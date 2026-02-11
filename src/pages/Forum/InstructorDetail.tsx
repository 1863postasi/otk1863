import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Star, User, MessageSquare, Plus, ThumbsUp, Loader2, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Instructor, Review, Course } from './types';
import { TextArea, Input } from '../../pages/Admin/components/SharedUI';
import { cn } from '../../lib/utils';

const InstructorDetail: React.FC = () => {
    const { instructorId } = useParams<{ instructorId: string }>();
    const { userProfile } = useAuth();

    const [instructor, setInstructor] = useState<Instructor | null>(null);
    const [courses, setCourses] = useState<{ code: string, name: string, id: string }[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Review Form
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '', isAnonymous: false });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!instructorId) return;
            setLoading(true);
            try {
                // Fetch Instructor
                const instDoc = await getDoc(doc(db, 'instructors', instructorId));
                if (!instDoc.exists()) {
                    setInstructor(null);
                    setLoading(false);
                    return;
                }
                const instructorData = { id: instDoc.id, ...instDoc.data() } as Instructor;
                setInstructor(instructorData);

                // Fetch Courses
                if (instructorData.courseCodes && instructorData.courseCodes.length > 0) {
                    const coursesQ = query(collection(db, 'courses'), where('code', 'in', instructorData.courseCodes));
                    const coursesSnap = await getDocs(coursesQ);
                    const coursesData = coursesSnap.docs.map(d => ({ id: d.id, code: (d.data() as Course).code, name: (d.data() as Course).name }));
                    setCourses(coursesData);
                } else {
                    setCourses([]);
                }

                // Fetch Reviews (General Instructor Reviews)
                const reviewsQ = query(collection(db, 'reviews'), where('type', '==', 'instructor'), where('targetId', '==', instructorId));
                const reviewsSnap = await getDocs(reviewsQ);
                const reviewsData = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
                setReviews(reviewsData);

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [instructorId]);

    const handleSubmitReview = async () => {
        if (!userProfile) {
            alert("Yorum yapmak için giriş yapmalısınız.");
            return;
        }
        if (!instructor) return;

        setSubmitting(true);
        try {
            const newReview: any = {
                type: 'instructor',
                targetId: instructor.id,
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

            // Update Instructor Stats
            const newCount = (instructor.reviewCount || 0) + 1;
            const newRating = ((instructor.rating || 0) * (instructor.reviewCount || 0) + reviewData.rating) / newCount;

            // REMOVED: updateDoc call. Handled by Cloud Function.
            /*
            await updateDoc(doc(db, 'instructors', instructor.id), {
                reviewCount: newCount,
                rating: newRating
            });
            */

            // Optimistic update
            setReviews([{ ...newReview, id: 'temp-' + Date.now(), timestamp: { seconds: Date.now() / 1000 } }, ...reviews]);
            setInstructor({ ...instructor, reviewCount: newCount, rating: newRating });
            setIsReviewModalOpen(false);
            setReviewData({ rating: 5, comment: '', isAnonymous: false });
        } catch (e) {
            console.error(e);
            alert("Hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-dvh flex items-center justify-center bg-[#f5f5f4]">
            <Loader2 className="animate-spin text-stone-400" size={32} />
        </div>
    );

    if (!instructor) return (
        <div className="h-dvh flex items-center justify-center bg-[#f5f5f4] flex-col gap-4">
            <h2 className="text-2xl font-serif font-bold text-stone-700">Hoca Bulunamadı</h2>
            <Link to="/forum/akademik" className="text-blue-600 hover:underline">← Akademik Arama'ya dön</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f5f5f4] font-sans selection:bg-purple-100 flex flex-col">

            {/* 1. COMPACT HEADER */}
            <div className="bg-[#f5f5f4]/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
                    <Link to="/forum/akademik" className="group flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors">
                        <div className="p-2 rounded-full group-hover:bg-stone-200/50 transition-colors">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="font-bold text-sm hidden md:inline">Akademik Arama</span>
                    </Link>

                    {/* Quick Stats in Header (Optional but nice) */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-stone-100 shadow-sm">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-stone-900">{instructor.rating?.toFixed(1) || '—'}</span>
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

                {/* 2. INSTRUCTOR PROFILE CARD */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-200/60 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                        {/* Avatar */}
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-stone-100 flex items-center justify-center text-3xl md:text-4xl font-serif font-bold text-stone-400 border-4 border-white shadow-lg shrink-0">
                            {instructor.name.split(' ').map(n => n[0]).join('')}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-2">{instructor.name}</h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                                <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-purple-100">
                                    {instructor.department}
                                </span>
                                <span className="text-xs font-medium text-stone-500">
                                    • {instructor.reviewCount || 0} değerlendirme
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* LEFT COL: COURSES */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest pl-1">Verdiği Dersler</h3>
                        <div className="space-y-3">
                            {courses.length === 0 ? (
                                <div className="p-4 border border-dashed border-stone-300 rounded-xl text-center text-xs text-stone-400">
                                    Kayıtlı ders bulunamadı.
                                </div>
                            ) : (
                                courses.map(course => (
                                    <Link
                                        key={course.id}
                                        to={`/forum/degerlendirme/${course.code}/${instructor.id}`}
                                        className="block group bg-white p-4 rounded-xl border border-stone-200 hover:border-purple-300 hover:shadow-md transition-all text-left relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                                        <div className="flex items-center justify-between mb-1 pl-2 group-hover:pl-3 transition-all">
                                            <span className="font-mono font-bold text-stone-900 group-hover:text-purple-700 transition-colors">{course.code}</span>
                                            <ArrowLeft size={16} className="rotate-180 text-stone-300 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                                        </div>
                                        <div className="text-xs text-stone-500 line-clamp-1 pl-2 group-hover:pl-3 transition-all">{course.name}</div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT COL: REVIEWS */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-serif font-bold text-xl text-stone-800">Hoca Değerlendirmeleri</h3>
                            <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-md">{reviews.length} Görüş</span>
                        </div>

                        {reviews.length === 0 ? (
                            <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-stone-300">
                                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                                    <MessageSquare size={24} />
                                </div>
                                <h3 className="font-serif font-bold text-xl text-stone-700 mb-2">Henüz Yorum Yok</h3>
                                <p className="text-stone-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                                    Bu hoca için henüz genel bir değerlendirme yapılmamış. İlk yorumu sen yaparak arkadaşlarına yardımcı ol!
                                </p>
                                <button
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors"
                                >
                                    İlk Değerlendirmeyi Yap
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={review.id}
                                        className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-sm">
                                                    {review.isAnonymous ? <User size={18} /> : (review.userPhotoUrl ? <img src={review.userPhotoUrl} className="w-full h-full rounded-full object-cover" /> : review.userDisplayName?.charAt(0))}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-stone-800">
                                                        {review.isAnonymous ? "Anonim Öğrenci" : review.userDisplayName}
                                                    </div>
                                                    <div className="text-[10px] text-stone-400">
                                                        {review.timestamp?.seconds ? new Date(review.timestamp.seconds * 1000).toLocaleDateString("tr-TR") : "Az önce"}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100">
                                                    <Star size={12} fill="currentColor" />
                                                    <span className="text-xs font-black">{review.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>

            {/* REVIEW MODAL */}
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
                                    Değerlendir: {instructor.name}
                                </h3>
                                <button onClick={() => setIsReviewModalOpen(false)} className="p-1 rounded-full hover:bg-stone-200 transition-colors">
                                    <X size={20} className="text-stone-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* INFO ALERT */}
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                    <p className="text-xs text-purple-800 leading-relaxed">
                                        <strong>Not:</strong> Bu yorum <strong>dersten bağımsız</strong> olarak hocanın genel tutumunu değerlendirir (danışmanlık, iletişim vb.). Spesifik bir ders deneyimi için "Verdiği Dersler" listesinden seçim yapın.
                                    </p>
                                </div>

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
                                    placeholder="Ders anlatımı, notlandırması ve öğrencilere yaklaşımı nasıldı? Dürüst ve yapıcı ol."
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

export default InstructorDetail;
