import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Star, ThumbsUp, Loader2, X, AlertCircle, MessageSquare
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Review, Course, Instructor } from './types';
import { TextArea } from '../../pages/Admin/components/SharedUI';
import { cn } from '../../lib/utils';

const CourseInstructorDetail: React.FC = () => {
    const { courseCode, instructorId } = useParams<{ courseCode: string, instructorId: string }>();
    const { userProfile } = useAuth();

    // State
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);

    // Meta Data
    const [course, setCourse] = useState<Course | null>(null);
    const [instructor, setInstructor] = useState<Instructor | null>(null);
    const [stats, setStats] = useState({ rating: 0, count: 0 });

    // Form
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '', isAnonymous: false });
    const [submitting, setSubmitting] = useState(false);

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

                // Fetch Reviews for THIS PAIRING
                const reviewsQ = query(
                    collection(db, 'reviews'),
                    where('type', '==', 'course-instructor'),
                    where('courseCode', '==', courseCode.toUpperCase()),
                    where('instructorId', '==', instructorId)
                );
                const reviewsSnap = await getDocs(reviewsQ);
                const reviewsData = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
                setReviews(reviewsData);

                // Calc Stats
                if (reviewsData.length > 0) {
                    const avgRating = reviewsData.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewsData.length;
                    setStats({ rating: avgRating, count: reviewsData.length });
                } else {
                    setStats({ rating: 0, count: 0 });
                }

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [courseCode, instructorId]);

    const handleSubmitReview = async () => {
        if (!userProfile) {
            alert("Yorum yapmak için giriş yapmalısınız.");
            return;
        }
        if (!course || !instructor) return;

        setSubmitting(true);
        try {
            const newReview: any = {
                type: 'course-instructor',
                courseCode: course.code,
                instructorId: instructor.id,
                instructorName: instructor.name, // Denormalize for easy querying
                targetId: `${course.code}_${instructor.id}`,
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

            // LAZY LINKING: Update both Course and Instructor to reflect association
            await updateDoc(doc(db, 'courses', course.id), {
                instructorIds: arrayUnion(instructor.id)
            });
            await updateDoc(doc(db, 'instructors', instructor.id), {
                courseCodes: arrayUnion(course.code)
            });

            // Update Course Stats (global for the course)
            const newCourseCount = (course.reviewCount || 0) + 1;
            const newCourseRating = ((course.rating || 0) * (course.reviewCount || 0) + reviewData.rating) / newCourseCount;
            await updateDoc(doc(db, 'courses', course.id), {
                reviewCount: newCourseCount,
                rating: newCourseRating
            });

            // Update Instructor Stats (global for the instructor)
            const newInstructorCount = (instructor.reviewCount || 0) + 1;
            const newInstructorRating = ((instructor.rating || 0) * (instructor.reviewCount || 0) + reviewData.rating) / newInstructorCount;
            await updateDoc(doc(db, 'instructors', instructor.id), {
                reviewCount: newInstructorCount,
                rating: newInstructorRating
            });

            // Optimistic local update
            setReviews([{ ...newReview, id: 'temp-' + Date.now(), timestamp: { seconds: Date.now() / 1000 } }, ...reviews]);
            const newStats = { rating: ((stats.rating * stats.count + reviewData.rating) / (stats.count + 1)), count: stats.count + 1 };
            setStats(newStats);

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
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-stone-100 shadow-sm">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-stone-900">{stats.rating.toFixed(1) || '—'}</span>
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
                        <span className="text-xs font-medium text-stone-400">{stats.count} yorum</span>
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
                                onClick={() => setIsReviewModalOpen(true)}
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
                                            <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-bold">
                                                {review.isAnonymous ? '?' : review.userDisplayName?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-stone-800">{review.userDisplayName || 'Anonim'}</div>
                                                <div className="text-xs text-stone-400">
                                                    {review.timestamp && new Date((review.timestamp as any).seconds * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                            <Star size={12} className="fill-amber-400 text-amber-400" />
                                            <span className="text-xs font-bold text-amber-700">{review.rating}</span>
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
                                    Değerlendir: {course.code} - {instructor.name}
                                </h3>
                                <button onClick={() => setIsReviewModalOpen(false)} className="p-1 rounded-full hover:bg-stone-200 transition-colors">
                                    <X size={20} className="text-stone-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* INFO ALERT */}
                                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                                    <p className="text-xs text-indigo-800 leading-relaxed">
                                        <strong>Bu yorum spesifiktir:</strong> Sadece <strong>{instructor.name} hocanın {course.code} dersindeki</strong> performansını değerlendiriyorsun. Diğer dersler veya hocalar için ayrı yorumlar yapabilirsin.
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
                                    placeholder="Hocanın anlatımı, sınavları, notlandırması nasıldı? Hangi konulara odaklandı? Dersi alacaklara tavsiyen..."
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

export default CourseInstructorDetail;
