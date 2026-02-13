import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Star, User, MessageSquare, Plus, ThumbsUp, ShieldCheck, Loader2, X, AlertCircle, Search } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Course, Review, Instructor } from './types';
import { TextArea } from '../../pages/Admin/components/SharedUI';
import { cn } from '../../lib/utils';

import { useReview } from '../../hooks/useReview';
import ReviewModal from '../../components/Shared/ReviewModal';
import AdminDataControls from '../../components/Shared/AdminDataControls';
import { recalculateCourseStats } from '../../lib/statUtils';

const CourseDetail: React.FC = () => {
    const { courseCode } = useParams<{ courseCode: string }>();
    const { userProfile } = useAuth();

    // Custom Hook
    const [course, setCourse] = useState<Course | null>(null);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Link Instructor Modal
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
    const [searchInstructor, setSearchInstructor] = useState('');
    const [linking, setLinking] = useState(false);

    const reviewHook = useReview({
        type: 'course',
        targetId: course ? course.id : ''
    });
    // Destructure from valid hook instance
    const {
        reviews: hookReviews,
        userReview: hookUserReview,
        loading: hookReviewsLoading,
        submitReview: hookSubmitReview,
        deleteReview: hookDeleteReview
    } = reviewHook;

    useEffect(() => {
        const fetchData = async () => {
            if (!courseCode) return;
            setLoading(true);
            try {
                // Fetch Course
                const coursesQ = query(collection(db, 'courses'), where('code', '==', courseCode.toUpperCase()));
                const coursesSnap = await getDocs(coursesQ);
                if (coursesSnap.empty) {
                    setCourse(null);
                    setLoading(false);
                    return;
                }
                const courseData = { id: coursesSnap.docs[0].id, ...coursesSnap.docs[0].data() } as Course;
                setCourse(courseData);

                // Fetch Instructors
                if (courseData.instructorIds && courseData.instructorIds.length > 0) {
                    // Fetch by ID
                    const instructorsPromises = courseData.instructorIds.map(id => getDoc(doc(db, 'instructors', id)));
                    const instructorsDocs = await Promise.all(instructorsPromises);
                    const instructorsData = instructorsDocs
                        .filter(d => d.exists())
                        .map(d => ({ id: d.id, ...d.data() })) as Instructor[];
                    setInstructors(instructorsData);
                } else {
                    setInstructors([]);
                }

                // Reviews fetched by hook when course state updates

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseCode]);

    const handleReviewSubmit = async (data: any) => {
        if (!course) return;

        try {
            await hookSubmitReview({
                ...data,
                courseCode: course.code // Explicitly pass courseCode for metadata!
            });

            // Recalculate Stats from Scratch (Self-healing & Retroactive Fix)
            const newStats = await recalculateCourseStats(course.id, course.code);

            setCourse(prev => prev ? {
                ...prev,
                rating: newStats.rating,
                reviewCount: newStats.count,
                avgDifficulty: newStats.difficulty
            } : null);

        } catch (e) {
            console.error(e);
            alert("İşlem başarısız.");
        }
    };

    const handleReviewDelete = async () => {
        if (!course || !hookUserReview) return;
        try {
            await hookDeleteReview();

            // Recalculate Stats from Scratch
            const newStats = await recalculateCourseStats(course.id, course.code);

            setCourse(prev => prev ? {
                ...prev,
                rating: newStats.rating,
                reviewCount: newStats.count,
                avgDifficulty: newStats.difficulty
            } : null);

        } catch (e) {
            console.error(e);
            alert("Silme başarısız.");
        }
    };

    const handleLinkInstructor = async (instructorId: string) => {
        if (!course) return;
        setLinking(true);
        try {
            // Update Course
            await updateDoc(doc(db, 'courses', course.id), {
                instructorIds: arrayUnion(instructorId)
            });
            // Update Instructor
            await updateDoc(doc(db, 'instructors', instructorId), {
                courseCodes: arrayUnion(course.code)
            });

            // Refresh
            const instDoc = await getDoc(doc(db, 'instructors', instructorId));
            if (instDoc.exists()) {
                setInstructors([...instructors, { id: instDoc.id, ...instDoc.data() } as Instructor]);
            }
            setIsLinkModalOpen(false);
            alert('Hoca başarıyla eklendi!');
        } catch (e) {
            console.error(e);
            alert('Hata oluştu.');
        } finally {
            setLinking(false);
        }
    };

    const openLinkModal = async () => {
        setIsLinkModalOpen(true);
        // Fetch all instructors
        const instructorsSnap = await getDocs(collection(db, 'instructors'));
        setAllInstructors(instructorsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Instructor[]);
    };

    const filteredInstructors = useMemo(() => {
        if (!searchInstructor) return allInstructors;
        return allInstructors.filter(i => i.name.toLowerCase().includes(searchInstructor.toLowerCase()));
    }, [allInstructors, searchInstructor]);

    if (loading) return (
        <div className="h-dvh flex items-center justify-center bg-[#f5f5f4]">
            <Loader2 className="animate-spin text-stone-400" size={32} />
        </div>
    );
    if (!course) return (
        <div className="h-dvh flex items-center justify-center bg-[#f5f5f4] flex-col gap-4">
            <h2 className="text-2xl font-serif font-bold text-stone-700">Ders Bulunamadı</h2>
            <Link to="/forum/akademik" className="text-blue-600 hover:underline">← Akademik Arama'ya dön</Link>
        </div>
    );

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
                        {/* Admin Controls */}
                        {course && <AdminDataControls type="course" data={course} />}

                        <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-stone-100 shadow-sm">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-stone-900">{course.rating?.toFixed(1) || '—'}</span>
                        </div>
                        <button
                            onClick={() => {
                                setIsEditing(!!hookUserReview);
                                setIsReviewModalOpen(true);
                            }}
                            className="bg-stone-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-colors"
                        >
                            {hookReviewsLoading ? <Loader2 size={12} className="animate-spin" /> : (hookUserReview ? 'Değerlendirmeyi Düzenle' : 'Değerlendir')}
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
                                    <span className="text-xs font-bold text-stone-500 pl-1">{course.reviewCount || 0} öğrenci değerlendirdi</span>
                                </div>
                            </div>

                            {/* Difficulty Gauge (Real Data) */}
                            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 w-full md:w-auto min-w-[180px]">
                                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Zorluk Seviyesi</div>
                                <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden mb-1">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(course.avgDifficulty || 0) * 10}%` }}
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            (course.avgDifficulty || 0) > 7 ? "bg-red-400" :
                                                (course.avgDifficulty || 0) > 4 ? "bg-amber-400" : "bg-emerald-400"
                                        )}
                                    />
                                </div>
                                <div className="flex justify-between text-xs font-bold">
                                    <span className={cn(
                                        (course.avgDifficulty || 0) > 7 ? "text-red-500" :
                                            (course.avgDifficulty || 0) > 4 ? "text-amber-500" : "text-emerald-500"
                                    )}>
                                        {(course.avgDifficulty || 0) > 7 ? "Yüksek" : (course.avgDifficulty || 0) > 4 ? "Orta" : "Düşük"}
                                    </span>
                                    <span className="text-stone-300">{course.avgDifficulty?.toFixed(1) || 0}/10</span>
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
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest pl-1">Veren Hocalar</h3>
                                <button
                                    onClick={openLinkModal}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                                >
                                    <Plus size={14} /> Ekle
                                </button>
                            </div>
                            {instructors.length === 0 ? (
                                <div className="p-4 border border-dashed border-stone-200 rounded-xl text-center text-xs text-stone-400">
                                    Henüz hoca eklenmemiş. İlk sen ekle!
                                </div>
                            ) : (
                                instructors.map(inst => (
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
                                            <Star size={10} fill="currentColor" /> {inst.rating?.toFixed(1) || '—'}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* Advice Box */}
                        <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5">
                            <h4 className="font-bold text-blue-900 text-sm flex items-center gap-2 mb-2">
                                <ShieldCheck size={16} /> ÖTK İpucu
                            </h4>
                            <p className="text-xs text-blue-800/80 leading-relaxed">
                                Hocanın anlatımı derse çok etki eder. Lütfen soldaki listeden hoca seçip özel değerlendirmeleri inceleyin.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COL: REVIEWS */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-serif font-bold text-xl text-stone-800">Ders Yorumları</h3>
                            <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-md">{hookReviews.length} Görüş</span>
                        </div>

                        {hookReviews.length === 0 ? (
                            <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-stone-300">
                                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                                    <MessageSquare size={24} />
                                </div>
                                <h3 className="font-serif font-bold text-xl text-stone-700 mb-2">Henüz Yorum Yok</h3>
                                <p className="text-stone-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                                    Bu ders için henüz genel bir değerlendirme yapılmamış. İlk yorumu sen yaparak arkadaşlarına yardımcı ol!
                                </p>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setIsReviewModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors"
                                >
                                    İlk Değerlendirmeyi Yap
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {hookReviews.map((review) => (
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
                                                        {userProfile && review.userId === userProfile.uid && (
                                                            <span className="ml-2 text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-bold">SEN</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-stone-400">
                                                        {review.timestamp?.seconds ? new Date(review.timestamp.seconds * 1000).toLocaleDateString("tr-TR") : "Az önce"}
                                                        {review.editedAt && <span className="ml-1 italic">(düzenlendi)</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100">
                                                    <Star size={12} fill="currentColor" />
                                                    <span className="text-xs font-black">{review.rating}</span>
                                                </div>
                                                {review.difficulty && (
                                                    <div className="text-[10px] font-bold text-stone-400">
                                                        Zorluk: <span className="text-stone-600">{review.difficulty}/10</span>
                                                    </div>
                                                )}
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
                                        <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>

            {/* REVIEW MODAL */}
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleReviewSubmit}
                onDelete={handleReviewDelete}
                initialData={isEditing && hookUserReview ? hookUserReview : undefined}
                isEditing={isEditing}
                title={course.code}
                includeDifficulty={true}
                warningMessage={<p><strong>Not:</strong> Bu yorum, hocadan bağımsız olarak <strong>dersin içeriğini ve zorluğunu</strong> değerlendirir.</p>}
            />

            {/* LINK INSTRUCTOR MODAL */}
            <AnimatePresence>
                {isLinkModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                                <h3 className="font-serif font-bold text-lg text-stone-800">Hoca Bağla</h3>
                                <button onClick={() => setIsLinkModalOpen(false)} className="p-2 bg-white rounded-full hover:bg-stone-200 transition-colors">
                                    <X size={20} className="text-stone-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center bg-stone-100 border border-stone-200 rounded-xl px-3 py-2">
                                    <Search className="text-stone-400 shrink-0" size={16} />
                                    <input
                                        type="text"
                                        value={searchInstructor}
                                        onChange={(e) => setSearchInstructor(e.target.value)}
                                        placeholder="Hoca ara..."
                                        className="w-full bg-transparent border-none text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:ring-0 px-2 outline-none"
                                    />
                                </div>

                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {filteredInstructors.map(inst => (
                                        <button
                                            key={inst.id}
                                            onClick={() => handleLinkInstructor(inst.id)}
                                            disabled={linking || instructors.some(i => i.id === inst.id)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                {inst.name.substring(0, 2)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-stone-800 truncate">{inst.name}</div>
                                                <div className="text-xs text-stone-500">{inst.department}</div>
                                            </div>
                                            {instructors.some(i => i.id === inst.id) && (
                                                <span className="text-xs font-bold text-green-600">✓ Ekli</span>
                                            )}
                                        </button>
                                    ))}
                                    {filteredInstructors.length === 0 && (
                                        <p className="text-center text-stone-400 text-sm py-10">Hoca bulunamadı</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default CourseDetail;
