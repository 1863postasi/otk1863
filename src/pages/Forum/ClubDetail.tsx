import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Calendar, MapPin, Globe, Users,
    Instagram, Mail, ExternalLink, ChevronRight,
    Clock, Heart, Share2, Info, AlertTriangle, Twitter, Check, Link as LinkIcon
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, FieldPath } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { formatDate, cn } from '../../lib/utils';
import { Club } from './types';

// --- TYPES ---
interface EventData {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    posterUrl?: string;
    shortDescription?: string;
}

// --- ANIMATIONS ---
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
};

// --- COMPONENT ---
export default function ClubDetail() {
    const params = useParams();
    const navigate = useNavigate();

    // Robust Param Extraction (Handle :id or :clubId)
    const id = params.clubId || params.id;

    // State
    const [club, setClub] = useState<Club | null>(null);
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'about' | 'events' | 'board'>('about');
    const [boardMembers, setBoardMembers] = useState<any[]>([]);
    const [isCopied, setIsCopied] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: club?.name, url });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            await navigator.clipboard.writeText(url);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const normalizeUrl = (url: string) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `https://${url}`;
    };

    // Board Members Fetcher (Query Users Collection)
    useEffect(() => {
        if (activeTab === 'board' && id) {
            const fetchBoard = async () => {
                try {
                    setLoading(true);
                    // Query users who have a role for this club ID
                    // We check if clubRoles.[id] exists and is a non-empty string
                    const usersRef = collection(db, "users");
                    // Using FieldPath to safely query nested map field with dynamic key
                    const q = query(usersRef, where(new FieldPath('clubRoles', id), '>=', ''));

                    const snapshot = await getDocs(q);

                    if (snapshot.empty) {
                        setBoardMembers([]);
                        return;
                    }

                    const members = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            name: data.username || data.displayName || "İsimsiz", // Prioritize username as per usage elsewhere
                            photoUrl: data.photoUrl,
                            role: data.clubRoles?.[id] || "Yetkili" // Get specific role for this club
                        };
                    });

                    setBoardMembers(members);
                } catch (e) {
                    console.error("Board fetch error:", e);
                } finally {
                    setLoading(false); // Only stop loading for this section, but main loading is handled by other effect. 
                    // Actually, main 'loading' state is for the whole page. We might want a local loading state for tab, 
                    // but for now this is fine, or we just don't touch main 'loading' here to avoid flickering current view.
                }
            };
            fetchBoard();
        }
    }, [activeTab, id]);

    // Fetch Logic
    useEffect(() => {
        if (!id) {
            setError("Geçersiz kulüp ID'si.");
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Club
                const clubRef = doc(db, "clubs", id);
                const clubSnap = await getDoc(clubRef);

                if (!clubSnap.exists()) {
                    setError("Kulüp bulunamadı.");
                    setLoading(false);
                    return;
                }

                const clubData = { id: clubSnap.id, ...clubSnap.data() } as Club;
                setClub(clubData);

                // 2. Fetch Events (Non-blocking UI, but fetching same time is fine)
                try {
                    const q = query(collection(db, "events"), where("clubId", "==", id));
                    const eventSnaps = await getDocs(q);
                    const loadedEvents = eventSnaps.docs.map(d => {
                        const data = d.data();
                        // Safe Date Conversion
                        const toISO = (val: any) => {
                            if (!val) return new Date().toISOString();
                            if (val.toDate) return val.toDate().toISOString(); // Firestore Timestamp
                            return val.includes('T') ? val : new Date().toISOString();
                        };
                        return {
                            id: d.id,
                            ...data,
                            startDate: toISO(data.startDate),
                            endDate: toISO(data.endDate)
                        } as EventData;
                    });

                    // Sort: Upcoming first
                    const now = new Date();
                    loadedEvents.sort((a, b) => {
                        const dateA = new Date(a.startDate).getTime();
                        const dateB = new Date(b.startDate).getTime();
                        // If both future, closest first. If both past, closest first (desc).
                        // Simplify: Just sort descending date for now? Or upcoming?
                        // Let's Sort by Date Ascending
                        return dateA - dateB;
                    });

                    setEvents(loadedEvents);
                } catch (err) {
                    console.warn("Event fetch failed (non-critical):", err);
                }

            } catch (err) {
                console.error("Critical Fetch Error:", err);
                setError("Veri yüklenirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    // Safety checks
    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mb-4" />
                <p className="text-stone-500 font-bold animate-pulse">Kulüp verileri yükleniyor...</p>
            </div>
        );
    }

    if (error || !club) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-bold text-stone-900 mb-2">Bir Sorun Oluştu</h2>
                <p className="text-stone-600 mb-6 max-w-xs">{error || "Kulüp bilgisi alınamadı."}</p>
                <button
                    onClick={() => navigate('/forum/kulupler')}
                    className="bg-stone-900 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-stone-700 transition-transform active:scale-95"
                >
                    Kulüplere Dön
                </button>
            </div>
        );
    }

    // --- RENDER SUCCESS ---
    // Extract Colors / Fallbacks
    const safeShortName = club.shortName || club.name.substring(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-[#fdfbf7] pb-20 overflow-x-hidden font-sans">

            {/* 1. IMMERSIVE HERO */}
            <header className="relative w-full h-[40vh] md:h-[50vh] bg-stone-900 overflow-hidden">
                {/* Background Image */}
                {club.bannerUrl ? (
                    <motion.div
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, ease: "linear" }}
                        className="absolute inset-0 z-0"
                    >
                        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay */}
                        <img
                            src={club.bannerUrl}
                            alt="Cover"
                            className="w-full h-full object-cover opacity-80"
                        />
                    </motion.div>
                ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800 to-stone-950 opacity-100" />
                )}

                {/* Navbar (Absolute) */}
                <div className="absolute top-0 left-0 right-0 z-50 p-4 pt-safe-top flex justify-between items-start">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex gap-2">
                        <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90">
                            {isCopied ? <Check size={18} /> : <Share2 size={18} />}
                        </button>
                    </div>
                </div>

                {/* Hero Content (Bottom Left) */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-32">
                    <div className="max-w-4xl mx-auto w-full flex items-end gap-6">
                        {/* Logo Card (Floating) */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="hidden md:block w-32 h-32 bg-white rounded-2xl p-1 shadow-2xl rotate-3"
                        >
                            <div className="w-full h-full bg-stone-50 rounded-xl overflow-hidden flex items-center justify-center border border-stone-100">
                                {club.logoUrl ? (
                                    <img src={club.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black text-stone-200">{safeShortName}</span>
                                )}
                            </div>
                        </motion.div>

                        <div className="flex-1 text-white pb-2">
                            {/* Mobile Logo (Inline) */}
                            <div className="md:hidden w-16 h-16 bg-white rounded-xl mb-4 overflow-hidden border-2 border-white/20 shadow-lg">
                                {club.logoUrl ? (
                                    <img src={club.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-stone-800 flex items-center justify-center text-stone-500 font-bold">{safeShortName}</div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-2">
                                {(club.categories || ((club as any).type ? [(club as any).type] : ["Öğrenci Kulübü"])).map((cat, idx) => (
                                    <motion.span
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider"
                                    >
                                        {cat}
                                    </motion.span>
                                ))}
                            </div>
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-2"
                            >
                                {club.name}
                            </motion.h1>
                            <p className="text-white/80 font-medium text-sm md:text-base max-w-xl line-clamp-2">
                                {club.description || "Boğaziçi Üniversitesi Öğrenci Kulübü"}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. STATS & ACTIONS BAR */}
            <div className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 md:px-0 py-3 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
                    {/* Stats */}
                    <div className="flex items-center gap-6 shrink-0">
                        <div className="flex items-center gap-2 text-stone-600">
                            <Calendar size={16} className="text-stone-400" />
                            <span className="text-sm font-bold">Est. {club.founded || "2000"}</span>
                        </div>
                    </div>

                    {/* Action Button Removed as per request */}
                    <div></div>
                </div>
            </div>

            {/* 3. MAIN CONTENT LAYOUT */}
            <main className="max-w-4xl mx-auto px-4 md:px-0 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* LEFT: CONTENT (2/3) */}
                <div className="md:col-span-2 space-y-8">

                    {/* TABS */}
                    <div className="flex w-full bg-stone-100 p-1 rounded-xl">
                        {(['about', 'events', 'board'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                                    activeTab === tab
                                        ? "bg-white text-stone-900 shadow-sm"
                                        : "text-stone-400 hover:text-stone-600"
                                )}
                            >
                                {{ about: 'Hakkında', events: 'Etkinlikler', board: 'Yönetim' }[tab]}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'about' && (
                            <motion.div key="about" {...fadeInUp} className="space-y-6">
                                <section className="prose prose-stone max-w-none">
                                    <p className="text-stone-700 text-base leading-relaxed whitespace-pre-line">
                                        {club.description || "Detaylı açıklama bulunmuyor."}
                                    </p>
                                </section>

                                {club.website && (
                                    <a href={club.website} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl hover:border-boun-blue/50 group transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-boun-blue">
                                                <Globe size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-stone-900 text-sm">Resmi Web Sitesi</div>
                                                <div className="text-xs text-stone-500">{club.website.replace(/^https?:\/\//, '')}</div>
                                            </div>
                                        </div>
                                        <ExternalLink size={16} className="text-stone-300 group-hover:text-boun-blue" />
                                    </a>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'events' && (
                            <motion.div key="events" {...fadeInUp} className="space-y-4">
                                {events.length > 0 ? (
                                    events.map(event => {
                                        const date = new Date(event.startDate);
                                        const isPast = new Date(event.endDate) < new Date();

                                        return (
                                            <div key={event.id} className={cn(
                                                "relative bg-white border rounded-xl p-4 transition-all flex gap-4 overflow-hidden group",
                                                isPast ? "border-stone-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-100" : "border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300"
                                            )}>
                                                {/* Date Box */}
                                                <div className={cn(
                                                    "w-16 h-16 rounded-lg flex flex-col items-center justify-center shrink-0 border",
                                                    isPast ? "bg-stone-50 border-stone-100 text-stone-400" : "bg-stone-50 border-stone-200 text-stone-900"
                                                )}>
                                                    <span className="text-[10px] font-bold uppercase">{date.toLocaleString('tr', { month: 'short' })}</span>
                                                    <span className="text-2xl font-black">{date.getDate()}</span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-stone-900 truncate">{event.title}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1 mb-2">
                                                        <Clock size={12} />
                                                        <span>{date.toLocaleTimeString('tr', { hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span>•</span>
                                                        <MapPin size={12} />
                                                        <span className="truncate">{event.location}</span>
                                                    </div>
                                                    {isPast && <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-bold rounded">GEÇMİŞ</span>}
                                                </div>


                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-stone-200">
                                        <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-3 text-stone-400">
                                            <Calendar size={24} />
                                        </div>
                                        <p className="text-stone-500 font-medium text-sm">Planlanmış etkinlik bulunmuyor.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'board' && (
                            <motion.div key="board" {...fadeInUp}>
                                <motion.div key="board" {...fadeInUp}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {boardMembers.length > 0 ? boardMembers.map((member: any) => (
                                            <div key={member.id} className="bg-white p-4 rounded-xl border border-stone-200 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-stone-100 overflow-hidden border border-stone-200 flex items-center justify-center text-stone-300">
                                                    {member.photoUrl ? <img src={member.photoUrl} className="w-full h-full object-cover" /> : <Users size={20} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-stone-900 text-sm">{member.name}</div>
                                                    <div className="text-xs text-boun-blue font-bold uppercase tracking-wide">{member.role}</div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="col-span-full text-center py-8 text-stone-400 text-sm">
                                                Yönetim kurulu bilgisi girilmemiştir.
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT: CONTACT & INFO (1/3) */}
                <div className="space-y-6">
                    {/* Contact Card */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm sticky top-24">
                        <h3 className="font-serif font-bold text-lg text-stone-900 mb-4 border-b border-stone-100 pb-2">İletişim</h3>
                        <div className="space-y-4">
                            {/* Address (Moved here or below) */}

                            {club.email && (
                                <a href={`mailto:${club.email}`} className="flex items-center gap-3 text-sm text-stone-600 hover:text-stone-900 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100"><Mail size={14} /></div>
                                    <span className="truncate">{club.email}</span>
                                </a>
                            )}

                            {club.website && (
                                <a href={normalizeUrl(club.website)} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-stone-600 hover:text-boun-blue transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100"><Globe size={14} /></div>
                                    <span className="truncate">Resmi Web Sitesi</span>
                                </a>
                            )}

                            {club.instagram && (
                                <a href={normalizeUrl(club.instagram.includes('instagram.com') ? club.instagram : `instagram.com/${club.instagram}`)} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-stone-600 hover:text-pink-600 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100"><Instagram size={14} /></div>
                                    <span className="truncate">Instagram</span>
                                </a>
                            )}

                            {club.twitter && (
                                <a href={normalizeUrl(club.twitter.includes('twitter.com') || club.twitter.includes('x.com') ? club.twitter : `twitter.com/${club.twitter}`)} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-stone-600 hover:text-stone-900 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100"><Twitter size={14} /></div>
                                    <span className="truncate">Twitter (X)</span>
                                </a>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-stone-100">
                            <h4 className="font-bold text-xs uppercase text-stone-400 tracking-wider mb-3">Kulüp Odası</h4>
                            {club.address ? (
                                <div className="flex items-start gap-2 text-sm text-stone-700">
                                    <MapPin size={16} className="text-boun-red mt-0.5 shrink-0" />
                                    <span className="leading-snug whitespace-pre-line">
                                        {club.address}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-sm text-stone-400 italic">Adres girilmemiş.</div>
                            )}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
