import React, { useState, useMemo, useEffect, useRef } from 'react';
import { formatTime, formatDate } from '../../lib/utils';
import { MapPin, ChevronDown, X, ArrowRight, Loader2, ChevronLeft, Calendar, Bookmark } from 'lucide-react';
import { motion as m, AnimatePresence, LayoutGroup } from 'framer-motion';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

const motion = m as any;

const START_HOUR = 8; // 08:00
const END_HOUR = 23;  // 23:00
const PIXELS_PER_HOUR = 120; // Increased slightly for better spacing

interface CalendarSectionProps {
  onBack?: () => void;
}

interface FirestoreEvent {
    id: string;
    title: string;
    shortDescription: string;
    details: string;
    startDate: string; // ISO
    endDate: string; // ISO
    location: string;
    link: string;
    posterUrl?: string;
    clubName: string;
    clubId: string;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({ onBack }) => {
  const { userProfile, toggleBookmark } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [loading, setLoading] = useState(false);
  
  // --- DATE STATE ---
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // The actual selected day
  const [viewDate, setViewDate] = useState<Date>(new Date()); // The month currently being viewed in the mini-calendar
  
  // --- DYNAMIC TIME STATE ---
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update "Now" indicator every minute
  useEffect(() => {
      const updateTime = () => {
          const now = new Date();
          // Calculate total minutes from start of the day
          const minutes = now.getHours() * 60 + now.getMinutes();
          setCurrentTimeMinutes(minutes);
      };
      
      updateTime(); // Initial call
      const interval = setInterval(updateTime, 60000); // Update every minute
      return () => clearInterval(interval);
  }, []);

  // Fetch Events from Firestore
  useEffect(() => {
    setLoading(true);
    
    // Define day start and end for query
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23,59,59,999);

    // Query events that overlap with this day or start on this day
    const q = query(collection(db, "events"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const allEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirestoreEvent[];
        
        // Filter client-side for the specific selected date
        const dayEvents = allEvents.filter(e => {
            const eStart = new Date(e.startDate);
            return eStart.toDateString() === selectedDate.toDateString();
        });

        setEvents(dayEvents);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  // Determine layout positions for overlapping events
  const positionedEvents = useMemo(() => {
    const validEvents = events.filter(e => e.startDate && e.endDate);

    const mappedWithPositions = validEvents.map(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();
      
      const dayStartMinutes = START_HOUR * 60;
      
      const top = ((startMinutes - dayStartMinutes) / 60) * PIXELS_PER_HOUR;
      const durationHours = (endMinutes - startMinutes) / 60;
      const height = Math.max(durationHours * PIXELS_PER_HOUR, 50); // Min height constraint

      return { ...event, top, height, startMinutes, endMinutes, width: 100, left: 0 };
    });

    const columns: any[][] = [];
    mappedWithPositions.forEach(event => {
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
            const lastEventInColumn = columns[i][columns[i].length - 1];
            if (event.startMinutes >= lastEventInColumn.endMinutes) {
                columns[i].push(event);
                event.left = i; 
                placed = true;
                break;
            }
        }
        if (!placed) {
            columns.push([event]);
            event.left = columns.length - 1;
        }
    });

    return mappedWithPositions.map(event => {
       const overlaps = mappedWithPositions.filter(e => 
         e.id !== event.id && 
         Math.max(event.startMinutes, e.startMinutes) < Math.min(event.endMinutes, e.endMinutes)
       );
       
       const totalOverlaps = overlaps.length + 1; 
       const myIndex = overlaps.filter(e => e.startMinutes < event.startMinutes || (e.startMinutes === event.startMinutes && e.id < event.id)).length;

       return {
           ...event,
           width: 95 / totalOverlaps, 
           left: (100 / totalOverlaps) * myIndex
       };
    });

  }, [events]);

  // Helper for Month Navigation
  const changeMonth = (offset: number) => {
      const newDate = new Date(viewDate);
      newDate.setMonth(newDate.getMonth() + offset);
      setViewDate(newDate);
  };

  // Helper to generate days for the mini calendar grid
  const calendarDays = useMemo(() => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      
      const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Adjust so Monday is 0, Sunday is 6
      const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

      const days = [];
      // Empty slots for previous month
      for (let i = 0; i < startDay; i++) days.push(null);
      // Days of current month
      for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
      
      return days;
  }, [viewDate]);

  // Calculate "Now" Line Position
  const nowLineTop = useMemo(() => {
      if (currentTimeMinutes === null) return -1;
      const dayStartMinutes = START_HOUR * 60;
      // Check if current time is within viewable hours
      if (currentTimeMinutes < dayStartMinutes || currentTimeMinutes > END_HOUR * 60 + 59) return -1;
      
      return ((currentTimeMinutes - dayStartMinutes) / 60) * PIXELS_PER_HOUR;
  }, [currentTimeMinutes]);

  // Check if selected date is today to show the line
  const isTodaySelected = useMemo(() => {
      const today = new Date();
      return selectedDate.getDate() === today.getDate() && 
             selectedDate.getMonth() === today.getMonth() && 
             selectedDate.getFullYear() === today.getFullYear();
  }, [selectedDate]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[#fdfbf7] overflow-hidden relative touch-pan-y font-sans">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#efede6] shadow-sm border-b border-stone-300 z-30 shrink-0 h-16">
        <button 
            onClick={() => setIsMobileCalendarOpen(!isMobileCalendarOpen)}
            className="flex items-center gap-2 font-serif font-bold text-stone-900 text-lg px-2 py-1 rounded-md active:bg-stone-200 transition-colors"
        >
            {formatDate(selectedDate.toISOString())}
            <motion.div animate={{ rotate: isMobileCalendarOpen ? 180 : 0 }}>
               <ChevronDown size={16} />
            </motion.div>
        </button>
        <button onClick={onBack} className="text-stone-600 flex items-center gap-1 font-serif text-sm font-bold">
             Ana Sayfa <ArrowRight size={18} />
        </button>
      </div>

      {/* LEFT SIDE: Sidebar & Calendar (Desktop) */}
      <div className="hidden md:flex md:w-1/3 lg:w-1/4 bg-[#efede6] border-r border-stone-300 flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        <div className="p-6 pb-2">
            <button 
                onClick={onBack}
                className="group flex items-center gap-2 text-stone-500 hover:text-boun-red transition-colors font-serif text-sm font-medium"
            >
                Ana Sayfa
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
        </div>

        {/* Selected Date Large Display */}
        <div className="px-8 mt-4">
             <div className="flex flex-col animate-in fade-in slide-in-from-left duration-500">
                 <span className="font-serif text-7xl text-stone-800 leading-none tracking-tighter">
                     {selectedDate.getDate()}
                 </span>
                 <span className="font-serif text-3xl text-stone-600 italic">
                     {selectedDate.toLocaleDateString('tr-TR', { month: 'long' })}
                 </span>
                 <span className="font-sans text-sm font-bold text-stone-400 uppercase tracking-widest mt-1">
                     {selectedDate.toLocaleDateString('tr-TR', { weekday: 'long' })}, {selectedDate.getFullYear()}
                 </span>
             </div>
             <div className="w-full h-px bg-stone-400/50 my-8"></div>
        </div>

        {/* Mini Calendar */}
        <div className="px-6 flex-1 overflow-y-auto">
            {/* Month Nav */}
            <div className="flex items-center justify-between mb-4 px-2">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-stone-200 rounded-full transition-colors"><ChevronLeft size={18}/></button>
                <span className="font-bold text-stone-800 text-sm">{viewDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-stone-200 rounded-full transition-colors"><ArrowRight size={18}/></button>
            </div>

            <div className="grid grid-cols-7 gap-y-2 gap-x-1 w-full text-center font-sans text-sm mb-8">
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                    <div key={day} className="text-stone-400 font-bold text-[10px] uppercase tracking-wider">{day}</div>
                ))}
                
                {calendarDays.map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} />;
                    
                    const isSelected = date.getDate() === selectedDate.getDate() && 
                                     date.getMonth() === selectedDate.getMonth() &&
                                     date.getFullYear() === selectedDate.getFullYear();
                    
                    const isToday = date.getDate() === new Date().getDate() && 
                                    date.getMonth() === new Date().getMonth() &&
                                    date.getFullYear() === new Date().getFullYear();

                    return (
                        <motion.button 
                            key={i}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedDate(date)}
                            className={`
                                aspect-square flex items-center justify-center rounded-full text-xs font-medium transition-all relative
                                ${isSelected ? 'bg-stone-800 text-white shadow-md font-bold' : 'text-stone-600 hover:bg-stone-200'}
                                ${!isSelected && isToday ? 'border border-boun-gold text-boun-gold font-bold' : ''}
                            `}
                        >
                            {date.getDate()}
                        </motion.button>
                    );
                })}
            </div>
        </div>
      </div>

      {/* MOBILE OVERLAY DRAWER (Simplified Calendar) */}
      <AnimatePresence>
        {isMobileCalendarOpen && (
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-40 bg-[#efede6] md:hidden flex flex-col p-6 overflow-y-auto"
            >
                <div className="w-full flex justify-end mb-4">
                    <button onClick={() => setIsMobileCalendarOpen(false)} className="p-2 text-stone-500 bg-white rounded-full shadow-sm">
                        <X size={24} />
                    </button>
                </div>
                {/* Re-use similar calendar logic here or simplified list */}
                <div className="text-center">
                    <h3 className="font-serif text-2xl font-bold mb-4">Tarih Seçin</h3>
                    <p className="text-stone-500">Takvim mobil görünümü...</p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT SIDE: Timeline */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 bg-[#fdfbf7] overflow-y-auto relative custom-scrollbar w-full touch-pan-y"
        style={{ backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: `100% ${PIXELS_PER_HOUR}px` }} 
      >
          <div className="relative min-h-full" style={{ height: (END_HOUR - START_HOUR + 1) * PIXELS_PER_HOUR + 50 }}>
             
             {/* Hour Markers */}
             {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => {
                 const hour = START_HOUR + i;
                 return (
                     <div 
                        key={hour} 
                        className="absolute w-full border-t border-stone-200/60 flex items-start"
                        style={{ top: i * PIXELS_PER_HOUR, height: PIXELS_PER_HOUR }}
                     >
                        <span className="text-xs font-sans font-bold text-stone-400 w-16 text-right pr-4 -mt-2.5 bg-[#fdfbf7]">
                            {hour.toString().padStart(2, '0')}:00
                        </span>
                     </div>
                 );
             })}

             {/* Events Layer */}
             <div className="absolute top-0 right-4 left-20 bottom-0">
                 
                 {loading && (
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-stone-400">
                         <Loader2 className="animate-spin" size={24} />
                         <span className="text-xs font-bold uppercase">Etkinlikler Yükleniyor...</span>
                     </div>
                 )}

                 {!loading && positionedEvents.length === 0 && (
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-stone-400 font-serif italic text-center px-4">
                         Bu güne ait etkinlik bulunamadı.
                     </div>
                 )}

                 <LayoutGroup>
                     <AnimatePresence>
                         {positionedEvents.map((event) => {
                             const isSelected = selectedEventId === event.id;
                             const isSaved = userProfile?.savedEventIds?.includes(event.id);

                             return (
                                 <motion.div
                                     layout 
                                     key={event.id}
                                     initial={{ opacity: 0, scale: 0.95 }}
                                     animate={{ 
                                         opacity: 1, 
                                         scale: 1,
                                         height: isSelected ? 'auto' : `${event.height}px`,
                                         zIndex: isSelected ? 50 : 10
                                     }}
                                     style={{
                                         top: `${event.top}px`,
                                         minHeight: `${Math.max(event.height, 60)}px`, 
                                         left: `${event.left}%`,
                                         width: `${event.width}%`,
                                     }}
                                     onClick={() => setSelectedEventId(isSelected ? null : event.id)}
                                     className={`
                                        absolute cursor-pointer transition-all duration-200
                                        bg-white rounded-sm shadow-sm hover:shadow-md
                                        border-l-[6px] border-stone-500
                                        p-3 overflow-hidden group
                                     `}
                                 >
                                     <motion.div layout="position" className="flex flex-col h-full relative">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-xs font-bold font-sans uppercase tracking-wider text-stone-600">
                                                {formatTime(event.startDate)}
                                            </span>
                                            {isSelected && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleBookmark('event', event.id);
                                                        }}
                                                        className="text-stone-400 hover:text-boun-gold transition-colors"
                                                    >
                                                        <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} className={isSaved ? "text-boun-gold" : ""} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setSelectedEventId(null); }}
                                                        className="text-stone-400 hover:text-stone-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <motion.h4 layout="position" className="font-serif font-bold text-lg text-stone-900 leading-tight mt-1 line-clamp-2 group-hover:text-boun-blue transition-colors">
                                            {event.title}
                                        </motion.h4>
                                        
                                        {!isSelected && (
                                            <motion.div layout="position" className="text-xs text-stone-500 mt-1 flex items-center gap-1 truncate font-sans">
                                                <MapPin size={10} /> {event.location}
                                            </motion.div>
                                        )}
                                        
                                        {/* Expanded Content */}
                                        {isSelected && (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                                className="mt-3 text-stone-600 font-sans border-t border-stone-100 pt-2"
                                            >
                                                {event.posterUrl && (
                                                    <div className="mb-4 rounded-lg overflow-hidden border border-stone-200">
                                                        <img src={event.posterUrl} alt={event.title} className="w-full h-auto max-h-60 object-contain bg-stone-100" />
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1 text-xs font-bold text-stone-500">
                                                        <MapPin size={12} /> {event.location}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-boun-blue bg-blue-50 px-2 py-1 rounded">
                                                        {event.clubName}
                                                    </div>
                                                </div>
                                                
                                                <div className="text-sm leading-relaxed whitespace-pre-wrap mb-4">
                                                    {event.details}
                                                </div>

                                                {event.link && (
                                                    <a href={event.link} target="_blank" rel="noreferrer" className="block w-full text-center bg-stone-900 text-white py-2 rounded text-sm font-bold hover:bg-stone-700 transition-colors">
                                                        Kayıt / Detay
                                                    </a>
                                                )}
                                            </motion.div>
                                        )}
                                     </motion.div>
                                 </motion.div>
                             );
                         })}
                     </AnimatePresence>
                 </LayoutGroup>

                 {/* DYNAMIC NOW LINE */}
                 {isTodaySelected && nowLineTop !== -1 && (
                     <div 
                        className="absolute w-full flex items-center z-30 pointer-events-none transition-all duration-1000 ease-linear"
                        style={{ top: nowLineTop }}
                     >
                         <div className="h-px bg-boun-red w-full border-t border-dashed border-boun-red/50 shadow-[0_0_8px_rgba(138,27,27,0.4)]"></div>
                         <div className="absolute right-0 bg-boun-red text-white text-[10px] px-2 py-0.5 font-bold rounded-l-md shadow-sm flex items-center gap-1">
                             <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> ŞİMDİ
                         </div>
                     </div>
                 )}

             </div>
          </div>
      </div>
    </div>
  );
};

export default CalendarSection;