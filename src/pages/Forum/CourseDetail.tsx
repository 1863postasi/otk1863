import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Star, User, MessageSquare, Plus, ThumbsUp, ShieldCheck, Loader2, X, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Course, Review, Instructor } from './types';
import { TextArea } from '../../pages/Admin/components/SharedUI';
import { cn } from '../../lib/utils';

const CourseDetail: React.FC = () => {
    const { courseCode } = useParams<{ courseCode: string }>();
    const { userProfile } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '', isAnonymous: false });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            await new Promise(r => setTimeout(r, 600));

            setCourse({
                id: '1',
                code: courseCode || 'CMPE101',
                name: 'Introduction to Computing',
                department: courseCode?.replace(/[0-9]/g, '') || 'CMPE',
                rating: 3.8,
                reviewCount: 42,
                instructors: ['1', '2']
            });

            setInstructors([
                { id: '1', name: 'Ali Hoca', department: 'CMPE', rating: 4.5, reviewCount: 10, courses: [] },
                { id: '2', name: 'Veli Hoca', department: 'CMPE', rating: 3.0, reviewCount: 5, courses: [] },
            ]);

            setReviews([
                {
                    id: 'r1', type: 'course', targetId: '1', userId: 'u1',
                    userDisplayName: 'Anonim Öğrenci', isAnonymous: true,
                    rating: 4, comment: 'Dersin içeriği çok yoğun ama öğretici. Kesinlikle Ali Hoca\'dan alın.',
                    timestamp: { seconds: Date.now() / 1000 },
                    likes: 12
                },
                {
                    id: 'r2', type: 'course', targetId: '1', userId: 'u2',
                    userDisplayName: 'mehmet_yilmaz', userBadge: 'Senior',
                    rating: 3, comment: 'Lablar çok zorluyor, vaktiniz yoksa bulaşmayın.',
                    timestamp: { seconds: (Date.now() - 86400000) / 1000 },
                    likes: 5
                }
            ]);

            setLoading(false);
        };
        fetchData();
    }, [courseCode]);

    const handleSubmitReview = async () => {
        if (!userProfile) {
            alert("Yorum yapmak için giriş yapmalısınız.");
            return;
        }
        setSubmitting(true);
        try {
            const newReview: any = {
                type: 'course', targetId: course?.id, userId: userProfile.uid,
                userDisplayName: reviewData.isAnonymous ? 'Anonim Öğrenci' : (userProfile.username || 'Öğrenci'),
                userPhotoUrl: reviewData.isAnonymous ? null : userProfile.photoUrl,
                isAnonymous: reviewData.isAnonymous, rating: reviewData.rating, comment: reviewData.comment,
                likes: 0, timestamp: serverTimestamp()
            };
            await addDoc(collection(db, "reviews"), newReview);
            setReviews([{ ...newReview, id: 'temp-' + Date.now(), timestamp: { seconds: Date.now() / 1000 } }, ...reviews]);
            setIsReviewModalOpen(false);
            setReviewData({ rating: 5, comment: '', isAnonymous: false });
        } catch (e) { console.error(e); alert("Hata"); } finally { setSubmitting(false); }
    };

    if (loading) return (
        <div className="h-dvh flex items-center justify-center bg-[#f5f5f4]">
            <Loader2 className="animate-spin text-stone-400" size={32} />
        </div>
    );
    if (!course) return null;

    return (
        <div className="min-h-screen bg-[#f5f5f4] font-sans selection:bg-blue-100 flex flex-col">

            {/* 1. COMPACT HEADER */}
            <div className="bg-[#f5f5f4]/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
                    <Link to="/forum/akademik" className="group flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors">
                        <div className="p-2 rounded-full group-hover:bg-stone-200/50 transition-colors">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="font-bold text-sm hidden md:inline">Akademik Arama</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-stone-100 shadow-sm">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-stone-900">{course.rating}</span>
                        </div>
                        <button
                            onClick={() => setIsReviewModalOpen(true)}
                            className="bg-stone-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-colors"
                        >
                            Değerlendir
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full max-w-4xl mx-auto px-4 lg:px-6 py-8">

                {/* 2. COURSE HERO */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-200/60 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 tracking-tight">{course.code}</h1>
                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-blue-100 self-center">
                                        {course.department}
                                    </span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-medium text-stone-600 mb-6">{course.name}</h2>

                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100/50 rounded-lg border border-stone-100">
                                    <div className="flex -space-x-2">
                                        {/* Mock avatars */}
                                        <div className="w-6 h-6 rounded-full bg-stone-200 border-2 border-white" />
                                        <div className="w-6 h-6 rounded-full bg-stone-300 border-2 border-white" />
                                        <div className="w-6 h-6 rounded-full bg-stone-400 border-2 border-white" />
                                    </div>
                                    <span className="text-xs font-bold text-stone-500 pl-1">{course.reviewCount} öğrenci değerlendirdi</span>
                                </div>
                            </div>

                            {/* Difficulty Gauge (Visual only) */}
                            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 w-full md:w-auto min-w-[180px]">
                                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Zorluk Seviyesi</div>
                                <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden mb-1">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '85%' }}
                                        className="h-full bg-red-400 rounded-full"
                                    />
                                </div>
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-red-500">Yüksek</span>
                                    <span className="text-stone-300">8.5/10</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* LEFT COL: INSTRUCTORS & INFO */}
                    <div className="space-y-6">
                        {/* Instructors */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest pl-1">Veren Hocalar</h3>
                            {instructors.map(inst => (
                                <Link
                                    key={inst.id}
                                    to={`/forum/degerlendirme/${course.code}/${inst.id}`}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200 hover:border-blue-300 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                                            {inst.name.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-stone-700 group-hover:text-stone-900">{inst.name}</div>
                                            <div className="text-[10px] text-stone-400">Detaylı İncele →</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded">
                                        <Star size={10} fill="currentColor" /> {inst.rating}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Advice Box */}
                        <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5">
                            <h4 className="font-bold text-blue-900 text-sm flex items-center gap-2 mb-2">
                                <ShieldCheck size={16} /> ÖTK İpucu
                            </h4>
                            <p className="text-xs text-blue-800/80 leading-relaxed">
                                Bu ders genellikle 3. sınıfta alınır. Projeler dönem sonu notunun %40'ını oluşturur. Grup arkadaşlarınızı iyi seçin!
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COL: REVIEWS */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-stone-300">
                            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                                <MessageSquare size={24} />
                            </div>
                            <h3 className="font-serif font-bold text-xl text-stone-700 mb-2">Değerlendirmeleri Görüntüle</h3>
                            <p className="text-stone-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                                Bu dersin yorumlarını ve not dağılımlarını görmek için lütfen soldaki listeden <strong>dersi aldığınız hocayı</strong> seçin.
                            </p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-50 rounded-full text-xs font-bold text-stone-400">
                                <AlertCircle size={14} />
                                <span>Doğru hoca seçimi, doğru bilgi demektir.</span>
                            </div>
                        </div>

                        {/* Legacy Reviews (Optional - Hidden for now or "Genel Yorumlar" if needed) */}
                    </div>

                </div>

            </div>

            {/* REVIEW MODAL (Same component structure as Instructor) */}
            <AnimatePresence>
                {isReviewModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                                <h3 className="font-serif font-bold text-lg text-stone-800">
                                    Değerlendir: {course.code}
                                </h3>
                                <button onClick={() => setIsReviewModalOpen(false)} className="p-1 rounded-full hover:bg-stone-200 transition-colors">
                                    <X size={20} className="text-stone-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Puanın</label>
                                    <div className="flex justify-center gap-3">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onMouseEnter={() => setReviewData(p => ({ ...p, rating: star }))}
                                                className="group p-2 transition-transform hover:scale-110 focus:outline-none"
                                            >
                                                <Star
                                                    size={36}
                                                    className={cn(
                                                        "transition-colors duration-200",
                                                        star <= reviewData.rating ? "fill-amber-400 text-amber-400" : "fill-stone-100 text-stone-200"
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <TextArea
                                    label="Deneyimin"
                                    placeholder="Dersin işlenişi, sınavları ve genel tavsiyelerin..."
                                    className="h-32 text-sm"
                                    value={reviewData.comment}
                                    onChange={(v: string) => setReviewData({ ...reviewData, comment: v })}
                                />

                                <div
                                    className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors select-none"
                                    onClick={() => setReviewData(p => ({ ...p, isAnonymous: !p.isAnonymous }))}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                        reviewData.isAnonymous ? "bg-stone-900 border-stone-900" : "bg-white border-stone-300"
                                    )}>
                                        {reviewData.isAnonymous && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <span className="text-sm font-medium text-stone-600">Bu yorumu <strong>anonim</strong> olarak paylaş</span>
                                </div>

                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submitting}
                                    className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-stone-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 size={16} className="animate-spin" />}
                                    {submitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default CourseDetail;
