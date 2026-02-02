import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, BookOpen, GraduationCap, ArrowRight, Star, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input, Select } from '../../pages/Admin/components/SharedUI'; // Reusing admin UI components
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Course, Instructor } from './types';

// Mock Data for Initial Population / Fallback
const MOCK_DEPARTMENTS = ["CMPE", "EE", "IE", "ME", "CE", "PHYS", "CHEM", "MATH", "HUM", "EC", "PSY", "SOC", "POLS", "HIST"];

const AcademicReviews: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'courses' | 'instructors'>('courses');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false); // Real search loading state

    // Data State
    const [results, setResults] = useState<(Course | Instructor)[]>([]);

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState<any>({});
    const [creating, setCreating] = useState(false);

    // Simulated Search Effect (would be algolia or firestore startAt in production)
    useEffect(() => {
        const performSearch = async () => {
            // Ideally debounce this
            setLoading(true);
            try {
                // For MVP, we'll fetch 'popular' if empty, or filter local mock / limited query if typed
                // Here we just use mock data to demonstrate the UI flow

                await new Promise(r => setTimeout(r, 600)); // Fake delay

                let mockResults: any[] = [];
                if (activeTab === 'courses') {
                    mockResults = [
                        { id: '1', code: 'CMPE150', name: 'Introduction to Computing', department: 'CMPE', rating: 3.5, reviewCount: 124 },
                        { id: '2', code: 'PHYS101', name: 'Physics I', department: 'PHYS', rating: 2.8, reviewCount: 89 },
                        { id: '3', code: 'HUM101', name: 'Cultural Encounters I', department: 'HUM', rating: 4.2, reviewCount: 250 },
                        { id: '4', code: 'MATH101', name: 'Calculus I', department: 'MATH', rating: 3.0, reviewCount: 150 },
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
                        { id: '3', name: 'Mehmet Hoca', department: 'HUM', rating: 4.5, reviewCount: 110 },
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
            // Firestore Add Logic
            if (activeTab === 'courses') {
                await addDoc(collection(db, "courses"), {
                    ...createFormData,
                    rating: 0,
                    reviewCount: 0,
                    instructors: []
                });
            } else {
                await addDoc(collection(db, "instructors"), {
                    ...createFormData,
                    rating: 0,
                    reviewCount: 0,
                    courses: []
                });
            }
            setIsCreateModalOpen(false);
            setCreateFormData({});
            alert("Başarıyla eklendi! (Onay sürecinden sonra listelenecektir)"); // Fake feedback
        } catch (e) {
            console.error(e);
            alert("Hata");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="w-full">

                    {/* HERO / SEARCH HEADER */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm text-center mb-8 relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-boun-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-boun-gold/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-3 relative z-10">Akademik Değerlendirme</h1>
                        <p className="text-stone-500 mb-8 max-w-xl mx-auto relative z-10">
                            Dersler ve hocalar hakkında tecrübelerini paylaş, dönemlik programını şansa bırakma.
                        </p>

                        {/* TABS */}
                        <div className="flex justify-center mb-6 relative z-10">
                            <div className="bg-stone-100 p-1 rounded-lg inline-flex">
                                <button
                                    onClick={() => setActiveTab('courses')}
                                    className={`px-6 py-2 rounded-md text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${activeTab === 'courses' ? 'bg-white text-stone-900 ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-700'}`}
                                >
                                    <BookOpen size={16} /> Dersler
                                </button>
                                <button
                                    onClick={() => setActiveTab('instructors')}
                                    className={`px-6 py-2 rounded-md text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${activeTab === 'instructors' ? 'bg-white text-stone-900 ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-700'}`}
                                >
                                    <GraduationCap size={18} /> Hocalar
                                </button>
                            </div>
                        </div>

                        {/* SEARCH INPUT */}
                        <div className="max-w-xl mx-auto relative z-10">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder={activeTab === 'courses' ? "Ders kodu veya adı (örn: CMPE 150)..." : "Hoca adı soyadı..."}
                                    className="w-full bg-stone-50 pl-12 pr-4 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-boun-blue/20 focus:border-boun-blue/50 outline-none transition-all shadow-sm text-lg font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 size={20} className="animate-spin text-stone-400" /></div>}
                            </div>
                        </div>
                    </div>

                    {/* RESULTS GRID */}
                    <div className="mb-4 flex justify-between items-center px-2">
                        <h2 className="font-bold text-stone-900 text-lg">
                            {searchTerm ? 'Arama Sonuçları' : (activeTab === 'courses' ? 'Popüler Dersler' : 'Öne Çıkan Hocalar')}
                        </h2>
                        {!searchTerm && (
                            <button className="text-xs font-bold text-boun-blue hover:underline">Tümünü Gör</button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence mode='popLayout'>
                            {results.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={item.id}
                                >
                                    <Link
                                        to={activeTab === 'courses' ? `/forum/ders/${(item as Course).code}` : `/forum/hoca/${item.id}`}
                                        className="group block bg-white p-5 rounded-xl border border-stone-200 hover:border-boun-gold hover:shadow-md transition-all relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="bg-stone-100 px-2 py-0.5 rounded text-xs font-bold text-stone-500 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                                                        {item.department}
                                                    </span>
                                                    {activeTab === 'courses' && <span className="text-xs font-bold text-stone-400">{(item as Course).code}</span>}
                                                </div>
                                                <h3 className="font-bold text-lg text-stone-800 leading-tight">
                                                    {activeTab === 'courses' ? (item as Course).name : (item as Instructor).name}
                                                </h3>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className={`flex items-center gap-1 font-bold text-lg ${item.rating >= 4 ? 'text-green-600' : item.rating >= 3 ? 'text-amber-500' : 'text-red-500'}`}>
                                                    {item.rating} <Star size={14} fill="currentColor" />
                                                </div>
                                                <div className="text-xs text-stone-400">{item.reviewCount} yorum</div>
                                            </div>
                                        </div>
                                        {activeTab === 'instructors' && (
                                            <div className="text-sm text-stone-500 truncate mt-2">
                                                Son dersler: CMPE150, CMPE451...
                                            </div>
                                        )}
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* EMPTY / CREATE STATE */}
                        {results.length === 0 && !loading && (
                            <div className="col-span-full py-12 text-center text-stone-400">
                                <p className="mb-4">Aradığın sonuç bulunamadı.</p>
                            </div>
                        )}

                        {/* ALWAYS SHOW CREATE OPTION IF SEARCHING */}
                        {searchTerm && (
                            <motion.button
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                onClick={() => setIsCreateModalOpen(true)}
                                className="col-span-full md:col-span-1 p-5 rounded-xl border-2 border-dashed border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900 hover:bg-white transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer h-full min-h-[120px]"
                            >
                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white transition-colors">
                                    <Plus size={20} />
                                </div>
                                <div className="text-sm font-bold">
                                    {activeTab === 'courses' ? 'Aradığın Ders Yok mu?' : 'Aradığın Hoca Yok mu?'}
                                </div>
                                <div className="text-xs">Yeni profil oluşturmak için tıkla</div>
                            </motion.button>
                        )}
                    </div>

                </div>

                {/* CREATE MODAL */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg text-stone-900">
                                    {activeTab === 'courses' ? 'Yeni Ders Ekle' : 'Yeni Hoca Ekle'}
                                </h3>
                                <button onClick={() => setIsCreateModalOpen(false)}><X size={20} className="text-stone-400 hover:text-stone-900" /></button>
                            </div>

                            <div className="space-y-4">
                                {activeTab === 'courses' ? (
                                    <>
                                        <Input label="Ders Kodu" placeholder="Örn: CMPE150" value={createFormData.code} onChange={(v: string) => setCreateFormData({ ...createFormData, code: v.toUpperCase() })} />
                                        <Input label="Ders Adı" placeholder="Örn: Introduction to Computing" value={createFormData.name} onChange={(v: string) => setCreateFormData({ ...createFormData, name: v })} />
                                    </>
                                ) : (
                                    <Input label="Hoca Adı Soyadı" placeholder="Örn: Ali Veli" value={createFormData.name} onChange={(v: string) => setCreateFormData({ ...createFormData, name: v })} />
                                )}

                                {/* Dept Select */}
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Bölüm / Departman</label>
                                    <select
                                        className="w-full bg-stone-50 border border-stone-200 rounded p-2 text-sm font-bold outline-none focus:border-stone-900"
                                        value={createFormData.department}
                                        onChange={(e) => setCreateFormData({ ...createFormData, department: e.target.value })}
                                    >
                                        <option value="">Seçiniz...</option>
                                        {MOCK_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>

                                <div className="bg-amber-50 p-3 rounded text-amber-800 text-xs flex gap-2">
                                    <span className="font-bold">Not:</span>
                                    <span>Eklediğiniz içerik moderatör onayından geçtikten sonra herkes tarafından görülebilir hale gelecektir.</span>
                                </div>

                                <button
                                    onClick={handleCreate}
                                    disabled={creating}
                                    className="w-full bg-stone-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-stone-700 transition-colors disabled:opacity-50"
                                >
                                    {creating ? 'Ekleniyor...' : 'Oluştur ve Devam Et'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcademicReviews;

