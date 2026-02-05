import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Star, ThumbsUp, Loader2, X, AlertCircle, Quote, MessageSquare
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Review } from './types';
import { TextArea } from '../../pages/Admin/components/SharedUI';
import { cn } from '../../lib/utils';

// Mock data for initial loading
const MOCK_COURSES: Record<string, { name: string, department: string }> = {
    'CMPE150': { name: 'Introduction to Computing', department: 'CMPE' },
    'PHYS101': { name: 'Physics I', department: 'PHYS' },
    'CMPE451': { name: 'Project Development', department: 'CMPE' },
};

const MOCK_INSTRUCTORS: Record<string, { name: string }> = {
    '1': { name: 'Ali Hoca' },
    '2': { name: 'Ayşe Yılmaz' },
    '3': { name: 'Mehmet Öz' },
};

const CourseInstructorDetail: React.FC = () => {
    const { courseCode, instructorId } = useParams<{ courseCode: string, instructorId: string }>();
    const { userProfile } = useAuth();

    // State
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);

    // Meta Data (Derived from params/mock for now)
    const [headerInfo, setHeaderInfo] = useState<{ courseName: string, instructorName: string, department: string } | null>(null);
    const [stats, setStats] = useState({ rating: 0, count: 0 });

    // Form
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '', isAnonymous: false });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            // Simulate Fetch
            await new Promise(r => setTimeout(r, 800));

            // Resolve Names
            const c = MOCK_COURSES[courseCode || ''] || { name: 'Bilinmeyen Ders', department: 'GEN' };
            const i = MOCK_INSTRUCTORS[instructorId || ''] || { name: 'Bilinmeyen Hoca' };
            setHeaderInfo({
                courseName: c.name,
                instructorName: i.name,
                department: c.department
            });

            // Mock Reviews for this PAIRING
            const mockReviews: Review[] = [
                {
                    id: 'p1', type: 'course-instructor', targetId: 'pair1', courseCode: courseCode, instructorId: instructorId,
                    userId: 'u1', userDisplayName: 'Deneyimli Öğrenci', rating: 4,
                    comment: `${i.name}, ${courseCode} dersini gerçekten yaşayarak anlatıyor. Sınavları zor ama adil.`,
                    timestamp: { seconds: Date.now() / 1000 }, likes: 15, isAnonymous: true
                },
                {
                    id: 'p2', type: 'course-instructor', targetId: 'pair2', courseCode: courseCode, instructorId: instructorId,
                    userId: 'u2', userDisplayName: 'Ahmet k.', rating: 5,
                    comment: 'Kesinlikle dersi bu hocadan alın. Notu boldur.',
                    timestamp: { seconds: (Date.now() - 200000) / 1000 }, likes: 4
                }
            ];
            setReviews(mockReviews);
            setStats({ rating: 4.5, count: 2 });
            setLoading(false);
        };
        loadData();
    }, [courseCode, instructorId]);

    const handleSubmitReview = async () => {
        if (!userProfile) {
            alert("Yorum yapmak için giriş yapmalısınız.");
            return;
        }
        setSubmitting(true);
        try {
            const newReview: any = {
                type: 'course-instructor',
                courseCode: courseCode,
                instructorId: instructorId,
                instructorName: headerInfo?.instructorName, // Denormalize for ease
                targetId: `${courseCode}_${instructorId}`, // Unique ID for this pairing
                userId: userProfile.uid,
                userDisplayName: reviewData.isAnonymous ? 'Anonim Öğrenci' : (userProfile.username || 'Öğrenci'),
                userPhotoUrl: reviewData.isAnonymous ? null : userProfile.photoUrl,
                isAnonymous: reviewData.isAnonymous,
                rating: reviewData.rating,
                comment: reviewData.comment,
                likes: 0,
                timestamp: serverTimestamp()
            };

            await addDoc(collection(db, "reviews"), newReview);

            // Optimistic UI Update
            setReviews(prev => [{ ...newReview, id: 'temp-' + Date.now(), timestamp: { seconds: Date.now() / 1000 } }, ...prev]);
            setStats(prev => ({
                rating: ((prev.rating * prev.count) + reviewData.rating) / (prev.count + 1), // Simple mock calc
                count: prev.count + 1
            }));

            setIsReviewModalOpen(false);
            setReviewData({ rating: 5, comment: '', isAnonymous: false });

        } catch (e) {
            console.error(e);
            alert("Bir hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-dvh flex items-center justify-center bg-[#f5f5f4]">
            <Loader2 className="animate-spin text-stone-300" size={32} />
        </div>
    );

    if (!headerInfo) return <div className="p-10 text-center">Bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-[#f5f5f4] font-sans selection:bg-stone-200">

            {/* 1. HEADER */}
            <header className="sticky top-0 z-50 bg-[#f5f5f4]/90 backdrop-blur-md border-b border-stone-200/50 transition-all">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to={`/forum/ders/${courseCode}`} className="flex items-center gap-2 group">
                        <div className="p-2 -ml-2 rounded-full group-hover:bg-stone-200 transition-colors text-stone-500 group-hover:text-stone-900">
                            <ArrowLeft size={20} />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="font-bold text-xs text-stone-400">Ders Detayına Dön</span>
                            <span className="font-serif font-black text-lg text-stone-800">{courseCode}</span>
                        </div>
                    </Link>

                    <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-stone-900/10 flex items-center gap-2"
                    >
                        <Star size={14} className="fill-current" />
                        <span>Değerlendir</span>
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">

                {/* 2. HERO CARD - THE PAIRING */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-stone-200/50 mb-10 relative overflow-hidden"
                >
                    {/* Background Decor */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-60" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-amber-100 to-orange-100 rounded-full blur-3xl opacity-60" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-stone-100 text-stone-500 font-mono text-xs font-bold mb-4">
                                {headerInfo.department}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 leading-tight mb-2 tracking-tight">
                                {headerInfo.instructorName}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-3 opacity-60">
                                <span className="text-lg">tarafından verilen</span>
                                <Link to={`/forum/ders/${courseCode}`} className="font-bold border-b border-stone-800 hover:text-blue-600 hover:border-blue-600 transition-colors">
                                    {courseCode}: {headerInfo.courseName}
                                </Link>
                            </div>
                        </div>

                        <div className="flex-1 w-full md:w-auto flex flex-row md:flex-col items-center justify-center gap-4 md:ml-auto">
                            <div className="flex flex-col items-center bg-stone-50 border border-stone-100 p-4 rounded-2xl min-w-[120px]">
                                <span className="text-4xl font-black text-stone-900 tracking-tighter">{stats.rating.toFixed(1)}</span>
                                <div className="flex gap-1 my-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} className={cn(i < Math.round(stats.rating) ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200")} />
                                    ))}
                                </div>
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{stats.count} Değerlendirme</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 3. REVIEWS LIST */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-stone-200" />
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Öğrenci Deneyimleri</span>
                        <div className="h-px flex-1 bg-stone-200" />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence>
                            {reviews.map((review, idx) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group bg-white p-6 rounded-2xl border border-stone-100 shadow-[0_2px_10px_-6px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-stone-200 transition-all duration-300"
                                >
                                    <div className="flex gap-4">
                                        <div className="shrink-0">
                                            <Quote size={24} className="text-stone-200 fill-stone-50" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <p className="text-stone-800 leading-relaxed font-medium">
                                                "{review.comment}"
                                            </p>

                                            <div className="flex items-center justify-between pt-3 border-t border-stone-50">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                                                        review.isAnonymous ? "bg-stone-100 text-stone-400" : "bg-gradient-to-br from-blue-100 to-indigo-100 text-indigo-600"
                                                    )}>
                                                        {review.isAnonymous ? '?' : review.userDisplayName?.[0]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-stone-600">
                                                            {review.userDisplayName}
                                                        </span>
                                                        <span className="text-[10px] text-stone-400">
                                                            {review.timestamp?.seconds ? new Date(review.timestamp.seconds * 1000).toLocaleDateString("tr-TR") : 'Bugün'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                                                    <Star size={10} fill="currentColor" /> {review.rating}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {reviews.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
                                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                                    <MessageSquare size={24} />
                                </div>
                                <h3 className="font-serif font-bold text-lg text-stone-700">Henüz Yorum Yok</h3>
                                <p className="text-stone-400 text-sm mb-6 max-w-xs mx-auto">
                                    Bu dersi {headerInfo.instructorName} hocadan alan ilk kişi sen ol ve deneyimini paylaş.
                                </p>
                                <button
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="text-stone-900 font-bold border-b-2 border-stone-900 hover:text-blue-600 hover:border-blue-600 transition-colors pb-0.5"
                                >
                                    İlk yorumu yaz
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* REVIEW MODAL */}
            <AnimatePresence>
                {isReviewModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/50"
                        >
                            <div className="p-6 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-serif font-bold text-xl text-stone-900">Değerlendir</h3>
                                    <p className="text-xs font-medium text-stone-500 mt-0.5">
                                        {headerInfo.instructorName} — {courseCode}
                                    </p>
                                </div>
                                <button onClick={() => setIsReviewModalOpen(false)} className="p-2 bg-white rounded-full hover:bg-stone-200 transition-colors shadow-sm text-stone-500 hover:text-stone-900">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Rating Input */}
                                <div className="flex flex-col items-center justify-center py-4 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Puanın</span>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onMouseEnter={() => setReviewData(p => ({ ...p, rating: star }))}
                                                className="group p-1 transition-transform hover:scale-110 focus:outline-none"
                                            >
                                                <Star
                                                    size={40}
                                                    className={cn(
                                                        "transition-colors duration-200 drop-shadow-sm",
                                                        star <= reviewData.rating ? "fill-amber-400 text-amber-400" : "fill-stone-100 text-stone-200"
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <span className="mt-2 text-xs font-bold text-amber-500">
                                        {reviewData.rating === 5 ? "Mükemmel" : reviewData.rating === 1 ? "Çok Kötü" : `${reviewData.rating} Yıldız`}
                                    </span>
                                </div>

                                <TextArea
                                    label="Deneyimin"
                                    placeholder="Dersin işlenişi, hocanın yaklaşımı ve sınavlar hakkında ne düşünüyorsun?"
                                    className="min-h-[140px] text-sm resize-none"
                                    value={reviewData.comment}
                                    onChange={(v: string) => setReviewData({ ...reviewData, comment: v })}
                                />

                                <div
                                    onClick={() => setReviewData(p => ({ ...p, isAnonymous: !p.isAnonymous }))}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors select-none"
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                        reviewData.isAnonymous ? "bg-stone-900 border-stone-900" : "bg-white border-stone-300"
                                    )}>
                                        {reviewData.isAnonymous && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold text-stone-700">Anonim Paylaş</span>
                                        <span className="block text-[10px] text-stone-400">Profilin gizli kalacak</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submitting || !reviewData.comment.trim()}
                                    className="w-full bg-stone-900 text-white py-4 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-stone-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <ThumbsUp size={18} />}
                                    {submitting ? 'Gönderiliyor...' : 'Yorumu Paylaş'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default CourseInstructorDetail;
