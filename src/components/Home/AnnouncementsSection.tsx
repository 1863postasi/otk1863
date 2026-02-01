import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Pin, ArrowLeft, Search, MapPin, Calendar, CheckCircle, HelpCircle, Archive, Camera, Plus, X, Upload, Instagram, Mail, AlertTriangle, Send, Megaphone, ExternalLink, Phone, Loader2, EyeOff, MessageCircle, Lock } from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';
import { motion as m, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/firebase';
import { collection, query, where, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, getDocs, onSnapshot } from 'firebase/firestore';
import { uploadFile } from '../../lib/storage';
import { cache, CACHE_KEYS, CACHE_TTL } from '../../lib/cache';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const motion = m as any;

// --- LOCAL MOCK DATA & TYPES ---

const CATEGORY_STYLES: Record<string, string> = {
    "Genel": "border-l-stone-500 text-stone-700 bg-stone-50/5",
    "Akademik": "border-l-blue-600 text-blue-700 bg-blue-50/5",
    "Etkinlik": "border-l-purple-500 text-purple-700 bg-purple-50/5",
    "Acil": "border-l-red-600 text-red-700 bg-red-50/5",
    "Ulaşım": "border-l-emerald-600 text-emerald-700 bg-emerald-50/5",
    "Yemekhane": "border-l-orange-500 text-orange-700 bg-orange-50/5",
    "Burs": "border-l-cyan-600 text-cyan-700 bg-cyan-50/5",
    "Kulüpler": "border-l-pink-500 text-pink-700 bg-pink-50/5",
    "Diğer": "border-l-gray-500 text-gray-700 bg-gray-50/5",
    // Fallback
    "default": "border-l-stone-400 text-stone-600 bg-stone-50/5"
};

const CATEGORY_BADGES: Record<string, string> = {
    "Genel": "bg-stone-100 text-stone-600",
    "Akademik": "bg-blue-100 text-blue-800",
    "Etkinlik": "bg-purple-100 text-purple-800",
    "Acil": "bg-red-100 text-red-800",
    "Ulaşım": "bg-emerald-100 text-emerald-800",
    "Yemekhane": "bg-orange-100 text-orange-800",
    "Burs": "bg-cyan-100 text-cyan-800",
    "Kulüpler": "bg-pink-100 text-pink-800",
    "Diğer": "bg-gray-100 text-gray-800",
    "default": "bg-stone-100 text-stone-600"
};

const FILTERS = ["Tümü", "Genel", "Akademik", "Etkinlik", "Acil", "Ulaşım", "Yemekhane", "Burs", "Kulüpler", "Diğer"];

interface Announcement {
    id: string;
    title: string;
    category: string;
    date: string;
    summary: string;
    isPinned?: boolean;
    link?: string;
}

interface LostItem {
    id: string;
    type: 'lost' | 'found';
    title: string;
    description: string;
    category: string;
    contactType: 'instagram' | 'email' | 'phone' | 'location';
    contactValue: string;
    imageURL?: string;
    isPinned: boolean;
    status: 'pending' | 'approved' | 'resolved';
    createdAt: any;
    ownerId?: string;
    ownerName?: string;
    contactHidden?: boolean;
}

// --- COMPONENT ---

interface AnnouncementsSectionProps {
    onBack?: () => void;
}

type Tab = 'announcements' | 'lost-found';
type LostFilterType = 'all' | 'owner_wanted' | 'item_wanted' | 'resolved';

const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({ onBack }) => {
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('announcements');

    // Data State
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [lostItems, setLostItems] = useState<LostItem[]>([]);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [announcementFilter, setAnnouncementFilter] = useState('Tümü');
    const [lostFilter, setLostFilter] = useState<LostFilterType>('all');

    // UI State for Modals & Interactions
    const [isModalOpen, setIsModalOpen] = useState(false); // For Create
    const [activeContactId, setActiveContactId] = useState<string | null>(null);

    // Note Modal State (For replacing report logic)
    const [noteModalItem, setNoteModalItem] = useState<LostItem | null>(null);
    const [noteText, setNoteText] = useState('');
    const [noteSending, setNoteSending] = useState(false);

    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info'; id: number } | null>(null);

    // Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formContactType, setFormContactType] = useState('Instagram');
    const [contactHidden, setContactHidden] = useState(false);

    // Fetch Data with Cache (10 Minutes)
    useEffect(() => {
        const fetchData = async () => {
            // 1. ANNOUNCEMENTS
            const cachedAnnouncements = cache.get(CACHE_KEYS.ANNOUNCEMENTS);
            if (cachedAnnouncements) {
                setAnnouncements(cachedAnnouncements);
            } else {
                try {
                    const q = query(collection(db, "announcements"));
                    const snapshot = await getDocs(q);
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Announcement[];
                    setAnnouncements(data);
                    cache.set(CACHE_KEYS.ANNOUNCEMENTS, data, CACHE_TTL.LONG);
                } catch (error) {
                    console.error("Error fetching announcements:", error);
                }
            }

            // 2. LOST ITEMS
            // We use a separate cache key or just local state if not globally defined, 
            // but user asked for 10 min cache here too.
            const CACHE_KEY_LOST = 'lost_items_cache';
            const cachedLost = cache.get(CACHE_KEY_LOST);
            if (cachedLost) {
                setLostItems(cachedLost);
            } else {
                try {
                    const q = query(collection(db, "lost-items"), where("status", "in", ["approved", "resolved"]));
                    const snapshot = await getDocs(q);
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LostItem[];
                    setLostItems(data);
                    cache.set(CACHE_KEY_LOST, data, CACHE_TTL.LONG);
                } catch (error) {
                    console.error("Error fetching lost items:", error);
                }
            }
        };

        fetchData();
    }, []);

    // Lock body scroll
    useEffect(() => {
        if (isModalOpen || noteModalItem || selectedAnnouncement) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isModalOpen, noteModalItem, selectedAnnouncement]);

    const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
        const id = Date.now();
        setToast({ msg, type, id });
        setTimeout(() => {
            setToast(current => current?.id === id ? null : current);
        }, 4000);
    };

    const markAsRead = (id: string) => {
        const readIds = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
        if (!readIds.includes(id)) {
            const updated = [...readIds, id];
            localStorage.setItem('readAnnouncements', JSON.stringify(updated));
        }
    };

    const handleAnnouncementClick = (item: Announcement) => {
        setSelectedAnnouncement(item);
        markAsRead(item.id);
    };

    // Helper function to ensure links are absolute
    const ensureAbsoluteUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    const getCardStyle = (category: string) => CATEGORY_STYLES[category] || CATEGORY_STYLES["default"];
    const getBadgeStyle = (category: string) => CATEGORY_BADGES[category] || CATEGORY_BADGES["default"];

    const filteredAnnouncements = announcements.filter(item => {
        const matchesFilter = announcementFilter === 'Tümü' || item.category === announcementFilter;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.summary.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const filteredLostItems = lostItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (lostFilter === 'all') return true;
        else if (lostFilter === 'owner_wanted') return item.type === 'found' && item.status !== 'resolved';
        else if (lostFilter === 'item_wanted') return item.type === 'lost' && item.status !== 'resolved';
        else if (lostFilter === 'resolved') return item.status === 'resolved';
        return true;
    }).sort((a, b) => {
        if (a.status === 'resolved' && b.status !== 'resolved') return 1;
        if (a.status !== 'resolved' && b.status === 'resolved') return -1;
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
    });

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !userProfile) {
            showToast("İlan vermek için giriş yapmalısınız.", 'info');
            return;
        }

        setIsSubmitting(true);
        try {
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);

            let imageURL = "";
            if (selectedFile) {
                const uploadResult = await uploadFile(selectedFile, 'kayip-esya');
                imageURL = uploadResult.url;
            }

            const checkedRadio = form.querySelector('input[name="type"]:checked') as HTMLInputElement;
            const typeVal = checkedRadio?.value === 'Buluntu Eşya' ? 'found' : 'lost';

            await addDoc(collection(db, "lost-items"), {
                type: typeVal,
                title: formData.get('title'),
                category: formData.get('category'),
                description: "",
                contactType: formData.get('contactType'),
                contactValue: formData.get('contactValue'),
                contactHidden: contactHidden,
                ownerId: currentUser.uid,
                ownerName: userProfile.username || 'Anonim',
                ownerDepartment: userProfile.department || 'Bölüm Yok',
                imageURL: imageURL,
                status: 'pending', // Always pending initially
                isPinned: false,
                notes: [], // Initialize empty notes array
                createdAt: serverTimestamp()
            });

            setIsModalOpen(false);
            showToast("İlanınız onaya gönderildi! Admin kontrolünden sonra yayınlanacaktır.");
            setSelectedFile(null);
            setContactHidden(false);
        } catch (error) {
            console.error("Submit error:", error);
            alert("Bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendNote = async () => {
        if (!noteModalItem || !currentUser || !noteText.trim()) return;

        setNoteSending(true);
        try {
            const noteData = {
                authorId: currentUser.uid,
                authorName: userProfile?.username || 'Gizli Kullanıcı',
                authorContact: userProfile?.email || '',
                content: noteText,
                createdAt: new Date().toISOString()
            };

            const ref = doc(db, "lost-items", noteModalItem.id);
            await updateDoc(ref, {
                notes: arrayUnion(noteData)
            });

            setNoteModalItem(null);
            setNoteText('');
            showToast("Notunuz ilan sahibine iletildi.", 'success');
        } catch (e) {
            console.error(e);
            showToast("Mesaj gönderilemedi.", 'info');
        } finally {
            setNoteSending(false);
        }
    };

    const getContactIcon = (type: string) => {
        switch (type) {
            case 'instagram': return <Instagram size={14} />;
            case 'email': return <Mail size={14} />;
            case 'phone': return <Phone size={14} />;
            case 'location': return <MapPin size={14} />;
            default: return <Send size={14} />;
        }
    };

    // Mask Contact info for guests
    const renderContactValue = (val: string, type: string) => {
        if (!currentUser) {
            return val.length > 3 ? val.substring(0, 3) + "**** (Giriş Yap)" : "****";
        }
        return val;
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#f5f5f4] overflow-hidden relative">

            {/* HEADER AREA */}
            <div className="bg-[#f5f5f4] border-b border-stone-200 z-20 shrink-0 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-3 pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 w-full md:w-auto">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onBack}
                                    className="group flex items-center justify-center w-8 h-8 rounded-full bg-stone-200 text-stone-600 hover:bg-boun-red hover:text-white transition-colors"
                                >
                                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                                </button>
                                <h2 className="font-serif text-xl md:text-3xl text-stone-900 tracking-tight whitespace-nowrap">ÖTK Duyurular</h2>
                            </div>

                            <div className="flex p-1 bg-stone-200/60 rounded-lg w-full md:w-auto">
                                <button
                                    onClick={() => setActiveTab('announcements')}
                                    className={cn(
                                        "flex-1 md:flex-none px-4 py-1.5 text-xs md:text-sm font-bold rounded-md transition-all duration-200 whitespace-nowrap",
                                        activeTab === 'announcements' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                                    )}
                                >
                                    Duyurular
                                </button>
                                <button
                                    onClick={() => setActiveTab('lost-found')}
                                    className={cn(
                                        "flex-1 md:flex-none px-4 py-1.5 text-xs md:text-sm font-bold rounded-md transition-all duration-200 whitespace-nowrap",
                                        activeTab === 'lost-found' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                                    )}
                                >
                                    Kayıp Eşya
                                </button>
                            </div>
                        </div>

                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder={activeTab === 'announcements' ? "Ara..." : "Eşya ara..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-stone-500 font-sans text-xs md:text-sm transition-all"
                            />
                            <Search className="absolute left-2.5 top-2.5 text-stone-400" size={14} />
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="bg-stone-100 border-b border-stone-200 px-4 md:px-8 py-2 shrink-0">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
                        {activeTab === 'announcements' ? (
                            <div className="flex items-center gap-1 md:gap-2 w-full min-w-max">
                                {FILTERS.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setAnnouncementFilter(cat)}
                                        className={cn(
                                            "flex items-center justify-center py-1.5 text-[10px] md:text-xs font-bold rounded-full border whitespace-nowrap px-3 transition-colors",
                                            announcementFilter === cat
                                                ? "bg-stone-800 text-white border-stone-800"
                                                : "bg-white text-stone-600 border-stone-300 hover:bg-stone-50"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 md:flex md:items-center gap-1 md:gap-2 w-full">
                                <button onClick={() => setLostFilter('all')} className={cn("flex items-center justify-center py-1.5 text-[10px] md:text-xs font-bold rounded md:rounded-full border whitespace-nowrap px-1", lostFilter === 'all' ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-600 border-stone-300 hover:bg-stone-50")}>
                                    Tümü
                                </button>
                                <button onClick={() => setLostFilter('owner_wanted')} className={cn("flex items-center justify-center gap-1 py-1.5 text-[10px] md:text-xs font-bold rounded md:rounded-full border whitespace-nowrap px-1", lostFilter === 'owner_wanted' ? "bg-boun-green text-white border-boun-green" : "bg-white text-boun-green border-stone-300 hover:bg-stone-50")}>
                                    <CheckCircle size={10} className="hidden sm:inline" />
                                    <span className="md:hidden">Buluntu</span><span className="hidden md:inline">Sahibi Aranıyor</span>
                                </button>
                                <button onClick={() => setLostFilter('item_wanted')} className={cn("flex items-center justify-center gap-1 py-1.5 text-[10px] md:text-xs font-bold rounded md:rounded-full border whitespace-nowrap px-1", lostFilter === 'item_wanted' ? "bg-orange-600 text-white border-orange-600" : "bg-white text-orange-600 border-stone-300 hover:bg-stone-50")}>
                                    <HelpCircle size={10} className="hidden sm:inline" />
                                    <span className="md:hidden">Kayıp</span><span className="hidden md:inline">Eşya Aranıyor</span>
                                </button>
                                <button onClick={() => setLostFilter('resolved')} className={cn("flex items-center justify-center gap-1 py-1.5 text-[10px] md:text-xs font-bold rounded md:rounded-full border whitespace-nowrap px-1", lostFilter === 'resolved' ? "bg-stone-500 text-white border-stone-500" : "bg-white text-stone-500 border-stone-300 hover:bg-stone-50")}>
                                    <Archive size={10} className="hidden sm:inline" />
                                    <span className="md:hidden">Çözüldü</span><span className="hidden md:inline">Bulundu/Çözüldü</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {activeTab === 'lost-found' && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (currentUser) {
                                    setIsModalOpen(true);
                                } else {
                                    navigate('/auth/login');
                                }
                            }}
                            className="hidden md:flex ml-4 px-4 py-1.5 bg-boun-red text-white text-xs font-bold rounded-full shadow-md items-center gap-1 hover:bg-red-800 transition-colors shrink-0 cursor-pointer"
                        >
                            <Plus size={14} />
                            <span>İlan Oluştur</span>
                        </button>
                    )}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-3 md:p-8 custom-scrollbar bg-[#f5f5f4] touch-pan-y">
                <div className="max-w-7xl mx-auto w-full pb-20">
                    <AnimatePresence mode="wait">
                        {activeTab === 'announcements' ? (
                            <motion.div
                                key="announcements"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
                            >
                                {filteredAnnouncements.length === 0 && (
                                    <div className="col-span-full text-center text-stone-400 py-12">
                                        <Megaphone size={48} className="mx-auto mb-2 opacity-20" />
                                        <p className="font-serif italic">Henüz bir duyuru bulunmuyor.</p>
                                    </div>
                                )}
                                {filteredAnnouncements.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        className={cn(
                                            "relative flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 rounded-lg rounded-l-none border border-stone-100 p-4 md:p-6 cursor-pointer md:min-h-[220px] group border-l-4",
                                            getCardStyle(item.category),
                                            item.isPinned && "border-t-4 border-t-boun-red"
                                        )}
                                        onClick={() => handleAnnouncementClick(item)}
                                        whileHover={{ y: -4 }}
                                    >
                                        {item.isPinned && <div className="absolute -top-3 right-4 z-10 drop-shadow-sm text-boun-red"><Pin size={24} fill="currentColor" className="transform rotate-12" /></div>}

                                        <div className="flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={cn("inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-transparent/10", getBadgeStyle(item.category))}>
                                                    {item.category}
                                                </span>
                                            </div>
                                            <h3 className="font-serif font-bold text-lg md:text-xl text-stone-900 leading-tight mb-3 group-hover:text-boun-red transition-colors">
                                                {item.title}
                                            </h3>
                                            <div className="flex-grow">
                                                <p className="font-sans text-sm leading-relaxed whitespace-pre-line text-stone-500 line-clamp-3">{item.summary}</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-stone-200/50">
                                                <span className="flex text-xs text-stone-400 font-medium font-sans items-center gap-1">
                                                    <Calendar size={12} /> {formatDate(item.date)}
                                                </span>
                                                <span className="text-xs font-bold text-stone-800 underline decoration-stone-300 underline-offset-4 group-hover:decoration-boun-red transition-all">Detaylar</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="lost-found"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8"
                            >
                                {filteredLostItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "bg-white shadow-sm rounded-lg transform transition-all hover:scale-[1.02] hover:shadow-xl relative flex",
                                            "flex-row md:flex-col p-0 md:p-3 h-28 md:h-auto overflow-hidden",
                                            item.status === 'resolved' && "grayscale opacity-70 hover:scale-100 hover:shadow-lg cursor-not-allowed"
                                        )}
                                    >
                                        <div className="absolute top-2 right-2 md:top-5 md:right-5 z-10 flex gap-1">
                                            {item.isPinned && item.status !== 'resolved' && <span className="bg-boun-red text-white p-1 rounded-sm"><Pin size={10} fill="currentColor" /></span>}
                                            {item.status === 'resolved' ? (
                                                <span className="px-2 py-0.5 bg-stone-600 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm rounded-sm">ÇÖZÜLDÜ</span>
                                            ) : (
                                                item.type === 'found' ? (
                                                    <span className="px-2 py-0.5 bg-boun-green text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm rounded-sm">BULUNTU</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-orange-600 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm rounded-sm">KAYIP</span>
                                                )
                                            )}
                                        </div>

                                        <div className={cn(
                                            "relative flex items-center justify-center border-l md:border-l-0 md:border md:border-stone-100 md:rounded-sm overflow-hidden",
                                            "w-[30%] md:w-full h-full md:aspect-square order-last md:order-first bg-stone-50"
                                        )}>
                                            {item.imageURL ? (
                                                <img src={item.imageURL} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="text-white opacity-50 w-6 h-6 md:w-12 md:h-12" />
                                            )}

                                            {item.status === 'resolved' && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px]">
                                                    <div className="border-2 md:border-4 border-stone-800 text-stone-800 px-1 md:px-2 py-0.5 md:py-1 font-serif font-black text-xs md:text-xl uppercase tracking-widest transform -rotate-12 opacity-80 text-center">
                                                        {item.type === 'found' ? 'TESLİM EDİLDİ' : 'BULUNDU'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col p-3 md:px-1 md:pb-2 justify-between min-w-0">
                                            <div>
                                                <h3 className="font-serif font-bold text-sm md:text-lg text-stone-900 leading-tight mb-1 md:mb-2 truncate pr-6">{item.title}</h3>
                                                <div className="space-y-0.5 md:space-y-1.5 mb-2">
                                                    <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-stone-600 font-sans"><Calendar size={10} className="shrink-0 text-stone-400" /><span>{formatDate(item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : new Date().toISOString())}</span></div>
                                                    <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-stone-600 font-sans font-bold"><span className="text-stone-400 shrink-0">Kimden:</span> {item.ownerName || 'Anonim'}</div>
                                                </div>
                                            </div>

                                            {item.status !== 'resolved' && (
                                                <div className="mt-auto space-y-2 md:space-y-3 relative">
                                                    {!item.contactHidden ? (
                                                        <div className="relative">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!currentUser) {
                                                                        showToast("İletişim bilgilerini görmek için giriş yapmalısınız.", 'info');
                                                                        return;
                                                                    }
                                                                    setActiveContactId(activeContactId === item.id ? null : item.id);
                                                                }}
                                                                className="w-full py-1 md:py-2 border border-stone-300 text-stone-600 text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-stone-800 hover:text-white hover:border-stone-800 transition-colors rounded-sm flex items-center justify-center gap-1 md:gap-2"
                                                            >
                                                                {currentUser ? <Send size={10} /> : <Lock size={10} />} İletişim
                                                            </button>

                                                            <AnimatePresence>
                                                                {activeContactId === item.id && currentUser && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: 10 }}
                                                                        className="absolute bottom-full left-0 right-0 mb-2 p-2 md:p-3 bg-stone-900 text-white rounded shadow-xl z-20 text-xs text-center font-sans"
                                                                    >
                                                                        <div className="flex items-center justify-center gap-2 mb-1 uppercase tracking-widest text-[10px] text-stone-400">
                                                                            {getContactIcon(item.contactType)}
                                                                            <span className="font-bold">{item.contactType}</span>
                                                                        </div>
                                                                        <div className="text-white select-all font-bold text-sm">{renderContactValue(item.contactValue, item.contactType)}</div>
                                                                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-900 rotate-45"></div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full py-1 md:py-2 border border-stone-200 bg-stone-50 text-stone-400 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1 cursor-not-allowed">
                                                            <EyeOff size={10} /> Gizli İletişim
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!currentUser) {
                                                                showToast("Mesaj göndermek için giriş yapmalısınız.", 'info');
                                                                return;
                                                            }
                                                            setNoteModalItem(item);
                                                        }}
                                                        className="w-full text-center text-[9px] md:text-xs text-boun-blue font-bold uppercase tracking-wider hover:text-blue-800 transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <MessageCircle size={12} /> <span className="hidden sm:inline">Bilgi Ver / Not Bırak</span><span className="sm:hidden">Bilgi Ver</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* MOBILE CREATE BUTTON */}
            {activeTab === 'lost-found' && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (currentUser) setIsModalOpen(true);
                        else navigate('/auth/login');
                    }}
                    className="md:hidden absolute bottom-8 right-6 z-50 w-14 h-14 bg-boun-red text-white rounded-full shadow-[0_4px_12px_rgba(138,27,27,0.4)] flex items-center justify-center cursor-pointer pointer-events-auto active:scale-95 transition-transform"
                >
                    <Plus size={28} />
                </button>
            )}

            {/* MODAL: ANNOUNCEMENT DETAILS */}
            {createPortal(
                <AnimatePresence>
                    {selectedAnnouncement && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAnnouncement(null)} className="absolute inset-0 bg-stone-900/60 md:backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-3xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                                <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex justify-between items-center shrink-0">
                                    <div className="flex items-center gap-3">
                                        <span className={cn("inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border border-transparent/10", getBadgeStyle(selectedAnnouncement.category))}>{selectedAnnouncement.category}</span>
                                        <span className="flex items-center gap-1 text-xs text-stone-500 font-bold"><Calendar size={12} /> {formatDate(selectedAnnouncement.date)}</span>
                                    </div>
                                    <button onClick={() => setSelectedAnnouncement(null)} className="text-stone-400 hover:text-stone-700 bg-stone-200/50 hover:bg-stone-200 p-1.5 rounded-full transition-colors"><X size={20} /></button>
                                </div>
                                <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar overflow-x-hidden">
                                    <h2 className="font-serif text-2xl md:text-4xl font-bold text-stone-900 mb-6 leading-tight">{selectedAnnouncement.title}</h2>
                                    <div className="font-sans text-stone-700 text-base md:text-lg leading-relaxed whitespace-pre-line break-words">{selectedAnnouncement.summary}</div>
                                    {selectedAnnouncement.link && (
                                        <div className="mt-8 pt-6 border-t border-stone-100">
                                            <a href={ensureAbsoluteUrl(selectedAnnouncement.link)} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-3 rounded text-sm font-bold hover:bg-stone-700 transition-all shadow-md hover:shadow-lg active:scale-95"><ExternalLink size={16} /> Bağlantıya Git</a>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* MODAL: CREATE LISTING */}
            {createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-stone-900/40 md:backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden my-auto z-10 max-h-[90vh] flex flex-col">
                                <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex justify-between items-center sticky top-0 z-10 shrink-0">
                                    <h3 className="font-serif font-bold text-xl text-stone-800">Yeni İlan Oluştur</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
                                </div>

                                <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto">
                                    <div className="bg-blue-50 p-3 rounded text-blue-800 text-xs flex gap-2 items-start border border-blue-100">
                                        <CheckCircle size={14} className="mt-0.5 shrink-0" />
                                        <span>İsim ve bölüm bilginiz profilinizden (<b>{userProfile?.username}</b>) otomatik eklenecektir. İlan onaylandıktan sonra yayına girer.</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">İlan Tipi</label>
                                        <div className="flex gap-4">
                                            <label className="flex-1 cursor-pointer group">
                                                <input type="radio" name="type" value="Kayıp Eşya" className="peer sr-only" defaultChecked />
                                                <div className="text-center py-2 border border-stone-300 rounded peer-checked:bg-orange-600 peer-checked:text-white peer-checked:border-orange-600 transition-all text-sm font-bold text-stone-600 group-hover:bg-stone-50">Kayıp Eşya</div>
                                            </label>
                                            <label className="flex-1 cursor-pointer group">
                                                <input type="radio" name="type" value="Buluntu Eşya" className="peer sr-only" />
                                                <div className="text-center py-2 border border-stone-300 rounded peer-checked:bg-boun-green peer-checked:text-white peer-checked:border-boun-green transition-all text-sm font-bold text-stone-600 group-hover:bg-stone-50">Buluntu Eşya</div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-bold text-stone-700 mb-1">Başlık</label>
                                            <input name="title" type="text" placeholder="Örn: Mavi Termos" className="w-full px-3 py-2 border border-stone-300 rounded focus:ring-1 focus:ring-stone-500 outline-none text-sm" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-stone-700 mb-1">Kategori</label>
                                            <select name="category" className="w-full px-3 py-2 border border-stone-300 rounded focus:ring-1 focus:ring-stone-500 outline-none text-sm bg-white">
                                                <option>Elektronik</option>
                                                <option>Giyim</option>
                                                <option>Cüzdan/Kart</option>
                                                <option>Aksesuar</option>
                                                <option>Diğer</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-1">Fotoğraf (Opsiyonel)</label>
                                        <div className="border-2 border-dashed border-stone-300 rounded-lg p-4 flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 hover:border-stone-400 transition-colors cursor-pointer relative">
                                            <input type="file" accept="image/*" onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            {selectedFile ? (
                                                <div className="text-stone-800 font-bold text-sm flex items-center gap-2"><CheckCircle size={16} className="text-boun-green" /> {selectedFile.name}</div>
                                            ) : (
                                                <><Upload size={24} className="mb-2" /><span className="text-xs">Resim yüklemek için tıklayın</span></>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">İletişim Tercihi</label>
                                        <div className="flex gap-2">
                                            <select name="contactType" className="w-1/3 px-2 py-2 border border-stone-300 rounded text-sm bg-white" value={formContactType} onChange={(e) => setFormContactType(e.target.value)}>
                                                <option value="instagram">Instagram</option>
                                                <option value="email">Email</option>
                                                <option value="phone">Telefon</option>
                                                <option value="location">Konum</option>
                                            </select>
                                            <input name="contactValue" type="text" placeholder="İletişim bilgisi..." className="flex-1 px-3 py-2 border border-stone-300 rounded focus:ring-1 focus:ring-stone-500 outline-none text-sm" required />
                                        </div>
                                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                            <input type="checkbox" checked={contactHidden} onChange={(e) => setContactHidden(e.target.checked)} className="rounded text-stone-900 focus:ring-0 accent-stone-900" />
                                            <span className="text-xs text-stone-600 font-bold">Telefon/İletişim bilgimi ilanda gizle (Sadece not bırakılabilir)</span>
                                        </label>
                                    </div>

                                    <div className="pt-4">
                                        <button type="submit" disabled={isSubmitting} className="w-full bg-stone-900 text-white font-bold py-3 rounded hover:bg-stone-700 transition-colors shadow-lg disabled:opacity-70 flex items-center justify-center gap-2">
                                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "İlanı Onaya Gönder"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* MODAL: SEND NOTE */}
            {createPortal(
                <AnimatePresence>
                    {noteModalItem && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNoteModalItem(null)} className="fixed inset-0 bg-stone-900/60 md:backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm z-10">
                                <h3 className="font-serif font-bold text-lg text-stone-900 mb-2">İlan Sahibine Not Bırak</h3>
                                <p className="text-sm text-stone-500 mb-4">
                                    Eşyayı bulduysanız veya bilgi vermek istiyorsanız buradan yazabilirsiniz. Mesajınız gizli kalacaktır.
                                </p>
                                <textarea
                                    className="w-full p-3 border border-stone-300 rounded text-sm min-h-[100px] mb-4 focus:ring-1 focus:ring-stone-500 outline-none"
                                    placeholder="Örn: Kimliği kütüphane güvenliğine bıraktım..."
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                />
                                <div className="flex gap-3">
                                    <button onClick={() => setNoteModalItem(null)} className="flex-1 py-2 border border-stone-300 rounded text-stone-600 font-bold text-sm hover:bg-stone-50">Vazgeç</button>
                                    <button onClick={handleSendNote} disabled={noteSending || !noteText.trim()} className="flex-1 py-2 bg-stone-900 text-white rounded font-bold text-sm hover:bg-stone-700 disabled:opacity-50">
                                        {noteSending ? "Gönderiliyor..." : "Gönder"}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* TOAST */}
            {createPortal(
                <AnimatePresence>
                    {toast && (
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] w-max max-w-[90vw]">
                            <div className={cn("px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-bold border", toast.type === 'success' ? "bg-stone-900 text-white border-stone-700" : "bg-white text-stone-800 border-stone-200")}>
                                {toast.type === 'success' ? <CheckCircle size={18} className="text-boun-green" /> : <AlertTriangle size={18} className="text-boun-gold" />}
                                <span className="truncate">{toast.msg}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

        </div>
    );
};

export default AnnouncementsSection;