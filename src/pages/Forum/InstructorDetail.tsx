import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Star, User, MessageSquare, Plus, ThumbsUp, Loader2, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Instructor, Review } from './types';
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
            await new Promise(r => setTimeout(r, 600));

            // Mock Data
            setInstructor({
                id: instructorId || '1',
                name: 'Ali Hoca',
                department: 'CMPE',
                rating: 4.8,
                reviewCount: 45,
                courses: ['1', '2']
            });

            setCourses([
                { id: '1', code: 'CMPE150', name: 'Intro to Computing' },
                { id: '2', code: 'CMPE451', name: 'Project Development' },
            ]);

            setReviews([
                {
                    id: 'r1', type: 'instructor', targetId: '1', userId: 'u1',
                    userDisplayName: 'Anonim', isAnonymous: true,
                    rating: 5, comment: 'Hayatımda gördüğüm en ilgili hoca. Mutlaka dersini alın.',
                    timestamp: { seconds: Date.now() / 1000 },
                    likes: 34
                },
                {
                    id: 'r2', type: 'instructor', targetId: '1', userId: 'u3',
                    userDisplayName: 'Ayşe K.', userBadge: 'Junior',
                    rating: 4, comment: 'Notu biraz kıttır ama çok iyi öğretir.',
                    timestamp: { seconds: (Date.now() - 100000) / 1000 },
                    likes: 8
                }
            ]);

            setLoading(false);
        };
        fetchData();
    }, [instructorId]);

    const handleSubmitReview = async () => {
        if (!userProfile) {
            alert("Yorum yapmak için giriş yapmalısınız.");
            return;
        }
        setSubmitting(true);
        try {
            const newReview: any = {
                type: 'instructor',
                targetId: instructor?.id,
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
            // Optimistic update
            setReviews([{ ...newReview, id: 'temp-' + Date.now(), timestamp: { seconds: Date.now() / 1000 } }, ...reviews]);
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

    if (!instructor) return null; // Or 404 page

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
                            <span className="text-sm font-bold text-stone-900">{instructor.rating}</span>
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
                                    • {instructor.reviewCount} değerlendirme
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
                            {courses.map(course => (
                                <Link
                                    key={course.id}
                                    to={`/forum/ders/${course.code}`}
                                    className="block group bg-white p-4 rounded-xl border border-stone-200 hover:border-purple-200 hover:shadow-sm transition-all text-left"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-mono font-bold text-stone-900 group-hover:text-purple-700 transition-colors">{course.code}</span>
                                        <ArrowLeft size={14} className="rotate-180 text-stone-300 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                    <div className="text-xs text-stone-500 line-clamp-1">{course.name}</div>
                                </Link>
                            ))}
                            {courses.length === 0 && (
                                <div className="p-4 border border-dashed border-stone-300 rounded-xl text-center text-xs text-stone-400">
                                    Kayıtlı ders bulunamadı.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COL: REVIEWS */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center justify-between pl-1">
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Öğrenci Yorumları</h3>
                            {/* Filter/Sort could go here */}
                        </div>

                        <div className="space-y-4">
                            {reviews.map(review => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={review.id}
                                    className="bg-white p-5 md:p-6 rounded-xl border border-stone-200 shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs select-none",
                                                review.isAnonymous ? "bg-stone-100 text-stone-400" : "bg-purple-50 text-purple-600"
                                            )}>
                                                {review.isAnonymous ? '?' : (review.userDisplayName?.[0] || 'U')}
                                            </div>
                                            <div>
                                                <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                                                    {review.userDisplayName}
                                                </div>
                                                <div className="text-[10px] text-stone-400 font-medium">
                                                    {review.timestamp?.seconds ? new Date(review.timestamp.seconds * 1000).toLocaleDateString("tr-TR", { month: 'long', year: 'numeric' }) : 'Bugün'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < review.rating ? "fill-amber-400 text-amber-400" : "fill-stone-100 text-stone-200"} />
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">
                                        {review.comment}
                                    </p>

                                    <div className="mt-4 pt-4 border-t border-stone-50 flex items-center justify-end">
                                        <button className="flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors">
                                            <ThumbsUp size={14} /> Faydalı ({review.likes})
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
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
