import React from 'react';
import { useBoundle } from '../../../lib/boundle/hooks';
import { Trophy, Star, HelpCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface UserStatsCardProps {
    className?: string;
    compact?: boolean;
    onOpenHelp?: () => void;
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({ className, compact = false, onOpenHelp }) => {
    const { stats, loading } = useBoundle();

    // Bugünkü toplam puan (lastPlayedDate === bugün olan oyunlar)
    // hook içindeki canPlay mantığına benzer
    const today = new Date().toISOString().split('T')[0];

    const todayScore = Object.values(stats.games).reduce((acc: number, game: any) => {
        // Eğer oyunun oynanma tarihi bugünse, puano ekle
        return game.lastPlayedDate === today ? acc + game.lastScore : acc;
    }, 0);

    if (loading) return null; // veya skeleton

    return (
        <div className={cn("bg-white rounded-xl border border-stone-200 shadow-sm p-4", className)}>
            <div className="flex items-center justify-between gap-4">

                {/* Günlük Puan */}
                <div className="flex-1 text-center border-r border-stone-100 last:border-0">
                    <div className="flex items-center justify-center gap-1.5 text-stone-500 mb-1">
                        <Star size={16} className="text-boun-gold" fill="currentColor" />
                        <span className="text-xs font-bold uppercase tracking-wider">Bugün</span>
                    </div>
                    <div className="text-2xl font-bold text-stone-800 font-mono">
                        +{todayScore}
                    </div>
                </div>

                {/* Toplam Puan */}
                <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-stone-500 mb-1">
                        <Trophy size={16} className="text-boun-blue" />
                        <span className="text-xs font-bold uppercase tracking-wider">Toplam</span>
                    </div>
                    <div className="text-2xl font-bold text-stone-800 font-mono">
                        {stats.totalScore}
                    </div>
                </div>

            </div>

            {!compact && (
                <div className="mt-3 pt-3 border-t border-stone-100 text-center">
                    <button
                        onClick={onOpenHelp}
                        className="text-xs text-stone-400 hover:text-boun-blue flex items-center justify-center gap-1.5 mx-auto transition-colors py-1 px-3 rounded-full hover:bg-blue-50"
                    >
                        <HelpCircle size={14} />
                        <span className="font-bold">Nasıl Oynanır? / Hata Bildir</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserStatsCard;
