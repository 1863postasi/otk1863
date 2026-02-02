import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Star, User, MessageSquare, Plus, ThumbsUp } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ForumSidebar from '../../components/Forum/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Instructor, Review } from './types';
import { TextArea } from '../../pages/Admin/components/SharedUI';

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
            await new Promise(r => setTimeout(r, 500));

            // Mock Instructor
            setInstructor({
                id: instructorId || '1',
                name: 'Ali Hoca', // Real fetch in prod
                department: 'CMPE',
                rating: 4.8,
                reviewCount: 45,
                courses: ['1', '2']
            });

            // Mock Courses taught
            setCourses([
                { id: '1', code: 'CMPE150', name: 'Intro to Computing' },
                { id: '2', code: 'CMPE451', name: 'Project Development' },
            ]);

            // Mock Reviews
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

    if (loading) return <div className="min-h-screen bg-stone-50 pt-20 flex justify-center"><div className="animate-spin text-stone-400">Loading...</div></div>;
    if (!instructor) return null;

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

                        {/* INSTRUCTOR HERO */}
                        <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm mb-8 flex items-center gap-6">
                            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center text-3xl font-bold text-stone-500 border-4 border-white shadow-lg">
                                {instructor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-stone-900 font-serif mb-2">{instructor.name}</h1>
                                <div className="flex items-center gap-3">
                                    <span className="bg-stone-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">{instructor.department}</span>
                                    <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded">
                                        <Star size={14} fill="currentColor" /> {instructor.rating}
                                    </div>
                                    <span className="text-xs text-stone-400">{instructor.reviewCount} değerlendirme</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* LEFT COLUMN: COURSES */}
                            <div>
                                <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                                    <BookOpen size={18} /> Verdiği Dersler
                                </h3>
                                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                                    {courses.map(course => (
                                        <Link key={course.id} to={`/forum/ders/${course.code}`} className="block p-4 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                                            <div className="font-bold text-stone-900 text-sm">{course.code}</div>
                                            <div className="text-xs text-stone-500">{course.name}</div>
                                        </Link>
                                    ))}
                                    {courses.length === 0 && <div className="p-4 text-xs text-stone-400">Kayıtlı ders bulunamadı.</div>}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: REVIEWS */}
                            <div className="lg:col-span-2">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-xl text-stone-900">Hoca Hakkında Yorumlar</h3>
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
                                                    <ThumbsUp size={14} /> ({review.likes})
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
                        <h3 className="font-bold text-lg text-stone-900 mb-4">Hocayı Değerlendir</h3>

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
                                placeholder="Ders anlatımı, notlandırması ve iletişimi nasıl?"
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

export default InstructorDetail;
