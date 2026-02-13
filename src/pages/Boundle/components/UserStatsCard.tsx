import React from 'react';
import { useBoundle } from '../../../lib/boundle/hooks';
import { Trophy, Star, Calendar } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface UserStatsCardProps {
    className?: string;
    compact?: boolean;
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({ className, compact = false }) => {
    const { stats } = useBoundle();

    // Bugünkü toplam puan (Oyunların lastScore'larından hesaplanabilir ama playedToday true olanlar)
    const todayScore = Object.values(stats.games).reduce((acc: number, game: any) => {
        return game.playedToday ? acc + game.lastScore : acc;
    }, 0);

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
                    <div className="text-xs text-stone-400 flex items-center justify-center gap-1">
                        <Calendar size={12} />
                        <span>Sıfırlanmaya: </span>
                        <span className="font-mono text-stone-600">00:00:00</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserStatsCard;
