import React, { useState, useMemo, useEffect, useRef } from 'react';
import { formatDate, formatTime } from '../../lib/utils';
import { MapPin, ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Link as LinkIcon, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cache, CACHE_TTL } from '../../lib/cache';
import { cn } from '../../lib/utils';

// --- TYPES ---
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

interface CalendarSectionProps {
    onBack?: () => void;
}

// --- SUB-COMPONENTS ---

// 1. Date Strip (Horizontal Scroll)
const DateStrip = React.memo(({ selectedDate, onSelectDate, days }: { selectedDate: Date, onSelectDate: (d: Date) => void, days: Date[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to selected date on mount/change
    useEffect(() => {
        if (scrollRef.current) {
            const selectedIndex = days.findIndex(d => d.toDateString() === selectedDate.toDateString());
            if (selectedIndex !== -1) {
                const buttonWidth = 60; // Approximate width of a date button
                const centerOffset = (scrollRef.current.offsetWidth / 2) - (buttonWidth / 2);
                scrollRef.current.scrollTo({
                    left: (selectedIndex * buttonWidth) - centerOffset,
                    behavior: 'smooth'
                });
            }
        }
    }, [selectedDate, days]);

    return (
        <div className="w-full bg-stone-100/50 border-b border-stone-200 py-3 relative backdrop-blur-md z-20">
            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-2 px-4 scrollbar-hide snap-x"
            >
                {days.map((date, i) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                        <button
                            key={i}
                            onClick={() => onSelectDate(date)}
                            className={cn(
                                "flex-shrink-0 flex flex-col items-center justify-center w-[50px] h-[70px] rounded-2xl transition-all duration-300 snap-center border",
                                isSelected
                                    ? "bg-stone-800 text-stone-50 border-stone-800 shadow-md scale-110 z-10"
                                    : "bg-white text-stone-500 border-stone-100 hover:border-stone-300",
                                !isSelected && isToday && "border-boun-red/50 text-boun-red"
                            )}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                                {date.toLocaleDateString('tr-TR', { weekday: 'short' }).replace('.', '')}
                            </span>
                            <span className={cn("text-xl font-serif font-bold leading-none mt-1", isSelected ? "text-stone-50" : "text-stone-800")}>
                                {date.getDate()}
                            </span>
                            {isToday && !isSelected && (
                                <div className="w-1 h-1 rounded-full bg-boun-red mt-1" />
                            )}
                        </button>
                    );
                })}
            </div>
            {/* Fade Shadows for Scroll Hint */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#fdfbf7] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#fdfbf7] to-transparent pointer-events-none" />
        </div>
    );
});


// 2. Event Card (Expandable)
const EventCard = React.memo(({ event, isExpanded, onClick }: { event: FirestoreEvent, isExpanded: boolean, onClick: () => void }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={onClick}
            className={cn(
                "relative pl-6 pb-8 border-l-2 last:border-l-0 transition-colors group",
                isExpanded ? "border-stone-300" : "border-stone-200"
            )}
        >
            {/* Timeline Dot */}
            <div className={cn(
                "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 transition-colors z-10",
                isExpanded ? "bg-white border-boun-red scale-110 shadow-sm" : "bg-stone-200 border-[#fdfbf7] group-hover:bg-stone-300"
            )} />

            {/* Content Container */}
            <div className={cn(
                "rounded-2xl border transition-all duration-300 overflow-hidden",
                isExpanded
                    ? "bg-white border-stone-200 shadow-xl ring-1 ring-stone-900/5 -mt-2"
                    : "bg-white border-stone-100 shadow-sm hover:shadow-md hover:border-stone-200"
            )}>
                {/* Header (Always Visible) */}
                <div className="p-4 flex gap-4">
                    {/* Time Column */}
                    <div className="flex flex-col items-center justify-center w-14 shrink-0 border-r border-stone-100 pr-4">
                        <span className="text-lg font-bold font-serif text-stone-900 leading-none">
                            {new Date(event.startDate).getHours().toString().padStart(2, '0')}
                        </span>
                        <span className="text-xs text-stone-400 font-mono">
                            {new Date(event.startDate).getMinutes().toString().padStart(2, '0')}
                        </span>
                    </div>

                    {/* Title & Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 truncate max-w-[120px]">
                                {event.clubName}
                            </span>
                            {/* Status Indicator (e.g. Live) could go here */}
                        </div>
                        <h3 className={cn("font-bold text-base leading-tight text-stone-900", !isExpanded && "line-clamp-2")}>
                            {event.title}
                        </h3>
                        {!isExpanded && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-stone-500 truncate">
                                <MapPin size={12} />
                                <span>{event.location}</span>
                            </div>
                        )}
                    </div>

                    {/* Expand Chevron Icon */}
                    <div className="flex items-center text-stone-300">
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                            <ChevronDown size={20} />
                        </motion.div>
                    </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <div className="px-4 pb-4 pt-0 border-t border-stone-100 mt-2">
                                {/* Poster Image */}
                                {event.posterUrl && (
                                    <div className="my-4 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                                        <img src={event.posterUrl} alt="Event Poster" className="w-full h-auto object-cover max-h-80" />
                                    </div>
                                )}

                                {/* Location Full */}
                                <div className="flex items-center gap-2 text-sm text-stone-700 font-medium mb-3 mt-4">
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                                        <MapPin size={16} />
                                    </div>
                                    {event.location}
                                </div>

                                {/* Description */}
                                <div className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap pl-10">
                                    {event.details}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-6 pl-10">
                                    {event.link && (
                                        <a
                                            href={event.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-stone-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors"
                                        >
                                            <LinkIcon size={16} />
                                            Kayıt / Detay
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
});


// --- MAIN COMPONENT ---

const CalendarSection: React.FC<CalendarSectionProps> = ({ onBack }) => {
    // State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewDate, setViewDate] = useState<Date>(new Date()); // Tracks the month being viewed
    const [events, setEvents] = useState<FirestoreEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchAllEvents = async () => {
            setLoading(true);
            // 1. Check Cache
            const cachedData = cache.get('events_cache') as FirestoreEvent[];
            if (cachedData) {
                setEvents(cachedData);
                setLoading(false);
                return;
            }

            // 2. Fetch from Firestore
            try {
                const q = query(collection(db, "events"));
                const snap = await getDocs(q);
                const allEvents = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirestoreEvent[];

                // 3. Cache
                cache.set('events_cache', allEvents, CACHE_TTL.MEDIUM);
                setEvents(allEvents);
            } catch (err) {
                console.error("Calendar fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllEvents();
    }, []);

    // Derived Data: Filtered Events for Selected Day
    const dayEvents = useMemo(() => {
        return events
            .filter(e => {
                if (!e.startDate) return false;
                const d = new Date(e.startDate);
                return d.toDateString() === selectedDate.toDateString();
            })
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [events, selectedDate]);

    // Derived Data: Days for the Current View Month
    const calendarDays = useMemo(() => {
        const days = [];
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const date = new Date(year, month, 1);

        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [viewDate]);

    // --- UI HELPERS ---
    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        setExpandedEventId(null); // Collapse any open cards when changing day
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setViewDate(newDate);
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#fdfbf7] font-sans relative overflow-hidden touch-pan-y">
            {/* 1. Header with Month Navigation */}
            <div className="flex items-center justify-between p-4 bg-[#efede6]/80 backdrop-blur-md sticky top-0 z-30 border-b border-stone-200">
                {onBack ? (
                    <button onClick={onBack} className="p-2 -ml-2 text-stone-500 hover:text-stone-900 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                ) : <div className="w-8" />}

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-1 text-stone-400 hover:text-stone-800 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex flex-col items-center w-32">
                        <h2 className="text-xl font-serif font-bold text-stone-800 uppercase tracking-widest leading-none">
                            {viewDate.toLocaleDateString('tr-TR', { month: 'long' })}
                        </h2>
                        <span className="text-[10px] font-bold text-stone-400 tracking-[0.2em]">
                            {viewDate.getFullYear()}
                        </span>
                    </div>

                    <button
                        onClick={() => changeMonth(1)}
                        className="p-1 text-stone-400 hover:text-stone-800 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="w-8 flex justify-end">
                    <button
                        onClick={() => {
                            const now = new Date();
                            setSelectedDate(now);
                            setViewDate(now);
                        }}
                        className="p-2 -mr-2 text-stone-400 hover:text-boun-red transition-colors"
                        title="Bugün"
                    >
                        <CalendarIcon size={20} />
                    </button>
                </div>
            </div>

            {/* 2. Date Strip */}
            <DateStrip selectedDate={selectedDate} onSelectDate={handleDateChange} days={calendarDays} />

            {/* 3. Main Content (Timeline) */}
            <div className="flex-1 overflow-y-auto relative p-6 custom-scrollbar touch-pan-y">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 text-stone-400 animate-pulse">
                        <Clock size={32} className="mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-widest">Yükleniyor...</span>
                    </div>
                ) : dayEvents.length > 0 ? (
                    <div className="max-w-2xl mx-auto pl-2">
                        {dayEvents.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                isExpanded={expandedEventId === event.id}
                                onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-stone-400 text-center px-6 opacity-60">
                        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                            <CalendarIcon size={32} className="text-stone-300" />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-stone-600 mb-1">Etkinlik Yok</h3>
                        <p className="text-sm font-medium">Bu tarihte planlanmış bir etkinlik bulunmuyor.</p>
                        <button
                            onClick={() => {
                                const now = new Date();
                                setSelectedDate(now);
                                setViewDate(now);
                            }}
                            className="mt-6 px-6 py-2 bg-stone-800 text-stone-50 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-stone-700 transition-colors"
                        >
                            Bugüne Dön
                        </button>
                    </div>
                )}

                {/* Bottom Safe Area Spacer */}
                <div className="h-20" />
            </div>
        </div>
    );
};

export default CalendarSection;