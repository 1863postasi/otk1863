import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, ThumbsUp, Share2, MoreHorizontal, Send, CornerDownRight } from 'lucide-react';
import { ForumThread, ForumComment } from './types'; // Ensure types are exported from types.ts
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// MOCK DATA
const mockThread: ForumThread = {
    id: 'thread-1',
    title: 'Kampüs kartıma nasıl para yüklerim?',
    content: 'Merhaba arkadaşlar, yeni kayıt oldum. Yemekhane için karta para yüklemem gerekiyor ama kiosk bozuk. Online yükleme var mı? Varsa link atabilir misiniz?',
    authorId: 'user-1',
    authorName: 'Ahmet Yılmaz', // Mock Data - In real app, this comes from user profile displayName
    authorPhotoUrl: 'https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=random',
    category: 'soru-cevap',
    tags: ['kampüs-kart', 'yemekhane'],
    createdAt: new Date().toISOString(),
    likes: 42,
    replyCount: 5,
};

const mockComments: ForumComment[] = [
    {
        id: 'c1',
        threadId: 'thread-1',
        content: 'Evet, sol taraftaki menüden "BounCard" başlığına tıklarsan online yükleme sayfasına gidersin.',
        authorId: 'user-2',
        authorName: 'Ayşe Demir', // Mock Data
        authorPhotoUrl: 'https://ui-avatars.com/api/?name=Ayse+Demir&background=random',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        likes: 12
    },
    {
        id: 'c2',
        threadId: 'thread-1',
        content: 'Teşekkürler, buldum! Peki komisyon alıyor mu?',
        authorId: 'user-1',
        authorName: 'Ahmet Yılmaz', // Mock Data
        authorPhotoUrl: 'https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=random',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        likes: 2
    },
    {
        id: 'c3',
        threadId: 'thread-1',
        content: 'Hayır, komisyon yok. Kredi kartı ile direkt yükleyebilirsin.',
        authorId: 'user-3',
        authorName: 'Mehmet Öztürk', // Mock Data
        authorPhotoUrl: 'https://ui-avatars.com/api/?name=Mehmet+Ozturk&background=random',
        createdAt: new Date(Date.now() - 900000).toISOString(),
        likes: 5
    }
];

const ThreadDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [thread, setThread] = useState<ForumThread | null>(null);
    const [comments, setComments] = useState<ForumComment[]>([]);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        // Mock API Fetch
        setThread(mockThread);
        setComments(mockComments);
    }, [id]);

    if (!thread) return <div className="min-h-screen bg-stone-50 pt-24 text-center">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* MAIN CONTENT */}
                    <div className="flex-1 min-w-0">

                        {/* BACK BUTTON */}
                        <Link to="/forum/topluluk" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-6 transition-colors font-medium">
                            <ArrowLeft size={20} />
                            Tüm Tartışmalara Dön
                        </Link>

                        {/* THREAD MAIN POST */}
                        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-8">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <img src={thread.authorPhotoUrl} alt={thread.authorName} className="w-10 h-10 rounded-full bg-stone-100" />
                                        <div>
                                            <div className="font-bold text-stone-900">{thread.authorName}</div>
                                            <div className="text-xs text-stone-500 flex items-center gap-1">
                                                <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true, locale: tr })}</span>
                                                <span>•</span>
                                                <span className="capitalize">{thread.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="text-stone-400 hover:text-stone-600">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                <h1 className="text-2xl font-serif font-bold text-stone-900 mb-4">{thread.title}</h1>

                                <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed mb-6">
                                    <p>{thread.content}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {thread.tags.map(tag => (
                                        <span key={tag} className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-medium">#{tag}</span>
                                    ))}
                                </div>

                                <div className="flex items-center gap-4 pt-4 border-t border-stone-100">
                                    <button className="flex items-center gap-2 text-stone-500 hover:text-boun-blue transition-colors bg-stone-50 hover:bg-white px-4 py-2 rounded-lg font-medium text-sm">
                                        <ThumbsUp size={18} />
                                        <span>{thread.likes} Beğeni</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors px-4 py-2 rounded-lg font-medium text-sm">
                                        <Share2 size={18} />
                                        <span>Paylaş</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* COMMENTS SECTION */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                                <MessageSquare size={20} />
                                {comments.length} Yorum
                            </h3>

                            {/* Comment Input */}
                            <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 shadow-sm flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-stone-100 shrink-0 overflow-hidden">
                                    <img src="https://ui-avatars.com/api/?name=Sen&background=random" className="w-full h-full" alt="" />
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        className="w-full bg-stone-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-boun-blue/20 transition-all outline-none resize-y min-h-[80px]"
                                        placeholder="Bu tartışmaya katkıda bulun..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button className="bg-boun-blue text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-boun-blue-dark transition-colors flex items-center gap-2">
                                            <Send size={16} /> Gönder
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Comment List */}
                            <div className="space-y-4">
                                {comments.map((comment, index) => (
                                    <div key={comment.id} className="group">
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <img src={comment.authorPhotoUrl} alt={comment.authorName} className="w-8 h-8 rounded-full bg-stone-100" />
                                                {/* Vertical line for threading visual */}
                                                {index !== comments.length - 1 && (
                                                    <div className="w-0.5 h-full bg-stone-200 rounded-full my-1 group-hover:bg-stone-300 transition-colors" />
                                                )}
                                            </div>

                                            <div className="flex-1 bg-white rounded-xl border border-stone-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-sm text-stone-900">{comment.authorName}</span>
                                                    <span className="text-xs text-stone-400">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: tr })}</span>
                                                </div>
                                                <p className="text-stone-700 text-sm leading-relaxed mb-3">
                                                    {comment.content}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs font-medium text-stone-500">
                                                    <button className="flex items-center gap-1 hover:text-boun-blue">
                                                        <ThumbsUp size={14} /> {comment.likes}
                                                    </button>
                                                    <button className="flex items-center gap-1 hover:text-stone-900">
                                                        <CornerDownRight size={14} /> Yanıtla
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT SPACE (Empty or Ads or Related) */}
                    <div className="hidden xl:block w-72 shrink-0">
                        {/* Optional Related Threads */}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ThreadDetail;
