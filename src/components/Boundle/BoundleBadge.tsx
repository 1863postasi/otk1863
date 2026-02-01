import React from 'react';
import { Crown, Milestone, Coffee, Trees, Compass } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export interface BoundleBadgeProps {
    rank: number;
    size?: 'sm' | 'md' | 'lg';
    showTitle?: boolean;
    className?: string;
}

export const GET_RANK_INFO = (rank: number) => {
    if (rank === 1) return {
        title: "Güney'in Efendisi",
        color: "from-yellow-400 to-amber-600",
        textColor: "text-amber-800",
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: Crown,
        shimmer: true
    };
    if (rank >= 2 && rank <= 3) return {
        title: "Hamlin Varisi",
        color: "from-stone-300 to-stone-500",
        textColor: "text-stone-700",
        bg: "bg-stone-50",
        border: "border-stone-300",
        icon: Milestone, // Using Milestone as Temple proxy or maybe Landmark
        shimmer: false
    };
    if (rank >= 4 && rank <= 10) return {
        title: "Manzara Müdavimi",
        color: "from-orange-700 to-yellow-900", // Bronze-ish
        textColor: "text-orange-900",
        bg: "bg-orange-50",
        border: "border-orange-200",
        icon: Coffee,
        shimmer: false
    };
    if (rank >= 11 && rank <= 50) return {
        title: "Meydan Sakini",
        color: "from-emerald-500 to-green-700",
        textColor: "text-emerald-800",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: Trees,
        shimmer: false
    };
    return {
        title: "Kampüs Çaylağı",
        color: "from-stone-400 to-stone-500",
        textColor: "text-stone-500",
        bg: "bg-stone-50",
        border: "border-stone-200",
        icon: Compass,
        shimmer: false
    };
};

const BoundleBadge: React.FC<BoundleBadgeProps> = ({ rank, size = 'md', showTitle = true, className }) => {
    const info = GET_RANK_INFO(rank);
    const Icon = info.icon;

    const sizeClasses = {
        sm: "px-1.5 py-0.5 text-[9px] gap-1",
        md: "px-2.5 py-1 text-[10px] gap-1.5",
        lg: "px-3 py-1.5 text-xs gap-2"
    };

    const iconSizes = {
        sm: 10,
        md: 14,
        lg: 16
    };

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className={cn(
                "relative inline-flex items-center rounded-full font-bold uppercase tracking-wider border shadow-sm select-none overflow-hidden",
                info.bg,
                info.border,
                info.textColor,
                sizeClasses[size],
                className
            )}
        >
            {/* Shimmer Effect for Top Rank */}
            {info.shimmer && (
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                </div>
            )}

            <div className={cn("relative z-10 p-0.5 rounded-full text-white bg-gradient-to-br", info.color)}>
                <Icon size={iconSizes[size]} fill="currentColor" strokeWidth={2.5} />
            </div>

            {showTitle && <span className="relative z-10">{info.title}</span>}
        </motion.div>
    );
};

export default BoundleBadge;
