import React from 'react';
import { Calendar, Clock, MapPin, Archive, ChevronRight, FileText, Scroll } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatTime } from '../../lib/utils';
import * as router from 'react-router-dom';

const { useNavigate } = router;

interface SavedEvent {
    id: string;
    title: string;
    startDate: string;
    location: string;
    clubName: string;
}

interface SavedEventsProps {
    events: SavedEvent[];
}

const SavedEvents: React.FC<SavedEventsProps> = ({ events }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            key="saved"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
        >
            {/* SAVED EVENTS SECTION */}
            <div>
                <h3 className="font-serif font-bold text-lg text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-200 pb-2">
                    <Calendar size={18} /> Yaklaşan Etkinlikler
                </h3>
                <div className="space-y-4">
                    {events.length === 0 && (
                        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-stone-300">
                            <Calendar size={32} className="mx-auto text-stone-300 mb-2" />
                            <p className="text-stone-500 text-sm">Kaydedilen etkinlik yok.</p>
                        </div>
                    )}
                    {events.map(event => (
                        <div key={event.id} className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex items-center gap-4 hover:border-boun-gold transition-colors">
                            <div className="text-center bg-stone-100 p-3 rounded-lg border border-stone-200 min-w-[70px]">
                                <div className="text-xs font-bold text-stone-500 uppercase">{new Date(event.startDate).toLocaleDateString('tr-TR', { month: 'short' })}</div>
                                <div className="text-2xl font-serif font-bold text-stone-900">{new Date(event.startDate).getDate()}</div>
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-bold text-boun-blue bg-blue-50 px-2 py-0.5 rounded w-fit mb-1">{event.clubName}</div>
                                <h3 className="font-bold text-stone-900">{event.title}</h3>
                                <div className="flex gap-3 mt-1 text-xs text-stone-500">
                                    <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(event.startDate)}</span>
                                    <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ARCHIVE CTA CARDS */}
            <div>
                <h3 className="font-serif font-bold text-lg text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-200 pb-2">
                    <Archive size={18} /> Arşiv Kayıtları
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/arsiv?view=institutional&saved=true')}
                        className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all text-left flex items-start justify-between group"
                    >
                        <div>
                            <h4 className="font-serif font-bold text-lg text-stone-900 mb-1 flex items-center gap-2">
                                <FileText size={20} className="text-boun-blue" /> Ders Notları
                            </h4>
                            <p className="text-sm text-stone-500">Kaydettiğiniz not ve sorulara buradan ulaşın.</p>
                        </div>
                        <ChevronRight className="text-stone-300 group-hover:text-stone-600 transition-colors" />
                    </button>

                    <button
                        onClick={() => navigate('/arsiv?view=roots&saved=true')}
                        className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all text-left flex items-start justify-between group"
                    >
                        <div>
                            <h4 className="font-serif font-bold text-lg text-stone-900 mb-1 flex items-center gap-2">
                                <Scroll size={20} className="text-boun-gold" /> Kökenler & Anılar
                            </h4>
                            <p className="text-sm text-stone-500">Favori hikaye ve fotoğraflarınız.</p>
                        </div>
                        <ChevronRight className="text-stone-300 group-hover:text-stone-600 transition-colors" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default SavedEvents;
