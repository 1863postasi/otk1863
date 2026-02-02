import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Star, User, MessageSquare, Plus, ThumbsUp, ShieldCheck } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ForumSidebar from '../../components/Forum/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Course, Review, Instructor } from './types';
import { TextArea, Input } from '../../pages/Admin/components/SharedUI'; // Reusing generic UI
import { formatDate } from '../../lib/utils';

const CourseDetail: React.FC = () => {
    const { courseCode } = useParams<{ courseCode: string }>();
    const { userProfile } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Review Form
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '', isAnonymous: false });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // MOCK FETCH for now - In production use courseCode to query firestore "courses" collection
        // Simulating delay and data
        const fetchData = async () => {
            await new Promise(r => setTimeout(r, 500));

            // Mock Course
            setCourse({
                id: '1',
                code: courseCode || 'CMPE101',
                name: 'Introduction to Computing', // In real app, fetch name based on code
                department: courseCode?.replace(/[0-9]/g, '') || 'CMPE',
                rating: 3.8,
                reviewCount: 42,
                instructors: ['1', '2']
            });

            // Mock Instructors for this course
            setInstructors([
                { id: '1', name: 'Ali Hoca', department: 'CMPE', rating: 4.5, reviewCount: 10, courses: [] },
                { id: '2', name: 'Veli Hoca', department: 'CMPE', rating: 3.0, reviewCount: 5, courses: [] },
            ]);

            // Mock Reviews
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
                type: 'course',
                targetId: course?.id, // Should be real ID
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

    if (loading) return <div className="min-h-screen bg-stone-50 pt-20 flex justify-center"><div className="animate-spin text-stone-400">Loading...</div></div>;
    if (!course) return null;

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* SIDEBAR */}
                    <div className="hidden lg:block w-64 shrink-0">
                        <ForumSidebar />
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="flex-1 min-w-0">
                        <Link to="/forum/akademik" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-6 transition-colors font-medium">
                            <ArrowLeft size={20} />
                            Akademik Arama
                        </Link>

                        {/* COURSE HERO */}
                        <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm mb-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-stone-100 rounded-bl-full -mr-8 -mt-8"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <h1 className="text-4xl font-bold text-stone-900 font-serif mb-2">{course.code}</h1>
                                    <h2 className="text-xl text-stone-600 mb-4">{course.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-stone-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">{course.department}</span>
                                        <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded">
                                            <Star size={14} fill="currentColor" /> {course.rating}
                                        </div>
                                        <span className="text-xs text-stone-400">{course.reviewCount} değerlendirme</span>
                                    </div>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-bold text-stone-400 uppercase mb-1">Zorluk</div>
                                    <div className="h-2 w-24 bg-stone-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-400 w-[80%]"></div>
                                    </div>
                                    <div className="text-xs text-red-500 font-bold mt-1">Yüksek</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* LEFT COLUMN: INSTRUCTORS & STATS */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
                                    <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                                        <User size={18} /> Veren Hocalar
                                    </h3>
                                    <div className="space-y-3">
                                        {instructors.map(inst => (
                                            <Link key={inst.id} to={`/forum/hoca/${inst.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-500 text-xs">
                                                        {inst.name.substring(0, 2)}
                                                    </div>
                                                    <span className="font-bold text-stone-700 group-hover:text-stone-900">{inst.name}</span>
                                                </div>
                                                <div className="text-xs font-bold text-amber-500 flex items-center gap-1">
                                                    <Star size={12} fill="currentColor" /> {inst.rating}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 text-blue-900">
                                    <h4 className="font-bold mb-2 text-sm flex items-center gap-2"><ShieldCheck size={16} /> Tavsiye</h4>
                                    <p className="text-xs leading-relaxed opacity-80">
                                        Öğrencilerin %70'i bu dersi "Zorunlu Olduğu İçin" alıyor. Geçme notu ortalaması CB civarında.
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: REVIEWS */}
                            <div className="lg:col-span-2">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-xl text-stone-900">Öğrenci Yorumları</h3>
                                    <button
                                        onClick={() => setIsReviewModalOpen(true)}
                                        className="bg-stone-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-stone-700 transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Yorum Yap
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <div key={review.id} className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${review.isAnonymous ? 'bg-stone-800 text-stone-400' : 'bg-boun-blue/10 text-boun-blue'}`}>
                                                        {review.isAnonymous ? '?' : (review.userDisplayName?.[0] || 'U')}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                                                            {review.userDisplayName}
                                                            {review.userBadge && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded">{review.userBadge}</span>}
                                                        </div>
                                                        <div className="text-xs text-stone-400">
                                                            {/* Simple simulated date format */}
                                                            {review.timestamp?.seconds ? new Date(review.timestamp.seconds * 1000).toLocaleDateString() : 'Bugün'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-0.5 text-amber-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-stone-300"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-stone-700 text-sm leading-relaxed mb-4">{review.comment}</p>
                                            <div className="flex items-center gap-4 text-xs font-bold text-stone-400">
                                                <button className="flex items-center gap-1 hover:text-stone-600 transition-colors">
                                                    <ThumbsUp size={14} /> Faydalı ({review.likes})
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* REVIEW MODAL */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden p-6">
                        <h3 className="font-bold text-lg text-stone-900 mb-4">Bu Dersi Değerlendir</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Puanın</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                                            className="p-1 hover:scale-110 transition-transform"
                                        >
                                            <Star
                                                size={32}
                                                className={star <= reviewData.rating ? "text-amber-400 fill-current" : "text-stone-200"}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <TextArea
                                label="Yorumun"
                                placeholder="Dersin işlenişi, sınavları ve genel tavsiyelerin..."
                                className="h-32"
                                value={reviewData.comment}
                                onChange={(v: string) => setReviewData({ ...reviewData, comment: v })}
                            />

                            <div className="flex items-center gap-2 p-3 bg-stone-50 rounded border border-stone-200 cursor-pointer" onClick={() => setReviewData(p => ({ ...p, isAnonymous: !p.isAnonymous }))}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${reviewData.isAnonymous ? 'bg-stone-900 border-stone-900' : 'bg-white border-stone-300'}`}>
                                    {reviewData.isAnonymous && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <span className="text-sm font-bold text-stone-700 select-none">Bu yorumu anonim olarak paylaş</span>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 font-bold text-stone-500 hover:bg-stone-100 rounded">İptal</button>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submitting}
                                    className="bg-stone-900 text-white px-6 py-2 rounded font-bold hover:bg-stone-700 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Gönderiliyor...' : 'Gönder'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetail;
