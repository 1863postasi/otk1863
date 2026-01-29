import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, getDocs, documentId } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadFile } from '../lib/storage';
import { updateUserProfile, changePassword } from '../lib/user_service';
import { MOCK_FACULTIES } from '../lib/data';
import { formatDate, cn, formatTime } from '../lib/utils';
import { 
  User, Mail, GraduationCap, Archive, AlertTriangle, MessageCircle, Clock, 
  CheckCircle, Camera, Edit3, Settings, Calendar, LogOut, Lock, Bookmark, MapPin, X, ChevronRight, FileText, Scroll
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as router from 'react-router-dom';

const { Link, useNavigate } = router;

interface LostItem {
    id: string;
    type: 'lost' | 'found';
    title: string;
    description: string;
    status: 'pending' | 'approved' | 'resolved';
    createdAt: any;
    imageURL?: string;
    notes?: {
        authorName: string;
        authorContact: string;
        content: string;
        createdAt: string;
    }[];
}

interface SavedEvent {
    id: string;
    title: string;
    startDate: string;
    location: string;
    clubName: string;
}

const Profile = () => {
    const { userProfile, currentUser, refreshProfile, logout } = useAuth();
    const navigate = useNavigate();
    
    // UI State
    const [activeTab, setActiveTab] = useState<'listings' | 'saved' | 'settings'>('listings');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Data State
    const [myItems, setMyItems] = useState<LostItem[]>([]);
    const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [clubNames, setClubNames] = useState<Record<string, string>>({});

    // Edit Form State
    const [editForm, setEditForm] = useState({
        displayName: '',
        username: '',
        department: ''
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password State
    const [passForm, setPassForm] = useState({ p1: '', p2: '' });
    const [passLoading, setPassLoading] = useState(false);

    // 1. Fetch My Listings
    useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, "lost-items"), where("ownerId", "==", currentUser.uid));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LostItem[];
            data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setMyItems(data);
            setLoadingData(false);
        });
        return () => unsub();
    }, [currentUser]);

    // 2. Fetch Saved Events
    useEffect(() => {
        const fetchSaved = async () => {
            if (!userProfile?.savedEventIds || userProfile.savedEventIds.length === 0) {
                setSavedEvents([]);
                return;
            }
            // Fetch individually to preserve order and handle potential missing docs
            const promises = userProfile.savedEventIds.map(id => getDoc(doc(db, "events", id)));
            const docs = await Promise.all(promises);
            const events = docs
                .filter(d => d.exists())
                .map(d => ({ id: d.id, ...d.data() })) as SavedEvent[];
            setSavedEvents(events);
        };
        fetchSaved();
    }, [userProfile?.savedEventIds]);

    // 3. Fetch Club Names for Badges
    useEffect(() => {
        const fetchClubNames = async () => {
            if (!userProfile?.clubRoles) return;
            const clubIds = Object.keys(userProfile.clubRoles);
            if (clubIds.length === 0) return;

            try {
                // Firestore 'in' query works with documentId()
                const q = query(collection(db, "clubs"), where(documentId(), "in", clubIds));
                const snapshot = await getDocs(q);
                const mapping: Record<string, string> = {};
                snapshot.docs.forEach(d => {
                    mapping[d.id] = d.data().shortName;
                });
                setClubNames(mapping);
            } catch (error) {
                console.error("Error fetching club names:", error);
            }
        };
        fetchClubNames();
    }, [userProfile]);

    // Handlers
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !currentUser) return;
        setAvatarUploading(true);
        try {
            const file = e.target.files[0];
            const path = `users/${currentUser.uid}/avatar`;
            const result = await uploadFile(file, path);
            await updateUserProfile(currentUser.uid, { photoUrl: result.url }, userProfile || {});
            await refreshProfile();
        } catch (error) {
            console.error(error);
            alert("Fotoğraf yüklenemedi.");
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleProfileUpdate = async () => {
        if (!currentUser) return;
        setSavingProfile(true);
        try {
            await updateUserProfile(currentUser.uid, editForm, userProfile || {});
            await refreshProfile();
            setIsEditModalOpen(false);
            alert("Profil güncellendi.");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passForm.p1 !== passForm.p2) {
            alert("Şifreler eşleşmiyor.");
            return;
        }
        if (passForm.p1.length < 6) {
            alert("Şifre en az 6 karakter olmalıdır.");
            return;
        }
        setPassLoading(true);
        try {
            await changePassword(passForm.p1);
            alert("Şifreniz başarıyla değiştirildi.");
            setPassForm({ p1: '', p2: '' });
        } catch (error: any) {
            console.error(error);
            alert("Hata: " + error.message);
        } finally {
            setPassLoading(false);
        }
    };

    const handleResolveItem = async (id: string) => {
        if (window.confirm("Bu ilanı çözüldü olarak işaretlemek istediğinize emin misiniz?")) {
            await updateDoc(doc(db, "lost-items", id), { status: 'resolved' });
        }
    };

    // Open Edit Modal with current data
    const openEdit = () => {
        if (userProfile) {
            setEditForm({
                displayName: userProfile.displayName || '',
                username: userProfile.username || '',
                department: userProfile.department || ''
            });
            setIsEditModalOpen(true);
        }
    };

    if (!userProfile) return <div className="min-h-screen flex items-center justify-center bg-[#efede6]">Yükleniyor...</div>;

    const departments = MOCK_FACULTIES.flatMap(f => f.departments.map(d => d.name)).sort();

    return (
        <div className="min-h-screen bg-[#efede6] pt-8 pb-20 px-4 md:px-8 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* --- LEFT: IDENTITY CARD (SIDEBAR) --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center relative overflow-hidden">
                        
                        {/* Avatar */}
                        <div className="relative w-32 h-32 mx-auto mb-6 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#efede6] shadow-inner bg-stone-100 relative">
                                {userProfile.photoUrl ? (
                                    <img src={userProfile.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-stone-800 text-boun-gold font-serif text-4xl font-bold">
                                        {userProfile.displayName?.charAt(0) || userProfile.username.charAt(0)}
                                    </div>
                                )}
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                            {avatarUploading && <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full"><div className="animate-spin w-6 h-6 border-2 border-stone-800 border-t-transparent rounded-full"></div></div>}
                        </div>

                        {/* Name & Info */}
                        <h1 className="font-serif text-2xl font-bold text-stone-900 mb-1">{userProfile.displayName || "İsimsiz"}</h1>
                        <p className="text-stone-400 text-sm font-medium mb-4">@{userProfile.username}</p>
                        
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-full text-xs font-bold text-stone-600 mb-6">
                            <GraduationCap size={14} />
                            <span className="truncate max-w-[200px]">{userProfile.department}</span>
                        </div>

                        {/* Badges / Roles */}
                        {userProfile.clubRoles && Object.keys(userProfile.clubRoles).length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                {Object.keys(userProfile.clubRoles).map(clubId => (
                                    <span key={clubId} className="px-2 py-1 bg-boun-blue/10 text-boun-blue text-[10px] font-bold uppercase rounded border border-boun-blue/20">
                                        {clubNames[clubId] ? `${clubNames[clubId]} Yetkilisi` : '...'}
                                    </span>
                                ))}
                            </div>
                        )}

                        <button onClick={openEdit} className="w-full py-2 border border-stone-300 rounded-lg text-stone-600 font-bold text-sm hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
                            <Edit3 size={16} /> Profili Düzenle
                        </button>
                    </div>

                    {/* Stats / Info Box */}
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 flex justify-around text-center">
                        <div>
                            <div className="font-serif text-2xl font-bold text-stone-900">{myItems.length}</div>
                            <div className="text-xs text-stone-500 font-bold uppercase tracking-wider mt-1">İlan</div>
                        </div>
                        <div className="w-px bg-stone-100"></div>
                        <div>
                            <div className="font-serif text-2xl font-bold text-stone-900">{userProfile.savedEventIds?.length || 0}</div>
                            <div className="text-xs text-stone-500 font-bold uppercase tracking-wider mt-1">Etkinlik</div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: TABS & CONTENT --- */}
                <div className="lg:col-span-8">
                    
                    {/* Tab Navigation */}
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-stone-200 mb-6 sticky top-20 z-10 overflow-x-auto">
                        <button 
                            onClick={() => setActiveTab('listings')} 
                            className={cn("flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-max", activeTab === 'listings' ? "bg-stone-900 text-white shadow-md" : "text-stone-500 hover:bg-stone-50")}
                        >
                            <Archive size={16} /> Kayıp İlanlarım
                        </button>
                        <button 
                            onClick={() => setActiveTab('saved')} 
                            className={cn("flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-max", activeTab === 'saved' ? "bg-stone-900 text-white shadow-md" : "text-stone-500 hover:bg-stone-50")}
                        >
                            <Bookmark size={16} /> Kaydedilenler
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')} 
                            className={cn("flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-max", activeTab === 'settings' ? "bg-stone-900 text-white shadow-md" : "text-stone-500 hover:bg-stone-50")}
                        >
                            <Settings size={16} /> Ayarlar
                        </button>
                    </div>

                    <div className="min-h-[400px]">
                        <AnimatePresence mode="wait">
                            
                            {/* TAB 1: LISTINGS */}
                            {activeTab === 'listings' && (
                                <motion.div 
                                    key="listings" 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    {myItems.length === 0 && (
                                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-300">
                                            <Archive size={48} className="mx-auto text-stone-300 mb-4" />
                                            <p className="text-stone-500 font-medium">Henüz bir ilan paylaşmadınız.</p>
                                        </div>
                                    )}
                                    {myItems.map(item => (
                                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden group">
                                            <div className="p-5 flex flex-col md:flex-row gap-5">
                                                <div className="w-full md:w-32 h-32 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-100">
                                                    {item.imageURL ? <img src={item.imageURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-300"><Archive size={24}/></div>}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border", item.status === 'approved' ? "bg-green-50 text-green-700 border-green-200" : item.status === 'resolved' ? "bg-stone-100 text-stone-500 border-stone-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
                                                                    {item.status === 'approved' ? 'Yayında' : item.status === 'resolved' ? 'Çözüldü' : 'Onay Bekliyor'}
                                                                </span>
                                                                <span className="text-xs text-stone-400 font-mono">{formatDate(item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : new Date().toISOString())}</span>
                                                            </div>
                                                            <h3 className="font-serif font-bold text-lg text-stone-900">{item.title}</h3>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Private Notes Display */}
                                                    {item.notes && item.notes.length > 0 && (
                                                        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
                                                            <h4 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1"><MessageCircle size={12}/> Gelen Mesajlar (Sadece siz görebilirsiniz)</h4>
                                                            <div className="space-y-2">
                                                                {item.notes.map((note, idx) => (
                                                                    <div key={idx} className="bg-white p-2 rounded border border-blue-100 text-xs text-stone-700">
                                                                        <p className="mb-1">{note.content}</p>
                                                                        <div className="text-[10px] text-stone-400 flex justify-between">
                                                                            <span>{note.authorName} ({note.authorContact})</span>
                                                                            <span>{formatDate(note.createdAt)}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {item.status !== 'resolved' && (
                                                        <div className="mt-4 flex justify-end">
                                                            <button 
                                                                onClick={() => handleResolveItem(item.id)}
                                                                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold rounded flex items-center gap-2 transition-colors"
                                                            >
                                                                <CheckCircle size={14} /> Çözüldü Olarak İşaretle
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {/* TAB 2: SAVED (EVENTS & ARCHIVE LINKS) */}
                            {activeTab === 'saved' && (
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
                                            <Calendar size={18}/> Yaklaşan Etkinlikler
                                        </h3>
                                        <div className="space-y-4">
                                            {savedEvents.length === 0 && (
                                                <div className="text-center py-8 bg-white rounded-xl border border-dashed border-stone-300">
                                                    <Calendar size={32} className="mx-auto text-stone-300 mb-2" />
                                                    <p className="text-stone-500 text-sm">Kaydedilen etkinlik yok.</p>
                                                </div>
                                            )}
                                            {savedEvents.map(event => (
                                                <div key={event.id} className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex items-center gap-4 hover:border-boun-gold transition-colors">
                                                    <div className="text-center bg-stone-100 p-3 rounded-lg border border-stone-200 min-w-[70px]">
                                                        <div className="text-xs font-bold text-stone-500 uppercase">{new Date(event.startDate).toLocaleDateString('tr-TR', { month: 'short' })}</div>
                                                        <div className="text-2xl font-serif font-bold text-stone-900">{new Date(event.startDate).getDate()}</div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-[10px] font-bold text-boun-blue bg-blue-50 px-2 py-0.5 rounded w-fit mb-1">{event.clubName}</div>
                                                        <h3 className="font-bold text-stone-900">{event.title}</h3>
                                                        <div className="flex gap-3 mt-1 text-xs text-stone-500">
                                                            <span className="flex items-center gap-1"><Clock size={12}/> {formatTime(event.startDate)}</span>
                                                            <span className="flex items-center gap-1"><MapPin size={12}/> {event.location}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ARCHIVE CTA CARDS */}
                                    <div>
                                        <h3 className="font-serif font-bold text-lg text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-200 pb-2">
                                            <Archive size={18}/> Arşiv Kayıtları
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button 
                                                onClick={() => navigate('/arsiv?view=institutional&saved=true')}
                                                className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all text-left flex items-start justify-between group"
                                            >
                                                <div>
                                                    <h4 className="font-serif font-bold text-lg text-stone-900 mb-1 flex items-center gap-2">
                                                        <FileText size={20} className="text-boun-blue"/> Ders Notları
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
                                                        <Scroll size={20} className="text-boun-gold"/> Kökenler & Anılar
                                                    </h4>
                                                    <p className="text-sm text-stone-500">Favori hikaye ve fotoğraflarınız.</p>
                                                </div>
                                                <ChevronRight className="text-stone-300 group-hover:text-stone-600 transition-colors" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* TAB 3: SETTINGS */}
                            {activeTab === 'settings' && (
                                <motion.div 
                                    key="settings"
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 space-y-8"
                                >
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">Şifre Değiştir</h3>
                                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Yeni Şifre</label>
                                                <input type="password" value={passForm.p1} onChange={e => setPassForm(p => ({...p, p1: e.target.value}))} className="w-full px-3 py-2 border border-stone-300 rounded focus:ring-2 focus:ring-stone-800 outline-none" required minLength={6} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Yeni Şifre (Tekrar)</label>
                                                <input type="password" value={passForm.p2} onChange={e => setPassForm(p => ({...p, p2: e.target.value}))} className="w-full px-3 py-2 border border-stone-300 rounded focus:ring-2 focus:ring-stone-800 outline-none" required />
                                            </div>
                                            <button disabled={passLoading} className="px-6 py-2 bg-stone-900 text-white font-bold rounded text-sm hover:bg-stone-700 transition-colors disabled:opacity-50">
                                                {passLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                                            </button>
                                        </form>
                                    </div>

                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-red-700 mb-4 border-b border-stone-100 pb-2">Oturum</h3>
                                        <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 font-bold rounded border border-red-200 hover:bg-red-100 transition-colors">
                                            <LogOut size={18} /> Çıkış Yap
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* EDIT PROFILE MODAL */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                                <h2 className="font-serif text-2xl font-bold text-stone-900">Profili Düzenle</h2>
                                <button onClick={() => setIsEditModalOpen(false)}><X size={24} className="text-stone-400 hover:text-stone-700"/></button>
                            </div>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Görünen İsim (Ayda 1 Kez)</label>
                                    <input 
                                        type="text" 
                                        value={editForm.displayName} 
                                        onChange={e => setEditForm(prev => ({...prev, displayName: e.target.value}))}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Kullanıcı Adı (2 Ayda 1 Kez)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3 text-stone-400">@</span>
                                        <input 
                                            type="text" 
                                            value={editForm.username} 
                                            onChange={e => setEditForm(prev => ({...prev, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '')}))}
                                            className="w-full pl-8 pr-4 py-3 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Bölüm</label>
                                    <select 
                                        value={editForm.department}
                                        onChange={e => setEditForm(prev => ({...prev, department: e.target.value}))}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 outline-none"
                                    >
                                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                
                                <div className="flex justify-end gap-3 pt-4">
                                    <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 rounded-lg font-bold text-stone-500 hover:bg-stone-100 transition-colors">İptal</button>
                                    <button onClick={handleProfileUpdate} disabled={savingProfile} className="px-8 py-3 bg-stone-900 text-white rounded-lg font-bold shadow-lg hover:bg-stone-800 transition-colors disabled:opacity-50">
                                        {savingProfile ? 'Kaydediliyor...' : 'Kaydet'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;