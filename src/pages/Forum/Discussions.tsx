import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
    MessageSquare, Heart, Share2, MoreHorizontal, Plus,
    Search, Filter, Ghost, User as UserIcon, X, ChevronLeft,
    Flame, CornerDownRight, Flag
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
    { id: 'genel', label: 'Genel', icon: MessageSquare, color: 'text-blue-400' },
    { id: 'soru-cevap', label: 'Soru/Cevap', icon: MessageSquare, color: 'text-emerald-400' },
    { id: 'gundem', label: 'Gündem', icon: Flame, color: 'text-orange-500' },
    { id: 'itiraf', label: 'İtiraf', icon: Ghost, color: 'text-purple-500' },
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

// Generate Mock Nested Comments
const generateComments = (depth = 0): Comment[] => {
    if (depth > 3) return [];
    return Array.from({ length: Math.random() > 0.5 ? 2 : 1 }).map((_, i) => ({
        id: `c-${depth}-${i}-${Math.random()}`,
        author: { name: `User ${Math.floor(Math.random() * 100)}`, isAnon: Math.random() > 0.8 },
        content: "Bu konu hakkında kesinlikle katılıyorum. Detaylar çok önemli.",
        timestamp: "2s",
        upvotes: Math.floor(Math.random() * 50),
        depth,
        children: generateComments(depth + 1)
    }));
};

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


// --- SUB-COMPONENTS (INLINED FOR SINGLE FILE CLARITY INITIALLY) ---

// 1. Thread Card (Feed Item)
const ThreadCard = ({ thread, isActive, onClick }: { thread: Thread, isActive: boolean, onClick: () => void }) => {
    return (
        <motion.div
            layout // Enable layout animation for list reordering
            onClick={onClick}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "group relative p-4 cursor-pointer border-b border-stone-800 hover:bg-stone-900/50 transition-colors",
                isActive ? "bg-stone-900 border-l-2 border-l-red-600" : "bg-transparent border-l-2 border-l-transparent"
            )}
        >
            {/* Hype Indicator */}
            {thread.isHot && (
                <div className="absolute top-2 right-2 text-[10px] font-bold text-orange-500 flex items-center gap-1 animate-pulse">
                    <Flame size={10} /> HOT
                </div>
            )}

            <div className="flex items-start gap-3">
                {/* Avatar / Vote Sidebar (Combined for density) */}
                <div className="flex flex-col items-center gap-1 min-w-[30px]">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-stone-800 border border-stone-700", thread.author.isAnon && "border-purple-500/30")}>
                        {thread.author.isAnon ? <Ghost size={14} className="text-purple-400" /> : <UserIcon size={14} className="text-stone-400" />}
                    </div>
                    <span className="text-[10px] font-bold text-stone-500 mt-1">{thread.stats.upvotes}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border bg-stone-900/50",
                            CATEGORIES.find(c => c.id === thread.category)?.color,
                            "border-stone-800"
                        )}>
                            {CATEGORIES.find(c => c.id === thread.category)?.label}
                        </span>
                        <span className="text-[10px] text-stone-600">• {thread.timestamp}</span>
                    </div>

                    <h3 className={cn("text-sm font-bold text-stone-200 mb-1 leading-snug line-clamp-2 group-hover:text-red-500 transition-colors", isActive && "text-red-500")}>
                        {thread.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2">{thread.content}</p>

                    <div className="flex items-center gap-4 mt-3 text-stone-600">
                        <div className="flex items-center gap-1 text-xs hover:text-stone-300 transition-colors">
                            <MessageSquare size={12} /> {thread.stats.comments}
                        </div>
                        <div className="flex items-center gap-1 text-xs hover:text-stone-300 transition-colors">
                            <Share2 size={12} /> Paylaş
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
        <div className={cn("relative", !isRoot && "pl-4 md:pl-6 border-l border-stone-800 hover:border-stone-700 transition-colors")}>
            {/* Collapse Trigger Line */}
            <div
                className="absolute left-0 top-0 bottom-0 w-4 cursor-pointer z-10 -ml-2" // Invisible click area for line
                onClick={() => setCollapsed(!collapsed)}
            />

            <div className="py-2 group">
                <div className="flex items-center gap-2 mb-1" onClick={() => setCollapsed(!collapsed)}>
                    <span className={cn("font-bold text-xs cursor-pointer hover:underline", comment.author.isAnon ? "text-purple-400" : "text-stone-300")}>
                        {comment.author.isAnon ? "Anonim" : comment.author.name}
                    </span>
                    <span className="text-[10px] text-stone-600">{comment.timestamp}</span>
                    {collapsed && <span className="text-[10px] text-stone-500 bg-stone-800 px-1 rounded">+{comment.children.length} yanıt</span>}
                </div>

                {!collapsed && (
                    <>
                        <p className="text-sm text-stone-400 leading-relaxed mb-2">{comment.content}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-4 text-stone-600 mb-2">
                            <button className="flex items-center gap-1 text-[10px] font-bold hover:text-orange-500 transition-colors"><Heart size={10} /> {comment.upvotes}</button>
                            <button className="flex items-center gap-1 text-[10px] font-bold hover:text-blue-500 transition-colors"><CornerDownRight size={10} /> Yanıtla</button>
                            <button className="ml-auto hover:text-stone-300"><MoreHorizontal size={12} /></button>
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

    // Filter threads
    const filteredThreads = MOCK_THREADS.filter(t => activeTab === 'all' || t.category === activeTab);

    // Auto-select first thread on desktop if none selected
    useEffect(() => {
        if (isDesktop && !selectedThread && filteredThreads.length > 0) {
            setSelectedThread(filteredThreads[0]);
        }
    }, [isDesktop, activeTab]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-stone-200 flex flex-col md:flex-row h-screen overflow-hidden">

            {/* LEFT PANE: FEED (Visible on Mobile unless thread selected, Always visible on Desktop) */}
            <div className={cn(
                "w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-stone-800 bg-[#0a0a0a] z-10",
                !isDesktop && selectedThread ? "hidden" : "flex"
            )}>
                {/* Header & Filters */}
                <div className="p-4 border-b border-stone-800 bg-[#0a0a0a]/95 backdrop-blur z-20 sticky top-0">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold font-serif tracking-tight">Topluluk</h1>
                        <button className="p-2 bg-stone-900 rounded-full text-stone-400 hover:text-white"><Search size={18} /></button>
                    </div>

                    {/* Category Chips */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={cn("px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all", activeTab === 'all' ? "bg-stone-100 text-black" : "bg-stone-900 text-stone-500 hover:bg-stone-800")}
                        >
                            Tümü
                        </button>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={cn("px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all border border-transparent",
                                    activeTab === cat.id ? `bg-stone-900 ${cat.color} border-stone-700` : "bg-stone-900 text-stone-500 hover:bg-stone-800"
                                )}
                            >
                                <cat.icon size={10} /> {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Thread List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-800">
                    {filteredThreads.map(thread => (
                        <ThreadCard
                            key={thread.id}
                            thread={thread}
                            isActive={selectedThread?.id === thread.id}
                            onClick={() => setSelectedThread(thread)}
                        />
                    ))}
                    {/* Bottom Padding for FAB */}
                    <div className="h-24" />
                </div>
            </div>


            {/* RIGHT PANE: DETAIL (Agora Split View) */}
            {/* On Mobile: Full screen overlay. On Desktop: Static right pane */}
            <div className={cn(
                "flex-1 bg-[#0c0c0c] flex flex-col h-full",
                !isDesktop && !selectedThread ? "hidden" : "flex"
            )}>
                {selectedThread ? (
                    <>
                        {/* Detail Header */}
                        <div className="p-4 border-b border-stone-800 flex items-center gap-4 bg-[#0c0c0c] sticky top-0 z-20">
                            {!isDesktop && (
                                <button onClick={() => setSelectedThread(null)} className="p-1 -ml-1 text-stone-400">
                                    <ChevronLeft size={24} />
                                </button>
                            )}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-lg font-bold leading-tight truncate">{selectedThread.title}</h1>
                                <span className="text-xs text-stone-500">
                                    {CATEGORIES.find(c => c.id === selectedThread.category)?.label} • {selectedThread.author.isAnon ? "Anonim" : selectedThread.author.name}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-stone-800 rounded-full transition-colors text-stone-500"><Flag size={18} /></button>
                                <button className="p-2 hover:bg-stone-800 rounded-full transition-colors text-stone-500"><Share2 size={18} /></button>
                            </div>
                        </div>

                        {/* Detail Content (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-stone-800">
                            {/* Original Post */}
                            <div className="mb-8 pb-8 border-b border-stone-800/50">
                                <p className="text-stone-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                                    {selectedThread.content}
                                </p>
                            </div>

                            {/* Comment Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-stone-400 text-xs uppercase tracking-widest">Yanıtlar</h3>
                                    <div className="flex gap-2">
                                        <button className="text-xs text-stone-500 hover:text-stone-300">En Yeniler</button>
                                        <button className="text-xs font-bold text-stone-300">Popüler</button>
                                    </div>
                                </div>

                                {generateComments().map(comment => (
                                    <CommentNode key={comment.id} comment={comment} isRoot />
                                ))}

                                {/* Padding for mobile bottom */}
                                <div className="h-24 md:h-8" />
                            </div>
                        </div>

                        {/* Reply Input (Sticky Bottom) */}
                        <div className="p-4 bg-[#0c0c0c] border-t border-stone-800">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Düşüncelerini paylaş..."
                                    className="w-full bg-stone-900 border border-stone-800 rounded-full py-3 px-4 text-sm focus:outline-none focus:border-stone-600 transition-colors"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-stone-700 rounded-full hover:bg-stone-600 transition-colors">
                                    <CornerDownRight size={14} className="text-white" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    // Empty State (Desktop only)
                    <div className="flex-1 flex flex-col items-center justify-center text-stone-600">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p>Bir başlık seçin veya yeni bir tartışma başlatın.</p>
                    </div>
                )}
            </div>

            {/* CREATE POST FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-900/40 z-50 hover:bg-red-600 transition-colors"
            >
                <Plus size={28} />
            </motion.button>


            {/* CREATE POST MODAL */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-lg bg-[#111] border border-stone-800 rounded-2xl p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold font-serif">Yeni Tartışma Başlat</h2>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-stone-500 hover:text-white"><X /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">Kategori</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                // Simplified selection logic for demo
                                                className={cn("flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs font-bold transition-all",
                                                    cat.id === 'itiraf' ? "border-purple-900/50 bg-purple-900/10 hover:bg-purple-900/20 text-purple-400" : "border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-400"
                                                )}
                                            >
                                                <cat.icon size={16} />
                                                <span>{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-[10px] text-stone-500 flex items-center gap-1">
                                        <Ghost size={10} className="text-purple-500" />
                                        "İtiraf" kategorisinde kimliğiniz <span className="text-purple-400 font-bold">gizli</span> tutulur.
                                    </p>
                                </div>

                                <input type="text" placeholder="Başlık" className="w-full bg-stone-900 border border-stone-800 rounded-lg p-3 text-sm focus:border-stone-600 outline-none" />
                                <textarea placeholder="İçerik..." rows={5} className="w-full bg-stone-900 border border-stone-800 rounded-lg p-3 text-sm focus:border-stone-600 outline-none resize-none" />

                                <button className="w-full py-3 bg-stone-200 text-black font-bold rounded-lg hover:bg-white transition-colors">
                                    Yayınla
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
