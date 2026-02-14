import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import UserStatsCard from './components/UserStatsCard';
import { doc, onSnapshot } from 'firebase/firestore';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile, useAuth } from '../../context/AuthContext';

interface LeaderboardProps {
    compactView?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ compactView = false }) => {
    const { currentUser, userProfile } = useAuth();
    const [leaders, setLeaders] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Aggregated Leaderboard (Function tarafından hesaplanan tek döküman)
        // Performans için users collection'ı yerine leaderboards/global okunuyor.
        const lbRef = doc(db, 'leaderboards', 'global');

        const unsubscribe = onSnapshot(lbRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const allLeaders = data.leaders || [];

                // Adapter: UserProfile formatına uyarla
                // Firestore'daki veri zaten uyumlu ama garanti olsun
                const formattedLeaders: UserProfile[] = allLeaders.map((l: any) => ({
                    uid: l.uid,
                    displayName: l.displayName,
                    username: '', // Aggregated data'da olmayabilir ama display name esas
                    photoUrl: l.photoUrl,
                    department: l.department,
                    boundleScore: l.score
                }));

                // Compact view için limit
                if (compactView) {
                    setLeaders(formattedLeaders.slice(0, 5));
                } else {
                    setLeaders(formattedLeaders);
                }
            } else {
                setLeaders([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Leaderboard error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [compactView]);

    const getDisplayName = (user: UserProfile) => {
        if (user.displayName) return user.displayName;
        if (user.username) return `@${user.username}`;
        return "İsimsiz Oyuncu";
    };

    return (
        <div className="space-y-6">

            {/* Kullanıcı Kartı (Sadece tam görünümde göster) */}
            {!compactView && <UserStatsCard compact className="bg-stone-100 border-stone-200" />}

            <div className={cn("text-center", compactView ? "hidden" : "py-4")}>
                <div className={cn("inline-block text-amber-600 rounded-full ring-4 ring-amber-50", "p-3 mb-3")}>
                    <Trophy size={32} />
                </div>
                <h2 className="font-bold text-stone-800 font-serif text-2xl">Şampiyonlar Ligi</h2>
                <p className="text-xs text-stone-500 mt-1">Boundle Top 50 Sıralaması</p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden min-h-[200px]">
                {loading ? (
                    <div className="p-8 text-center text-stone-400 text-sm">Yükleniyor...</div>
                ) : leaders.length === 0 ? (
                    <div className="p-8 text-center text-stone-400 text-sm">Henüz kimse puan kazanmamış. İlk sen ol!</div>
                ) : (
                    leaders.map((user, index) => (
                        <motion.div
                            key={user.uid || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "flex items-center gap-4 p-4 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors",
                                index < 3 ? "bg-gradient-to-r from-yellow-50/50 to-transparent" : ""
                            )}
                        >
                            {/* Sıralama Numarası / Madalya */}
                            <div className="w-8 flex justify-center font-bold text-stone-400 font-mono">
                                {index === 0 ? <Medal size={24} className="text-yellow-500 drop-shadow-sm" /> :
                                    index === 1 ? <Medal size={24} className="text-stone-400 drop-shadow-sm" /> :
                                        index === 2 ? <Medal size={24} className="text-amber-700 drop-shadow-sm" /> :
                                            `#${index + 1}`
                                }
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden border border-stone-100 shrink-0">
                                {user.photoUrl ? (
                                    <img src={user.photoUrl} alt={getDisplayName(user)} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-stone-400" />
                                )}
                            </div>

                            {/* İsim */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-stone-800 text-sm truncate">{getDisplayName(user)}</h4>
                                <span className="text-xs text-stone-400 truncate block">{user.department || "Boğaziçi Üniv."}</span>
                            </div>

                            {/* Puan */}
                            <div className="font-mono font-bold text-boun-blue">
                                {user.boundleScore || 0}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="text-center text-xs text-stone-400 pb-4">
                Sıralama anlık olarak güncellenir.
            </div>
        </div>
    );
};

export default Leaderboard;
