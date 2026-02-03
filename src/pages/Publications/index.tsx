import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Unlock, Feather, Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import { PUBLICATIONS } from './data';

// --- TYPES & DATA HELPERS ---
const periodicals = PUBLICATIONS.filter(p => p.type === 'Dergi' || p.type === 'Süreli (ÖTK)');
const fanzines = PUBLICATIONS.filter(p => p.type === 'Fanzin');

// --- COMPONENTS ---

// 1. Publication Card (Film Poster Style)
const PublicationCard = ({ item }: { item: typeof PUBLICATIONS[0] }) => {
    return (
        <Link to={`/yayinlar/${item.id}`} className="block group select-none">
            <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative w-48 md:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-stone-900"
            >
                {/* Cover Image */}
                <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                />

                {/* Dark Gradient Overlay (Bottom) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1 block">
                        {item.frequency || 'Yayın'}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-stone-50 leading-tight mb-1 group-hover:text-white">
                        {item.title}
                    </h3>
                    <div className="text-xs text-stone-400 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                        {item.description}
                    </div>
                </div>

                {/* Top Badge (Hidden by default, shown on hover maybe?) */}
                <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    OKU
                </div>
            </motion.div>
        </Link>
    );
};

// 2. Secret Button Component
const SecretDiaryButton = () => {
    const [isUNLOCKED, setIsUNLOCKED] = useState(false);
    const navigate = useNavigate();

    const handleClick = () => {
        if (!isUNLOCKED) {
            setIsUNLOCKED(true);
        } else {
            navigate('/yayinlar-gunluk');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8 tracking-tight">Özel</h2>

            <motion.div
                layout
                onClick={handleClick}
                initial={{ width: '60px' }}
                animate={{
                    width: isUNLOCKED ? '320px' : '64px',
                    backgroundColor: isUNLOCKED ? '#0c0a09' : '#1c1917', // stone-900 vs stone-950
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`h-16 rounded-full flex items-center justify-center cursor-pointer shadow-2xl relative overflow-hidden group ${isUNLOCKED ? 'hover:scale-105' : 'hover:scale-110'}`}
            >
                {/* Background Animation on Unlocked */}
                <AnimatePresence>
                    {isUNLOCKED && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-boun-blue/40"
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {!isUNLOCKED ? (
                        <motion.div
                            key="locked"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="text-stone-400"
                        >
                            <Lock size={24} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="unlocked"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-3 text-stone-100 whitespace-nowrap z-10 px-6"
                        >
                            <Unlock size={18} className="text-emerald-400" />
                            <span className="font-serif italic text-lg">Kendimi Tanıma Günlükleri</span>
                            <ChevronRight size={18} className="opacity-50 animate-pulse" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pulse Effect when Locked */}
                {!isUNLOCKED && (
                    <div className="absolute inset-0 border-2 border-stone-800 rounded-full animate-ping opacity-20 pointer-events-none" />
                )}
            </motion.div>


        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const PublicationsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-stone-50 pb-24 overflow-x-hidden">

            {/* --- HERO SECTION --- */}
            <div className="relative h-[85vh] md:h-[75vh] w-full bg-stone-900 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 opacity-60">
                    <img
                        src="https://images.unsplash.com/photo-1507842217121-9e871e7e8424?q=80&w=2483&auto=format&fit=crop"
                        alt="Library"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-stone-900/30 via-stone-900/50 to-stone-900" />
                </div>

                {/* Hero Content */}
                <div className="absolute inset-0 flex flex-col items-center pt-24 md:pt-32 z-10 text-center px-4">


                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-8xl font-serif font-black text-white tracking-tighter shadow-2xl drop-shadow-lg mb-4"
                    >
                        Kütüphane
                    </motion.h1>
                </div>
            </div>

            {/* --- PERIODICALS STRIP (Overlapping Hero) --- */}
            <div className="relative z-20 -mt-64 md:-mt-48 mb-12">
                <div className="container mx-auto px-8 md:px-20 mb-6">
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-white/90 tracking-tight drop-shadow-lg">Süreli Yayınlar</h2>
                </div>
                <div className="w-full overflow-x-auto pb-12 pt-4 px-8 scrollbar-hide">
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="flex gap-6 md:gap-10 w-max mx-auto md:mx-0 md:px-20"
                    >
                        {periodicals.map((pub, index) => (
                            <PublicationCard key={pub.id} item={pub} />
                        ))}

                        {/* 'More Coming' Placeholder */}
                        <div className="w-48 md:w-64 aspect-[2/3] rounded-xl border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center text-stone-400 group cursor-pointer hover:bg-white/10 transition-colors">
                            <Sparkles className="mb-2 opacity-50" />
                            <span className="text-xs font-bold uppercase tracking-widest">Yakında</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- DIVIDER --- */}
            <div className="container mx-auto px-12 mb-12">
                <hr className="border-stone-200" />
            </div>

            {/* --- FANZINES STRIP --- */}
            <section className="mb-12">
                <div className="container mx-auto px-8 md:px-20 mb-10 flex items-end justify-between">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 tracking-tight">Fanzinler</h2>
                        <p className="text-stone-500 mt-2 font-light text-lg">Öğrencilerin bağımsız sesi.</p>
                    </div>
                    <Link to="/yayinlar/fanzin-gonder" className="hidden md:flex items-center gap-2 text-stone-900 font-bold hover:text-boun-blue transition-colors">
                        <span>Fanzin Gönder</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="w-full overflow-x-auto pb-8 px-8 scrollbar-hide">
                    <div className="flex gap-6 md:gap-8 w-max md:px-20">
                        {fanzines.map((pub) => (
                            <PublicationCard key={pub.id} item={pub} />
                        ))}
                        {/* Placeholder if empty or just extra */}
                        <Link to="#" className="block group">
                            <div className="w-48 md:w-64 aspect-[2/3] rounded-xl border-2 border-dashed border-stone-300 bg-stone-100 flex flex-col items-center justify-center text-stone-400 hover:border-stone-900 hover:text-stone-900 transition-colors">
                                <Feather size={32} className="mb-3" />
                                <span className="text-sm font-bold">Senin Fanzinin?</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- DIVIDER --- */}
            <div className="container mx-auto px-12 mb-12">
                <hr className="border-stone-200" />
            </div>

            {/* --- SECRET DIARY SECTION --- */}
            <section className="pb-20">
                <SecretDiaryButton />
            </section>

        </div>
    );
};

export default PublicationsPage;
