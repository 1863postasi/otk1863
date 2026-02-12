import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Star, ThumbsUp, Loader2, X, AlertCircle, MessageSquare, User
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Review, Course, Instructor } from './types';
import { TextArea } from '../../pages/Admin/components/SharedUI';
import { cn } from '../../lib/utils';

import { useReview } from '../../hooks/useReview';
import ReviewModal from '../../components/Shared/ReviewModal';
import AdminDataControls from '../../components/Shared/AdminDataControls';
import { recalculateCourseStats, recalculateInstructorStats } from '../../lib/statUtils';

const CourseInstructorDetail: React.FC = () => {
    const { courseCode, instructorId } = useParams<{ courseCode: string, instructorId: string }>();
    const { userProfile } = useAuth();

    // Use derived targetId from URL params for immediate hook initialization
    // courseCode is typically Uppercase in DB, ensure we use that if possible, but reading from URL it might be any case.
    // The previous code used courseCode.toUpperCase().
    const targetId = `${courseCode?.toUpperCase()}_${instructorId}`;

    const {
        reviews,
        userReview,
        loading: reviewsLoading,
        submitReview,
        deleteReview,
        submitting: reviewSubmitting,
        deleting: reviewDeleting
    } = useReview({
        type: 'course-instructor',
        targetId: targetId
    });

    // State
    const [loading, setLoading] = useState(true);
    // const [reviews, setReviews] = ... // Removed

    // Meta Data
    const [course, setCourse] = useState<Course | null>(null);
    const [instructor, setInstructor] = useState<Instructor | null>(null);
    const [stats, setStats] = useState({ rating: 0, count: 0 }); // Kept for local header stats, but maybe can derive from reviews? 
    // Actually stats in this component are derived from 'reviews' state in original code.
    // I can derive them from 'reviews' returned by hook.

    // Form
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    // const [reviewData, setReviewData] = ... // Removed
    // const [submitting, setSubmitting] = ... // Removed

    useEffect(() => {
        const loadData = async () => {
            if (!courseCode || !instructorId) return;
            setLoading(true);
            try {
                // Fetch Course
                const coursesQ = query(collection(db, 'courses'), where('code', '==', courseCode.toUpperCase()));
                const coursesSnap = await getDocs(coursesQ);
                if (coursesSnap.empty || !coursesSnap.docs[0].exists()) {
                    setCourse(null);
                    setLoading(false);
                    return;
                }
                const courseData = { id: coursesSnap.docs[0].id, ...coursesSnap.docs[0].data() } as Course;
                setCourse(courseData);

                // Fetch Instructor
                const instructorDoc = await getDoc(doc(db, 'instructors', instructorId));
                if (!instructorDoc.exists()) {
                    setInstructor(null);
                    setLoading(false);
                    return;
                }
                const instructorData = { id: instructorDoc.id, ...instructorDoc.data() } as Instructor;
                setInstructor(instructorData);

                // Reviews fetched by hook

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [courseCode, instructorId]);

    // Update stats when reviews change
    useEffect(() => {
        if (reviews.length > 0) {
            const avgRating = reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length;
            setStats({ rating: avgRating, count: reviews.length });
        } else {
            setStats({ rating: 0, count: 0 });
        }
    }, [reviews]);

    const handleReviewSubmit = async (data: any) => {
        if (!course || !instructor) return;

        try {
            await submitReview({
                ...data,
                courseCode: course.code,
                instructorId: instructor.id,
                instructorName: instructor.name // Denormalize
            });

            // LAZY LINKING (Idempotent-ish)
            await updateDoc(doc(db, 'courses', course.id), {
                instructorIds: arrayUnion(instructor.id)
            });
            await updateDoc(doc(db, 'instructors', instructor.id), {
                courseCodes: arrayUnion(course.code)
            });

            // Recalculate Stats (Self-healing & Retroactive Fix)
            const newCourseStats = await recalculateCourseStats(course.id, course.code);
            const newInstStats = await recalculateInstructorStats(instructor.id);

            // Update Local State with Perfect Data
            setCourse(prev => prev ? {
                ...prev,
                rating: newCourseStats.rating,
                reviewCount: newCourseStats.count,
                avgDifficulty: newCourseStats.difficulty
            } : null);

            setInstructor(prev => prev ? {
                ...prev,
                rating: newInstStats.rating,
                reviewCount: newInstStats.count
            } : null);

            setIsReviewModalOpen(false);
        } catch (e) {
            console.error(e);
            alert("İşlem başarısız.");
        }
    };

    const handleReviewDelete = async () => {
        if (!course || !instructor) return;
        try {
            await deleteReview();

            // Recalculate Stats for Consistency
            const newCourseStats = await recalculateCourseStats(course.id, course.code);
            const newInstStats = await recalculateInstructorStats(instructor.id);

            setCourse(prev => prev ? {
                ...prev,
                rating: newCourseStats.rating,
                reviewCount: newCourseStats.count,
                avgDifficulty: newCourseStats.difficulty
            } : null);

            setInstructor(prev => prev ? {
                ...prev,
                rating: newInstStats.rating,
                reviewCount: newInstStats.count
            } : null);

        } catch (e) {
            console.error(e);
            alert("Silme başarısız.");
        }
    };

    if (loading) return (
        <div className="h-dvh flex items-center justify-center bg-[#f5f5f4]">
            <Loader2 className="animate-spin text-stone-400" size={32} />
        </div>
    );
    if (!course || !instructor) return (
        <div className="h-dvh flex items-center justify-center bg-[#f5f5f4] flex-col gap-4">
            <h2 className="text-2xl font-serif font-bold text-stone-700">Eşleşme Bulunamadı</h2>
            <Link to="/forum/akademik" className="text-blue-600 hover:underline">← Akademik Arama'ya dön</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f5f5f4] font-sans selection:bg-indigo-100 flex flex-col">

            {/* HEADER */}
            <div className="bg-[#f5f5f4]/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
                    <Link to={`/forum/ders/${course.code}`} className="group flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors">
                        <div className="p-2 rounded-full group-hover:bg-stone-200/50 transition-colors">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="font-bold text-sm hidden md:inline">Ders Sayfası</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* Admin Controls */}
                        {course && instructor && (
                            <AdminDataControls
                                type="course-instruction"
                                data={course}
                                secondaryId={instructor.id}
                            />
                        )}

                        <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-stone-100 shadow-sm">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-stone-900">{stats.rating.toFixed(1) || '—'}</span>
                        </div>
                        <button
                            onClick={() => {
                                setIsEditing(!!userReview);
                                setIsReviewModalOpen(true);
                            }}
                            className="bg-stone-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-colors"
                        >
                            {reviewsLoading ? <Loader2 size={12} className="animate-spin" /> : (userReview ? 'Değerlendirmeyi Düzenle' : 'Değerlendir')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-6 py-8 space-y-8">

                {/* HERO CARD */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 md:p-10 shadow-sm border border-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-white/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left mb-6">
                            {/* Instructor Avatar */}
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/60 backdrop-blur-sm border-4 border-white shadow-lg flex items-center justify-center text-2xl md:text-3xl font-bold text-indigo-600 shrink-0">
                                {instructor.name.split(' ').map(n => n[0]).join('')}
                            </div>

                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full mb-3 border border-white/50">
                                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">{course.code}</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-2 leading-tight">{course.name}</h1>
                                <h2 className="text-xl md:text-2xl font-medium text-stone-600 mb-4">{instructor.name}</h2>

                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-lg border border-white/40">
                                    <Star size={14} className="fill-amber-400 text-amber-400" />
                                    <span className="text-sm font-bold text-stone-700">{stats.rating.toFixed(1)} ortalama</span>
                                    <span className="text-xs text-stone-500">• {stats.count} değerlendirme</span>
                                </div>
                            </div>
                        </div>

                        {/* Inline Disclaimer */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-stone-700 leading-relaxed">
                                    <strong>Bu sayfa,</strong> {instructor.name} hocanın <strong>{course.code}</strong> dersindeki spesifik deneyimlerini içeriyor. Hocanın genel tarzı veya dersin farklı bir hoca ile değerlendirmesi için diğer sayfalara göz at.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* REVIEWS SECTION */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-stone-700">Öğrenci Deneyimleri</h3>
                        <span className="text-xs font-medium text-stone-400">{reviews.length} yorum</span>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-stone-300">
                            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                                <MessageSquare size={24} />
                            </div>
                            <h3 className="font-serif font-bold text-xl text-stone-700 mb-2">Henüz Değerlendirme Yapılmamış</h3>
                            <p className="text-stone-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                                Bu ders-hoca eşleşmesinde ilk yorumu sen yap! Deneyimini sonraki öğrenciler için paylaş.
                            </p>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setIsReviewModalOpen(true);
                                }}
                                className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg"
                            >
                                İlk Yorumu Yap
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review, idx) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-2xl p-6 border border-stone-200/60 hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-sm">
                                                {review.isAnonymous ? <User size={18} /> : (review.userPhotoUrl ? <img src={review.userPhotoUrl} className="w-full h-full rounded-full object-cover" /> : review.userDisplayName?.charAt(0))}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-stone-800">
                                                    {review.userDisplayName || 'Anonim'}
                                                    {userProfile && review.userId === userProfile.uid && (
                                                        <span className="ml-2 text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-bold">SEN</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-stone-400">
                                                    {review.timestamp && new Date((review.timestamp as any).seconds * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                                    {review.editedAt && <span className="ml-1 italic">(düzenlendi)</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                                <span className="text-xs font-bold text-amber-700">{review.rating}</span>
                                            </div>
                                            {/* Edit/Delete Buttons for Review Owner */}
                                            {userProfile && review.userId === userProfile.uid && (
                                                <div className="flex gap-2 mt-1">
                                                    <button
                                                        onClick={() => {
                                                            setIsEditing(true);
                                                            setIsReviewModalOpen(true);
                                                        }}
                                                        className="text-[10px] text-stone-400 hover:text-stone-900 font-bold transition-colors"
                                                    >
                                                        Düzenle
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm text-stone-700 leading-relaxed mb-4">{review.comment}</p>

                                    <div className="flex items-center gap-4 pt-3 border-t border-stone-100">
                                        <button className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-indigo-600 transition-colors group">
                                            <ThumbsUp size={14} className="group-hover:scale-110 transition-transform" />
                                            <span>{review.likes || 0}</span>
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* REVIEW MODAL */}
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleReviewSubmit}
                onDelete={handleReviewDelete}
                initialData={isEditing && userReview ? userReview : undefined}
                isEditing={isEditing}
                title={`${course.code} - ${instructor.name}`}
                warningMessage={<p><strong>Bu yorum spesifiktir:</strong> Sadece <strong>{instructor.name} hocanın {course.code} dersindeki</strong> performansını değerlendiriyorsun. Diğer dersler veya hocalar için ayrı yorumlar yapabilirsin.</p>}
            />

        </div>
    );
};

export default CourseInstructorDetail;
