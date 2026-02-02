
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Globe, Bookmark, Star, Users, MessageSquare } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ForumSidebar from '../../components/Forum/Sidebar';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

// Types
interface ClubData {
    id: string;
    name: string;
    shortName: string;
    description: string;
    website?: string;
    type: string;
    founded?: string;
}

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
    const [club, setClub] = useState<ClubData | null>(null);
    const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
    const [pastEvents, setPastEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'reviews'>('overview');

    // Mock Bookmarked IDs (Ideally fetch from user profile)
    const [bookmarkedEvents, setBookmarkedEvents] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!clubId) return;
            try {
                // 1. Fetch Club Details
                const clubDoc = await getDoc(doc(db, "clubs", clubId));
                if (clubDoc.exists()) {
                    setClub({ id: clubDoc.id, ...clubDoc.data() } as ClubData);
                }

                // 2. Fetch Events
                const q = query(collection(db, "events"), where("clubId", "==", clubId));
                const snapshot = await getDocs(q);
                const allEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EventData[];

                const now = new Date();
                const upcoming = allEvents.filter(e => new Date(e.endDate) >= now).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                const past = allEvents.filter(e => new Date(e.endDate) < now).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()); // Latest past first

                setUpcomingEvents(upcoming);
                setPastEvents(past);

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
        // TODO: Persist to Firestore user profile
    };

    if (loading) return <div className="min-h-screen bg-stone-50 pt-20 flex justify-center"><div className="animate-spin text-stone-400">Loading...</div></div>;
    if (!club) return <div className="min-h-screen bg-stone-50 pt-20 text-center">Kulüp bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* SIDEBAR */}
                    <div className="hidden lg:block w-64 shrink-0">
                        <ForumSidebar />
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="flex-1 min-w-0">

                        {/* BACK NAVIGATION */}
                        <Link to="/forum/kulupler" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-6 transition-colors font-medium">
                            <ArrowLeft size={20} />
                            Tüm Kulüpler
                        </Link>

                        {/* CLUB HERO HEADER */}
                        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm mb-6">
                            <div className="h-32 bg-stone-900 relative">
                                {/* Banner Pattern */}
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            </div>
                            <div className="px-8 pb-8 flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12">
                                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-3xl font-bold text-stone-800 shrink-0">
                                    {club.shortName.substring(0, 2)}
                                </div>
                                <div className="flex-1 pb-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h1 className="text-3xl font-bold text-stone-900 font-serif">{club.name}</h1>
                                        {club.website && (
                                            <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-boun-blue">
                                                <Globe size={18} />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                                        <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-500 font-bold text-xs uppercase tracking-wider">{club.type}</span>
                                        <span className="flex items-center gap-1"><Users size={16} className="text-stone-400" /> 150+ Üye</span>
                                        <span className="flex items-center gap-1"><Calendar size={16} className="text-stone-400" /> {club.founded || '2000'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                    <button className="flex-1 md:flex-none bg-stone-900 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-stone-700 transition-colors shadow-lg shadow-stone-900/20">
                                        Üye Ol / İletişime Geç
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* TABS */}
                        <div className="flex border-b border-stone-200 mb-6 space-x-6 px-2">
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
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'reviews' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                Değerlendirmeler
                                {activeTab === 'reviews' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />}
                            </button>
                        </div>

                        {/* CONTENT AREA */}
                        <div className="space-y-6">

                            {activeTab === 'overview' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
                                        <h3 className="font-bold text-lg text-stone-900 mb-4">Hakkında</h3>
                                        <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                                            {club.description || "Bu kulüp hakkında henüz detaylı bilgi girilmemiş."}
                                        </p>
                                    </div>

                                    {/* Recent Activity Snapshot */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-amber-50 rounded-xl border border-amber-100 p-6">
                                            <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2"><Star size={18} /> Topluluk Puanı</h4>
                                            <div className="text-4xl font-bold text-amber-500 mb-1">4.8</div>
                                            <div className="text-sm text-amber-700/60">24 değerlendirme üzerinden</div>
                                        </div>
                                        <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                                            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Calendar size={18} /> Son Etkinlik</h4>
                                            {pastEvents.length > 0 ? (
                                                <>
                                                    <div className="font-bold text-blue-800">{pastEvents[0].title}</div>
                                                    <div className="text-sm text-blue-600">{formatDate(pastEvents[0].startDate)}</div>
                                                </>
                                            ) : (
                                                <div className="text-sm text-blue-400">Kayıtlı geçmiş etkinlik yok.</div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'events' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

                                    {/* UPCOMING */}
                                    <div>
                                        <h3 className="font-bold text-lg text-stone-900 mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            Gelecek Etkinlikler
                                        </h3>
                                        {upcomingEvents.length > 0 ? (
                                            <div className="grid gap-4">
                                                {upcomingEvents.map(event => (
                                                    <div key={event.id} className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex gap-4 transition-all hover:border-boun-blue/50">
                                                        <div className="w-16 h-16 bg-stone-100 rounded-lg flex flex-col items-center justify-center text-stone-600 border border-stone-200 shrink-0">
                                                            <span className="text-xs font-bold uppercase">{new Date(event.startDate).toLocaleString('tr', { month: 'short' })}</span>
                                                            <span className="text-xl font-bold">{new Date(event.startDate).getDate()}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-stone-900 text-lg">{event.title}</h4>
                                                            <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                                                                <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                                                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(event.startDate).toLocaleTimeString('tr', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleBookmark(event.id)}
                                                            className={`self-start p-2 rounded-full transition-colors ${bookmarkedEvents.includes(event.id)
                                                                    ? 'bg-boun-blue text-white shadow-lg'
                                                                    : 'bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600'
                                                                }`}
                                                            title={bookmarkedEvents.includes(event.id) ? "Kaydedildi" : "Kaydet"}
                                                        >
                                                            <Bookmark size={20} fill={bookmarkedEvents.includes(event.id) ? "currentColor" : "none"} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-white rounded-xl border border-stone-200 border-dashed text-stone-400">
                                                Planlanmış gelecek etkinlik bulunmuyor.
                                            </div>
                                        )}
                                    </div>

                                    {/* PAST */}
                                    <div>
                                        <h3 className="font-bold text-lg text-stone-900 mb-4 opacity-60">Geçmiş Etkinlikler (Arşiv)</h3>
                                        <div className="space-y-4">
                                            {pastEvents.map(event => (
                                                <div key={event.id} className="bg-stone-50 rounded-xl border border-stone-200 p-4 flex gap-4 opacity-75 hover:opacity-100 transition-opacity">
                                                    <div className="w-12 h-12 bg-stone-200 rounded-lg flex flex-col items-center justify-center text-stone-500 shrink-0">
                                                        <span className="text-[10px] font-bold uppercase">{new Date(event.startDate).toLocaleString('tr', { month: 'short' })}</span>
                                                        <span className="text-sm font-bold">{new Date(event.startDate).getDate()}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-stone-700">{event.title}</h4>
                                                        <p className="text-xs text-stone-500 line-clamp-1">{event.shortDescription || 'Etkinlik detayı mevcut değil.'}</p>
                                                    </div>
                                                    <button className="text-stone-400 hover:text-stone-900 text-sm font-bold flex items-center gap-1">
                                                        <MessageSquare size={16} /> Değerlendir
                                                    </button>
                                                </div>
                                            ))}
                                            {pastEvents.length === 0 && (
                                                <div className="text-sm text-stone-400 italic">Geçmiş etkinlik bulunamadı.</div>
                                            )}
                                        </div>
                                    </div>

                                </motion.div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="text-center py-12 text-stone-400">
                                    <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>Henüz değerlendirme yapılmamış.</p>
                                    <button className="mt-4 text-boun-blue font-bold hover:underline">İlk yorumu sen yaz</button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubDetail;
