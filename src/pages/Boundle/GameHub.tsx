import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BOUNDLE_GAMES } from '../../lib/boundle/registry';
import { useBoundle } from '../../lib/boundle/hooks';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import UserStatsCard from './components/UserStatsCard';
import Leaderboard from './Leaderboard';

import { useState } from 'react';
import { Gamepad2, Trophy } from 'lucide-react';

const GameHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'games' | 'leaderboard'>('games');
    const { canPlay } = useBoundle(); // Hook kullanımı

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
        <div className="space-y-6">

            {/* MOBİL TAB NAVİGASYON (Sadece Mobilde Görünür) */}
            <div className="md:hidden flex p-1 bg-stone-200/50 rounded-xl backdrop-blur-sm sticky top-16 z-30 mx-8 shadow-sm border border-white/50">
                <button
                    onClick={() => setActiveTab('games')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 relative overflow-hidden",
                        activeTab === 'games'
                            ? "bg-white text-boun-blue shadow-sm ring-1 ring-black/5"
                            : "text-stone-500 hover:text-stone-700 hover:bg-white/50"
                    )}
                >
                    {activeTab === 'games' && (
                        <motion.div
                            layoutId="activeTabBg"
                            className="absolute inset-0 bg-white rounded-lg -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <Gamepad2 size={18} />
                    <span className="relative z-10">Oyunlar</span>
                </button>
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 relative overflow-hidden",
                        activeTab === 'leaderboard'
                            ? "bg-white text-boun-gold shadow-sm ring-1 ring-black/5"
                            : "text-stone-500 hover:text-stone-700 hover:bg-white/50"
                    )}
                >
                    {activeTab === 'leaderboard' && (
                        <motion.div
                            layoutId="activeTabBg"
                            className="absolute inset-0 bg-white rounded-lg -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <Trophy size={18} />
                    <span className="relative z-10">Sıralama</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative">

                {/* SOL KOLON: Oyunlar ve İstatistikler - Mobilde 'games' tabındaysa veya Masaüstünde her zaman görünür */}
                <div className={cn(
                    "md:col-span-2 space-y-6 transition-all duration-500",
                    "md:block", // Masaüstünde her zaman göster
                    activeTab === 'games' ? "block animate-in fade-in slide-in-from-left-4 duration-500" : "hidden" // Mobilde tab kontrolü
                )}>
                    {/* Kullanıcı İstatistik Kartı */}
                    <UserStatsCard />

                    <div className="flex items-center justify-between px-1 border-b border-stone-200 pb-2 mb-4">
                        <h3 className="font-bold text-stone-800 text-lg flex items-center gap-2">
                            <Gamepad2 className="text-stone-400" size={20} />
                            Günün Oyunları
                        </h3>
                        <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-1 rounded-full border border-stone-200">
                            Yenilenme: 00:00
                        </span>
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
                            // Oynanabilir mi?
                            // canPlay false dönüyorsa oynamış demektir (tabi comingSoon değilse)
                            const isCompleted = !game.comingSoon && !canPlay(game.id);

                            return (
                                <motion.div key={game.id} variants={item}>
                                    <Link
                                        to={game.comingSoon ? '#' : game.path}
                                        className={cn(
                                            "group block bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:shadow-boun-blue/10 hover:border-boun-blue/30 transition-all duration-300 relative transform hover:-translate-y-1",
                                            game.comingSoon && "opacity-80 grayscale-[0.3] hover:shadow-sm cursor-not-allowed hover:transform-none"
                                        )}
                                    >
                                        <div className="flex items-stretch min-h-[110px]">
                                            {/* Sol İkon Alanı */}
                                            <div className={cn(
                                                "w-28 flex items-center justify-center text-white relative overflow-hidden",
                                                game.color,
                                                isCompleted && "bg-stone-400 grayscale" // Tamamlandıysa gri yap
                                            )}>
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                                                <GameIcon size={36} className="relative z-10 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out" />

                                                {/* Arkaplan Deseni */}
                                                <div className="absolute -bottom-6 -right-6 text-white/20 transform rotate-12 scale-150 transition-transform duration-700 group-hover:rotate-45">
                                                    <GameIcon size={80} />
                                                </div>

                                                {/* Tamamlandı Badge */}
                                                {isCompleted && (
                                                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-[2px]">
                                                        <div className="bg-white/90 text-stone-800 text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                                                            TAMAMLANDI
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* İçerik */}
                                            <div className="flex-1 p-5 flex flex-col justify-between relative bg-gradient-to-br from-white to-stone-50/50">
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <h4 className="font-bold text-lg text-stone-800 group-hover:text-boun-blue transition-colors font-serif tracking-tight">
                                                            {game.name}
                                                        </h4>
                                                        {game.comingSoon && (
                                                            <span className="text-[9px] font-bold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-md border border-stone-200 tracking-wider">
                                                                ÇOK YAKINDA
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-medium">
                                                        {game.description}
                                                    </p>
                                                </div>

                                                {!game.comingSoon && (
                                                    <div className="flex items-center justify-end mt-3">
                                                        {isCompleted ? (
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full shadow-sm">
                                                                Puan Alındı
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-boun-blue bg-blue-50 px-3 py-1.5 rounded-full group-hover:bg-boun-blue group-hover:text-white transition-all duration-300 shadow-sm">
                                                                Oyna <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                                            </div>
                                                        )}
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

                {/* SAĞ KOLON: Leaderboard - Mobilde 'leaderboard' tabındaysa veya Masaüstünde her zaman görünür */}
                <div className={cn(
                    "md:block md:col-span-1 border-l border-stone-100 md:pl-8", // Masaüstü stil
                    activeTab === 'leaderboard' ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden md:block" // Mobil tab kontrolü
                )}>
                    <div className="sticky top-24 space-y-4">

                        {/* Masaüstü Başlık (Mobilde gizli çünkü tab zaten başlık görevi görüyor) */}
                        <div className="hidden md:flex items-center gap-2 pb-2 border-b border-stone-200 mb-2 text-stone-800">
                            <div className="p-1.5 bg-amber-100/50 text-amber-600 rounded-lg">
                                <Trophy size={18} />
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-wider">Liderlik Tablosu</h3>
                        </div>

                        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-1">
                            <Leaderboard compactView={true} />
                        </div>

                        {/* Motivasyon Kartı */}
                        <div className="bg-gradient-to-br from-boun-blue/5 to-boun-blue/10 rounded-xl p-4 border border-boun-blue/10 text-center">
                            <p className="text-xs text-boun-blue font-medium leading-relaxed">
                                "Sıralamaya girmek için her gün Boundle oyunlarını tamamla ve puanlarını topla!"
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GameHub;
