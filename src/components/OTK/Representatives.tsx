import React, { useState, useEffect } from 'react';
import { MOCK_FACULTIES } from '../../lib/data';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Mail, ShieldCheck, User, Search, Filter } from 'lucide-react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cache, CACHE_KEYS, CACHE_TTL } from '../../lib/cache';

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
    const [mainTab, setMainTab] = useState<MainTab>('exec'); // Default to Exec for prestige
    const [activeFacultyIndex, setActiveFacultyIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

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
                cache.set('otk_reps_cache', data, CACHE_TTL.VERY_LONG); // 24h cache
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

    // Search Logic for General Board
    const filteredDepartments = activeFaculty.departments.map(dept => {
        const reps = allReps.filter(r =>
            r.faculty === activeFaculty.name &&
            r.department === dept.name &&
            (searchTerm === '' || r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.roles.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        return { ...dept, reps };
    }).filter(dept => searchTerm === '' || dept.reps.length > 0);


    // Logic for mobile faculty carousel
    const handlePrev = () => setActiveFacultyIndex((prev) => Math.max(0, prev - 1));
    const handleNext = () => setActiveFacultyIndex((prev) => Math.min(MOCK_FACULTIES.length - 1, prev + 1));
    const handleDragEnd = (e: any, { offset, velocity }: any) => {
        const swipe = Math.abs(offset.x) * velocity.x;
        if (offset.x < -50 || swipe < -500) handleNext();
        else if (offset.x > 50 || swipe > 500) handlePrev();
    };

    return (
        <div className="bg-stone-50 py-24 px-4 min-h-screen relative overflow-hidden">

            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stone-200/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-boun-gold/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <span className="text-boun-gold text-xs font-bold tracking-[0.2em] uppercase mb-3 block">1863'ten Günümüze</span>
                    <h2 className="font-serif text-4xl md:text-5xl text-[#3e2723] mb-4">Temsilciler Kurulu</h2>
                    <p className="text-[#5d4037] font-light max-w-2xl mx-auto text-lg">
                        Öğrencilerin demokratik sesi olan seçilmiş temsilcilerimiz.
                    </p>
                </div>

                {/* MAIN TABS (Exec vs General) */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white p-1.5 rounded-full inline-flex shadow-sm border border-stone-200">
                        <button
                            onClick={() => setMainTab('exec')}
                            className={cn(
                                "px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 relative overflow-hidden",
                                mainTab === 'exec' ? "text-stone-100 shadow-md" : "text-stone-500 hover:text-stone-800"
                            )}
                        >
                            {mainTab === 'exec' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-[#3e2723] z-0"
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <ShieldCheck size={16} /> Üst Kurul
                            </span>
                        </button>
                        <button
                            onClick={() => setMainTab('general')}
                            className={cn(
                                "px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 relative overflow-hidden",
                                mainTab === 'general' ? "text-stone-100 shadow-md" : "text-stone-500 hover:text-stone-800"
                            )}
                        >
                            {mainTab === 'general' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-[#3e2723] z-0"
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <User size={16} /> Genel Kurul
                            </span>
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
                            {loading && <div className="col-span-full py-20 text-center text-stone-400">Yükleniyor...</div>}

                            {!loading && execBoard.length === 0 && (
                                <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-stone-300 text-center">
                                    <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h3 className="text-xl font-serif text-stone-600 mb-2">Liste Güncelleniyor</h3>
                                    <p className="text-stone-400">Üst kurul üyeleri yakında eklenecektir.</p>
                                </div>
                            )}

                            {execBoard.map((member) => (
                                <div
                                    key={member.id}
                                    className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                                >
                                    {/* Gradient Border Top */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3e2723] via-boun-gold to-[#3e2723]" />

                                    {/* Background Pattern */}
                                    <div className="absolute -right-8 -bottom-8 text-stone-50 opacity-[0.03] transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                                        <ShieldCheck size={200} />
                                    </div>

                                    <div className="flex items-start justify-between mb-6 relative z-10">
                                        <div className="w-14 h-14 bg-[#3e2723] text-boun-gold rounded-2xl flex items-center justify-center font-serif font-bold text-2xl shadow-lg shadow-[#3e2723]/20">
                                            {member.name.charAt(0)}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider border shadow-sm",
                                            member.status === 'Resmî'
                                                ? "bg-blue-50 text-blue-900 border-blue-100"
                                                : "bg-amber-50 text-amber-900 border-amber-100"
                                        )}>
                                            {member.status}
                                        </span>
                                    </div>

                                    <h3 className="font-serif text-2xl font-bold text-[#3e2723] mb-2 leading-tight">{member.name}</h3>
                                    <p className="text-xs text-boun-gold font-bold uppercase tracking-widest mb-6 border-b border-stone-100 pb-4">{member.roles}</p>

                                    <div className="mt-auto space-y-1.5 text-sm">
                                        <div className="flex items-center gap-2 text-stone-700 font-bold">
                                            <span className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                                            {member.department}
                                        </div>
                                        <div className="flex items-center gap-2 text-stone-500 text-xs pl-3.5">
                                            {member.faculty}
                                        </div>
                                        {member.contact && (
                                            <a href={`mailto:${member.contact}`} className="flex items-center gap-2 mt-4 pt-4 text-boun-blue font-bold hover:underline text-xs group/link">
                                                <div className="p-1.5 bg-blue-50 rounded-full group-hover/link:bg-blue-100 transition-colors">
                                                    <Mail size={14} />
                                                </div>
                                                {member.contact}
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
                            {/* SEARCH & FILTERS */}
                            <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                                {/* Search Bar */}
                                <div className="relative w-full md:w-auto md:min-w-[300px]">
                                    <input
                                        type="text"
                                        placeholder="İsim veya görev ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-full border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#3e2723]/20 transition-all shadow-sm text-sm"
                                    />
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                </div>
                            </div>

                            {/* DESKTOP FACULTY TABS */}
                            <div className="hidden md:flex overflow-x-auto pb-4 mb-8 custom-scrollbar scroll-smooth">
                                <div className="flex space-x-2 px-2 mx-auto">
                                    {MOCK_FACULTIES.map((fac, idx) => (
                                        <button
                                            key={fac.slug}
                                            onClick={() => setActiveFacultyIndex(idx)}
                                            className={cn(
                                                "px-5 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap border mb-2",
                                                idx === activeFacultyIndex
                                                    ? "bg-[#3e2723] text-stone-100 border-[#3e2723] shadow-md shadow-[#3e2723]/20"
                                                    : "bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-700 hover:bg-stone-50"
                                            )}
                                        >
                                            {fac.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* MOBILE FACULTY CAROUSEL */}
                            <div className="md:hidden relative h-20 mb-8 flex items-center justify-center bg-white rounded-2xl border border-stone-100 shadow-lg shadow-stone-200/50">
                                <button
                                    onClick={handlePrev}
                                    disabled={activeFacultyIndex === 0}
                                    className="absolute left-2 z-10 text-[#3e2723] disabled:opacity-20 p-2 active:scale-95 transition-transform"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={activeFacultyIndex === MOCK_FACULTIES.length - 1}
                                    className="absolute right-2 z-10 text-[#3e2723] disabled:opacity-20 p-2 active:scale-95 transition-transform"
                                >
                                    <ChevronRight size={24} />
                                </button>

                                <motion.div
                                    className="flex items-center justify-center w-full cursor-grab active:cursor-grabbing px-12"
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={handleDragEnd}
                                >
                                    <AnimatePresence mode='popLayout'>
                                        {MOCK_FACULTIES.map((fac, index) => {
                                            const diff = index - activeFacultyIndex;
                                            if (diff !== 0) return null;

                                            return (
                                                <motion.div
                                                    key={fac.slug}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="w-full text-center"
                                                >
                                                    <span className="font-serif font-bold text-base block leading-tight text-[#3e2723]">
                                                        {fac.name}
                                                    </span>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </motion.div>
                            </div>

                            {/* DEPARTMENT GRID */}
                            <motion.div
                                key={`${activeFaculty.slug}-${searchTerm}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filteredDepartments.length === 0 && (
                                    <div className="col-span-full py-20 text-center flex flex-col items-center">
                                        <Filter className="text-stone-300 mb-4" size={48} />
                                        <p className="text-stone-500 font-medium">Sonuç bulunamadı.</p>
                                        <p className="text-stone-400 text-sm">Arama teriminizi değiştirmeyi deneyin.</p>
                                    </div>
                                )}

                                {filteredDepartments.map((dept) => (
                                    <div key={dept.name} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
                                        <h4 className="font-serif text-lg font-bold text-[#3e2723] border-b border-stone-100 pb-3 mb-4 min-h-[3rem] flex items-center">
                                            {dept.name}
                                        </h4>

                                        <div className="flex-1 space-y-3">
                                            {dept.reps.map(rep => (
                                                <div key={rep.id} className="flex flex-col gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100 hover:border-boun-gold/30 hover:bg-[#fffdf5] transition-colors relative group/item">
                                                    <div className="flex justify-between items-start">
                                                        <h5 className="font-bold text-sm text-stone-900 leading-tight">{rep.name}</h5>
                                                        <span className={cn(
                                                            "text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase shrink-0 ml-2",
                                                            rep.status === 'Resmî'
                                                                ? "bg-blue-50 text-blue-800 border-blue-100"
                                                                : "bg-amber-50 text-amber-800 border-amber-100"
                                                        )}>
                                                            {rep.status === 'Resmî' ? 'R' : 'F'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-stone-500 leading-tight font-medium">{rep.roles}</p>
                                                    {rep.contact && (
                                                        <div className="pt-2 border-t border-stone-200/50 mt-1 flex justify-start">
                                                            <a href={`mailto:${rep.contact}`} className="text-[10px] text-boun-blue font-bold flex items-center gap-1 hover:underline bg-white px-2 py-1 rounded-full border border-stone-100 shadow-sm">
                                                                <Mail size={10} /> İletişim
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Representatives;