import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Plus } from 'lucide-react';
import ForumSidebar from '../../components/Forum/Sidebar';
import { ForumThread } from './types';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// MOCK DATA GENERATOR
const generateMockThreads = (category: string): ForumThread[] => {
    return Array.from({ length: 10 }).map((_, i) => ({
        id: `thread-${i}-${category}`,
        title: category === 'soru-cevap' ? `Kampüs kartıma nasıl para yüklerim? #${i}` : `Kampüs gündemi hakkında düşünceler #${i}`,
        content: `Bu bir deneme tartışma içeriğidir. ${category} kategorisinde oluşturulmuştur. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        authorId: `user-${i}`,
        authorName: `Öğrenci ${i + 1}`,
        authorPhotoUrl: `https://ui-avatars.com/api/?name=Ogrenci+${i + 1}&background=random`,
        category: category as any,
        tags: ['kampüs', 'yemekhane'],
        createdAt: new Date(Date.now() - i * 10000000).toISOString(),
        likes: Math.floor(Math.random() * 100),
        replyCount: Math.floor(Math.random() * 20),
        isPinned: i === 0,
    }));
};

const Community: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentCategory = searchParams.get('kategori') || 'genel';
    const [threads, setThreads] = useState<ForumThread[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter States
    const [filter, setFilter] = useState<'hot' | 'new' | 'top'>('hot');

    useEffect(() => {
        setIsLoading(true);
        // Simulate API Call
        setTimeout(() => {
            setThreads(generateMockThreads(currentCategory));
            setIsLoading(false);
        }, 800);
    }, [currentCategory, filter]);

    const handleCategoryChange = (cat: string) => {
        setSearchParams({ kategori: cat });
    };

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LEFT SIDEBAR (Desktop Navigation) */}
                    <div className="hidden lg:block w-64 shrink-0">
                        {/* We need to adjust Sidebar to accept props or handle its own state logic if needed, 
                             but for now let's use the one we created which uses Links */}
                        <ForumSidebar />
                    </div>

                    {/* MAIN CONTENT (Feed) */}
                    <div className="flex-1 min-w-0">

                        {/* Mobile Category Selector (Horizontal Scroll) */}
                        <div className="lg:hidden mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                            <div className="flex gap-2">
                                {[
                                    { id: 'genel', name: 'Genel' },
                                    { id: 'soru-cevap', name: 'Soru & Cevap' },
                                    { id: 'kampus-gundemi', name: 'Gündem' },
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategoryChange(cat.id)}
                                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${currentCategory === cat.id
                                            ? 'bg-boun-blue text-white shadow-md'
                                            : 'bg-white text-stone-600 border border-stone-200'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Header & Filters */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h1 className="text-2xl font-bold text-stone-900 capitalize flex items-center gap-2">
                                {currentCategory.replace('-', ' ')}
                                <span className="text-sm font-normal text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                                    {threads.length} tartışma
                                </span>
                            </h1>

                            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-stone-200 shadow-sm self-start">
                                <button
                                    onClick={() => setFilter('hot')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'hot' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                                >
                                    🔥 Popüler
                                </button>
                                <button
                                    onClick={() => setFilter('new')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'new' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                                >
                                    ✨ Yeni
                                </button>
                                <button
                                    onClick={() => setFilter('top')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'top' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                                >
                                    📈 En Çok
                                </button>
                            </div>
                        </div>

                        {/* CREATE POST INPUT (Collapsed) */}
                        <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 shadow-sm flex gap-4 items-center cursor-text hover:border-boun-blue/50 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-stone-100 shrink-0 overflow-hidden">
                                <img src="https://ui-avatars.com/api/?name=Sen&background=random" className="w-full h-full" alt="" />
                            </div>
                            <input
                                type="text"
                                placeholder="Bir tartışma başlat..."
                                className="flex-1 bg-stone-50 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-boun-blue/20 transition-all outline-none group-hover:bg-white"
                            />
                            <button className="hidden sm:flex bg-boun-blue text-white p-2.5 rounded-full hover:bg-boun-blue-dark transition-colors shadow-lg shadow-boun-blue/30">
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* THREAD LIST */}
                        <div className="space-y-4">
                            {isLoading ? (
                                // SKELETON LOADING
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse">
                                        <div className="flex gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-stone-100" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-stone-100 rounded w-1/3" />
                                                <div className="h-3 bg-stone-100 rounded w-1/4" />
                                            </div>
                                        </div>
                                        <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-stone-100 rounded w-1/2" />
                                    </div>
                                ))
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {threads.map((thread) => (
                                        <motion.div
                                            key={thread.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            layout
                                            className="bg-white rounded-xl border border-stone-200 p-0 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group"
                                        >
                                            {/* Card Meta Header */}
                                            <div className="px-6 pt-5 pb-3 flex items-start justify-between">
                                                <div className="flex gap-3 items-center">
                                                    <img src={thread.authorPhotoUrl} alt={thread.authorName} className="w-8 h-8 rounded-full bg-stone-100 object-cover border border-stone-100" />
                                                    <div>
                                                        <div className="text-sm font-bold text-stone-900 hover:underline cursor-pointer decoration-stone-300 underline-offset-2">
                                                            {thread.authorName}
                                                        </div>
                                                        <div className="text-xs text-stone-500 flex items-center gap-1">
                                                            <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true, locale: tr })}</span>
                                                            <span>•</span>
                                                            <span className="capitalize">{thread.category}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {thread.isPinned && (
                                                    <div className="text-xs font-bold text-boun-blue bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                                                        <MoreHorizontal size={14} /> Sabit
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card Content (Clickable) */}
                                            <Link to={`/forum/topluluk/${thread.id}`} className="block px-6 pb-4">
                                                <h2 className="text-lg font-bold text-stone-900 mb-2 leading-snug group-hover:text-boun-blue transition-colors">
                                                    {thread.title}
                                                </h2>
                                                <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed">
                                                    {thread.content}
                                                </p>
                                            </Link>

                                            {/* Card Footer Actions */}
                                            <div className="px-6 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-stone-500">
                                                <div className="flex items-center gap-4">
                                                    <button className="flex items-center gap-1.5 text-xs font-medium hover:text-boun-blue transition-colors hover:bg-white px-2 py-1 rounded-md">
                                                        <ThumbsUp size={16} />
                                                        <span>{thread.likes}</span>
                                                    </button>
                                                    <button className="flex items-center gap-1.5 text-xs font-medium hover:text-boun-blue transition-colors hover:bg-white px-2 py-1 rounded-md">
                                                        <MessageCircle size={16} />
                                                        <span>{thread.replyCount} Yorum</span>
                                                    </button>
                                                </div>
                                                <button className="flex items-center gap-1.5 text-xs font-medium hover:text-stone-900 transition-colors">
                                                    <Share2 size={16} />
                                                    <span className="hidden sm:inline">Paylaş</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                    </div>

                    {/* RIGHT SIDEBAR (Trending / Ads - Desktop Only) */}
                    <div className="hidden xl:block w-72 shrink-0">
                        <div className="sticky top-24 bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
                            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                                <span className="bg-yellow-100 p-1 rounded">🔥</span> Gündem
                            </h3>
                            <ul className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <li key={i} className="group cursor-pointer">
                                        <div className="text-xs font-semibold text-stone-400 mb-0.5">Akademik</div>
                                        <div className="text-sm font-medium text-stone-900 group-hover:text-boun-blue transition-colors">
                                            Yemekhane zamları geri çekilsin!
                                        </div>
                                        <div className="text-xs text-stone-500 mt-1">1.2b Post • 50k Like</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>

            {/* MOBILE FAB (Floating Action Button) */}
            <button className="lg:hidden fixed bottom-20 right-4 w-14 h-14 bg-boun-blue text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 border-4 border-white">
                <Plus size={28} />
            </button>
        </div>
    );
};

export default Community;
