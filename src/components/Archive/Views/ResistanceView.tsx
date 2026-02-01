import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion as m, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, Image, Video, ExternalLink, Calendar, X, Globe, PlayCircle, Eye } from 'lucide-react';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { cache, CACHE_TTL } from '../../../lib/cache';

const motion = m as any;

// --- TYPES ---

type ZoomLevel = 'ROOT' | 'YEAR' | 'MONTH';

interface ViewState {
    level: ZoomLevel;
    yearId?: string;
    monthId?: string;
}

interface ResistanceContent {
    id: string;
    type: 'image' | 'video' | 'pdf' | 'news';
    title: string;
    url: string;
    source?: string;
    year: string;
    month: string;
    day: string;
    description?: string;
}

const MONTH_NAMES: Record<string, string> = {
    '01': 'OCAK', '02': 'ŞUBAT', '03': 'MART', '04': 'NİSAN',
    '05': 'MAYIS', '06': 'HAZİRAN', '07': 'TEMMUZ', '08': 'AĞUSTOS',
    '09': 'EYLÜL', '10': 'EKİM', '11': 'KASIM', '12': 'ARALIK'
};

// --- HELPER FUNCTIONS ---

const ensureAbsoluteUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `https://${url}`;
};

const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
};

const getOfficeViewerUrl = (url: string) => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
};

const isOfficeDoc = (url: string) => {
    return url.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i);
};

// --- MAIN COMPONENT ---

interface ResistanceViewProps {
    onBack: () => void;
}

const ResistanceView: React.FC<ResistanceViewProps> = ({ onBack }) => {
    const [viewState, setViewState] = useState<ViewState>({ level: 'ROOT' });
    const [contentData, setContentData] = useState<ResistanceContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewerContent, setViewerContent] = useState<ResistanceContent | null>(null);

    // Fetch Data (Cached)
    useEffect(() => {
        const fetchData = async () => {
            // 1. Try Cache
            const cachedData = cache.get('resistance_content_cache');
            if (cachedData) {
                setContentData(cachedData);
                setLoading(false);
                return;
            }

            // 2. Fetch
            try {
                const q = query(collection(db, "resistance_content")); // No filtering, get all
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ResistanceContent[];

                // Sort Client-Side (Same logic)
                data.sort((a, b) => {
                    if (b.year !== a.year) return Number(b.year) - Number(a.year);
                    if (b.month !== a.month) return b.month.localeCompare(a.month);
                    return Number(b.day || 0) - Number(a.day || 0);
                });

                // 3. Cache
                setContentData(data);
                cache.set('resistance_content_cache', data, CACHE_TTL.MEDIUM);
            } catch (error) {
                console.error("Resistance Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Grouping Logic
    const treeData = useMemo<{ years: string[], monthsByYear: Record<string, Set<string>> }>(() => {
        const years: Record<string, Set<string>> = {};
        contentData.forEach(item => {
            if (!item.year) return;
            if (!years[item.year]) years[item.year] = new Set<string>();
            if (item.month) years[item.year].add(item.month);
        });
        return {
            years: Object.keys(years).sort((a, b) => Number(b) - Number(a)),
            monthsByYear: years
        };
    }, [contentData]);

    const handleNav = (target: ViewState) => setViewState(target);

    const handleBack = () => {
        if (viewState.level === 'MONTH') setViewState(prev => ({ ...prev, level: 'YEAR', monthId: undefined }));
        else if (viewState.level === 'YEAR') setViewState({ level: 'ROOT' });
        else onBack();
    };

    // --- LAYERS ---

    // 1. ROOT LAYER (YEARS) - Minimalist List with Timeline Line
    const RootLayer = () => (
        <div className="max-w-2xl mx-auto py-12 px-6 relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-10 md:left-1/2 top-0 bottom-0 w-0.5 bg-stone-300 -translate-x-1/2 z-0" />

            <div className="text-center mb-12 relative z-10">
                <h2 className="font-serif text-3xl font-bold text-stone-900 bg-[#f5f5f4] inline-block px-4">Zaman Çizelgesi</h2>
                <p className="text-stone-500 text-sm mt-1">Direnişin hafızası.</p>
            </div>
            {loading ? (
                <div className="text-center text-stone-400">Yükleniyor...</div>
            ) : (
                <div className="space-y-8 relative z-10">
                    {treeData.years.length === 0 && <div className="text-center text-stone-400">Henüz kayıt bulunmuyor.</div>}
                    {treeData.years.map((year, idx) => (
                        <motion.div
                            key={year}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <button
                                onClick={() => handleNav({ level: 'YEAR', yearId: year })}
                                className="w-full group relative flex items-center justify-between p-6 bg-white border border-stone-200 hover:border-stone-900 transition-all shadow-sm hover:shadow-lg rounded-sm overflow-hidden"
                            >
                                <span className="font-serif text-4xl md:text-5xl font-bold text-stone-300 group-hover:text-stone-900 transition-colors">
                                    {year}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-boun-red transition-colors flex items-center gap-2">
                                    Görüntüle <ArrowLeft className="rotate-180" size={14} />
                                </span>
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );

    // 2. YEAR LAYER (MONTHS) - Clean Grid with Connecting Lines
    const YearLayer = () => {
        if (!viewState.yearId) return null;
        const yearId = viewState.yearId;
        const monthsSet = treeData.monthsByYear[yearId] || new Set<string>();
        const sortedMonths = Array.from(monthsSet).sort();

        return (
            <div className="max-w-4xl mx-auto py-12 px-6">
                <div className="flex items-baseline gap-4 mb-12 border-b border-stone-300 pb-4">
                    <h1 className="font-serif text-5xl font-bold text-stone-900">{yearId}</h1>
                    <span className="text-stone-500 text-sm">Bir ay seçerek olayları görüntüleyin.</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                    {/* Subtle horizontal line connecting grid items visually could be added here if desired */}
                    {sortedMonths.map((month: string, idx: number) => (
                        <motion.button
                            key={month}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => handleNav({ level: 'MONTH', yearId: yearId, monthId: month })}
                            className="aspect-[4/3] flex flex-col items-center justify-center bg-white border border-stone-200 hover:border-boun-red hover:text-boun-red transition-all shadow-sm group rounded-sm relative"
                        >
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowLeft className="rotate-180" size={12} />
                            </div>
                            <span className="text-3xl font-serif font-bold text-stone-800 group-hover:text-boun-red">{MONTH_NAMES[month]}</span>
                            <span className="text-[10px] font-bold text-stone-400 mt-1">{month}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    };

    // 3. MONTH LAYER (CONTENT) - Pinterest Masonry with Stagger
    const MonthLayer = () => {
        if (!viewState.yearId || !viewState.monthId) return null;

        const filtered = contentData.filter(i => i.year === viewState.yearId && i.month === viewState.monthId);

        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-8">
                {/* Compact Sticky Header */}
                <div className="sticky top-0 z-30 bg-[#f5f5f4]/95 backdrop-blur border-b border-stone-300 py-3 mb-6 flex justify-between items-center shadow-sm px-2">
                    <div className="flex items-center gap-3">
                        <h2 className="font-serif text-2xl font-bold text-stone-900">{MONTH_NAMES[viewState.monthId]}</h2>
                        <span className="font-serif text-xl text-stone-400">{viewState.yearId}</span>
                    </div>
                    <span className="text-xs font-bold text-stone-500">{filtered.length} İçerik</span>
                </div>

                {/* Masonry Grid with Staggered Animation */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {filtered.map((item, idx) => {
                        const isOffice = isOfficeDoc(item.url);
                        const isYouTube = getYouTubeEmbedUrl(item.url);

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05, duration: 0.4 }}
                                className="break-inside-avoid bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer relative"
                                onClick={() => {
                                    // If it's a YouTube link, assume we want to embed it, even if classified as 'news'
                                    if (isYouTube || item.type === 'video' || item.type === 'image' || isOffice) {
                                        setViewerContent(item);
                                    } else {
                                        // Only open new tab for generic links/pdfs that aren't YouTube
                                        window.open(ensureAbsoluteUrl(item.url), '_blank');
                                    }
                                }}
                            >
                                {/* Visual Preview */}
                                <div className="w-full bg-stone-100 relative">
                                    {item.type === 'image' && (
                                        <img src={item.url} alt={item.title} className="w-full h-auto object-cover" loading="lazy" />
                                    )}
                                    {/* Display Video Placeholder if it's explicitly video type OR looks like a YouTube URL */}
                                    {(item.type === 'video' || isYouTube) && (
                                        <div className="aspect-video w-full flex items-center justify-center bg-stone-900 text-white">
                                            <PlayCircle size={48} className="opacity-80" />
                                        </div>
                                    )}
                                    {/* Generic Files */}
                                    {(item.type === 'pdf' || isOffice || (item.type === 'news' && !isYouTube)) && (
                                        <div className="aspect-[3/2] w-full flex items-center justify-center bg-stone-50 text-stone-300">
                                            {item.type === 'news' ? <Globe size={48} /> : <FileText size={48} />}
                                        </div>
                                    )}

                                    {/* Type Badge */}
                                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm uppercase">
                                        {isOffice ? 'DOC' : (isYouTube ? 'VIDEO' : item.type)}
                                    </div>
                                </div>

                                {/* Content Info */}
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                        <Calendar size={10} />
                                        <span>{item.day || '01'} {MONTH_NAMES[item.month!]} {item.year}</span>
                                    </div>
                                    <h3 className="font-serif font-bold text-stone-900 text-lg leading-tight mb-2 group-hover:text-boun-red transition-colors">
                                        {item.title}
                                    </h3>
                                    {item.description && (
                                        <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-3">
                                            {item.description}
                                        </p>
                                    )}
                                    {item.source && (
                                        <div className="flex items-center gap-1 text-[10px] text-stone-400 font-bold uppercase">
                                            <Globe size={10} /> {item.source}
                                        </div>
                                    )}

                                    {/* CTA Hint */}
                                    <div className="mt-3 pt-3 border-t border-stone-100 flex justify-end">
                                        {(item.type === 'news' || item.type === 'pdf') && !isYouTube && !isOffice ? (
                                            <ExternalLink size={14} className="text-stone-400" />
                                        ) : (
                                            <Eye size={14} className="text-stone-400" />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // SMART VIEWER (FIXED)
    const renderViewerContent = () => {
        if (!viewerContent) return null;

        const ytEmbed = getYouTubeEmbedUrl(viewerContent.url);
        const isOffice = isOfficeDoc(viewerContent.url);

        // YouTube Embed logic supports explicit video type OR auto-detected YouTube URL
        if (viewerContent.type === 'video' || ytEmbed) {
            // Prefer embed url if derived, else use url directly if it looks like an embed
            const src = ytEmbed || viewerContent.url;
            return <iframe src={src} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title="Video" />;
        }
        // Image
        if (viewerContent.type === 'image') {
            return <img src={viewerContent.url} alt={viewerContent.title} className="max-w-full max-h-full object-contain" />;
        }
        // Office (Docs Viewer)
        if (isOffice) {
            const viewerUrl = getOfficeViewerUrl(viewerContent.url);
            return <iframe src={viewerUrl} className="w-full h-full bg-white" title="Document" />;
        }
        // Fallback
        return (
            <div className="text-white text-center">
                <p>Önizleme yapılamıyor.</p>
                <a href={ensureAbsoluteUrl(viewerContent.url)} target="_blank" rel="noreferrer" className="text-boun-gold underline mt-2 inline-block">Tarayıcıda Aç</a>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 top-14 bg-[#f5f5f4] overflow-hidden text-[#292524] z-40">

            {/* HEADER */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none bg-gradient-to-b from-[#f5f5f4] to-transparent h-24">
                <button
                    onClick={handleBack}
                    className="pointer-events-auto flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors bg-white/90 backdrop-blur px-4 py-2 border border-stone-200 shadow-sm rounded-full"
                >
                    <ArrowLeft size={16} />
                    <span className="font-serif font-bold text-xs uppercase">
                        {viewState.level === 'ROOT' ? 'Lobi' : 'Geri'}
                    </span>
                </button>
            </div>

            {/* VIEWPORT */}
            <div className="relative w-full h-full overflow-y-auto custom-scrollbar pt-16 pb-20">
                <AnimatePresence mode="popLayout">
                    {viewState.level === 'ROOT' && (
                        <motion.div key="ROOT" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <RootLayer />
                        </motion.div>
                    )}
                    {viewState.level === 'YEAR' && (
                        <motion.div key="YEAR" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <YearLayer />
                        </motion.div>
                    )}
                    {viewState.level === 'MONTH' && (
                        <motion.div key="MONTH" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                            <MonthLayer />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* SMART VIEWER OVERLAY (Uses Portal to break stacking context) */}
            {createPortal(
                <AnimatePresence>
                    {viewerContent && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                            <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
                                {/* Close Button - Outside the content area for hit testing */}
                                <button
                                    onClick={() => setViewerContent(null)}
                                    className="absolute -top-10 right-0 md:-right-4 text-white/80 hover:text-white flex items-center gap-2 z-[10000] p-2 bg-white/10 rounded-full"
                                >
                                    <span className="text-xs font-bold hidden md:inline">KAPAT</span>
                                    <X size={24} />
                                </button>

                                {/* Media Container */}
                                <div className="flex-1 flex items-center justify-center overflow-hidden rounded bg-black/50 border border-white/10">
                                    {renderViewerContent()}
                                </div>

                                {/* Footer Meta */}
                                <div className="mt-4 text-white">
                                    <h3 className="text-xl font-serif font-bold">{viewerContent.title}</h3>
                                    <p className="text-stone-400 text-sm mt-1 max-w-2xl">{viewerContent.description}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

        </div>
    );
};

export default ResistanceView;