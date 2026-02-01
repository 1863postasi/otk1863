import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, getDocs, documentId } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadFile } from '../lib/storage';
import { updateUserProfile, changePassword } from '../lib/user_service';
import { MOCK_FACULTIES } from '../lib/data';
import { cn } from '../lib/utils';
import { Archive, Settings, Bookmark, X, Edit3, GraduationCap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Modular Components
import IdentityCard from './Profile/IdentityCard';
import MyListings from './Profile/MyListings';
import SavedEvents from './Profile/SavedEvents';
import SettingsTab from './Profile/SettingsTab';

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

    const handlePasswordChange = async (p1: string, p2: string) => {
        await changePassword(p1);
    };

    const handleResolveItem = async (id: string) => {
        if (window.confirm("Bu ilanı çözüldü olarak işaretlemek istediğinize emin misiniz?")) {
            await updateDoc(doc(db, "lost-items", id), { status: 'resolved' });
        }
    };

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

                {/* LEFT: IDENTITY CARD */}
                <IdentityCard
                    userProfile={userProfile}
                    fileInputRef={fileInputRef}
                    avatarUploading={avatarUploading}
                    clubNames={clubNames}
                    myItemsCount={myItems.length}
                    savedEventsCount={userProfile.savedEventIds?.length || 0}
                    onAvatarUpload={handleAvatarUpload}
                    onEditClick={openEdit}
                />

                {/* RIGHT: TABS & CONTENT */}
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
                            {activeTab === 'listings' && <MyListings items={myItems} loading={loadingData} onResolve={handleResolveItem} />}
                            {activeTab === 'saved' && <SavedEvents events={savedEvents} />}
                            {activeTab === 'settings' && <SettingsTab onPasswordChange={handlePasswordChange} onLogout={logout} />}
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
                                <button onClick={() => setIsEditModalOpen(false)}><X size={24} className="text-stone-400 hover:text-stone-700" /></button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Görünen İsim (Ayda 1 Kez)</label>
                                    <input
                                        type="text"
                                        value={editForm.displayName}
                                        onChange={e => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
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
                                            onChange={e => setEditForm(prev => ({ ...prev, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') }))}
                                            className="w-full pl-8 pr-4 py-3 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Bölüm</label>
                                    <select
                                        value={editForm.department}
                                        onChange={e => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 outline-none"
                                    >
                                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 rounded-lg font-bold text-stone-500 hover:bg-stone-100 transition-colors">İptal</button>
                                    <button onClick={handleProfileUpdate} disabled={savingProfile} className="px-8 py-3 bg-stone-900 text-white rounded-lg font-bold shadow-lg hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                                        <Edit3 size={16} />
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