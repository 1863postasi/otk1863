import React, { useState, useEffect, useMemo } from 'react';
import { Header, Input } from '../components/SharedUI';
import { Search, Edit3, Shield, User, Loader2, Save, X, Plus, Trash2, GraduationCap } from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface UserData {
    uid: string;
    username: string;
    email: string;
    department: string;
    role: 'student' | 'admin' | 'moderator';
    clubRoles?: Record<string, string>; // { "club_id": "official" }
    photoURL?: string;
}

interface ClubData {
    id: string;
    shortName: string;
    name: string;
}

export const UsersPanel = () => {
    // --- STATE ---
    const [users, setUsers] = useState<UserData[]>([]);
    const [clubs, setClubs] = useState<ClubData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal & Editing State
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [tempClubRoles, setTempClubRoles] = useState<Record<string, string>>({});
    const [selectedClubToAdd, setSelectedClubToAdd] = useState<string>('');
    const [saving, setSaving] = useState(false);

    // --- FETCH DATA ---
    useEffect(() => {
        // 1. Fetch Clubs (for reference in dropdowns and badges)
        const unsubClubs = onSnapshot(collection(db, "clubs"), (snapshot) => {
            const clubList = snapshot.docs.map(doc => ({
                id: doc.id,
                shortName: doc.data().shortName,
                name: doc.data().name
            }));
            setClubs(clubList);
        });

        // 2. Fetch Users
        const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
            const userList = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            })) as UserData[];
            setUsers(userList);
            setLoading(false);
        });

        return () => { unsubClubs(); unsubUsers(); };
    }, []);

    // --- HELPER: Get Club Name by ID ---
    const getClubName = (id: string) => {
        return clubs.find(c => c.id === id)?.shortName || id;
    };

    // --- HANDLERS ---

    const openEditModal = (user: UserData) => {
        setEditingUser(user);
        setTempClubRoles(user.clubRoles || {});
        setSelectedClubToAdd('');
    };

    const closeEditModal = () => {
        setEditingUser(null);
        setTempClubRoles({});
    };

    const handleAddRole = () => {
        if (!selectedClubToAdd) return;
        
        // Prevent duplicate
        if (tempClubRoles[selectedClubToAdd]) {
            alert("Bu kulüp yetkisi zaten tanımlı.");
            return;
        }

        setTempClubRoles(prev => ({
            ...prev,
            [selectedClubToAdd]: 'official' // Fixed role type
        }));
        setSelectedClubToAdd('');
    };

    const handleRemoveRole = (clubId: string) => {
        setTempClubRoles(prev => {
            const updated = { ...prev };
            delete updated[clubId];
            return updated;
        });
    };

    const handleSave = async () => {
        if (!editingUser) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, "users", editingUser.uid), {
                clubRoles: tempClubRoles
            });
            closeEditModal();
        } catch (error) {
            console.error("Yetki güncellenirken hata:", error);
            alert("Hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    // --- FILTERING ---
    const filteredUsers = useMemo(() => {
        const lowerQ = searchQuery.toLowerCase();
        return users.filter(u => 
            (u.username?.toLowerCase() || '').includes(lowerQ) ||
            (u.email?.toLowerCase() || '').includes(lowerQ) ||
            (u.department?.toLowerCase() || '').includes(lowerQ)
        );
    }, [users, searchQuery]);

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <Header title="Üye ve Yetki Yönetimi" desc="Kullanıcılara kulüp yönetim yetkisi tanımlayın." />

            {/* Toolbar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                <div className="relative w-full max-w-md">
                    <input 
                        type="text" 
                        placeholder="İsim, kullanıcı adı veya bölüm ara..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-400 outline-none text-sm transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
                </div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Toplam {users.length} Üye
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-stone-100 text-stone-600 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-4">Kullanıcı</th>
                                <th className="p-4">Rol & Bölüm</th>
                                <th className="p-4">Kulüp Yetkileri</th>
                                <th className="p-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {loading && (
                                <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-stone-400"/></td></tr>
                            )}
                            {!loading && filteredUsers.length === 0 && (
                                <tr><td colSpan={4} className="p-8 text-center text-stone-400 italic">Kullanıcı bulunamadı.</td></tr>
                            )}
                            {filteredUsers.map(user => (
                                <tr key={user.uid} className="hover:bg-stone-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold overflow-hidden border border-stone-300">
                                                {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover"/> : <User size={20}/>}
                                            </div>
                                            <div>
                                                <div className="font-bold text-stone-900">{user.username}</div>
                                                <div className="text-xs text-stone-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                                user.role === 'admin' ? "bg-red-50 text-red-700 border-red-200" : "bg-stone-100 text-stone-600 border-stone-200"
                                            )}>
                                                {user.role === 'admin' ? 'Yönetici' : 'Öğrenci'}
                                            </span>
                                            <span className="text-xs text-stone-500 flex items-center gap-1">
                                                <GraduationCap size={10} /> {user.department || 'Bölüm Yok'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.clubRoles && Object.keys(user.clubRoles).length > 0 ? (
                                                Object.keys(user.clubRoles).map(clubId => (
                                                    <span key={clubId} className="px-2 py-1 bg-boun-blue/10 text-boun-blue border border-boun-blue/20 rounded text-xs font-bold">
                                                        {getClubName(clubId)}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-stone-300 text-xs italic">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => openEditModal(user)}
                                            className="p-2 bg-white border border-stone-200 rounded text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-colors shadow-sm"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EDIT MODAL */}
            <AnimatePresence>
                {editingUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-stone-200"
                        >
                            <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex justify-between items-center">
                                <h3 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2">
                                    <Shield size={20} className="text-boun-gold" /> Yetkilendirme
                                </h3>
                                <button onClick={closeEditModal} className="text-stone-400 hover:text-stone-700"><X size={20}/></button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* User Summary */}
                                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded border border-stone-200">
                                    <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center font-bold text-stone-500">
                                        {editingUser.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-stone-900">{editingUser.username}</div>
                                        <div className="text-xs text-stone-500">{editingUser.email}</div>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="text-[10px] font-bold uppercase bg-stone-200 text-stone-600 px-2 py-1 rounded">
                                            {editingUser.role} (Değiştirilemez)
                                        </span>
                                    </div>
                                </div>

                                {/* Club Role Manager */}
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Kulüp Yetkisi Ekle</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <select 
                                                className="w-full pl-3 pr-8 py-2.5 bg-white border border-stone-300 rounded text-sm focus:ring-2 focus:ring-stone-800 outline-none appearance-none cursor-pointer"
                                                value={selectedClubToAdd}
                                                onChange={(e) => setSelectedClubToAdd(e.target.value)}
                                            >
                                                <option value="">Kulüp Seçiniz...</option>
                                                {clubs.map(c => (
                                                    <option key={c.id} value={c.id}>{c.shortName} - {c.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-3 pointer-events-none text-stone-400">
                                                <Plus size={14} className="rotate-45" /> {/* Down Arrow ish */}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleAddRole}
                                            disabled={!selectedClubToAdd}
                                            className="bg-stone-900 text-white px-4 py-2 rounded font-bold text-sm hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            <Plus size={16} /> Ekle
                                        </button>
                                    </div>
                                </div>

                                {/* Current Roles List */}
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Mevcut Yetkiler</label>
                                    <div className="min-h-[100px] border border-stone-200 rounded-lg p-2 bg-stone-50/50 space-y-2">
                                        {Object.keys(tempClubRoles).length === 0 && (
                                            <div className="text-center py-8 text-xs text-stone-400 italic">
                                                Bu kullanıcının yetkisi yok.
                                            </div>
                                        )}
                                        {Object.keys(tempClubRoles).map(clubId => (
                                            <div key={clubId} className="flex justify-between items-center bg-white p-3 rounded border border-stone-200 shadow-sm animate-in zoom-in-95 duration-200">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-serif font-bold text-stone-800 text-lg">{getClubName(clubId)}</span>
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase border border-green-200">Official</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleRemoveRole(clubId)}
                                                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Yetkiyi Kaldır"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
                                <button onClick={closeEditModal} className="px-4 py-2 text-sm font-bold text-stone-600 hover:bg-stone-200 rounded">Vazgeç</button>
                                <button 
                                    onClick={handleSave} 
                                    disabled={saving}
                                    className="px-6 py-2 bg-stone-900 text-white rounded font-bold text-sm hover:bg-stone-700 transition-all flex items-center gap-2"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                                    Değişiklikleri Kaydet
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};