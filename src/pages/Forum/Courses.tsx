import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, BookOpen, GraduationCap, ArrowRight, Star,
    Loader2, X, ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Course, Instructor } from './types';
import { cn, normalizeCourseCode, normalizeName, toTitleCase } from '../../lib/utils';

const MOCK_DEPARTMENTS = ["CMPE", "EE", "IE", "ME", "CE", "PHYS", "CHEM", "MATH", "HUM", "EC", "PSY", "SOC", "POLS", "HIST", "STS", "PHIL"];

const AcademicReviews: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'courses' | 'instructors'>('courses');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form states
    const [courseDept, setCourseDept] = useState('');
    const [courseNumber, setCourseNumber] = useState('');
    const [courseName, setCourseName] = useState('');
    const [instructorName, setInstructorName] = useState('');
    const [department, setDepartment] = useState('');

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const coursesSnap = await getDocs(collection(db, 'courses'));
                const coursesData = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
                setCourses(coursesData);

                const instructorsSnap = await getDocs(collection(db, 'instructors'));
                const instructorsData = instructorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Instructor[];
                setInstructors(instructorsData);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Search results
    const results = useMemo(() => {
        const items = activeTab === 'courses' ? courses : instructors;
        if (!searchTerm) return items;

        const term = searchTerm.toLowerCase();
        return items.filter(item => {
            if (activeTab === 'courses') {
                const c = item as Course;
                return c.code.toLowerCase().includes(term) || c.name.toLowerCase().includes(term);
            } else {
                const i = item as Instructor;
                return i.name.toLowerCase().includes(term);
            }
        });
    }, [activeTab, courses, instructors, searchTerm]);

    const handleCreateCourse = async () => {
        if (!courseDept || !courseNumber || !courseName) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }

        const normalizedCode = normalizeCourseCode(courseDept, courseNumber);

        // Duplicate kontrolü
        const existing = courses.find(c => c.code === normalizedCode);
        if (existing) {
            alert(`Bu ders zaten mevcut: ${normalizedCode}`);
            setIsCreateModalOpen(false);
            return;
        }

        setCreating(true);
        try {
            await addDoc(collection(db, 'courses'), {
                code: normalizedCode,
                deptCode: courseDept.toUpperCase(),
                courseNumber,
                name: courseName,
                department: courseDept.toUpperCase(),
                rating: 0,
                reviewCount: 0,
                instructorIds: []
            });

            // Refresh
            const coursesSnap = await getDocs(collection(db, 'courses'));
            setCourses(coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[]);

            setIsCreateModalOpen(false);
            setCourseDept('');
            setCourseNumber('');
            setCourseName('');
            alert('Ders başarıyla eklendi!');
        } catch (e) {
            console.error(e);
            alert('Hata oluştu.');
        } finally {
            setCreating(false);
        }
    };

    const handleCreateInstructor = async () => {
        if (!instructorName || !department) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }

        const normalized = normalizeName(instructorName);

        // Duplicate kontrolü
        const existing = instructors.find(i => normalizeName(i.name) === normalized);
        if (existing) {
            alert(`Bu hoca zaten mevcut: ${existing.name}`);
            setIsCreateModalOpen(false);
            return;
        }

        setCreating(true);
        try {
            await addDoc(collection(db, 'instructors'), {
                name: toTitleCase(instructorName),
                normalizedName: normalized,
                department,
                rating: 0,
                reviewCount: 0,
                courseCodes: []
            });

            // Refresh
            const instructorsSnap = await getDocs(collection(db, 'instructors'));
            setInstructors(instructorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Instructor[]);

            setIsCreateModalOpen(false);
            setInstructorName('');
            setDepartment('');
            alert('Hoca başarıyla eklendi!');
        } catch (e) {
            console.error(e);
            alert('Hata oluştu.');
        } finally {
            setCreating(false);
        }
    };

    const handleCreate = () => {
        if (activeTab === 'courses') {
            handleCreateCourse();
        } else {
            handleCreateInstructor();
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f0f0f0] font-sans selection:bg-stone-900 selection:text-white overflow-x-hidden">

            {/* --- HEADER --- */}
            <div className="sticky top-0 z-40 bg-[#f0f0f0]/95 backdrop-blur-xl border-b border-stone-200/50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-20 flex items-center justify-between relative">

                    {/* DESKTOP LEFT: Brand */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/forum" className="p-2 -ml-2 rounded-full hover:bg-white/50 text-stone-400 hover:text-stone-900 transition-all active:scale-95">
                            <ArrowRight size={20} className="rotate-180" />
                        </Link>
                        <div>
                            <h1 className="font-serif font-black text-2xl text-stone-900 leading-none tracking-tight">AKADEMİK</h1>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">BOĞAZİÇİ AKADEMİK FORUMU</p>
                        </div>
                    </div>

                    {/* MOBILE CENTER: Title (Absolute) */}
                    <div className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <h1 className="font-serif font-bold text-lg text-stone-900 leading-none">AKADEMİK</h1>
                    </div>

                    {/* DESKTOP CENTER: Tab Switcher */}
                    <div className="hidden md:flex bg-stone-200/60 p-1.5 rounded-xl">
                        <button
                            onClick={() => setActiveTab('courses')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                                activeTab === 'courses' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
                            )}
                        >
                            <BookOpen size={16} strokeWidth={2.5} />
                            DERSLER
                        </button>
                        <button
                            onClick={() => setActiveTab('instructors')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                                activeTab === 'instructors' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
                            )}
                        >
                            <GraduationCap size={18} strokeWidth={2.5} />
                            HOCALAR
                        </button>
                    </div>

                    {/* DESKTOP RIGHT: Actions & Search */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Search Input */}
                        <div className="relative group w-auto">
                            <div className={cn(
                                "flex items-center bg-white border border-stone-200 rounded-xl px-3 py-2 transition-all duration-300",
                                "w-48 focus-within:w-64 focus-within:border-stone-400 focus-within:shadow-md"
                            )}>
                                <Search className="text-stone-400 shrink-0" size={16} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Ara..."
                                    className="w-full bg-transparent border-none text-sm font-bold text-stone-800 placeholder:text-stone-400 focus:ring-0 px-2 outline-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-stone-900 hover:bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-stone-900/20"
                        >
                            <Plus size={20} />
                            <span className="font-bold text-sm">Katkıda Bulun</span>
                        </button>
                    </div>
                </div>

                {/* MOBILE SUB-HEADER: Search & Add (Below Title Bar) */}
                <div className="md:hidden px-4 pb-3 flex items-center gap-3">
                    <div className="flex-1 flex items-center bg-white border border-stone-200 rounded-xl px-3 py-2.5 shadow-sm">
                        <Search className="text-stone-400 shrink-0" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={activeTab === 'courses' ? "Ders Kodu, Adı..." : "Hoca Adı..."}
                            className="w-full bg-transparent border-none text-sm font-bold text-stone-800 placeholder:text-stone-400 focus:ring-0 px-2 outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-stone-900 text-white p-2.5 rounded-xl shadow-md active:scale-95"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* --- MOBILE TOGGLE SECTION (Centered & Enlarged) --- */}
                <div className="md:hidden px-4 pb-4 pt-1 flex justify-center w-full">
                    <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-stone-100 flex w-[90%] max-w-sm relative">
                        {/* Sliding Background */}
                        <motion.div
                            layoutId="activeTabBg"
                            className="absolute top-1.5 bottom-1.5 bg-stone-900 rounded-xl z-0"
                            initial={false}
                            animate={{
                                left: activeTab === 'courses' ? '6px' : '50%',
                                width: 'calc(50% - 6px)'
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />

                        <button
                            onClick={() => setActiveTab('courses')}
                            className={cn(
                                "flex-1 relative z-10 py-3 flex flex-col items-center justify-center gap-1 transition-colors duration-200",
                                activeTab === 'courses' ? "text-white" : "text-stone-400"
                            )}
                        >
                            <BookOpen size={22} strokeWidth={activeTab === 'courses' ? 2.5 : 2} />
                            <span className="text-[10px] font-black tracking-widest uppercase">Dersler</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('instructors')}
                            className={cn(
                                "flex-1 relative z-10 py-3 flex flex-col items-center justify-center gap-1 transition-colors duration-200",
                                activeTab === 'instructors' ? "text-white" : "text-stone-400"
                            )}
                        >
                            <GraduationCap size={24} strokeWidth={activeTab === 'instructors' ? 2.5 : 2} />
                            <span className="text-[10px] font-black tracking-widest uppercase">Hocalar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT GRID --- */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-10">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-50 space-y-4">
                        <Loader2 size={48} className="animate-spin text-stone-400" />
                        <p className="font-serif italic text-stone-400">Veriler taranıyor...</p>
                    </div>
                ) : results.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                    >
                        <AnimatePresence mode='popLayout'>
                            {results.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4, delay: idx * 0.05, type: "spring" }}
                                >
                                    <Link
                                        to={activeTab === 'courses' ? `/forum/ders/${(item as Course).code}` : `/forum/hoca/${item.id}`}
                                        className="group block relative bg-white rounded-3xl p-6 h-full border border-transparent hover:border-stone-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Colorful Header Background (Subtle) */}
                                        <div className={cn(
                                            "absolute top-0 left-0 right-0 h-1.5",
                                            activeTab === 'courses' ? "bg-gradient-to-r from-blue-400 to-indigo-500" : "bg-gradient-to-r from-emerald-400 to-teal-500"
                                        )} />

                                        <div className="flex justify-between items-start mb-6">
                                            {/* Icon / Avatar */}
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black transition-transform group-hover:scale-110 shadow-inner",
                                                activeTab === 'courses'
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "bg-emerald-50 text-emerald-600"
                                            )}>
                                                {activeTab === 'courses' ? (
                                                    (item as Course).department.substring(0, 2)
                                                ) : (
                                                    (item as Instructor).name.charAt(0)
                                                )}
                                            </div>

                                            {/* Rating Badge */}
                                            <div className={cn(
                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-colors",
                                                item.rating >= 4.0 ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                                                    item.rating >= 2.5 ? "bg-amber-50 border-amber-100 text-amber-700" :
                                                        "bg-red-50 border-red-100 text-red-700"
                                            )}>
                                                <Star size={12} className="fill-current" />
                                                <span className="font-bold text-xs">{item.rating || '—'}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {/* Code / Title */}
                                            {activeTab === 'courses' && (
                                                <code className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md inline-block">
                                                    {(item as Course).code}
                                                </code>
                                            )}

                                            <h3 className="font-serif font-bold text-xl text-stone-900 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-stone-900 group-hover:to-stone-600 transition-all line-clamp-2">
                                                {activeTab === 'courses' ? (item as Course).name : (item as Instructor).name}
                                            </h3>

                                            <div className="flex items-center justify-between pt-4 mt-2 border-t border-stone-50">
                                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                                                    {item.department} Departmanı
                                                </span>
                                                <span className="text-xs font-medium text-stone-500 group-hover:text-stone-900 transition-colors">
                                                    {item.reviewCount} Görüş
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Icon */}
                                        <div className="absolute bottom-4 right-4 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                                            <div className="bg-stone-900 text-white p-2 rounded-full shadow-lg">
                                                <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    /* EMPTY STATE */
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center text-stone-400 mb-6 animate-pulse">
                            <Search size={40} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Sonuç Bulunamadı</h3>
                        <p className="text-stone-500 max-w-sm mx-auto mb-8">
                            Aradığın kriterlere uygun {activeTab === 'courses' ? 'ders' : 'hoca'} sistemde kayıtlı değil.
                        </p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-stone-900 font-bold border-b-2 border-stone-900 pb-0.5 hover:text-blue-600 hover:border-blue-600 transition-colors"
                        >
                            İlk sen ekle
                        </button>
                    </motion.div>
                )}
            </main>

            {/* --- CREATE MODAL --- */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                            className="bg-[#fcfcfc] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/50"
                        >
                            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                                <div>
                                    <h3 className="font-serif font-black text-xl text-stone-800">
                                        {activeTab === 'courses' ? 'Ders Ekle' : 'Hoca Ekle'}
                                    </h3>
                                    <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">Topluluğa Katkı Ver</p>
                                </div>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 bg-white rounded-full hover:bg-stone-200 transition-colors shadow-sm">
                                    <X size={20} className="text-stone-500" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                {activeTab === 'courses' ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-stone-500 uppercase ml-1">Bölüm Kodu</label>
                                                <input
                                                    className="w-full bg-stone-100 border-2 border-transparent focus:border-stone-900 rounded-xl p-3 font-bold text-stone-900 outline-none transition-all uppercase"
                                                    placeholder="CMPE"
                                                    maxLength={6}
                                                    value={courseDept}
                                                    onChange={(e) => setCourseDept(e.target.value.toUpperCase())}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-stone-500 uppercase ml-1">Ders Numarası</label>
                                                <input
                                                    className="w-full bg-stone-100 border-2 border-transparent focus:border-stone-900 rounded-xl p-3 font-bold text-stone-900 outline-none transition-all"
                                                    placeholder="150"
                                                    maxLength={4}
                                                    value={courseNumber}
                                                    onChange={(e) => setCourseNumber(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">Ders Adı</label>
                                            <input
                                                className="w-full bg-stone-100 border-2 border-transparent focus:border-stone-900 rounded-xl p-3 font-medium text-stone-900 outline-none transition-all"
                                                placeholder="Introduction to Computing"
                                                value={courseName}
                                                onChange={(e) => setCourseName(e.target.value)}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">Hoca Adı Soyadı</label>
                                            <input
                                                className="w-full bg-stone-100 border-2 border-transparent focus:border-stone-900 rounded-xl p-3 font-bold text-stone-900 outline-none transition-all"
                                                placeholder="Prof. Dr. Cahit Arf"
                                                value={instructorName}
                                                onChange={(e) => setInstructorName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">Bölüm</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full appearance-none bg-stone-100 border-2 border-transparent focus:border-stone-900 rounded-xl p-3 font-bold text-stone-900 outline-none transition-all cursor-pointer"
                                                    value={department}
                                                    onChange={(e) => setDepartment(e.target.value)}
                                                >
                                                    <option value="">Seçiniz</option>
                                                    {MOCK_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={18} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <button
                                    onClick={handleCreate}
                                    disabled={creating}
                                    className="w-full mt-2 bg-stone-900 text-white py-4 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-stone-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {creating && <Loader2 size={18} className="animate-spin" />}
                                    {creating ? 'EKLENİYOR...' : 'KÜTÜPHANEYE EKLE'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default AcademicReviews;
