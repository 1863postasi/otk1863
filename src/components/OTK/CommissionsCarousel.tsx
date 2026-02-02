import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { BookOpen, Camera, MapPin, Scale, AlertTriangle, ExternalLink, ChevronDown, ChevronRight, Clock, FolderOpen, Users, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import * as router from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cache, CACHE_KEYS, CACHE_TTL } from '../../lib/cache';

const { Link } = router;

// Types
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

    // Fetch from Firestore (Cached - 24 Hours)
    useEffect(() => {
        const fetchCommissions = async () => {
            const cachedData = cache.get(CACHE_KEYS.OTK_COMMISSIONS);
            if (cachedData) {
                setCommissions(cachedData);
                setLoading(false);
                return;
            }

            try {
                const q = query(collection(db, "otk_commissions"), orderBy("createdAt", "asc"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Commission[];

                setCommissions(data);
                cache.set(CACHE_KEYS.OTK_COMMISSIONS, data, CACHE_TTL.VERY_LONG);
            } catch (error) {
                console.error("Error fetching commissions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCommissions();
    }, []);

    const getIcon = (iconName: string, size = 24) => {
        const icons: any = { BookOpen, Camera, MapPin, Scale, AlertTriangle, Clock, Users, Star };
        const IconComponent = icons[iconName] || BookOpen;
        return <IconComponent size={size} />;
    };

    const ensureAbsoluteUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    return (
        <div className="py-24 bg-stone-900 text-stone-100 overflow-hidden relative min-h-screen">

            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-stone-800 via-stone-900 to-stone-950 opacity-60 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-boun-gold text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Çalışma Grupları</span>
                    <h2 className="font-serif text-4xl md:text-5xl text-stone-100 mb-4 drop-shadow-md">Komisyonlar</h2>
                    <p className="text-stone-400 font-light max-w-xl mx-auto text-lg">
                        ÖTK bünyesinde faaliyet gösteren aktif çalışma grupları.
                    </p>
                </div>

                {loading && (
                    <div className="flex justify-center p-12">
                        <div className="w-8 h-8 border-2 border-boun-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!loading && (
                    <LayoutGroup>
                        {/* DESKTOP ACCORDION */}
                        <div className="hidden lg:flex gap-4 h-[650px] w-full">
                            {commissions.map((comm, index) => {
                                const isActive = index === activeIndex;
                                const isDisabled = comm.status === 'coming_soon';

                                return (
                                    <motion.div
                                        key={comm.id}
                                        layout
                                        onClick={() => !isDisabled && setActiveIndex(index)}
                                        className={cn(
                                            "relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-700 ease-[0.16,1,0.3,1] border border-stone-800",
                                            isActive ? "flex-[4] bg-stone-800/80 border-boun-gold/30 shadow-2xl" : "flex-[1] bg-stone-900/50 hover:bg-stone-800",
                                            isDisabled && "opacity-40 cursor-not-allowed grayscale"
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                                        {/* Content Container */}
                                        <div className="p-8 h-full flex flex-col relative z-20">

                                            {/* Header Section */}
                                            <div className="flex items-start justify-between mb-8">
                                                <motion.div
                                                    layout="position"
                                                    className={cn(
                                                        "p-4 rounded-2xl transition-all duration-500",
                                                        isActive ? "bg-boun-gold text-stone-900 shadow-lg shadow-boun-gold/20" : "bg-stone-800 text-stone-400 group-hover:text-stone-200"
                                                    )}
                                                >
                                                    {getIcon(comm.icon, isActive ? 32 : 24)}
                                                </motion.div>

                                                {/* Vertical Text for Inactive State */}
                                                {!isActive && (
                                                    <div className="absolute bottom-12 left-0 w-full text-center">
                                                        <span className="block -rotate-90 whitespace-nowrap text-stone-400 font-serif font-bold text-xl tracking-wider origin-center">
                                                            {comm.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Active Content */}
                                            <AnimatePresence mode="wait">
                                                {isActive && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.4, delay: 0.1 }}
                                                        className="flex flex-col h-full"
                                                    >
                                                        <h3 className="font-serif text-4xl text-white font-bold mb-6 leading-tight">
                                                            {comm.name}
                                                        </h3>

                                                        <p className="text-stone-300 text-lg leading-relaxed mb-8 max-w-2xl border-l-2 border-stone-700 pl-4">
                                                            {comm.description}
                                                        </p>

                                                        {/* Sub-groups Grid */}
                                                        {comm.subUnits && comm.subUnits.length > 0 && (
                                                            <div className="grid grid-cols-2 gap-4 mb-auto">
                                                                {comm.subUnits.map((unit, idx) => (
                                                                    <div key={idx} className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                                                                        <h4 className="text-boun-gold text-xs font-bold uppercase tracking-wider mb-2">{unit.title}</h4>
                                                                        <p className="text-stone-400 text-sm">{unit.members}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Footer Actions */}
                                                        <div className="mt-8 flex gap-4 pt-8 border-t border-stone-800">
                                                            {comm.externalLinks?.map((link, lIdx) => (
                                                                <a
                                                                    key={lIdx}
                                                                    href={ensureAbsoluteUrl(link.url)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="px-6 py-3 bg-boun-gold hover:bg-white text-stone-900 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 text-sm shadow-lg shadow-boun-gold/10"
                                                                >
                                                                    {link.label} <ExternalLink size={16} />
                                                                </a>
                                                            ))}

                                                            {comm.archiveTag && (
                                                                <Link
                                                                    to={`/arsiv?commission=${comm.archiveTag}`}
                                                                    className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 text-sm"
                                                                >
                                                                    <FolderOpen size={16} /> Arşiv
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* MOBILE STACK */}
                        <div className="lg:hidden flex flex-col gap-3">
                            {commissions.map((comm, index) => {
                                const isActive = index === activeIndex;
                                const isDisabled = comm.status === 'coming_soon';

                                return (
                                    <motion.div
                                        key={comm.id}
                                        layout
                                        onClick={() => !isDisabled && setActiveIndex(isActive ? -1 : index)}
                                        className={cn(
                                            "rounded-2xl overflow-hidden border transition-colors duration-300",
                                            isActive ? "bg-stone-800 border-boun-gold/40 shadow-lg" : "bg-stone-900 border-stone-800",
                                            isDisabled && "opacity-50 grayscale"
                                        )}
                                    >
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "p-3 rounded-xl transition-colors",
                                                    isActive ? "bg-boun-gold text-stone-900" : "bg-stone-800 text-stone-500"
                                                )}>
                                                    {getIcon(comm.icon, 20)}
                                                </div>
                                                <h3 className={cn("font-serif font-bold text-lg", isActive ? "text-white" : "text-stone-400")}>
                                                    {comm.name}
                                                </h3>
                                            </div>
                                            {!isDisabled && (
                                                <div className={cn("transition-transform duration-300", isActive && "rotate-180")}>
                                                    <ChevronDown className="text-stone-500" />
                                                </div>
                                            )}
                                        </div>

                                        <AnimatePresence>
                                            {isActive && !isDisabled && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="p-4 pt-0 border-t border-stone-700/50 mt-2">
                                                        <p className="text-stone-300 py-4 leading-relaxed text-sm">
                                                            {comm.description}
                                                        </p>

                                                        {/* Sub Units Mobile */}
                                                        {comm.subUnits && comm.subUnits.length > 0 && (
                                                            <div className="space-y-3 mb-6">
                                                                {comm.subUnits.map((unit, idx) => (
                                                                    <div key={idx} className="bg-stone-950/30 p-3 rounded-lg border border-stone-800/50">
                                                                        <h5 className="text-boun-gold text-[10px] font-bold uppercase tracking-wider mb-1">{unit.title}</h5>
                                                                        <p className="text-stone-400 text-xs">{unit.members}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="flex flex-col gap-2">
                                                            {comm.externalLinks?.map((link, lIdx) => (
                                                                <a
                                                                    key={lIdx}
                                                                    href={ensureAbsoluteUrl(link.url)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="w-full py-3 bg-boun-gold text-stone-900 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                                                >
                                                                    {link.label} <ExternalLink size={14} />
                                                                </a>
                                                            ))}
                                                            {comm.archiveTag && (
                                                                <Link
                                                                    to={`/arsiv?commission=${comm.archiveTag}`}
                                                                    className="w-full py-3 bg-stone-950 text-stone-400 border border-stone-800 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                                                >
                                                                    <FolderOpen size={14} /> Arşiv
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </LayoutGroup>
                )}
            </div>
        </div>
    );
};

export default CommissionsCarousel;