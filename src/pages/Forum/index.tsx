import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Users, MessageCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils'; // Assuming this utility exists based on Archive.tsx usage

const ForumHub: React.FC = () => {
    const categories = [
        {
            id: 'academic',
            title: 'AKADEMİK',
            desc: 'Ders ve hoca değerlendirmeleri.',
            icon: GraduationCap,
            path: '/forum/akademik',
        },
        {
            id: 'clubs',
            title: 'KULÜPLER',
            desc: 'Etkinlikler ve topluluklar.',
            icon: Users,
            path: '/forum/kulupler',
        },
        {
            id: 'community',
            title: 'SOHBET',
            desc: 'Kampüs gündemi ve tartışmalar.',
            icon: MessageCircle,
            path: '/forum/topluluk',
        },
        {
            id: 'marketplace',
            title: 'PAZAR YERİ',
            desc: 'İkinci el alım satım.',
            icon: ShoppingBag,
            path: '/forum/pazar',
        }
    ];

    return (
        <div className="h-dvh md:h-[calc(100vh-56px)] bg-[#f5f5f4] font-sans relative overflow-hidden flex flex-col items-center justify-center">

            <div className="w-full max-w-3xl px-6 md:px-8 space-y-10 md:space-y-12 -mt-16 md:-mt-0">

                {/* HEADER */}
                <div className="text-center flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="mb-4"
                    >
                        {/* Reusing the logo or a forum-specific icon if available, simpler to just use text for now or same logo */}
                        <div className="w-16 h-16 rounded-full bg-stone-200/50 flex items-center justify-center text-stone-400 mb-2">
                            <MessageCircle size={32} strokeWidth={1} />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h1 className="font-serif text-3xl md:text-5xl text-stone-900 font-bold tracking-tight mb-2 uppercase">
                            Forum
                        </h1>
                        <p className="font-serif text-stone-500 font-medium text-xs md:text-sm tracking-widest uppercase">
                            Kampüsün Dijital Meydanı
                        </p>
                    </motion.div>
                </div>

                {/* GRID - Compact & Elegant */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 w-full">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 + (idx * 0.1) }}
                        >
                            <Link
                                to={cat.path}
                                className="group relative flex items-center gap-4 p-3 md:p-5 rounded-xl transition-all duration-300 hover:bg-stone-200/50 text-left border border-transparent hover:border-stone-200/50"
                            >
                                {/* Icon Container - Smaller on mobile */}
                                <div className="p-2.5 md:p-3 rounded-full bg-stone-200/50 group-hover:bg-white transition-colors shrink-0 text-stone-600 group-hover:text-black shadow-none group-hover:shadow-sm">
                                    <cat.icon size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
                                </div>

                                {/* Text Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-serif text-sm md:text-base font-bold text-stone-700 group-hover:text-black uppercase tracking-wide transition-colors truncate">
                                        {cat.title}
                                    </h3>
                                    <p className="text-[10px] md:text-xs text-stone-400 group-hover:text-stone-500 transition-colors truncate font-medium">
                                        {cat.desc}
                                    </p>
                                </div>

                                {/* Arrow - Subtle Reveal */}
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 text-stone-400">
                                    <ArrowRight size={16} className="md:w-5 md:h-5" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* FOOTER NOTE */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center"
                >
                    <p className="font-serif italic text-stone-300 text-[10px] md:text-xs tracking-wide">
                        Saygı çerçevesinde özgür düşünce.
                    </p>
                </motion.div>

            </div>
        </div>
    );
};

export default ForumHub;
