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
      whileHover={!isDisabled ? { y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      onClick={!isDisabled ? onClick : undefined}
      className={cn(
        "relative rounded-xl overflow-hidden border transition-all duration-300 flex flex-col group select-none h-full",
        isDisabled
          ? "bg-stone-100/50 border-stone-200 cursor-not-allowed grayscale-[0.8] opacity-80"
          : "bg-white border-stone-200 cursor-pointer shadow-sm hover:border-boun-gold",
        span ? "md:col-span-2 md:row-span-2 min-h-[300px]" : "min-h-[180px]",
        className
      )}
    >
      {/* Background Pattern/Image */}
      {imageUrl && span && !isDisabled && (
        <div className="absolute inset-0 bg-stone-900 z-0">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
        </div>
      )}

      {/* Content Container */}
      <div className={cn("relative z-10 p-6 flex flex-col h-full", span && !isDisabled ? "justify-end" : "justify-between")}>

        {/* Header Icon/Badge */}
        <div className="flex justify-between items-start mb-4">
          {!span && (
            <div className={cn(
              "p-3 rounded-lg flex items-center justify-center transition-colors",
              isDisabled ? "bg-stone-200 text-stone-400" : "bg-stone-100 text-stone-700 group-hover:bg-boun-gold group-hover:text-white"
            )}>
              {icon}
            </div>
          )}

          {playedToday ? (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
              <CheckCircle size={10} fill="currentColor" /> Oynadın
            </span>
          ) : isLocked ? (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-stone-200 text-stone-500 px-2 py-1 rounded flex items-center gap-1">
              <Lock size={10} /> {status === 'coming_soon' ? 'Yakında' : 'Kilitli'}
            </span>
          ) : (
            <span className={cn(
              "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ml-auto",
              span ? "bg-boun-gold text-white" : "bg-green-100 text-green-700"
            )}>
              {span ? <Star size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
              {span ? 'Günün Oyunu' : 'Aktif'}
            </span>
          )}
        </div>

        {/* Text Content */}
        <div className={cn(span && !isDisabled ? "text-white" : "text-stone-900")}>
          <h3 className={cn("font-serif font-bold leading-tight mb-2 group-hover:translate-x-1 transition-transform", span ? "text-3xl md:text-4xl" : "text-lg")}>
            {title}
          </h3>
          {description && (
            <p className={cn(
              "text-xs font-sans leading-relaxed line-clamp-2",
              span && !isDisabled ? "text-stone-300" : "text-stone-500"
            )}>
              {description}
            </p>
          )}

          {/* CTA Button */}
          {!isDisabled && !playedToday && (
            <div className={cn(
              "mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all",
              span ? "text-boun-gold" : "text-stone-900 group-hover:text-boun-blue"
            )}>
              Oyna <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          )}

          {playedToday && (
            <div className="mt-4 text-xs text-stone-500 italic">
              Yarın yeni bir oyun için gel!
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;