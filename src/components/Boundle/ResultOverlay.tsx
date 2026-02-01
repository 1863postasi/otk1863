// Separate file for the result overlay to make GameModal cleaner
import React from 'react';
import { motion } from 'framer-motion';
import { Share2, RotateCcw, Sparkles } from 'lucide-react';
import ShareCard from './ShareCard';
import { usePWAInstall } from '../../hooks/usePWAInstall';

type CellStatus = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

interface ResultOverlayProps {
    gameState: 'won' | 'lost';
    score: number;
    streak: number;
    showShareCard: boolean;
    onToggleShareCard: () => void;
    onShare: () => void;
    onClose: () => void;
    // ShareCard props
    username: string;
    guessCount: number;
    dayNumber: number;
    grid: string[][];
    colors: CellStatus[][];
    fortune?: string;
}

export const ResultOverlay: React.FC<ResultOverlayProps> = ({
    gameState,
    score,
    streak,
    showShareCard,
    onToggleShareCard,
    onShare,
    onClose,
    username,
    guessCount,
    dayNumber,
    grid,
    colors,
    fortune
}) => {
    const { supportsPWA, isInstalled, install } = usePWAInstall();

    return (
        <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            className="absolute inset-0 z-50 bg-stone-900/90 flex flex-col items-center justify-center text-white p-4 md:p-8 overflow-y-auto"
        >
            {!showShareCard ? (
                <motion.div
                    key="result"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-full max-w-sm space-y-6"
                >
                    {/* Sad Cat (Only on Loss) */}
                    {gameState === 'lost' && (
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                            className="flex justify-center mb-4"
                        >
                            <img src="/img/boundle/sad-cat.svg" alt="Üzgün Kedi" className="w-32 h-32" />
                        </motion.div>
                    )}

                    <h2 className="font-serif text-5xl md:text-6xl font-bold text-boun-gold tracking-tight text-center">
                        {gameState === 'won' ? 'Helal!' : 'Sağlık Olsun!'}
                    </h2>
                    <p className="text-stone-300 text-lg md:text-xl font-serif text-center">
                        {gameState === 'won'
                            ? 'Boğaziçi seninle gurur duyuyor!'
                            : 'Kediler bile bazen dört ayağının üzerine düşemez.'}
                    </p>

                    <div className="grid grid-cols-2 gap-4 bg-white/10 p-6 rounded-xl border border-white/10">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white font-mono">{score}</div>
                            <div className="text-xs uppercase tracking-widest text-stone-400 font-bold mt-1">Puan</div>
                        </div>
                        <div className="text-center border-l border-white/10">
                            <div className="text-4xl font-bold text-white font-mono">{streak}</div>
                            <div className="text-xs uppercase tracking-widest text-stone-400 font-bold mt-1">Seri</div>
                        </div>
                    </div>

                    {/* Günün Falı (Fortune) - Always visible */}
                    {fortune && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-xl p-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={16} className="text-purple-300" />
                                <h4 className="text-sm uppercase tracking-widest font-bold text-purple-200">Günün Falı</h4>
                            </div>
                            <p className="text-stone-200 text-sm leading-relaxed italic">
                                "{fortune}"
                            </p>
                        </motion.div>
                    )}

                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={onToggleShareCard}
                            className="w-full py-4 bg-boun-green text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg active:scale-95 text-lg"
                        >
                            <Share2 size={24} /> MANŞET YAP
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-stone-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-600 transition-colors shadow-lg active:scale-95 text-lg"
                        >
                            <RotateCcw size={24} /> KAPAT
                        </button>

                        {/* PWA Install Button */}
                        {/* Only show if supported AND not already installed */}
                        {supportsPWA && !isInstalled && (
                            <button
                                onClick={install}
                                className="w-full py-3 mt-2 bg-stone-200 text-stone-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-300 transition-colors text-sm uppercase tracking-wide"
                            >
                                <span className="text-xl">📲</span> Ana Ekrana Ekle
                            </button>
                        )}
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="sharecard"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md space-y-4"
                >
                    <ShareCard
                        username={username}
                        score={score}
                        guessCount={guessCount}
                        dayNumber={dayNumber}
                        grid={grid}
                        colors={colors}
                        gameResult={gameState}
                        fortune={gameState === 'won' ? fortune : undefined}
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={onToggleShareCard}
                            className="flex-1 py-3 bg-stone-700 text-white rounded-xl font-bold hover:bg-stone-600 transition-colors"
                        >
                            Geri
                        </button>
                        <button
                            onClick={onShare}
                            className="flex-1 py-3 bg-boun-green text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg active:scale-95"
                        >
                            <Share2 size={20} /> Kaydet
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};
