import React from 'react';
import { cn } from '../../lib/utils';

interface ShareCardProps {
    username: string;
    score: number;
    guessCount: number;
    dayNumber: number;
    grid: string[][]; // The game grid
    colors: ('empty' | 'filled' | 'correct' | 'present' | 'absent')[][];
    gameResult: 'won' | 'lost';
    fortune?: string; // Günün Falı
}

const HEADLINES = {
    won: [
        (name: string) => `FLAŞ! ${name} bugünün şifresini tek nefeste çözdü, Güney Meydan yıkıldı!`,
        (name: string) => `SON DAKİKA: ${name} bulmacayı öyle bir çözdü ki, Albert Long Hall'de ayakta alkışlandı!`,
        (name: string) => `${name} ecel terleri döktü ama finalde gülen taraf oldu!`,
    ],
    lost: [
        (name: string) => `SKANDAL! ${name} bugünkü bulmacada tökezledi, 'Yarın telafi edeceğim' dedi.`,
    ],
};

const ShareCard: React.FC<ShareCardProps> = ({
    username,
    score,
    guessCount,
    dayNumber,
    grid,
    colors,
    gameResult,
    fortune
}) => {
    const headline = HEADLINES[gameResult][
        Math.floor(Math.random() * HEADLINES[gameResult].length)
    ](username);

    return (
        <div
            id="share-card"
            className="relative w-full max-w-md mx-auto bg-[#f4e4bc] rounded-sm shadow-2xl overflow-hidden"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03' /%3E%3C/svg%3E")`,
            }}
        >
            {/* Top Torn Paper Edge */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-[#f4e4bc]" style={{
                clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%, 100% 100%, 0% 100%)'
            }} />

            {/* Header */}
            <div className="pt-8 pb-4 px-6 border-b-2 border-[#1c1917]">
                <h1 className="font-serif text-3xl md:text-4xl font-black text-center text-[#1c1917] leading-tight">
                    1863 POSTASI
                </h1>
                <p className="text-center text-xs text-[#57534e] mt-1 uppercase tracking-widest">
                    Boğaziçi'nin Sesi · Sayı {dayNumber}
                </p>
            </div>

            {/* Main Content */}
            <div className="p-6 space-y-4">
                {/* Headline */}
                <div className="border-l-4 border-[#b91c1c] pl-4 pr-2">
                    <h2 className="font-serif text-lg md:text-xl font-bold text-[#1c1917] leading-snug">
                        {headline}
                    </h2>
                </div>

                {/* Game Grid Visualization */}
                <div className="flex justify-center py-4">
                    <div className="grid grid-rows-6 gap-1 max-w-[160px]">
                        {colors.map((row, rIdx) => (
                            <div key={rIdx} className="grid grid-cols-5 gap-1">
                                {row.map((cell, cIdx) => (
                                    <div
                                        key={cIdx}
                                        className={cn(
                                            "w-6 h-6 border-2 flex items-center justify-center text-[8px] font-serif font-bold",
                                            cell === 'correct' && "bg-[#2d4f1e] border-[#2d4f1e] text-white",
                                            cell === 'present' && "bg-[#b48e43] border-[#b48e43] text-white",
                                            cell === 'absent' && "bg-[#78716c] border-[#78716c] text-white",
                                            cell === 'empty' && "bg-transparent border-[#a8a29e]"
                                        )}
                                    >
                                        {grid[rIdx][cIdx]}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Box */}
                <div className="border-2 border-[#1c1917] p-3 bg-white/30">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-[#1c1917] font-mono">{score}</div>
                            <div className="text-[10px] uppercase text-[#57534e] font-bold tracking-wide">Puan</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#1c1917] font-mono">{guessCount}</div>
                            <div className="text-[10px] uppercase text-[#57534e] font-bold tracking-wide">Tahmin</div>
                        </div>
                    </div>
                </div>

                {/* Fortune (if win) */}
                {fortune && (
                    <div className="border-t border-dashed border-[#78716c] pt-3">
                        <p className="text-center text-xs italic text-[#57534e] leading-relaxed">
                            <span className="font-bold not-italic">Günün Falı:</span> {fortune}
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-[10px] text-[#78716c] pt-2">
                    1863postasi.org/boundle
                </div>
            </div>

            {/* Stamp (Top Right) */}
            <div
                className="absolute top-6 right-6 w-20 h-20 rounded-full border-4 border-[#b91c1c] flex items-center justify-center transform rotate-12 bg-[#b91c1c]/10"
            >
                <div className="text-center">
                    <div className="text-[#b91c1c] font-bold text-[10px] leading-tight">1863</div>
                    <div className="text-[#b91c1c] font-black text-xs leading-tight">ONAYLI</div>
                </div>
            </div>

            {/* Bottom Torn Edge */}
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#f4e4bc]" style={{
                clipPath: 'polygon(0% 0%, 0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%, 100% 0%)'
            }} />
        </div>
    );
};

export default ShareCard;
