import React, { useState, useEffect } from 'react';
import { MOCK_FACULTIES } from '../../lib/data';
import { cn } from '../../lib/utils';
import { motion as m, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Mail, ShieldCheck, User } from 'lucide-react';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cache, CACHE_KEYS, CACHE_TTL } from '../../lib/cache';

const motion = m as any;

interface Representative {
    id: string;
    name: string;
    faculty: string;
    department: string;
    roles: string;
    status: 'Resmî' | 'Fiilî';
    contact: string;
    isExec: boolean;
}

type MainTab = 'exec' | 'general';

const Representatives: React.FC = () => {
    const [mainTab, setMainTab] = useState<MainTab>('general');
    const [activeFacultyIndex, setActiveFacultyIndex] = useState(0);

    // Dynamic Data State
    const [allReps, setAllReps] = useState<Representative[]>([]);
    const [loading, setLoading] = useState(true);

    const activeFaculty = MOCK_FACULTIES[activeFacultyIndex];

    // Fetch Reps (Cached)
    useEffect(() => {
        const fetchReps = async () => {
            // 1. Try Cache
            const cachedData = cache.get('otk_reps_cache');
            if (cachedData) {
                setAllReps(cachedData);
                setLoading(false);
                return;
            }

            // 2. Fetch
            try {
                const q = query(collection(db, "otk_representatives"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Representative[];

                // 3. Set & Cache
                setAllReps(data);
                cache.set('otk_reps_cache', data, CACHE_TTL.MEDIUM); // 5 min cache
            } catch (error) {
                console.error("Error fetching reps:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReps();
    }, []);

    // Filtered Data
    const execBoard = allReps.filter(r => r.isExec);

    // Logic for mobile faculty carousel
    const handlePrev = () => setActiveFacultyIndex((prev) => Math.max(0, prev - 1));
    const handleNext = () => setActiveFacultyIndex((prev) => Math.min(MOCK_FACULTIES.length - 1, prev + 1));
    const handleDragEnd = (e: any, { offset, velocity }: any) => {
        const swipe = Math.abs(offset.x) * velocity.x;
        if (offset.x < -50 || swipe < -500) handleNext();
        else if (offset.x > 50 || swipe > 500) handlePrev();
    };

    return (
        <div className="bg-stone-50 py-20 px-4 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-4xl text-[#3e2723] mb-4">Temsilciler</h2>
                    <p className="text-[#5d4037] font-light max-w-2xl mx-auto">
                        Demokratik seçimlerle göreve gelen bölüm ve fakülte temsilcileri.
                    </p>
                </div>

                {/* MAIN TABS (Exec vs General) */}
                <div className="flex justify-center mb-12">
                    <div className="bg-stone-200 p-1 rounded-full inline-flex">
                        <button
                            onClick={() => setMainTab('exec')}
                            className={cn(
                                "px-8 py-2 rounded-full text-sm font-bold transition-all duration-300",
                                mainTab === 'exec' ? "bg-[#3e2723] text-white shadow-md" : "text-[#5d4037] hover:text-[#3e2723]"
                            )}
                        >
                            Üst Kurul
                        </button>
                        <button
                            onClick={() => setMainTab('general')}
                            className={cn(
                                "px-8 py-2 rounded-full text-sm font-bold transition-all duration-300",
                                mainTab === 'general' ? "bg-[#3e2723] text-white shadow-md" : "text-[#5d4037] hover:text-[#3e2723]"
                            )}
                        >
                            Genel Kurul
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <AnimatePresence mode="wait">
                    {mainTab === 'exec' ? (
                        <motion.div
                            key="exec"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {execBoard.length === 0 && <div className="col-span-full text-center text-stone-400 py-12 italic">Üst Kurul listesi güncelleniyor...</div>}

                            {execBoard.map((member) => (
                                <div
                                    key={member.id}
                                    className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 flex flex-col hover:shadow-lg transition-all border-t-4 border-t-boun-gold relative overflow-hidden group"
                                >
                                    {/* Decor */}
                                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <ShieldCheck size={64} />
                                    </div>

                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-[#3e2723] text-boun-gold rounded-full flex items-center justify-center font-bold text-xl shadow-sm">
                                            {member.name.charAt(0)}
                                        </div>
                                        <span className={cn("text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider border", member.status === 'Resmî' ? "bg-blue-50 text-blue-800 border-blue-100" : "bg-amber-50 text-amber-800 border-amber-100")}>
                                            {member.status}
                                        </span>
                                    </div>

                                    <h3 className="font-serif text-xl font-bold text-[#3e2723] mb-1">{member.name}</h3>
                                    <p className="text-xs text-[#8d6e63] font-bold uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">{member.roles}</p>

                                    <div className="mt-auto space-y-1 text-xs text-stone-500">
                                        <p className="font-bold text-stone-700">{member.department}</p>
                                        <p className="opacity-80">{member.faculty}</p>
                                        {member.contact && (
                                            <a href={`mailto:${member.contact}`} className="flex items-center gap-2 mt-3 text-boun-blue font-bold hover:underline">
                                                <Mail size={12} /> {member.contact}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="general"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {/* DESKTOP FACULTY TABS */}
                            <div className="hidden md:block overflow-x-auto pb-4 mb-8 custom-scrollbar">
                                <div className="flex space-x-2 justify-center px-2">
                                    {MOCK_FACULTIES.map((fac, idx) => (
                                        <button
                                            key={fac.slug}
                                            onClick={() => setActiveFacultyIndex(idx)}
                                            className={cn(
                                                "px-4 py-2 text-sm font-serif font-bold border-b-2 transition-colors",
                                                idx === activeFacultyIndex
                                                    ? "border-boun-blue text-boun-blue"
                                                    : "border-transparent text-[#8d6e63] hover:text-[#3e2723] hover:border-[#d7ccc8]"
                                            )}
                                        >
                                            {fac.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* MOBILE FACULTY CAROUSEL */}
                            <div className="md:hidden relative h-20 mb-6 flex items-center justify-center bg-stone-100 rounded-lg border border-stone-200 overflow-hidden shadow-inner">
                                <button
                                    onClick={handlePrev}
                                    disabled={activeFacultyIndex === 0}
                                    className="absolute left-2 z-10 text-[#5d4037] disabled:opacity-20 p-2 bg-white/50 rounded-full"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={activeFacultyIndex === MOCK_FACULTIES.length - 1}
                                    className="absolute right-2 z-10 text-[#5d4037] disabled:opacity-20 p-2 bg-white/50 rounded-full"
                                >
                                    <ChevronRight size={24} />
                                </button>

                                <motion.div
                                    className="flex items-center justify-center w-full cursor-grab active:cursor-grabbing"
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={handleDragEnd}
                                >
                                    {MOCK_FACULTIES.map((fac, index) => {
                                        const diff = index - activeFacultyIndex;
                                        if (diff !== 0) return null;

                                        return (
                                            <motion.div
                                                key={fac.slug}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="w-64 text-center"
                                            >
                                                <span className="font-serif font-bold text-lg block leading-tight text-[#3e2723]">
                                                    {fac.name}
                                                </span>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            </div>

                            {/* DEPARTMENT GRID */}
                            <motion.div
                                key={activeFaculty.slug}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {activeFaculty.departments.map((dept) => {
                                    // Find reps for this specific department
                                    const deptReps = allReps.filter(r => r.faculty === activeFaculty.name && r.department === dept.name);

                                    return (
                                        <div key={dept.name} className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm hover:border-[#8d6e63] transition-all flex flex-col h-full">
                                            <h4 className="font-serif text-lg font-bold text-[#3e2723] border-b border-stone-100 pb-3 mb-4 min-h-[3.5rem] flex items-center">
                                                {dept.name}
                                            </h4>

                                            <div className="flex-1 space-y-4">
                                                {deptReps.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center h-24 text-stone-400 bg-stone-50 rounded border border-dashed border-stone-200">
                                                        <User size={20} className="mb-2 opacity-50" />
                                                        <span className="text-xs italic">Temsilci bulunmamaktadır.</span>
                                                    </div>
                                                ) : (
                                                    deptReps.map(rep => (
                                                        <div key={rep.id} className="flex flex-col gap-2 p-3 bg-stone-50 rounded border border-stone-100 relative group">
                                                            <div className="flex justify-between items-start">
                                                                <h5 className="font-bold text-sm text-stone-900">{rep.name}</h5>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase" style={rep.status === 'Resmî' ? { backgroundColor: '#f0f9ff', color: '#0369a1', borderColor: '#bfdbfe' } : { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }}>
                                                                    {rep.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-stone-500 leading-tight">{rep.roles}</p>
                                                            {rep.contact && (
                                                                <div className="pt-2 border-t border-stone-200/50 mt-1">
                                                                    <a href={`mailto:${rep.contact}`} className="text-[10px] text-boun-blue font-bold flex items-center gap-1 hover:underline">
                                                                        <Mail size={10} /> İletişim
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Representatives;