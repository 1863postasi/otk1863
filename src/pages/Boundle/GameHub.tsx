import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BOUNDLE_GAMES } from '../../lib/boundle/registry';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import UserStatsCard from './components/UserStatsCard';
import Leaderboard from './Leaderboard';

const GameHub: React.FC = () => {
    // Animasyon varyasyonları
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* SOL KOLON: Oyunlar ve İstatistikler */}
            <div className="md:col-span-2 space-y-6">
                {/* Kullanıcı İstatistik Kartı */}
                <UserStatsCard />

                <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-stone-800 text-lg">Günün Oyunları</h3>
                    <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-full">Her gece 00:00'da yenilenir</span>
                </div>

                {/* Oyun Listesi */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4"
                >
                    {BOUNDLE_GAMES.map((game) => {
                        const GameIcon = game.icon;

                        return (
                            <motion.div key={game.id} variants={item}>
                                <Link
                                    to={game.comingSoon ? '#' : game.path}
                                    className={cn(
                                        "group block bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-boun-blue/30 transition-all duration-300 relative",
                                        game.comingSoon && "opacity-75 grayscale-[0.5] hover:shadow-sm cursor-not-allowed"
                                    )}
                                >
                                    <div className="flex items-stretch min-h-[100px]">
                                        {/* Sol İkon Alanı */}
                                        <div className={cn(
                                            "w-24 flex items-center justify-center text-white relative overflow-hidden",
                                            game.color
                                        )}>
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                                            <GameIcon size={32} className="relative z-10 transform group-hover:scale-110 transition-transform duration-300" />

                                            {/* Arkaplan Deseni */}
                                            <div className="absolute -bottom-4 -right-4 text-white/20 transform rotate-12 scale-150">
                                                <GameIcon size={64} />

                                            </div>
                                        </div>

                                        {/* İçerik */}
                                        <div className="flex-1 p-4 flex flex-col justify-between relative">
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-bold text-stone-800 group-hover:text-boun-blue transition-colors">
                                                        {game.name}
                                                    </h4>
                                                    {game.comingSoon && (
                                                        <span className="text-[10px] font-bold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full border border-stone-200">
                                                            ÇOK YAKINDA
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                                                    {game.description}
                                                </p>
                                            </div>

                                            {!game.comingSoon && (
                                                <div className="flex items-center justify-end mt-2">
                                                    <div className="flex items-center gap-1 text-xs font-bold text-boun-blue group-hover:translate-x-1 transition-transform">
                                                        Oyna <ChevronRight size={14} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            {/* SAĞ KOLON: Leaderboard (Desktop Only) */}
            <div className="hidden md:block md:col-span-1 sticky top-20">
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
                    <Leaderboard compactView={true} />
                </div>
            </div>

        </div>
    );
};

export default GameHub;
