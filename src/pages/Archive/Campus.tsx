import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, MapPin, Users, Folder, Music, Mountain, Radio, Clapperboard, Plane, Camera, X, ExternalLink, FileText, Image as ImageIcon, Download, Film, Link as LinkIcon, Eye, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { cn } from '../../lib/utils';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';

// --- TYPES ---

interface ClubContent {
    title: string;
    type: 'file' | 'link';
    subType: string;
    url: string;
    size?: string;
    date: string;
    description?: string;
    fileName?: string;
    folderName?: string;
}

interface Club {
    id: string;
    name: string;
    shortName: string;
    fullName?: string;
    type: string;
    founded: string;
    description: string;
    website?: string;
    logoUrl?: string;
    location: { x: number; y: number };
    contents?: ClubContent[];
}

const Campus: React.FC = () => {
    const navigate = useNavigate();
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredClubId, setHoveredClubId] = useState<string | null>(null);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);

    // Media Viewer State
    const [viewerContent, setViewerContent] = useState<ClubContent | null>(null);

    // Accordion State for Years
    const [expandedYears, setExpandedYears] = useState<string[]>([]);

    // Fetch Clubs from Firestore
    useEffect(() => {
        const q = query(collection(db, "clubs"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Club[];
            setClubs(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // When club selected, expand all years by default
    useEffect(() => {
        if (selectedClub) {
            const years = new Set<string>();
            selectedClub.contents?.forEach(item => {
                const year = item.date.includes('-') ? item.date.split('-')[0] : item.date;
                years.add(year);
            });
            setExpandedYears(Array.from(years));
        }
    }, [selectedClub]);

    const toggleYear = (year: string) => {
        setExpandedYears(prev =>
            prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
        );
    };

    const filteredClubs = useMemo(() => {
        return clubs.filter(club =>
            club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            club.shortName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [clubs, searchQuery]);

    // Group Contents by Year
    const groupedContents = useMemo(() => {
        if (!selectedClub?.contents) return {} as Record<string, ClubContent[]>;

        const groups: Record<string, ClubContent[]> = {};

        // Sort contents by date descending
        const sorted = [...selectedClub.contents].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        sorted.forEach(item => {
            // Extract Year
            const year = item.date.includes('-') ? item.date.split('-')[0] : item.date;
            if (!groups[year]) groups[year] = [];
            groups[year].push(item);
        });

        return groups;
    }, [selectedClub]);

    const ensureAbsoluteUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    };

    const getClubIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes('müzik') || t.includes('music')) return <Music size={20} />;
        if (t.includes('sinema') || t.includes('film')) return <Clapperboard size={20} />;
        if (t.includes('spor') || t.includes('dağ')) return <Mountain size={20} />;
        if (t.includes('radyo') || t.includes('medya')) return <Radio size={20} />;
        if (t.includes('fotoğraf')) return <Camera size={20} />;
        if (t.includes('havacılık')) return <Plane size={20} />;
        return <Users size={20} />;
    };

    // SMART VIEWER LOGIC
    const handleContentClick = (content: ClubContent, e: React.MouseEvent) => {
        e.preventDefault();

        if (content.subType.includes('image')) {
            setViewerContent(content); // Open Lightbox
        } else if (content.subType.includes('video') && (content.url.includes('youtube') || content.url.includes('youtu.be'))) {
            setViewerContent(content); // Open Embed Player
        } else if (content.subType.includes('pdf')) {
            const url = content.url.startsWith('http') ? content.url : ensureAbsoluteUrl(content.url);
            window.open(url, '_blank');
        } else if (content.fileName?.endsWith('.docx') || content.fileName?.endsWith('.xlsx') || content.fileName?.endsWith('.pptx')) {
            const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(content.url)}&embedded=true`;
            setViewerContent({ ...content, url: viewerUrl, subType: 'office_embed' });
        } else {
            window.open(ensureAbsoluteUrl(content.url), '_blank');
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col md:flex-row bg-[#f5f5f4] overflow-hidden min-h-[calc(100vh-64px)]">

            {/* 1. LEFT PANEL: DIRECTORY */}
            <div className="w-full md:w-80 flex flex-col border-r border-stone-300 bg-white z-20 shadow-xl md:shadow-none h-[40vh] md:h-full order-2 md:order-1 shrink-0">
                {/* Header */}
                <div className="p-4 border-b border-stone-200 bg-stone-50">
                    <button
                        onClick={() => navigate('/arsiv')}
                        className="flex items-center gap-2 text-stone-500 hover:text-boun-red transition-colors font-serif font-bold text-xs uppercase tracking-widest mb-4"
                    >
                        <ArrowLeft size={14} /> Lobiye Dön
                    </button>
                    <h2 className="font-serif text-2xl text-stone-900 font-bold mb-1">Kulüpler Arşivi</h2>
                    <p className="text-stone-500 text-xs font-sans">Kulüp odaları, etkinlik alanları ve hafıza.</p>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-stone-100 sticky top-0 bg-white z-10">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Kulüp ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-stone-100 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-stone-400 outline-none transition-all font-sans"
                        />
                        <Search className="absolute left-2.5 top-2.5 text-stone-400" size={14} />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {loading && <div className="p-8 text-center text-stone-400 text-sm italic">Yükleniyor...</div>}

                    {filteredClubs.map(club => (
                        <button
                            key={club.id}
                            onClick={() => setSelectedClub(club)}
                            onMouseEnter={() => setHoveredClubId(club.id)}
                            onMouseLeave={() => setHoveredClubId(null)}
                            className={cn(
                                "w-full p-2 rounded-lg flex items-center gap-3 transition-all duration-200 text-left border",
                                selectedClub?.id === club.id
                                    ? "bg-stone-800 text-white border-stone-800 shadow-md"
                                    : "bg-white text-stone-700 border-transparent hover:bg-stone-100 hover:border-stone-200"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden border",
                                selectedClub?.id === club.id ? "bg-stone-700 text-boun-gold border-stone-600" : "bg-stone-50 text-stone-500 border-stone-200"
                            )}>
                                {club.logoUrl ? <img src={club.logoUrl} alt={club.shortName} className="w-full h-full object-cover" /> : getClubIcon(club.type)}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-serif font-bold text-sm leading-tight truncate">{club.name}</h4>
                                <div className="flex items-center gap-2 mt-0.5 opacity-70">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{club.shortName}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. RIGHT PANEL: INTERACTIVE MAP */}
            <div className="flex-1 relative bg-[#e0ded8] overflow-hidden order-1 md:order-2 h-[60vh] md:h-full border-b md:border-b-0 md:border-l border-stone-300">
                {/* Map Background */}
                <div className="absolute inset-0">
                    <img
                        src="https://cdn.1863postasi.org/kulupler-arsivi/kroki.png"
                        className="w-full h-full object-cover opacity-80 mix-blend-multiply"
                        alt="Kampüs Krokisi"
                    />
                </div>

                {/* Map UI Elements */}
                <div className="absolute top-16 md:top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded text-xs font-bold text-stone-600 uppercase tracking-widest border border-stone-200 shadow-sm flex items-center gap-2 z-10">
                    <MapPin size={14} className="text-boun-red" /> Güney Kampüs
                </div>

                {/* PINS */}
                {(clubs as Club[]).map((club) => {
                    const isHovered = hoveredClubId === club.id;
                    const isSelected = selectedClub?.id === club.id;

                    const posX = club.location?.x ?? 50;
                    const posY = club.location?.y ?? 50;

                    return (
                        <div
                            key={club.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                            style={{ top: `${posY}%`, left: `${posX}%` }}
                        >
                            <motion.button
                                onClick={() => setSelectedClub(club)}
                                onMouseEnter={() => setHoveredClubId(club.id)}
                                onMouseLeave={() => setHoveredClubId(null)}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                    "relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-300 border-2 overflow-hidden",
                                    isSelected
                                        ? "bg-stone-900 border-boun-gold z-50 scale-125"
                                        : "bg-white border-white hover:border-boun-blue"
                                )}
                            >
                                {club.logoUrl ? (
                                    <img src={club.logoUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] font-bold text-stone-600">{club.shortName.substring(0, 2)}</span>
                                )}
                            </motion.button>

                            {/* Tooltip */}
                            <AnimatePresence>
                                {(isHovered || isSelected) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.9 }}
                                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap z-20 pointer-events-none font-bold shadow-xl border border-stone-700"
                                    >
                                        {club.shortName}
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-900 rotate-45 border-l border-t border-stone-700"></div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* 3. DETAIL MODAL (THE CARD) */}
            <AnimatePresence>
                {selectedClub && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 pointer-events-none">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedClub(null)}
                            className="absolute inset-0 bg-stone-900/60 md:backdrop-blur-sm pointer-events-auto"
                        />

                        {/* Card Container */}
                        <motion.div
                            layoutId={`card-${selectedClub.id}`}
                            initial={{ y: 50, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-5xl bg-[#f0eadd] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] pointer-events-auto border border-stone-400"
                            style={{
                                backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")'
                            }}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedClub(null)}
                                className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-900 bg-stone-200/50 rounded-full z-20 transition-colors hover:bg-stone-300/50"
                            >
                                <X size={20} />
                            </button>

                            {/* LEFT: Branding & Visuals (Thinner on Desktop) */}
                            <div className="w-full md:w-1/4 bg-stone-200/50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-stone-300/50 relative overflow-hidden shrink-0">
                                <div className="absolute inset-0 opacity-5 pointer-events-none">
                                    <div className="w-full h-full bg-[radial-gradient(#44403c_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                </div>

                                <div className="w-32 h-32 bg-white rounded-full shadow-lg border-4 border-white flex items-center justify-center overflow-hidden mb-6 relative z-10">
                                    {selectedClub.logoUrl ? (
                                        <img src={selectedClub.logoUrl} className="w-full h-full object-cover" alt={selectedClub.name} />
                                    ) : (
                                        <span className="text-4xl font-serif font-bold text-stone-300">{selectedClub.shortName.substring(0, 2)}</span>
                                    )}
                                </div>

                                <div className="text-center relative z-10">
                                    <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">{selectedClub.shortName}</h1>
                                    <div className="inline-flex items-center gap-2 bg-stone-800 text-boun-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                        <span>EST. {selectedClub.founded || '----'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Content & Info */}
                            <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white/40">
                                <div className="mb-8">
                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 block">{selectedClub.type}</span>
                                    <h2 className="font-serif text-2xl md:text-3xl text-stone-900 font-bold leading-tight mb-4">
                                        {selectedClub.fullName || selectedClub.name}
                                    </h2>
                                    <p className="font-serif text-base text-stone-600 leading-relaxed italic border-l-4 border-boun-gold pl-4">
                                        {selectedClub.description}
                                    </p>
                                </div>

                                {/* Metadata (Simple Stats) */}
                                <div className="mb-6 border-b border-stone-200 pb-4">
                                    <div className="flex items-center gap-2 text-stone-800 font-bold text-lg">
                                        <Folder size={18} className="text-boun-blue" />
                                        {selectedClub.contents?.length || 0} Arşiv Kaydı
                                    </div>
                                </div>

                                {/* CONTENT - PINTEREST STYLE WITH ACCORDION */}
                                {Object.keys(groupedContents).length > 0 && (
                                    <LayoutGroup>
                                        <div className="space-y-4 pb-8">
                                            {Object.entries(groupedContents).map(([year, items]) => {
                                                const files = items as ClubContent[];
                                                const isExpanded = expandedYears.includes(year);

                                                return (
                                                    <motion.div
                                                        layout
                                                        key={year}
                                                        className="border border-stone-200 rounded-lg bg-white/60 overflow-hidden"
                                                        initial={{ borderRadius: 8 }}
                                                    >
                                                        {/* Accordion Header */}
                                                        <motion.button
                                                            layout="position"
                                                            onClick={() => toggleYear(year)}
                                                            className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 transition-colors"
                                                        >
                                                            <h3 className="font-serif text-xl font-bold text-stone-800 flex items-center gap-2">
                                                                <span className="text-stone-300">#</span> {year}
                                                            </h3>
                                                            <motion.div
                                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                <ChevronDown size={20} className="text-stone-400" />
                                                            </motion.div>
                                                        </motion.button>

                                                        {/* Grid Content */}
                                                        <AnimatePresence mode="sync">
                                                            {isExpanded && (
                                                                <motion.div
                                                                    key={`content-${year}`}
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                    style={{ overflow: 'hidden' }}
                                                                >
                                                                    <div className="p-4 columns-2 md:columns-3 gap-4 space-y-4">
                                                                        {files.map((file, idx) => (
                                                                            <motion.div
                                                                                key={idx}
                                                                                initial={{ opacity: 0, y: 20 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                transition={{ delay: Math.min(idx, 12) * 0.05 }}
                                                                                onClick={(e) => handleContentClick(file, e)}
                                                                                className="break-inside-avoid bg-white border border-stone-200 rounded-lg overflow-hidden hover:shadow-lg transition-all group cursor-pointer relative mb-4"
                                                                            >
                                                                                {/* PREVIEW AREA */}
                                                                                <div className="aspect-[4/3] bg-stone-100 relative flex items-center justify-center overflow-hidden">
                                                                                    {file.subType.includes('image') ? (
                                                                                        <img src={file.url} alt={file.title} className="w-full h-full object-cover" />
                                                                                    ) : file.subType.includes('video') ? (
                                                                                        <div className="bg-stone-900 w-full h-full flex items-center justify-center text-white"><Film size={32} /></div>
                                                                                    ) : file.subType.includes('pdf') ? (
                                                                                        <div className="bg-red-50 w-full h-full flex items-center justify-center text-red-400"><FileText size={40} /></div>
                                                                                    ) : (
                                                                                        <div className="bg-stone-50 w-full h-full flex items-center justify-center text-stone-300"><Folder size={40} /></div>
                                                                                    )}

                                                                                    {/* Overlay Icon */}
                                                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                                        <Eye className="text-white drop-shadow-md" size={32} />
                                                                                    </div>
                                                                                </div>

                                                                                {/* INFO AREA */}
                                                                                <div className="p-3">
                                                                                    <h4 className="font-sans font-bold text-stone-800 text-xs leading-tight mb-1">{file.title || file.fileName}</h4>
                                                                                    <div className="flex items-center justify-between">
                                                                                        <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded uppercase tracking-wider">{file.subType}</span>
                                                                                        <span className="text-[10px] text-stone-400">{file.date}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </motion.div>
                                                                        ))}
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

                                {/* Links Footer */}
                                {selectedClub.website && (
                                    <div className="pt-4 border-t border-stone-200">
                                        <a
                                            href={ensureAbsoluteUrl(selectedClub.website)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded font-bold text-sm hover:bg-stone-700 transition-colors shadow-md"
                                        >
                                            <ExternalLink size={14} /> İletişim / Web Sitesi
                                        </a>
                                    </div>
                                )}
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 4. SMART VIEWER MODAL (OVERLAY) */}
            <AnimatePresence>
                {viewerContent && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 md:backdrop-blur-md">
                        <div className="relative w-full max-w-5xl h-full max-h-[90vh] flex flex-col">
                            {/* Close Viewer */}
                            <button
                                onClick={() => setViewerContent(null)}
                                className="absolute -top-10 right-0 text-white hover:text-stone-300 flex items-center gap-2"
                            >
                                <span className="text-sm font-bold">Kapat</span> <X size={24} />
                            </button>

                            {/* Content Render */}
                            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden rounded-lg border border-stone-800">
                                {viewerContent.subType.includes('image') && (
                                    <img src={viewerContent.url} alt={viewerContent.title} className="max-w-full max-h-full object-contain" />
                                )}
                                {viewerContent.subType.includes('video') && (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${viewerContent.url.split('v=')[1] || viewerContent.url.split('/').pop()}`}
                                        className="w-full h-full"
                                        allowFullScreen
                                        title="Video Player"
                                    />
                                )}
                                {viewerContent.subType === 'office_embed' && (
                                    <iframe
                                        src={viewerContent.url}
                                        className="w-full h-full bg-white"
                                        title="Document Viewer"
                                    />
                                )}
                            </div>

                            {/* Footer Meta */}
                            <div className="mt-4 text-white">
                                <h3 className="text-xl font-serif font-bold">{viewerContent.title}</h3>
                                <p className="text-stone-400 text-sm mt-1">{viewerContent.description || viewerContent.date}</p>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Campus;
