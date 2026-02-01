import React, { useState, useEffect } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { BookOpen, Camera, MapPin, Scale, AlertTriangle, ExternalLink, ChevronDown, ChevronRight, Clock, FolderOpen, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import * as router from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const motion = m as any;
const { Link } = router;

interface SubUnit {
    title: string;
    members: string;
}

interface ExternalLinkType {
    label: string;
    url: string;
}

interface Commission {
    id: string;
    name: string;
    description: string;
    icon: string;
    status: 'active' | 'coming_soon';
    subUnits: SubUnit[];
    externalLinks: ExternalLinkType[];
    archiveTag: string;
}

const CommissionsCarousel: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch from Firestore
    useEffect(() => {
        const q = query(collection(db, "otk_commissions"), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Commission[];
            setCommissions(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getIcon = (iconName: string, size = 24) => {
        switch (iconName) {
            case 'BookOpen': return <BookOpen size={size} />;
            case 'Camera': return <Camera size={size} />;
            case 'MapPin': return <MapPin size={size} />;
            case 'Scale': return <Scale size={size} />;
            case 'AlertTriangle': return <AlertTriangle size={size} />;
            case 'Clock': return <Clock size={size} />;
            case 'Users': return <Users size={size} />;
            default: return <BookOpen size={size} />;
        }
    };

    // Helper to force absolute URLs for external links
    const ensureAbsoluteUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    };

    return (
        // Coffee tones background (#3f2e27)
        <div className="py-20 bg-[#3f2e27] text-stone-100 overflow-hidden relative min-h-screen md:min-h-0">

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#5d4037] via-[#3f2e27] to-[#2a1e19] opacity-40 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 mt-8">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-4xl text-boun-gold mb-2 drop-shadow-md">Komisyonlar</h2>
                    <p className="text-[#d7ccc8] font-light">ÖTK'nın çalışma grupları ve alt birimleri.</p>
                </div>

                {loading && <div className="text-center text-[#d7ccc8] italic">Yükleniyor...</div>}

                {/* DESKTOP LAYOUT (Expandable Horizontal Cards) */}
                <div className="hidden md:flex gap-4 h-[600px]">
                    {commissions.map((comm, index) => {
                        const isActive = index === activeIndex;
                        const isDisabled = comm.status === 'coming_soon';

                        return (
                            <motion.div
                                key={comm.id}
                                layout
                                onClick={() => !isDisabled && setActiveIndex(index)}
                                className={cn(
                                    "relative rounded-2xl border border-[#5d4037] bg-[#4e342e] overflow-hidden cursor-pointer transition-all duration-500 ease-in-out",
                                    isActive ? "flex-[3] border-boun-gold shadow-2xl bg-[#3e2723]" : "flex-[1] bg-[#4e342e]/80",
                                    isDisabled ? "opacity-60 cursor-not-allowed border-stone-800 grayscale-[0.5]" : "opacity-90 hover:opacity-100 hover:bg-[#5d4037]"
                                )}
                            >
                                {/* Background Glow for active */}
                                {isActive && <div className="absolute inset-0 bg-gradient-to-br from-boun-gold/10 to-transparent pointer-events-none" />}

                                {/* Coming Soon Overlay */}
                                {isDisabled && !isActive && (
                                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                        <span className="bg-black/50 px-3 py-1 text-xs font-bold text-[#d7ccc8] uppercase tracking-widest border border-[#5d4037] -rotate-90 whitespace-nowrap">Çok Yakında</span>
                                    </div>
                                )}

                                <div className="p-8 flex flex-col h-full relative z-10 overflow-hidden">
                                    <motion.div layout="position" className="flex items-center justify-between mb-6 shrink-0">
                                        <div className={cn("p-3 rounded-full transition-colors shadow-sm", isActive ? "bg-boun-gold text-[#3e2723]" : "bg-[#3e2723] text-[#a1887f]")}>
                                            {getIcon(comm.icon, 24)}
                                        </div>
                                    </motion.div>

                                    <motion.h3 layout="position" className={cn("font-serif text-2xl font-bold mb-2 leading-tight", isActive ? "text-[#efebe9]" : "text-[#d7ccc8] text-center mt-auto mb-auto break-words")}>
                                        {comm.name}
                                    </motion.h3>

                                    {/* Optimized Text Animation */}
                                    <AnimatePresence mode="wait">
                                        {isActive && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2, duration: 0.4 }}
                                                className="flex flex-col flex-1 min-h-0"
                                            >
                                                <p className="text-sm leading-relaxed mb-6 text-[#d7ccc8] block shrink-0">
                                                    {comm.description}
                                                </p>

                                                {/* DYNAMIC SUB-UNITS SCROLL AREA */}
                                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2 mb-6">
                                                    {comm.subUnits?.map((unit, idx) => (
                                                        <div key={idx} className="border-t border-[#6d4c41] pt-4 first:border-0 first:pt-0">
                                                            <p className="text-xs text-boun-gold uppercase tracking-widest mb-1 font-bold">{unit.title}</p>
                                                            <p className="text-xs text-[#efebe9] leading-relaxed whitespace-pre-wrap">{unit.members}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-auto space-y-4 shrink-0">
                                                    <div className="flex gap-3 flex-wrap">
                                                        {/* Archive Link Button */}
                                                        {comm.archiveTag && (
                                                            <Link
                                                                to={`/arsiv?commission=${comm.archiveTag}`}
                                                                className="flex-1 px-3 py-3 bg-[#4e342e] border border-[#6d4c41] text-[#efebe9] text-xs font-bold rounded hover:bg-[#5d4037] transition-colors flex items-center justify-center gap-2 group whitespace-nowrap"
                                                            >
                                                                <FolderOpen size={16} className="text-boun-gold group-hover:scale-110 transition-transform" /> Komisyon Arşivi
                                                            </Link>
                                                        )}

                                                        {/* External Links */}
                                                        {comm.externalLinks?.map((link, lIdx) => (
                                                            <a
                                                                key={lIdx}
                                                                href={ensureAbsoluteUrl(link.url)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="flex-1 px-3 py-3 bg-boun-gold text-[#3e2723] text-xs font-bold rounded hover:bg-[#ffe082] transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                                                            >
                                                                {link.label} <ExternalLink size={12} />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* MOBILE LAYOUT (Accordion) */}
                <div className="md:hidden space-y-3">
                    {commissions.map((comm, index) => {
                        const isActive = index === activeIndex;
                        const isDisabled = comm.status === 'coming_soon';

                        return (
                            <motion.div
                                key={comm.id}
                                initial={false}
                                animate={{ backgroundColor: isActive ? "#3e2723" : "#4e342e" }}
                                className={cn(
                                    "rounded-xl border overflow-hidden",
                                    isActive ? "border-boun-gold shadow-sm" : "border-[#5d4037]",
                                    isDisabled && "opacity-60 grayscale-[0.5]"
                                )}
                            >
                                <button
                                    onClick={() => !isDisabled && setActiveIndex(index)}
                                    disabled={isDisabled}
                                    className="w-full p-4 flex items-center justify-between bg-black/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("text-[#a1887f]", isActive && "text-boun-gold")}>
                                            {getIcon(comm.icon, 20)}
                                        </div>
                                        <span className={cn("font-serif font-bold text-lg text-left", isActive ? "text-[#efebe9]" : "text-[#d7ccc8]")}>
                                            {comm.name}
                                        </span>
                                    </div>
                                    {!isDisabled && (isActive ? <ChevronDown size={20} className="text-boun-gold" /> : <ChevronRight size={20} className="text-[#8d6e63]" />)}
                                    {isDisabled && <span className="text-[10px] uppercase font-bold text-stone-500 border border-stone-600 px-2 py-0.5 rounded">Yakında</span>}
                                </button>

                                <AnimatePresence initial={false}>
                                    {isActive && !isDisabled && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ willChange: 'height, opacity' }}
                                        >
                                            <div className="p-4 pt-0 border-t border-[#5d4037]/50">
                                                <p className="text-sm text-[#d7ccc8] mt-4 mb-4 leading-relaxed">
                                                    {comm.description}
                                                </p>

                                                {/* Sub Units Mobile */}
                                                <div className="space-y-4 mb-6">
                                                    {comm.subUnits?.map((unit, idx) => (
                                                        <div key={idx} className="bg-black/20 p-3 rounded">
                                                            <p className="text-xs text-boun-gold uppercase font-bold mb-1">{unit.title}</p>
                                                            <p className="text-xs text-[#efebe9]">{unit.members}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex flex-col gap-3">
                                                    {comm.archiveTag && (
                                                        <Link
                                                            to={`/arsiv?commission=${comm.archiveTag}`}
                                                            className="w-full py-3 bg-[#2a1e19] border border-[#5d4037] text-[#efebe9] text-xs font-bold rounded flex items-center justify-center gap-2 hover:bg-[#3e2723]"
                                                        >
                                                            <FolderOpen size={16} className="text-boun-gold" /> Komisyon Arşivi
                                                        </Link>
                                                    )}

                                                    {comm.externalLinks?.map((link, lIdx) => (
                                                        <a
                                                            key={lIdx}
                                                            href={ensureAbsoluteUrl(link.url)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="w-full py-3 bg-boun-gold text-[#3e2723] font-bold text-sm rounded shadow hover:bg-[#ffe082] transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            {link.label} <ExternalLink size={14} />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CommissionsCarousel;