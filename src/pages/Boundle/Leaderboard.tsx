import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import UserStatsCard from './components/UserStatsCard';

interface LeaderboardProps {
    compactView?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ compactView = false }) => {
    // DUMMY DATA FOR DEMO
    const leaderboardData = Array.from({ length: 15 }).map((_, i) => ({
        rank: i + 1,
        username: i === 0 ? "Barış Yazıcı" : i === 1 ? "Umut A." : `Öğrenci ${i + 142}`,
        score: 1250 - (i * 45),
        photo: null
    }));

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

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                {leaderboardData.map((user, index) => (
                    <motion.div
                        key={index}
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
                                        `#${user.rank}`
                            }
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden border border-stone-100">
                            <User size={20} className="text-stone-400" />
                        </div>

                        {/* İsim */}
                        <div className="flex-1">
                            <h4 className="font-bold text-stone-800 text-sm">{user.username}</h4>
                            <span className="text-xs text-stone-400">Boğaziçi Üniv.</span>
                        </div>

                        {/* Puan */}
                        <div className="font-mono font-bold text-boun-blue">
                            {user.score}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="text-center text-xs text-stone-400 pb-4">
                Sıralama her 15 dakikada bir güncellenir.
            </div>
        </div>
    );
};

export default Leaderboard;
