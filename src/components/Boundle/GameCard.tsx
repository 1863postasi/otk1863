import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Play, Star, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GameCardProps {
  title: string;
  description?: string;
  status: 'active' | 'locked' | 'coming_soon';
  icon: React.ReactNode;
  imageUrl?: string;
  onClick?: () => void;
  className?: string;
  span?: boolean; // If true, spans 2 columns (for Bento grid)
  playedToday?: boolean; // NEW: If user already played today
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  status,
  icon,
  imageUrl,
  onClick,
  className,
  span = false,
  playedToday = false
}) => {
  const isLocked = status !== 'active';
  const isDisabled = isLocked || playedToday;

  return (
    <motion.div
      whileHover={!isDisabled ? { y: -4, rotate: -1 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      onClick={!isDisabled ? onClick : undefined}
      className={cn(
        "relative rounded-sm overflow-hidden flex flex-col group select-none h-full",
        "border-2",
        isDisabled
          ? "bg-stone-200 border-stone-300 cursor-not-allowed opacity-70"
          : "bg-game-paper border-game-ink cursor-pointer shadow-[4px_4px_0px_0px_rgba(28,25,23,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,0.3)]",
        span ? "md:col-span-2 md:row-span-2 min-h-[300px]" : "min-h-[180px]",
        className
      )}
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-noise opacity-50 pointer-events-none mix-blend-multiply" />

      {/* Background Image (If present) */}
      {imageUrl && span && !isDisabled && (
        <div className="absolute inset-0 z-0">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 transition-all duration-700 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-game-paper via-transparent to-transparent" />
        </div>
      )}

      {/* Cartridge Label Design */}
      <div className="relative z-10 p-5 flex flex-col h-full border-4 border-double border-game-ink/10 m-2">

        {/* Header: Status Stamps */}
        <div className="flex justify-between items-start mb-2">
          {/* Icon Badge */}
          <div className={cn(
            "w-10 h-10 border-2 border-game-ink flex items-center justify-center rounded-full bg-stone-100 shadow-sm",
            isDisabled ? "text-stone-400" : "text-game-ink group-hover:bg-game-ink group-hover:text-game-paper transition-colors"
          )}>
            {icon}
          </div>

          {/* Status Stamp */}
          {playedToday ? (
            <div className="border-2 border-game-win text-game-win px-2 py-1 transform rotate-[-5deg] font-bold uppercase text-[10px] tracking-widest bg-white/80 backdrop-blur-sm shadow-sm">
              TAMAMLANDI
            </div>
          ) : isLocked ? (
            <div className="border-2 border-stone-400 text-stone-500 px-2 py-1 font-bold uppercase text-[10px] tracking-widest bg-stone-200/50">
              {status === 'coming_soon' ? 'YAKINDA' : 'KİLİTLİ'}
            </div>
          ) : (
            <div className="border-2 border-game-stamp text-game-stamp px-2 py-1 transform rotate-[2deg] font-bold uppercase text-[10px] tracking-widest bg-white/50 backdrop-blur-sm shadow-sm animate-pulse">
              OYNA
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-auto">
          <h3 className={cn(
            "font-serif font-black text-game-ink uppercase tracking-tight leading-none mb-2",
            span ? "text-4xl" : "text-xl"
          )}>
            {title}
          </h3>

          <div className="h-0.5 w-12 bg-game-ink mb-3 group-hover:w-full transition-all duration-500" />

          {description && (
            <p className="font-serif text-game-ink/80 text-xs italic leading-tight line-clamp-2">
              {description}
            </p>
          )}

          {!isDisabled && !playedToday && (
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-game-ink">
              BAŞLAMAK İÇİN DOKUN <ArrowRight size={12} />
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default GameCard;