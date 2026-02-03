import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, MessageCircle, ArrowRight, Filter,
    ThumbsUp, Flame, Clock, TrendingUp, BookOpen, GraduationCap, X,
    MoreHorizontal, Share2, MessageSquare
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// --- TYPES ---
interface ForumThread {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    authorPhotoUrl: string;
    category: string;
    tags: string[];
    createdAt: string;
    likes: number;
    replyCount: number;
    isPinned: boolean;
}

// --- MOCK DATA ---
const MOCK_COURSES = [
    { code: 'CMPE150', name: 'Intro to Computing', rating: 4.5 },
    { code: 'PHYS101', name: 'Physics I', rating: 2.8 },
    { code: 'HUM101', name: 'Cultural Encounters', rating: 4.2 },
    { code: 'MATH201', name: 'Matrix Theory', rating: 3.5 },
];

const MOCK_INSTRUCTORS = [
    { id: '1', name: 'Prof. Dr. Ali Veli', dept: 'CMPE', rating: 4.8 },
    { id: '2', name: 'Dr. Ayşe Yılmaz', dept: 'PHYS', rating: 3.9 },
    { id: '3', name: 'Mehmet Öz', dept: 'HUM', rating: 4.5 },
];

const generateMockThreads = (category: string): ForumThread[] => {
    return Array.from({ length: 8 }).map((_, i) => ({
        id: `thread-${i}-${category}`,
        title: category === 'soru-cevap' ? `Kampüs kart bakiyesi hakkında #${i}` : `Güney Kampüs kedileri çok tatlı değil mi? #${i}`,
        content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...`,
        authorId: `user-${i}`,
        authorName: `Öğrenci ${i + 1}`,
        authorPhotoUrl: `https://ui-avatars.com/api/?name=Ogrenci+${i + 1}&background=random`,
        category: category,
        tags: ['kampüs', 'yaşam'],
        createdAt: new Date(Date.now() - i * 3600000 * 5).toISOString(),
        likes: Math.floor(Math.random() * 50) + 5,
        replyCount: Math.floor(Math.random() * 15),
        isPinned: i === 0 && category === 'genel',
    }));
};

const Community: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentCategory = searchParams.get('kategori') || 'genel';
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [threads, setThreads] = useState<ForumThread[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Simulate API delay
        const timer = setTimeout(() => {
            setThreads(generateMockThreads(currentCategory));
            setIsLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, [currentCategory]);

    // Categories for navigation
    const CATEGORIES = [
        { id: 'genel', label: 'Genel' },
        { id: 'soru-cevap', label: 'Soru & Cevap' },
        { id: 'gundem', label: 'Gündem' },
        { id: 'itiraf', label: 'İtiraf' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f5f4] font-sans overflow-hidden h-screen">

            {/* 1. SLIM HEADER & FILTER BAR */}
            <div className="bg-white/80 backdrop-blur-md border-b border-stone-200 z-20 shrink-0">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                        {/* Title Section */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Link to="/forum" className="p-2 -ml-2 text-stone-400 hover:text-stone-700 transition-colors rounded-full hover:bg-stone-100">
                                <ArrowRight size={20} className="rotate-180" />
                            </Link>
                            <div>
                                <h1 className="font-serif text-xl md:text-2xl font-bold text-stone-900 leading-none">
                                    TOPLULUK
                                </h1>
                                <p className="text-[10px] md:text-xs font-medium text-stone-400 uppercase tracking-widest hidden md:block">
                                    Kampüsün Serbest Kürsüsü
                                </p>
                            </div>
                        </div>

                        {/* Center: Category Tabs (Pill Shape) */}
                        <div className="flex items-center bg-stone-100/80 p-1 rounded-full overflow-x-auto scrollbar-hide max-w-full">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSearchParams({ kategori: cat.id })}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap",
                                        currentCategory === cat.id
                                            ? "bg-white text-stone-900 shadow-sm ring-1 ring-black/5"
                                            : "text-stone-500 hover:text-stone-700"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Right: Search & Action */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-600 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Tartışma ara..."
                                    className="w-full bg-stone-100/50 group-focus-within:bg-white border border-stone-200 focus:border-stone-400 rounded-lg pl-10 pr-4 py-2 text-sm font-medium outline-none transition-all placeholder:text-stone-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-stone-900 text-white text-xs md:text-sm font-bold hover:bg-black transition-colors shadow-sm shrink-0"
                            >
                                <Plus size={16} />
                                <span className="hidden lg:inline">Yeni Başlık</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative">
                <div className="h-full overflow-y-auto custom-scrollbar">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-24">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* --- LEFT COLUMN: DISCUSSION FEED (8 cols) --- */}
                            <div className="lg:col-span-8 space-y-4">
                                {isLoading ? (
                                    // SKELETONS
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="bg-white rounded-2xl p-6 border border-stone-100 animate-pulse">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-stone-100" />
                                                <div className="space-y-2">
                                                    <div className="h-3 w-24 bg-stone-100 rounded" />
                                                    <div className="h-2 w-16 bg-stone-100 rounded" />
                                                </div>
                                            </div>
                                            <div className="h-4 w-3/4 bg-stone-100 rounded mb-2" />
                                            <div className="h-4 w-1/2 bg-stone-100 rounded" />
                                        </div>
                                    ))
                                ) : (
                                    <AnimatePresence mode="popLayout">
                                        {threads.map((thread, idx) => (
                                            <motion.div
                                                key={thread.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group relative bg-white rounded-2xl border border-transparent hover:border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                            >
                                                <Link to={`/forum/topluluk/${thread.id}`} className="block p-5 sm:p-6">
                                                    {/* Header: Author & Meta */}
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <img
                                                                    src={thread.authorPhotoUrl}
                                                                    alt={thread.authorName}
                                                                    className="w-10 h-10 rounded-full border border-stone-100 object-cover"
                                                                />
                                                                {/* Online indicator mock */}
                                                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-bold text-stone-900 group-hover:text-blue-600 transition-colors">
                                                                    {thread.authorName}
                                                                </h3>
                                                                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-stone-400 font-medium">
                                                                    <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-500 uppercase tracking-wide">{thread.category}</span>
                                                                    <span>•</span>
                                                                    <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true, locale: tr })}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {thread.isPinned && (
                                                            <div className="bg-blue-50 text-blue-600 p-1.5 rounded-full" title="Sabitlenmiş">
                                                                <MoreHorizontal size={16} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content Preview */}
                                                    <div className="mb-4">
                                                        <h2 className="text-base sm:text-lg font-bold text-stone-800 mb-2 leading-tight group-hover:text-blue-700 transition-colors">
                                                            {thread.title}
                                                        </h2>
                                                        <p className="text-sm text-stone-500 line-clamp-3 leading-relaxed">
                                                            {thread.content}
                                                        </p>
                                                    </div>

                                                    {/* Footer Actions */}
                                                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                                                        <div className="flex items-center gap-4">
                                                            <button className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors">
                                                                <ThumbsUp size={16} />
                                                                <span>{thread.likes}</span>
                                                            </button>
                                                            <button className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors">
                                                                <MessageSquare size={16} />
                                                                <span>{thread.replyCount} Yanıt</span>
                                                            </button>
                                                        </div>
                                                        <button className="text-stone-400 hover:text-stone-900 transition-colors p-1.5 rounded-full hover:bg-stone-100">
                                                            <Share2 size={16} />
                                                        </button>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>

                            {/* --- RIGHT COLUMN: SIDEBAR WIDGETS (4 cols) --- */}
                            <div className="hidden lg:block lg:col-span-4 space-y-6">

                                {/* Widget 1: Trending Courses */}
                                <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm sticky top-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-serif font-bold text-stone-800 flex items-center gap-2">
                                            <BookOpen size={18} className="text-blue-500" />
                                            Gündemdeki Dersler
                                        </h3>
                                        <Link to="/forum/akademik" className="text-[10px] font-bold text-stone-400 hover:text-stone-900 uppercase tracking-wider">Tümü</Link>
                                    </div>
                                    <div className="space-y-3">
                                        {MOCK_COURSES.map((course, i) => (
                                            <Link
                                                key={i}
                                                to={`/forum/ders/${course.code}`}
                                                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-blue-50 hover:scale-[1.02] transition-all group"
                                            >
                                                <div>
                                                    <div className="text-xs font-bold text-stone-900 group-hover:text-blue-700">{course.code}</div>
                                                    <div className="text-[10px] text-stone-500 truncate max-w-[120px]">{course.name}</div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm">
                                                    <span className="text-[10px] font-bold text-stone-700">{course.rating}</span>
                                                    <span className="text-amber-500 text-[10px]">★</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Widget 2: Top Instructors */}
                                <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-serif font-bold text-stone-800 flex items-center gap-2">
                                            <GraduationCap size={18} className="text-purple-500" />
                                            Popüler Hocalar
                                        </h3>
                                        <Link to="/forum/akademik?tab=instructors" className="text-[10px] font-bold text-stone-400 hover:text-stone-900 uppercase tracking-wider">Tümü</Link>
                                    </div>
                                    <div className="space-y-3">
                                        {MOCK_INSTRUCTORS.map((inst, i) => (
                                            <Link
                                                key={i}
                                                to={`/forum/hoca/${inst.id}`}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                                                    {inst.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-bold text-stone-900 group-hover:text-purple-700 truncate">{inst.name}</div>
                                                    <div className="text-[10px] text-stone-500">{inst.dept} • {inst.rating} ★</div>
                                                </div>
                                                <ArrowRight size={14} className="text-stone-300 group-hover:text-stone-600" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Widget 3: Quick Stats or Tags */}
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-lg">
                                    <h3 className="font-serif font-bold text-lg mb-2">Tartışmaya Katıl</h3>
                                    <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                                        Fikirlerin bizim için değerli. Kampüs gündemine yön ver.
                                    </p>
                                    <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="w-full py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold transition-all border border-white/10"
                                    >
                                        Bir şeyler yaz...
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CREATE MODAL */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                                <h3 className="font-serif font-bold text-lg text-stone-800">Yeni Tartışma Başlat</h3>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-full hover:bg-stone-200 transition-colors">
                                    <X size={20} className="text-stone-500" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Başlık</label>
                                    <input
                                        type="text"
                                        className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm font-medium outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400"
                                        placeholder="Konu başlığı..."
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Kategori</label>
                                    <div className="flex gap-2 bg-stone-50 p-1.5 rounded-lg border border-stone-200">
                                        {CATEGORIES.slice(0, 3).map(cat => (
                                            <button key={cat.id} className="flex-1 py-1.5 text-xs font-bold rounded-md hover:bg-white hover:shadow-sm transition-all text-stone-600">
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">İçerik</label>
                                    <textarea
                                        className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm font-medium outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all placeholder:text-stone-400 min-h-[120px] resize-none"
                                        placeholder="Düşüncelerini paylaş..."
                                    />
                                </div>
                                <button
                                    className="w-full mt-2 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-stone-900/20"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Paylaş
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Community;
