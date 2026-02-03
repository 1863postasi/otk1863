import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, BookOpen, GraduationCap, ArrowRight, Star, Loader2, X, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '../../pages/Admin/components/SharedUI';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Course, Instructor } from './types';
import { cn } from '../../lib/utils';

// MOCK DATA - kept for structure
const MOCK_DEPARTMENTS = ["CMPE", "EE", "IE", "ME", "CE", "PHYS", "CHEM", "MATH", "HUM", "EC", "PSY", "SOC", "POLS", "HIST"];

const AcademicReviews: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'courses' | 'instructors'>('courses');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<(Course | Instructor)[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState<any>({});
    const [creating, setCreating] = useState(false);

    // Mock Search Logic (Preserved)
    useEffect(() => {
        const performSearch = async () => {
            setLoading(true);
            try {
                await new Promise(r => setTimeout(r, 400));
                let mockResults: any[] = [];
                if (activeTab === 'courses') {
                    mockResults = [
                        { id: '1', code: 'CMPE150', name: 'Introduction to Computing', department: 'CMPE', rating: 3.5, reviewCount: 124 },
                        { id: '2', code: 'PHYS101', name: 'Physics I', department: 'PHYS', rating: 2.8, reviewCount: 89 },
                        { id: '3', code: 'HUM101', name: 'Cultural Encounters I', department: 'HUM', rating: 4.2, reviewCount: 250 },
                        { id: '4', code: 'MATH101', name: 'Calculus I', department: 'MATH', rating: 3.0, reviewCount: 150 },
                        { id: '5', code: 'EC101', name: 'Introduction to Economics I', department: 'EC', rating: 3.8, reviewCount: 200 },
                        { id: '6', code: 'STS205', name: 'Science Tech & Society', department: 'STS', rating: 4.7, reviewCount: 42 },
                    ];
                    if (searchTerm) {
                        mockResults = mockResults.filter(r =>
                            r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.name.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                    }
                } else {
                    mockResults = [
                        { id: '1', name: 'Ali Hoca', department: 'CMPE', rating: 4.8, reviewCount: 45 },
                        { id: '2', name: 'Ayşe Hoca', department: 'PHYS', rating: 3.2, reviewCount: 22 },
                        { id: '3', name: 'Mehmet Hoca', department: 'HUM', rating: 4.9, reviewCount: 110 },
                    ];
                    if (searchTerm) {
                        mockResults = mockResults.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
                    }
                }
                setResults(mockResults);
            } finally {
                setLoading(false);
            }
        };
        performSearch();
    }, [searchTerm, activeTab]);

    const handleCreate = async () => {
        setCreating(true);
        try {
            const colName = activeTab === 'courses' ? "courses" : "instructors";
            await addDoc(collection(db, colName), {
                ...createFormData,
                rating: 0,
                reviewCount: 0,
                [activeTab === 'courses' ? 'instructors' : 'courses']: []
            });
            setIsCreateModalOpen(false);
            setCreateFormData({});
            alert("Başarıyla eklendi! Moderatör onayı bekleniyor.");
        } catch (e) {
            console.error(e);
            alert("Hata oluştu.");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="h-dvh flex flex-col bg-[#f5f5f4] font-sans selection:bg-stone-200">

            {/* 1. SLIM COMPACT HEADER */}
            {/* Designed to be minimally intrusive, taking up top space efficiently */}
            <div className="bg-[#f5f5f4]/80 backdrop-blur-md border-b border-stone-200 z-50 shrink-0">
                <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">

                    {/* Left: Branding & Back */}
                    <Link to="/forum" className="group flex items-center gap-3 pr-4 border-r border-stone-200/50">
                        <div className="p-2 -ml-2 rounded-full group-hover:bg-stone-200/50 transition-colors text-stone-400 group-hover:text-stone-900">
                            <ArrowRight size={18} className="rotate-180" />
                        </div>
                        <h1 className="font-serif font-bold text-lg md:text-xl text-stone-900 tracking-tight">
                            AKADEMİK
                        </h1>
                    </Link>

                    {/* Middle: Controls (Search & Type) - Responsive */}
                    <div className="flex-1 flex items-center justify-end md:justify-center gap-3 max-w-2xl mx-auto">

                        {/* Tab Switcher - Pill Style */}
                        <div className="hidden md:flex bg-stone-200/50 p-1 rounded-lg shrink-0">
                            <button
                                onClick={() => setActiveTab('courses')}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2",
                                    activeTab === 'courses' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
                                )}
                            >
                                <BookOpen size={14} />
                                Dersler
                            </button>
                            <button
                                onClick={() => setActiveTab('instructors')}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2",
                                    activeTab === 'instructors' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
                                )}
                            >
                                <GraduationCap size={16} />
                                Hocalar
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full max-w-xs md:max-w-sm group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-600 transition-colors" size={15} />
                            <input
                                type="text"
                                placeholder={activeTab === 'courses' ? "Ders kodu (CMPE150)..." : "Hoca adı..."}
                                className="w-full bg-stone-100 group-focus-within:bg-white border border-transparent group-focus-within:border-stone-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium outline-none transition-all placeholder:text-stone-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Mobile Tab Toggle (Dropdown-ish or Icon) */}
                        <button
                            className="md:hidden p-2 rounded-lg bg-stone-100 text-stone-600"
                            onClick={() => setActiveTab(activeTab === 'courses' ? 'instructors' : 'courses')}
                        >
                            {activeTab === 'courses' ? <BookOpen size={18} /> : <GraduationCap size={18} />}
                        </button>
                    </div>

                    {/* Right: Actions */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors shadow-sm"
                    >
                        <Plus size={16} />
                        <span>Yeni Ekle</span>
                    </button>
                    {/* Mobile Add Button */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-stone-900 text-white shadow-sm"
                    >
                        <Plus size={18} />
                    </button>

                </div>
            </div>

            {/* 2. DENSE GRID CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">

                    {loading ? (
                        <div className="flex justify-center pt-32 text-stone-300">
                            <Loader2 size={32} className="animate-spin" />
                        </div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        >
                            <AnimatePresence mode='popLayout'>
                                {results.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                                    >
                                        <Link
                                            to={activeTab === 'courses' ? `/forum/ders/${(item as Course).code}` : `/forum/hoca/${item.id}`}
                                            className="group block h-full bg-white border border-stone-200/60 hover:border-stone-300 rounded-xl p-4 transition-all duration-300 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 relative overflow-hidden"
                                        >
                                            {/* Top Row: Type Indicator + Rating */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                                    activeTab === 'courses'
                                                        ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                                                        : "bg-purple-50 text-purple-600 group-hover:bg-purple-100"
                                                )}>
                                                    {activeTab === 'courses' ? <BookOpen size={16} /> : <GraduationCap size={18} />}
                                                </div>

                                                <div className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-md border border-stone-100">
                                                    <Star size={10} className={item.rating >= 4 ? "text-emerald-500 fill-emerald-500" : "text-amber-500 fill-amber-500"} />
                                                    <span className="text-xs font-bold text-stone-700">{item.rating}</span>
                                                </div>
                                            </div>

                                            {/* Info Block */}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                                                        {item.department}
                                                    </span>
                                                    {activeTab === 'courses' && (
                                                        <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                                                            {(item as Course).code}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="font-serif font-bold text-stone-900 text-lg leading-tight group-hover:text-black line-clamp-1">
                                                    {activeTab === 'courses' ? (item as Course).name : (item as Instructor).name}
                                                </h3>

                                                <p className="text-xs font-medium text-stone-400 group-hover:text-stone-500 pt-1">
                                                    {item.reviewCount} değerlendirme
                                                </p>
                                            </div>

                                            {/* Hover Action Indicator */}
                                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <ArrowRight size={16} className="text-stone-300" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {!loading && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-stone-200/50 rounded-full flex items-center justify-center text-stone-400 mb-4">
                                <Search size={24} />
                            </div>
                            <h3 className="text-stone-900 font-serif font-bold text-lg">Sonuç Bulunamadı</h3>
                            <p className="text-stone-500 text-sm max-w-xs mx-auto mt-1">
                                Aradığın kriterlere uygun ders veya hoca bulunmuyor.
                            </p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="mt-4 text-xs font-bold text-stone-900 underline decoration-stone-300 hover:decoration-stone-900 underline-offset-4 transition-all"
                            >
                                Yeni Ekle
                            </button>
                        </div>
                    )}

                </div>
            </div>

            {/* CREATE MODAL (Cleaned Up) */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                                <h3 className="font-serif font-bold text-lg text-stone-800">
                                    {activeTab === 'courses' ? 'Ders Ekle' : 'Hoca Ekle'}
                                </h3>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-full hover:bg-stone-200 transition-colors">
                                    <X size={20} className="text-stone-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {activeTab === 'courses' ? (
                                    <>
                                        <Input label="Ders Kodu" placeholder="Örn: CMPE150" value={createFormData.code} onChange={(v: string) => setCreateFormData({ ...createFormData, code: v.toUpperCase() })} />
                                        <Input label="Ders Adı" placeholder="Örn: Introduction to Computing" value={createFormData.name} onChange={(v: string) => setCreateFormData({ ...createFormData, name: v })} />
                                    </>
                                ) : (
                                    <Input label="Hoca Adı Soyadı" placeholder="Örn: Ali Veli" value={createFormData.name} onChange={(v: string) => setCreateFormData({ ...createFormData, name: v })} />
                                )}

                                <div>
                                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Bölüm</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-sm font-bold outline-none focus:border-stone-900 appearance-none text-stone-700 cursor-pointer transition-colors hover:bg-stone-100"
                                            value={createFormData.department}
                                            onChange={(e) => setCreateFormData({ ...createFormData, department: e.target.value })}
                                        >
                                            <option value="">Seçiniz</option>
                                            {MOCK_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                                            <ChevronDown size={14} />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreate}
                                    disabled={creating}
                                    className="w-full mt-4 bg-stone-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-stone-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {creating && <Loader2 size={16} className="animate-spin" />}
                                    {creating ? 'Ekleniyor...' : 'Kütüphaneye Ekle'}
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
