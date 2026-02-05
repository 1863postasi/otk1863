import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Heart, Share2, MoreHorizontal, Plus,
    Search, Filter, Ghost, User as UserIcon, X, ChevronLeft,
    Flame, CornerDownRight, Flag, Send, ArrowUp
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Simple hook to replace react-responsive
const useMediaQuery = ({ query }: { query: string }) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) setMatches(media.matches);
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [query]);

    return matches;
}

// --- MOCK DATA ---
const CATEGORIES = [
    { id: 'genel', label: 'Genel', icon: MessageSquare, color: 'text-blue-600' },
    { id: 'soru-cevap', label: 'Soru/Cevap', icon: MessageSquare, color: 'text-emerald-600' },
    { id: 'gundem', label: 'Gündem', icon: Flame, color: 'text-orange-600' },
    { id: 'itiraf', label: 'İtiraf', icon: Ghost, color: 'text-purple-600' },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

interface Comment {
    id: string;
    author: { name: string; avatar?: string; isAnon?: boolean };
    content: string;
    timestamp: string;
    upvotes: number;
    depth: number;
    children: Comment[];
}

interface Thread {
    id: string;
    title: string;
    category: CategoryId;
    content: string;
    author: { name: string; avatar?: string; isAnon?: boolean };
    timestamp: string;
    stats: { upvotes: number; comments: number; views: number };
    isHot?: boolean;
}

// Generate Mock Nested Comments (Deterministic for stability)
const generateComments = (depth = 0, prefix = 'root'): Comment[] => {
    if (depth > 3) return [];
    return Array.from({ length: depth % 2 === 0 ? 2 : 1 }).map((_, i) => ({
        id: `c-${prefix}-${depth}-${i}`,
        author: { name: `User ${10 + depth * 10 + i}`, isAnon: i % 2 === 0 },
        content: "Bu konu hakkında kesinlikle katılıyorum. Detaylar çok önemli.",
        timestamp: "2s",
        upvotes: 45 - depth * 5,
        depth,
        children: generateComments(depth + 1, `${prefix}-${i}`)
    }));
};

// Stable Mock Data
const MOCK_COMMENTS = generateComments();

const MOCK_THREADS: Thread[] = Array.from({ length: 20 }).map((_, i) => ({
    id: `t-${i}`,
    title: i % 3 === 0 ? "Kampüs kedileri hakkında önemli duyuru" : "Finaller ne zaman açıklanacak?",
    category: CATEGORIES[i % 4].id,
    content: "Merhaba arkadaşlar, bu konuda fikrinizi merak ediyorum. Geçen gün kütüphanede...",
    author: { name: "Umut", isAnon: CATEGORIES[i % 4].id === 'itiraf' },
    timestamp: `${i}d`,
    stats: { upvotes: 120 - i * 2, comments: 45, views: 1000 },
    isHot: i < 3
}));



// --- SUB-COMPONENTS ---

// 1. Thread Card (Feed Item)
const ThreadCard = ({ thread, isActive, onClick }: { thread: Thread, isActive: boolean, onClick: () => void }) => {
    return (
        <motion.div
            layout
            onClick={onClick}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "group relative p-3 md:p-4 cursor-pointer border-b border-stone-100 hover:bg-stone-50 transition-all",
                isActive ? "bg-stone-50 border-l-2 border-l-stone-900" : "bg-transparent border-l-2 border-l-transparent"
            )}
        >
            {/* Hype Indicator */}
            {thread.isHot && (
                <div className="absolute top-3 right-3 text-[10px] font-bold text-orange-600 flex items-center gap-1 animate-pulse bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-100">
                    <Flame size={10} /> HOT
                </div>
            )}

            <div className="flex items-start gap-3">
                {/* Avatar / Vote Sidebar */}
                <div className="flex flex-col items-center gap-1 min-w-[32px] pt-1">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-white border border-stone-200 shadow-sm shrink-0", thread.author.isAnon && "border-purple-200 bg-purple-50")}>
                        {thread.author.isAnon ? <Ghost size={14} className="text-purple-500" /> : <UserIcon size={14} className="text-stone-400" />}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap pr-12">
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                            CATEGORIES.find(c => c.id === thread.category)?.color.replace('text-', 'bg-').replace('600', '100').replace('500', '100'),
                            "text-stone-700"
                        )}>
                            {CATEGORIES.find(c => c.id === thread.category)?.label}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium">• {thread.timestamp}</span>
                    </div>

                    <h3 className={cn("text-sm font-bold text-stone-900 mb-1 leading-snug line-clamp-2 group-hover:text-boun-blue transition-colors font-serif", isActive && "text-boun-blue")}>
                        {thread.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-2.5">{thread.content}</p>

                    <div className="flex items-center gap-4 text-stone-400">
                        <div className="flex items-center gap-1 text-[10px] font-bold hover:text-stone-600 transition-colors bg-stone-100 px-2 py-1 rounded-md">
                            <ArrowUp size={12} className={thread.stats.upvotes > 50 ? "text-green-600" : ""} /> {thread.stats.upvotes}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold hover:text-stone-600 transition-colors">
                            <MessageSquare size={12} /> {thread.stats.comments}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// 2. Comment Node (Recursive)
const CommentNode = ({ comment, isRoot = false }: { comment: Comment, isRoot?: boolean }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className={cn("relative", !isRoot && "pl-4 md:pl-6 border-l border-stone-200 hover:border-stone-300 transition-colors")}>
            {/* Collapse Trigger Line */}
            <div
                className="absolute left-0 top-0 bottom-0 w-4 cursor-pointer z-10 -ml-2" // Invisible click area for line
                onClick={() => setCollapsed(!collapsed)}
            />

            <div className="py-2 group">
                <div className="flex items-center gap-2 mb-1" onClick={() => setCollapsed(!collapsed)}>
                    <span className={cn("font-bold text-xs cursor-pointer hover:underline", comment.author.isAnon ? "text-purple-600" : "text-stone-700")}>
                        {comment.author.isAnon ? "Anonim" : comment.author.name}
                    </span>
                    <span className="text-[10px] text-stone-400">{comment.timestamp}</span>
                    {collapsed && <span className="text-[10px] text-stone-500 bg-stone-100 px-1 rounded">+{comment.children.length} yanıt</span>}
                </div>

                {!collapsed && (
                    <>
                        <p className="text-sm text-stone-700 leading-relaxed mb-2">{comment.content}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-4 text-stone-400 mb-2">
                            <button className="flex items-center gap-1 text-[10px] font-bold hover:text-orange-500 transition-colors"><Heart size={10} /> {comment.upvotes}</button>
                            <button className="flex items-center gap-1 text-[10px] font-bold hover:text-blue-500 transition-colors"><CornerDownRight size={10} /> Yanıtla</button>
                            <button className="ml-auto hover:text-stone-600"><MoreHorizontal size={12} /></button>
                        </div>
                    </>
                )}
            </div>

            {/* Recursion */}
            {!collapsed && comment.children.length > 0 && (
                <div className="flex flex-col">
                    {comment.children.map(child => <CommentNode key={child.id} comment={child} />)}
                </div>
            )}
        </div>
    );
};


// 3. Main Page
const Discussions: React.FC = () => {
    const isDesktop = useMediaQuery({ query: '(min-width: 768px)' });
    const [activeTab, setActiveTab] = useState<CategoryId | 'all'>('all');
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Filter threads - Memoized for performance
    const filteredThreads = React.useMemo(() =>
        MOCK_THREADS.filter(t => activeTab === 'all' || t.category === activeTab),
        [activeTab]);

    // Auto-select first thread on desktop if none selected
    useEffect(() => {
        if (isDesktop && !selectedThread && filteredThreads.length > 0) {
            setSelectedThread(filteredThreads[0]);
        }
    }, [isDesktop, activeTab]);

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col md:flex-row h-screen overflow-hidden font-sans">

            {/* LEFT PANE: FEED */}
            <div className={cn(
                "w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-stone-200 bg-stone-50 z-10",
                !isDesktop && selectedThread ? "hidden" : "flex"
            )}>
                {/* HEADER */}
                <div className="border-b border-stone-200 bg-stone-50/95 backdrop-blur z-20 sticky top-0 transition-all">

                    {/* DESKTOP HEADER */}
                    <div className="hidden md:flex p-4 items-center justify-between pointer-events-none md:pointer-events-auto">
                        <h1 className="text-2xl font-bold font-serif tracking-tight text-stone-900">Topluluk</h1>
                        <button className="p-2 bg-white border border-stone-200 rounded-full text-stone-400 hover:text-boun-blue shadow-sm cursor-pointer"><Search size={18} /></button>
                    </div>

                    {/* MOBILE HEADER - Frosted & Centered */}
                    <div className="md:hidden h-14 relative flex items-center justify-center border-b border-stone-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-30">
                        <h1 className="text-lg font-bold font-serif text-stone-900 tracking-tight">Topluluk</h1>
                        {/* Right Actions */}
                        <div className="absolute right-4 flex items-center gap-2">
                            <button className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors">
                                <Search size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Category Chips (Edge-to-Edge Scroll) */}
                    <div className="md:p-4 bg-stone-50 z-20">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3 md:py-0 px-4 md:px-0 mask-linear-fade">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={cn("px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-sm touch-manipulation",
                                    activeTab === 'all'
                                        ? "bg-stone-900 text-white border-stone-900 shadow-md transform scale-105"
                                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                                )}
                            >
                                Tümü
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={cn("px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all border shadow-sm touch-manipulation",
                                        activeTab === cat.id
                                            ? "bg-stone-900 text-white border-stone-900 shadow-md transform scale-105"
                                            : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                                    )}
                                >
                                    <cat.icon size={12} /> {cat.label}
                                </button>
                            ))}
                            {/* Spacer for right edge */}
                            <div className="w-2 shrink-0 md:hidden" />
                        </div>
                    </div>
                </div>

                {/* Thread List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200">
                    {filteredThreads.map(thread => (
                        <ThreadCard
                            key={thread.id}
                            thread={thread}
                            isActive={selectedThread?.id === thread.id}
                            onClick={() => setSelectedThread(thread)}
                        />
                    ))}
                    <div className="h-24" />
                </div>
            </div>


            {/* RIGHT PANE: DETAIL */}
            <div className={cn(
                "flex-1 bg-white flex flex-col h-full border-l border-stone-200",
                !isDesktop && !selectedThread ? "hidden" : "flex"
            )}>
                {selectedThread ? (
                    <>
                        {/* Detail Header */}
                        <div className="h-14 md:h-20 px-4 flex items-center gap-4 bg-white/95 backdrop-blur sticky top-0 z-20 border-b border-stone-100">
                            {!isDesktop && (
                                <button onClick={() => setSelectedThread(null)} className="p-2 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full">
                                    <ChevronLeft size={24} />
                                </button>
                            )}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h1 className="text-lg md:text-xl font-bold leading-tight truncate text-stone-900">{selectedThread.title}</h1>
                                <span className="text-xs text-stone-500 font-medium hidden md:inline">
                                    {CATEGORIES.find(c => c.id === selectedThread.category)?.label} • {selectedThread.author.isAnon ? "Anonim" : selectedThread.author.name}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-400 hover:text-red-500"><Flag size={18} /></button>
                                <button className="p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-400 hover:text-blue-500"><Share2 size={18} /></button>
                            </div>
                        </div>

                        {/* Detail Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-stone-200">
                            {/* Mobile Sub-info */}
                            <div className="md:hidden flex items-center gap-2 mb-4 text-xs text-stone-500 font-medium">
                                <span className={cn("px-2 py-0.5 rounded-full border", CATEGORIES.find(c => c.id === selectedThread.category)?.color.replace('text-', 'bg-').replace('600', '100') || "bg-stone-100", "border-transparent text-stone-800")}>
                                    {CATEGORIES.find(c => c.id === selectedThread.category)?.label}
                                </span>
                                <span>• {selectedThread.author.isAnon ? "Anonim" : selectedThread.author.name}</span>
                            </div>

                            {/* Original Post */}
                            <div className="mb-8 pb-8 border-b border-stone-100">
                                <p className="text-stone-800 leading-relaxed whitespace-pre-wrap text-base font-medium">
                                    {selectedThread.content}
                                </p>
                            </div>

                            {/* Comment Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-stone-400 text-xs uppercase tracking-widest">Yanıtlar</h3>
                                    <div className="flex gap-4">
                                        <button className="text-xs font-bold text-stone-900 border-b-2 border-stone-900 pb-0.5">En Yeniler</button>
                                        <button className="text-xs font-bold text-stone-400 hover:text-stone-600">Popüler</button>
                                    </div>
                                </div>

                                {MOCK_COMMENTS.map(comment => (
                                    <CommentNode key={comment.id} comment={comment} isRoot />
                                ))}

                                <div className="h-24 md:h-8" />
                            </div>
                        </div>

                        {/* Reply Input */}
                        <div className="p-4 bg-white border-t border-stone-200">
                            <div className="relative max-w-3xl mx-auto">
                                <input
                                    type="text"
                                    placeholder="Düşüncelerini paylaş..."
                                    className="w-full bg-stone-50 border border-stone-200 rounded-full py-3.5 px-6 text-sm focus:outline-none focus:border-boun-blue focus:ring-1 focus:ring-boun-blue/20 transition-all shadow-sm"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-stone-200 rounded-full hover:bg-boun-blue hover:text-white transition-all text-stone-500">
                                    <CornerDownRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-stone-400 bg-stone-50/50">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-stone-100 mb-4">
                            <MessageSquare size={32} className="opacity-50" />
                        </div>
                        <p className="font-bold text-stone-500">Bir başlık seçin veya yeni bir tartışma başlatın.</p>
                    </div>
                )}
            </div>

            {/* CREATE POST FAB */}
            {/* CREATE POST FAB - Lifted above bottom nav */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed bottom-24 right-5 md:bottom-8 md:right-8 w-14 h-14 bg-stone-900 rounded-full flex items-center justify-center text-white shadow-xl shadow-stone-900/30 z-40 hover:bg-black transition-colors border border-stone-800"
            >
                <Plus size={24} />
            </motion.button>

            {/* CREATE POST MODAL */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-stone-100"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold font-serif text-stone-800">Yeni Tartışma Başlat</h2>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-stone-400 hover:text-stone-900 transition-colors"><X /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">Kategori</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                className={cn("flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all",
                                                    cat.id === 'itiraf' ? "bg-purple-50 border-purple-100 text-purple-600 hover:bg-purple-100" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                                                )}
                                            >
                                                <cat.icon size={18} />
                                                <span>{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-3 text-[10px] text-stone-400 flex items-center gap-1">
                                        <Ghost size={12} className="text-purple-500" />
                                        "İtiraf" kategorisinde kimliğiniz <span className="text-purple-600 font-bold">gizli</span> tutulur.
                                    </p>
                                </div>

                                <input type="text" placeholder="Başlık" className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm focus:border-boun-blue focus:ring-1 focus:ring-boun-blue/20 outline-none font-bold text-stone-800" />
                                <textarea placeholder="İçerik..." rows={5} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm focus:border-boun-blue focus:ring-1 focus:ring-boun-blue/20 outline-none resize-none text-stone-800" />

                                <button className="w-full py-3.5 bg-boun-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                                    <Send size={18} /> Yayınla
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Discussions;
