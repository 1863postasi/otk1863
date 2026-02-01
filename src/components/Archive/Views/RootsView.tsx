import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Dices, Quote, Image as ImageIcon, Scroll, X, Calendar, MapPin, Tag, BookOpen, ChevronLeft, ChevronRight, Youtube, Eye, Link as LinkIcon, Film, Bookmark, Search } from 'lucide-react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { collection, query, orderBy, onSnapshot, getDocs, limit, startAfter, startAt, endAt, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { createPortal } from 'react-dom';
import * as router from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { cache, CACHE_KEYS, CACHE_TTL } from '../../../lib/cache';


const motion = m as any;
const { useSearchParams } = router;

// --- TYPES ---

interface Story {
    id: string;
    title: string;
    content: string;
    category: string;
    year: string;
    source: string;
    images?: string[]; // Can contain video URLs from R2 as well
    youtubeUrl?: string;
    externalUrl?: string;
    tags?: string[];
    createdAt?: any;
}

// --- COMPONENT ---

interface ViewProps {
    onBack: () => void;
}

const RootsView: React.FC<ViewProps> = ({ onBack }) => {
    const { userProfile, toggleBookmark } = useAuth();
    const CHUNK_SIZE = 100;
    // --- STATE ---
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastDoc, setLastDoc] = useState<any>(null); // For pagination cursor
    const [hasMore, setHasMore] = useState(true); // Are there more?

    // Filters & Inputs
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(""); // For API optimization
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [activeFilter, setActiveFilter] = useState<string>('Tümü');
    const [showSavedOnly, setShowSavedOnly] = useState(false);

    // UI State
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState(0);
    const [chunkIndex, setChunkIndex] = useState(1); // Visual Page Indication (Client Calculation)

    // Debounce Search Input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Synced with Admin Panel Categories
    const filters = [
        'Tümü',
        'Kampüs Anıları',
        'Efsane',
        'Portreler & Simalar',
        'Mekan & Manzara',
        'Objeler & Yadigarlar',
        'Gelenekler',
        'Alıntılar',
        'Basın & Medya',
        'Tarihi Anlar'
    ];

    // --- MAIN DATA FETCHING (Server Side) ---
    const fetchStories = async (reset: boolean = false) => {
        if (loading) return;
        setLoading(true);

        try {
            // 1. Determine Query Constraints
            let constraints: any[] = [];
            let collectionRef = collection(db, "stories");
            let q;

            // Search > Date > Default
            // Firestore Limitation: Can't Combine "Title Prefix" (Inequality) with "Date Range" (Inequality).
            // Strategy: 
            // - If Search is Active: Order by Title. (Date filter applied Client Side on result).
            // - If Search is Inactive: Order by Year (if Date Filter) or CreatedAt.

            if (debouncedSearch) {
                // Search Mode
                constraints.push(orderBy("title"));
                constraints.push(startAt(debouncedSearch));
                constraints.push(endAt(debouncedSearch + '\uf8ff'));
            } else if (dateRange.start || dateRange.end) {
                // Date Mode (No Text Search)
                // Assuming 'year' field is stored as string "YYYY" or number.
                constraints.push(orderBy("year", "desc")); // Newest first usually? Or Asc? "desc" for Archive.
                if (dateRange.start) {
                    // start means "From 1990", so year >= 1990. 
                    // Note: If desc sort, we might need careful range.
                    // Actually, let's keep it simple. Filter >= Start, <= End.
                    // For Descending sort:
                    const startYear = dateRange.start.split('-')[0];
                    constraints.push(where("year", ">=", startYear));
                }
                if (dateRange.end) {
                    const endYear = dateRange.end.split('-')[0];
                    constraints.push(where("year", "<=", endYear));
                }
            } else {
                // Default Sort
                constraints.push(orderBy("createdAt", "desc"));
            }

            // FILTER LOGIC (Category) - Equality, works with anything
            if (activeFilter !== 'Tümü') {
                constraints.push(where("category", "==", activeFilter));
            }

            // PAGINATION
            if (!reset && lastDoc) {
                constraints.push(startAfter(lastDoc));
            }

            constraints.push(limit(100)); // Server side limit

            q = query(collectionRef, ...constraints);

            // 2. CACHE CHECK (Only for default view - Page 1, No Search, No Filter)
            const isDefaultView = !debouncedSearch && activeFilter === 'Tümü' && !dateRange.start && reset;
            if (isDefaultView) {
                const cached = cache.get(CACHE_KEYS.ORIGINS);
                if (cached) {
                    setStories(cached);
                    // Since we have cache, we might not have the 'cursor' for the next page unless we saved it?
                    // Usually we don't save cursors in simple cache. 
                    // Strategy: If cached, show it. Then background fetch to update and get fresh cursor.
                }
            }

            // 3. EXECUTE QUERY
            const snapshot = await getDocs(q);

            // 4. PROCESS RESULTS
            const newStories = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) })) as Story[];

            // Handle Empty
            setHasMore(newStories.length === 100);

            // Create Cursor
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

            // Set State
            if (reset) {
                setStories(newStories);
                setChunkIndex(1);
                // Update Cache if Default View
                if (isDefaultView) {
                    cache.set(CACHE_KEYS.ORIGINS, newStories, CACHE_TTL.EPIC);
                }
            } else {
                // Append
                setStories(prev => [...prev, ...newStories]);
            }

        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Trigger Fetch on Change
    useEffect(() => {
        // Reset and fetch when Search, Filter or Date changes
        fetchStories(true);
    }, [debouncedSearch, activeFilter, dateRange.start, dateRange.end]);

    // Deep Link Logic (Open story from URL)
    const [searchParams, setSearchParams] = useSearchParams();
    useEffect(() => {
        const storyIdFromUrl = searchParams.get('storyId');
        if (storyIdFromUrl && stories.length > 0) {
            const targetStory = stories.find(s => s.id === storyIdFromUrl);
            if (targetStory) {
                setSelectedStory(targetStory);
                // Clean URL without refreshing
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('storyId');
                // We replace history to keep back button functional but clean current state
                // We won't force URL change to avoid re-renders, just set state.
            }
        }
    }, [stories, searchParams]);

    // Check URL params for saved filter
    useEffect(() => {
        if (searchParams.get('saved') === 'true') {
            setShowSavedOnly(true);
        }
    }, [searchParams]);

    // Recommendation Engine
    const recommendedStories = useMemo(() => {
        if (!selectedStory) return [];
        const related = stories.filter(s =>
            s.id !== selectedStory.id &&
            s.tags?.some(tag => selectedStory.tags?.includes(tag))
        );
        if (related.length < 3) {
            const others = stories.filter(s => s.id !== selectedStory.id && !related.includes(s));
            return [...related, ...others].slice(0, 4);
        }
        return related.slice(0, 4);
    }, [selectedStory, stories]);

    // Image Gallery Logic
    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedStory?.images) return;
        setSlideDirection(1);
        setActiveImageIndex((prev) => (prev + 1) % selectedStory.images!.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedStory?.images) return;
        setSlideDirection(-1);
        setActiveImageIndex((prev) => (prev - 1 + selectedStory.images!.length) % selectedStory.images!.length);
    };

    const handleRandomStory = () => {
        if (stories.length > 0) {
            const random = stories[Math.floor(Math.random() * stories.length)];
            setSelectedStory(random);
            setActiveImageIndex(0);
        }
    };

    const openStory = (story: Story) => {
        setSelectedStory(story);
        setActiveImageIndex(0);
        // Push state for back button handling
        window.history.pushState({ modalOpen: true }, '', '');
    }

    // --- NATIVE BACK BUTTON LOGIC ---
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (selectedStory) {
                // If modal is open and back is pressed, close modal and stay on view
                event.preventDefault(); // Sometimes needed depending on browser
                setSelectedStory(null);
            } else {
                // If no modal, go back to Lobby (handled by React Router if we push URL, but here we use View State)
                // However, Archive.tsx handles view switching. RootsView is just a component.
                // If user presses back in RootsView, we want to go to Lobby.
                // Standard browser Back likely goes to previous ROUTE. 
                // We need to intercept if we want "Back -> Lobby", OR rely on "Lobiye Dön" button.
                // User Request: "arşivde bir kısımdayken telefonun geri git tuşuna basıldğında arşiv lobisine dönülmeli."
                // Since this component is mounted *inside* /arsiv, if we didn't push a state for RootsView, back button leaves /arsiv.
                // To fix this: Archive.tsx should push state when entering a view.

                // For THIS component (RootsView), we only handle the Modal closing standardly.
                // The parent (Archive.tsx) should probably handle the "View -> Lobby" transition if we want precise control,
                // OR we accept that Back leaves the page unless we hacked the history stack on mount.

                // Let's implement the Modal closing here correctly first:
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [selectedStory]);

    // Close modal helper (removes history state if manual close)
    const closeStory = () => {
        setSelectedStory(null);
        // If we manually close, we should go back in history to remove the 'modalOpen' state
        // ONLY if the current state was actually pushed by us. 
        // A simple way is just `history.back()` but that triggers popstate.
        // Better: Check state.
        if (window.history.state && window.history.state.modalOpen) {
            window.history.back();
        }
    }

    // --- Helper: SAFE URL & EMBED ---

    // --- HELPERS (Layout) ---

    // 1. Displayed Stories
    // Logic: Return ALL filtered stories accumulated so far (Infinite Scroll).
    // Hybrid Filter: If Search is active, Server ignored Date. So we filter Date here.
    const displayedStories = useMemo(() => {
        let result = stories;

        // If Search was active, Server returned matches by Title (ignoring Date).
        // We must filter by Date client-side to satisfy "Simultaneous" requirement.
        if (debouncedSearch && (dateRange.start || dateRange.end)) {
            result = result.filter(s => {
                const storyYear = parseInt(s.year) || 0;
                let startYear = 0;
                let endYear = 9999;
                if (dateRange.start) startYear = parseInt(dateRange.start.split('-')[0]);
                if (dateRange.end) endYear = parseInt(dateRange.end.split('-')[0]);
                return storyYear >= startYear && storyYear <= endYear;
            });
        }

        // Then Slice for "Load More" effect (though usually we show all if Infinite Append)
        return result.slice(0, chunkIndex * 100);
    }, [stories, chunkIndex, debouncedSearch, dateRange]);

    // 2. Featured Story
    // Pick a random story from the current loaded batch (stories).
    // Ideally this should be a stable pick so it doesn't change on every render.
    const featuredStory = useMemo(() => {
        if (stories.length === 0) return null;
        // Seed random index based on list length to be somewhat stable or just random
        const randomIndex = Math.floor(Math.random() * stories.length);
        return stories[randomIndex];
    }, [stories.length]); // Only change if count changes (load more) or mount.

    // NEXT PAGE HANDLER
    const handleNextPage = () => {
        if (!hasMore || loading) return;
        setChunkIndex(prev => prev + 1);
        fetchStories(false);
    };

    // 3. Image/Video Helpers
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
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=0` : null;
    };

    const isCurrentSlideVideo = () => {
        if (!selectedStory?.images || selectedStory.images.length === 0) return false;
        const url = selectedStory.images[activeImageIndex];
        return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
    };

    return (
        <div className="min-h-full bg-[#f5f5f4] text-stone-900 font-sans relative pb-20">

            {/* 1. COMPACT HEADER & FILTERS */}
            <div className="sticky top-0 z-40 bg-[#f5f5f4]/95 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all">

                <div className="px-4 py-3 max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">

                    {/* A. Back & Title */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors font-serif font-bold text-xs uppercase tracking-widest shrink-0"
                        >
                            <ArrowLeft size={16} /> Lobiye Dön
                        </button>
                        <div className="h-4 w-px bg-stone-300 hidden md:block"></div>
                        <h1 className="font-serif font-bold text-lg text-stone-800 hidden md:block">Kökenler ve Hikayeler</h1>
                    </div>

                    {/* B. Active Tools (Search, Date, Filter) */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">

                        {/* Search Input */}
                        <div className="relative group shrink-0 w-40 focus-within:w-60 transition-all duration-300">
                            <Search className="absolute left-2.5 top-2.5 text-stone-400 group-focus-within:text-stone-600" size={14} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ara..."
                                className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-700 outline-none focus:border-stone-400 shadow-sm"
                            />
                        </div>

                        {/* Date Filter (Compact) */}
                        <div className="flex items-center bg-white border border-stone-200 rounded-lg px-2 py-1.5 gap-2 shrink-0 shadow-sm">
                            <Calendar size={14} className="text-stone-400" />
                            <input
                                type="month"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="w-24 text-[10px] bg-transparent outline-none font-bold text-stone-600 uppercase"
                            />
                            <span className="text-stone-300">-</span>
                            <input
                                type="month"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="w-24 text-[10px] bg-transparent outline-none font-bold text-stone-600 uppercase"
                            />
                        </div>

                        {/* Category Filter Dropdown (Mobile optimized) */}
                        <div className="shrink-0 relative">
                            <select
                                value={activeFilter}
                                onChange={(e) => setActiveFilter(e.target.value)}
                                className="w-32 pl-3 pr-8 py-2 bg-stone-800 text-stone-100 rounded-lg text-xs font-bold appearance-none cursor-pointer outline-none shadow-md hover:bg-stone-700 transition-colors"
                            >
                                {filters.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <div className="absolute right-2.5 top-2.5 pointer-events-none text-stone-400">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                            </div>
                        </div>

                        {/* Saved Toggle */}
                        <button
                            onClick={() => setShowSavedOnly(!showSavedOnly)}
                            className={cn(
                                "p-2 rounded-lg transition-all border shrink-0",
                                showSavedOnly ? "bg-boun-gold border-boun-gold text-white" : "bg-white border-stone-200 text-stone-400 hover:border-stone-400"
                            )}
                            title="Kaydedilenler"
                        >
                            <Bookmark size={16} fill={showSavedOnly ? "currentColor" : "none"} />
                        </button>

                    </div>
                </div>
            </div>

            {/* 2. FEATURED STORY (Random) */}
            {featuredStory && !debouncedSearch && activeFilter === 'Tümü' && !showSavedOnly && chunkIndex === 1 && (
                <div className="px-4 py-6 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl border-4 border-double border-stone-200 p-1 md:p-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
                        onClick={() => openStory(featuredStory)}
                    >
                        {/* Random Symbol/Badge */}
                        <div className="absolute top-0 right-0 z-20 bg-stone-900/10 backdrop-blur-md px-3 py-1 rounded-bl-xl border-l border-b border-white/20">
                            <Dices size={16} className="text-white drop-shadow-md" />
                        </div>

                        <div className="w-full h-48 md:h-80 relative rounded-xl overflow-hidden">
                            {/* Background Image/Blur */}
                            <div className="absolute inset-0">
                                {featuredStory.images && featuredStory.images.length > 0 ? (
                                    <img src={featuredStory.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full bg-stone-100 flex items-center justify-center opacity-50"><Quote size={64} className="text-stone-300" /></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
                            </div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white">
                                <div className="flex items-center gap-3 mb-3 opacity-90">
                                    <span className="bg-boun-gold text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">Günün Hikayesi</span>
                                    <span className="text-sm font-serif italic text-stone-300">{featuredStory.category}</span>
                                </div>
                                <h2 className="font-serif text-2xl md:text-5xl font-bold leading-tight mb-4 drop-shadow-lg">{featuredStory.title}</h2>
                                <p className="font-sans text-sm md:text-lg text-stone-200 line-clamp-2 md:line-clamp-3 max-w-3xl opacity-90">{featuredStory.content}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* 3. MASONRY GRID (Chunked) */}
            <div className="px-4 max-w-7xl mx-auto min-h-[50vh]">
                {loading && stories.length === 0 ? (
                    <div className="text-center py-20 text-stone-400 font-serif italic flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-500 rounded-full animate-spin"></div>
                        Arşiv taranıyor...
                    </div>
                ) : stories.length === 0 ? (
                    <div className="text-center py-20 text-stone-400 font-serif italic border-2 border-dashed border-stone-200 rounded-xl bg-stone-50">
                        {debouncedSearch ? "Aramanızla eşleşen hikaye bulunamadı." : "Bu kategoride henüz hikaye yok."}
                    </div>
                ) : (
                    <>
                        <motion.div
                            key={chunkIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 pb-8"
                        >
                            {displayedStories.map((story, idx) => {
                                const youtubeEmbed = getYouTubeEmbedUrl(story.youtubeUrl || '');
                                const hasMedia = story.images && story.images.length > 0;
                                const isVideoFile = hasMedia && (story.images![0].endsWith('.mp4') || story.images![0].endsWith('.webm'));
                                const isSaved = userProfile?.savedRootIds?.includes(story.id);

                                return (
                                    <motion.div
                                        key={story.id}
                                        layoutId={`card-${story.id}`}
                                        whileHover={{ y: -4, scale: 1.01 }}
                                        onClick={() => openStory(story)}
                                        className="break-inside-avoid bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group relative ring-1 ring-stone-900/5"
                                    >
                                        {/* Media Thumbnail */}
                                        <div className="relative bg-stone-100 overflow-hidden">
                                            {hasMedia ? (
                                                isVideoFile ? (
                                                    <div className="aspect-video bg-black flex items-center justify-center text-white">
                                                        <Film size={32} />
                                                    </div>
                                                ) : (
                                                    <img src={story.images![0]} alt={story.title} className="w-full h-auto object-cover" loading="lazy" />
                                                )
                                            ) : youtubeEmbed ? (
                                                <div className="aspect-video bg-black relative">
                                                    <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center pointer-events-none z-10">
                                                        <Youtube size={32} className="text-white" />
                                                    </div>
                                                    <img
                                                        src={`https://img.youtube.com/vi/${story.youtubeUrl?.split('v=')[1] || story.youtubeUrl?.split('/').pop()}/0.jpg`}
                                                        className="w-full h-full object-cover opacity-60"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-[4/3] flex items-center justify-center text-stone-300 bg-[#fdfbf7] pattern-paper">
                                                    <Quote size={32} className="opacity-20 text-stone-900" />
                                                </div>
                                            )}

                                            {/* Overlays */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider text-stone-800 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                                {story.category}
                                            </div>

                                            {isSaved && (
                                                <div className="absolute top-2 right-2 text-boun-gold bg-black/80 p-1.5 rounded-full shadow-lg">
                                                    <Bookmark size={10} fill="currentColor" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Teaser (Pinterest Style) */}
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{story.year}</span>
                                            </div>
                                            <h3 className="font-serif font-bold text-stone-900 leading-snug mb-2 text-sm md:text-base group-hover:text-amber-800 transition-colors">
                                                {story.title}
                                            </h3>
                                            <p className="font-sans text-xs text-stone-500 line-clamp-2 leading-relaxed opacity-80">
                                                {story.content}
                                            </p>

                                            {/* Tags preview */}
                                            {story.tags && story.tags.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-1 opacity-60">
                                                    {story.tags.slice(0, 2).map(t => (
                                                        <span key={t} className="text-[9px] text-stone-500 bg-stone-100 px-1 rounded">#{t}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </motion.div>

                        {/* CHUNK NAVIGATION (Pagination) */}
                        <div className="flex justify-center items-center gap-4 py-8 border-t border-stone-200 mt-8">
                            <button
                                onClick={() => { setChunkIndex(Math.max(1, chunkIndex - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={chunkIndex === 1}
                                className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm font-bold text-stone-600 disabled:opacity-30 hover:bg-stone-50 transition-colors flex items-center gap-2"
                            >
                                <ChevronLeft size={16} /> Önceki Sayfa
                            </button>

                            <span className="text-xs font-serif font-bold text-stone-400">
                                SAYFA {chunkIndex}
                            </span>

                            <button
                                onClick={() => { handleNextPage(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={!hasMore && chunkIndex * CHUNK_SIZE >= stories.length}
                                className="px-4 py-2 bg-stone-800 text-stone-100 rounded-lg text-sm font-bold shadow-md hover:bg-stone-700 disabled:opacity-30 disabled:shadow-none transition-all flex items-center gap-2"
                            >
                                {loading ? "Yükleniyor..." : "Sıradaki Anılar"} <ChevronRight size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* 4. LIGHTBOX MODAL */}
            {createPortal(
                <AnimatePresence>
                    {selectedStory && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 bg-stone-900/80 md:backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={closeStory}
                                className="absolute inset-0"
                            />

                            <motion.div
                                layoutId={`card-${selectedStory.id}`} // Synced Layout ID
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="relative w-full max-w-6xl h-full md:h-[85vh] bg-[#fdfbf7] md:rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* CLOSE BUTTON */}
                                <button
                                    onClick={closeStory}
                                    className="absolute top-4 right-4 z-50 p-2.5 bg-white text-stone-800 rounded-full hover:bg-stone-100 transition-colors shadow-lg border border-stone-200"
                                >
                                    <X size={20} />
                                </button>

                                {/* LEFT: MEDIA (Black Bg) */}
                                <div className="w-full md:w-3/5 bg-black flex items-center justify-center relative overflow-hidden group shrink-0 h-[40vh] md:h-full">
                                    {/* 1. YouTube */}
                                    {selectedStory.youtubeUrl && getYouTubeEmbedUrl(selectedStory.youtubeUrl) ? (
                                        <iframe
                                            src={getYouTubeEmbedUrl(selectedStory.youtubeUrl)!}
                                            className="w-full h-full"
                                            allowFullScreen
                                            title="Video"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                    ) : selectedStory.images && selectedStory.images.length > 0 ? (
                                        /* 2. R2 Files (Images/Videos) */
                                        /* 2. R2 Files (Images/Videos) */
                                        <div className="relative w-full h-full flex items-center justify-center bg-black">
                                            <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                                                {isCurrentSlideVideo() ? (
                                                    <motion.video
                                                        key={activeImageIndex}
                                                        src={selectedStory.images![activeImageIndex]}
                                                        custom={slideDirection}
                                                        initial={{ opacity: 0, x: slideDirection > 0 ? 300 : -300 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: slideDirection > 0 ? -300 : 300 }}
                                                        transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                                        className="w-full h-full object-contain absolute inset-0"
                                                        controls
                                                        autoPlay
                                                    />
                                                ) : (
                                                    <motion.img
                                                        key={activeImageIndex}
                                                        src={selectedStory.images![activeImageIndex]}
                                                        alt={selectedStory.title}
                                                        custom={slideDirection}
                                                        initial={{ opacity: 0, x: slideDirection > 0 ? 300 : -300 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: slideDirection > 0 ? -300 : 300 }}
                                                        transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                                        className="w-full h-full object-contain absolute inset-0"
                                                    />
                                                )}
                                            </AnimatePresence>

                                            {/* Navigation Arrows */}
                                            {selectedStory.images!.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={handlePrevImage}
                                                        className="absolute left-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                                                    >
                                                        <ChevronLeft size={24} />
                                                    </button>
                                                    <button
                                                        onClick={handleNextImage}
                                                        className="absolute right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                                                    >
                                                        <ChevronRight size={24} />
                                                    </button>
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/50 px-3 py-1 rounded-full text-white text-xs font-bold backdrop-blur-sm">
                                                        {activeImageIndex + 1} / {selectedStory.images!.length}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-white/50 flex flex-col items-center gap-2">
                                            <ImageIcon size={48} />
                                            <span className="text-sm">Görsel Yok</span>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT: CONTENT (Scrollable) */}
                                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[#fdfbf7]">
                                    <div className="mb-6 border-b border-stone-200 pb-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-stone-200 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{selectedStory.category}</span>
                                                <span className="text-xs font-bold text-amber-700 flex items-center gap-1"><Calendar size={12} /> {selectedStory.year}</span>
                                            </div>

                                            {/* BOOKMARK BUTTON */}
                                            <button
                                                onClick={() => toggleBookmark('story', selectedStory.id)}
                                                className="text-stone-400 hover:text-boun-gold transition-colors"
                                                title="Kaydet"
                                            >
                                                <Bookmark
                                                    size={24}
                                                    fill={userProfile?.savedRootIds?.includes(selectedStory.id) ? "currentColor" : "none"}
                                                    className={userProfile?.savedRootIds?.includes(selectedStory.id) ? "text-boun-gold" : ""}
                                                />
                                            </button>
                                        </div>

                                        <h2 className="font-serif text-3xl font-bold text-stone-900 leading-tight mb-4">{selectedStory.title}</h2>

                                        {/* Source & External Link */}
                                        <div className="flex flex-wrap gap-4 text-xs text-stone-500 font-sans">
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-stone-700">Kaynak:</span> {selectedStory.source}
                                            </div>
                                            {selectedStory.externalUrl && (
                                                <a href={ensureAbsoluteUrl(selectedStory.externalUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline font-bold">
                                                    <LinkIcon size={12} /> Bağlantıya Git
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="prose prose-stone prose-sm max-w-none text-stone-800 leading-relaxed whitespace-pre-wrap font-serif">
                                        {selectedStory.content}
                                    </div>

                                    {/* Tags */}
                                    {selectedStory.tags && selectedStory.tags.length > 0 && (
                                        <div className="mt-8 pt-6 border-t border-stone-200">
                                            <div className="flex flex-wrap gap-2">
                                                {selectedStory.tags.map((tag, i) => (
                                                    <span key={i} className="text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded border border-stone-200 flex items-center gap-1">
                                                        <Tag size={10} /> {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

        </div>
    );
};

export default RootsView;