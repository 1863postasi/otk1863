
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Globe, Bookmark, Star, Users, MessageSquare, Loader2, Instagram } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { Club } from './types'; // Use centralized type

interface EventData {
    id: string;
    title: string;
    startDate: string; // ISO
    endDate: string;
    location: string;
    posterUrl?: string;
    shortDescription?: string;
}

const ClubDetail: React.FC = () => {
    const { clubId } = useParams<{ clubId: string }>();
    const { userProfile } = useAuth(); // For check bookmarks
    const [club, setClub] = useState<Club | null>(null);
    const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
    const [pastEvents, setPastEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'reviews'>('overview');

    // Mock Bookmarked IDs (Ideally fetch from user profile)
    const [bookmarkedEvents, setBookmarkedEvents] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!clubId) {
                setLoading(false);
                return;
            }

            // 1. Try Cache
            const cacheKey = `club_detail_${clubId}`;
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                try {
                    const parsed = JSON.parse(cachedData);
                    if (parsed && parsed.club) {
                        setClub(parsed.club);
                        setUpcomingEvents(parsed.upcoming || []);
                        setPastEvents(parsed.past || []);
                        setLoading(false);
                    }
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }

            try {
                // 2. Fetch Fresh Data
                // Fetch Club Details
                const clubDoc = await getDoc(doc(db, "clubs", clubId));
                let clubData = null;
                if (clubDoc.exists()) {
                    clubData = { id: clubDoc.id, ...clubDoc.data() } as Club;
                    setClub(clubData);
                }

                // Fetch Events
                const q = query(collection(db, "events"), where("clubId", "==", clubId));
                const snapshot = await getDocs(q);
                const allEvents = snapshot.docs.map(doc => {
                    const data = doc.data();
                    // Robust Date Conversion
                    let startDate = new Date().toISOString();
                    let endDate = new Date().toISOString();

                    if (data.startDate && typeof data.startDate.toDate === 'function') {
                        startDate = data.startDate.toDate().toISOString();
                    } else if (data.startDate) {
                        startDate = data.startDate; // Assume string
                    }

                    if (data.endDate && typeof data.endDate.toDate === 'function') {
                        endDate = data.endDate.toDate().toISOString();
                    } else if (data.endDate) {
                        endDate = data.endDate; // Assume string
                    }

                    return {
                        id: doc.id,
                        ...data,
                        startDate,
                        endDate
                    } as EventData;
                });

                const now = new Date();
                const upcoming = allEvents.filter(e => new Date(e.endDate) >= now).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                const past = allEvents.filter(e => new Date(e.endDate) < now).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

                setUpcomingEvents(upcoming);
                setPastEvents(past);

                // 3. Update Cache
                if (clubData) {
                    localStorage.setItem(cacheKey, JSON.stringify({
                        club: clubData,
                        upcoming,
                        past,
                        timestamp: Date.now()
                    }));
                }

            } catch (error) {
                console.error("Error fetching club details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [clubId]);

    const handleBookmark = (eventId: string) => {
        // Toggle bookmark logic (Mock)
        if (bookmarkedEvents.includes(eventId)) {
            setBookmarkedEvents(prev => prev.filter(id => id !== eventId));
        } else {
            setBookmarkedEvents(prev => [...prev, eventId]);
        }
    };

    if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><Loader2 className="animate-spin text-stone-400" /></div>;
    if (!club) return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500">Kulüp bulunamadı.</div>;

    // Safety check for shortName to prevent crash
    const safeShortName = club.shortName || club.name?.substring(0, 2) || "??";

    return (
        <div className="min-h-screen bg-stone-50 pb-20">
            {/* 1. HERO & BANNER SECTION */}
            <div className="relative w-full h-64 md:h-80 bg-stone-900 overflow-hidden">
                {/* Banner Image */}
                {club.bannerUrl ? (
                    <img src={club.bannerUrl} className="w-full h-full object-cover opacity-90" alt="Club Banner" />
                ) : (
                    // Fallback Pattern
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
                )}

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Navbar Placeholder (Back Button - Lowered for Global Button Safety) */}
                <div className="absolute top-14 left-4 md:top-8 md:left-8 z-20">
                    <Link to="/forum/kulupler" className="flex items-center gap-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full transition-all text-sm font-bold border border-white/10">
                        <ArrowLeft size={18} />
                        <span className="hidden md:inline">Kulüplere Dön</span>
                    </Link>
                </div>
            </div>

            {/* 2. CLUB HEADER INFO (Overlapping) */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-20 z-10">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 flex flex-col md:flex-row items-start md:items-end gap-6">
                    {/* Logo */}
                    <div className="relative -mt-16 md:-mt-20 shrink-0">
                        <div className="w-28 h-28 md:w-36 md:h-36 bg-white p-1.5 rounded-2xl shadow-md border border-stone-100">
                            <div className="w-full h-full bg-stone-50 rounded-xl overflow-hidden flex items-center justify-center border border-stone-100">
                                {club.logoUrl ? (
                                    <img src={club.logoUrl} className="w-full h-full object-cover" alt="Logo" />
                                ) : (
                                    <span className="text-2xl font-black text-stone-300">{safeShortName.substring(0, 2)}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold font-serif text-stone-900 leading-tight">
                                    {club.name}
                                </h1>
                                <p className="text-sm font-bold text-stone-400 mt-1">{(club.description || "").substring(0, 100) || club.name}...</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-boun-blue text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                                    <Users size={18} /> Üye Ol
                                </button>
                                {club.website && (
                                    <a href={club.website} target="_blank" rel="noreferrer" className="p-2.5 border border-stone-200 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors">
                                        <Globe size={18} />
                                    </a>
                                )}
                                <button className="p-2.5 border border-stone-200 rounded-full text-stone-500 hover:text-pink-600 hover:bg-pink-50 transition-colors">
                                    <Instagram size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Meta Tags */}
                        <div className="flex flex-wrap gap-3 mt-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">
                                <Users size={14} /> {club.memberCount || "150+"} Üye
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">
                                <Calendar size={14} /> {club.founded || "2000"}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">
                                <Star size={14} className="text-amber-400 fill-amber-400" /> {club.rating || "4.8"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. TABS & CONTENT */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN (Content) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs Navigation */}
                        <div className="flex border-b border-stone-200 space-x-6 px-2">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'overview' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                Genel Bakış
                                {activeTab === 'overview' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('events')}
                                className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'events' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                Etkinlikler <span className="ml-1 bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full text-xs">{upcomingEvents.length}</span>
                                {activeTab === 'events' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />}
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="py-2">
                            {activeTab === 'overview' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
                                        <h3 className="font-bold text-lg text-stone-900 mb-4">Hakkında</h3>
                                        <p className="text-stone-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                                            {club.description || "Bu kulüp hakkında henüz detaylı bilgi girilmemiş."}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'events' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                    {upcomingEvents.length > 0 ? (
                                        upcomingEvents.map(event => {
                                            // Extra safety for date parsing in render
                                            const start = event.startDate ? new Date(event.startDate) : new Date();
                                            return (
                                                <div key={event.id} className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex gap-4">
                                                    <div className="w-14 h-14 bg-stone-100 rounded-lg flex flex-col items-center justify-center text-stone-600 shrink-0 font-bold border border-stone-200">
                                                        <span className="text-[10px] uppercase text-stone-500">{start.toLocaleString('tr', { month: 'short' })}</span>
                                                        <span className="text-xl leading-none">{start.getDate()}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-stone-900">{event.title}</h4>
                                                        <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                                                            <MapPin size={12} /> {event.location || 'Kampüs'}
                                                            <span>•</span>
                                                            <Calendar size={12} /> {start.toLocaleTimeString('tr', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-10 bg-white border border-dashed border-stone-200 rounded-xl text-stone-400 text-sm">
                                            Yaklaşan etkinlik bulunmuyor.
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN (Sidebar Stats) */}
                    <div className="space-y-4 hidden lg:block">
                        <div className="bg-amber-50 rounded-xl border border-amber-100 p-6">
                            <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2"><Star size={18} /> Topluluk Puanı</h4>
                            <div className="text-4xl font-bold text-amber-500 mb-1">4.8</div>
                            <div className="text-sm text-amber-700/60">24 değerlendirme</div>
                        </div>
                        <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Calendar size={18} /> Son Etkinlik</h4>
                            {pastEvents.length > 0 ? (
                                <>
                                    <div className="font-bold text-blue-800 line-clamp-1">{pastEvents[0].title}</div>
                                    <div className="text-sm text-blue-600">{formatDate(pastEvents[0].startDate)}</div>
                                </>
                            ) : (
                                <div className="text-sm text-blue-400">Arşivde etkinlik yok.</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ClubDetail;
