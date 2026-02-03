import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Users, Calendar, ArrowRight, Instagram, Globe, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';

interface ClubData {
    id: string;
    name: string;
    shortName: string;
    description: string;
    logoUrl?: string;
    coverUrl?: string; // Added coverUrl support if available, logic to mock if not
    type: string;
    memberCount?: number;
    rating?: number;
}

const ClubReviews: React.FC = () => {
    const [clubs, setClubs] = useState<ClubData[]>([]);
    const [filteredClubs, setFilteredClubs] = useState<ClubData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('Tümü');

    const clubTypes = ['Tümü', 'Kültür', 'Spor', 'Akademik', 'Sosyal', 'Kariyer'];

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const q = query(collection(db, "clubs"), orderBy("name"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    rating: (4 + Math.random()).toFixed(1),
                    memberCount: Math.floor(Math.random() * 200) + 20
                })) as unknown as ClubData[];
                setClubs(data);
                setFilteredClubs(data);
            } catch (error) {
                console.error("Error fetching clubs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClubs();
    }, []);

    useEffect(() => {
        let result = clubs;

        if (searchTerm) {
            result = result.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.shortName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterType !== 'Tümü') {
            result = result.filter(c => c.type === filterType);
        }

        setFilteredClubs(result);
    }, [searchTerm, filterType, clubs]);

    return (
        <div className="min-h-screen h-screen flex flex-col bg-[#f5f5f4] font-sans overflow-hidden">

            {/* 1. SLIM HEADER & FILTER BAR */}
            <div className="bg-white/80 backdrop-blur-md border-b border-stone-200 z-20 shrink-0">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">

                    <div className="flex flex-col md:flex-row items-center gap-4 justify-between">

                        {/* Left: Back & Title */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Link to="/forum" className="p-2 -ml-2 text-stone-400 hover:text-stone-700 transition-colors rounded-full hover:bg-stone-100">
                                <ArrowRight size={20} className="rotate-180" />
                            </Link>
                            <div>
                                <h1 className="font-serif text-xl md:text-2xl font-bold text-stone-900 leading-none">
                                    KULÜPLER
                                </h1>
                                <p className="text-[10px] md:text-xs font-medium text-stone-400 uppercase tracking-widest hidden md:block">
                                    Aktiviteler & Topluluklar
                                </p>
                            </div>
                        </div>

                        {/* Center/Right: Search & Filters */}
                        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto md:overflow-visible pb-1 md:pb-0 scrollbar-hide">

                            {/* Search */}
                            <div className="relative group w-full md:w-64 shrink-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-600 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Kulüp ara..."
                                    className="w-full bg-stone-100/50 group-focus-within:bg-white border border-stone-200 focus:border-stone-400 rounded-lg pl-10 pr-4 py-2 text-sm font-medium outline-none transition-all placeholder:text-stone-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Divider */}
                            <div className="h-6 w-px bg-stone-200 hidden md:block" />

                            {/* Filter Tabs */}
                            <div className="flex gap-1">
                                {clubTypes.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                                            filterType === type
                                                ? "bg-stone-900 text-white shadow-sm"
                                                : "text-stone-500 hover:bg-stone-100 hover:text-stone-700"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT (Scrollable) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                <div className="max-w-7xl mx-auto">

                    {loading ? (
                        <div className="flex justify-center pt-20 text-stone-300">
                            <Loader2 size={32} className="animate-spin" />
                        </div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            <AnimatePresence mode='popLayout'>
                                {filteredClubs.length > 0 ? (
                                    filteredClubs.map((club, idx) => (
                                        <motion.div
                                            key={club.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <Link
                                                to={`/forum/kulupler/${club.id}`}
                                                className="group bg-white rounded-xl border border-stone-200 hover:border-stone-300 overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 flex flex-col h-full relative"
                                            >
                                                {/* Banner Image (Gradient fallback) */}
                                                <div className="h-28 bg-gradient-to-br from-stone-100 to-stone-200 relative overflow-hidden group-hover:h-32 transition-all duration-500">
                                                    <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors" />
                                                    {/* Abstract decorative elements */}
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />

                                                    {/* Rating Badge */}
                                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-stone-800 flex items-center gap-1 shadow-sm">
                                                        <Star size={10} className="fill-amber-400 text-amber-400" />
                                                        {club.rating}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-5 flex-1 flex flex-col pt-12 relative">

                                                    {/* Floating Logo */}
                                                    <div className="absolute -top-8 left-5 w-16 h-16 rounded-xl bg-white p-1 border border-stone-100 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform duration-300 z-10">
                                                        <div className="w-full h-full bg-stone-50 rounded-lg flex items-center justify-center font-serif font-bold text-stone-700 text-lg border border-stone-100">
                                                            {club.shortName ? club.shortName.substring(0, 3) : '??'}
                                                        </div>
                                                    </div>

                                                    {/* Text Info */}
                                                    <div className="mb-4">
                                                        <h3 className="font-serif font-bold text-lg text-stone-900 leading-tight group-hover:text-black mb-1 line-clamp-1">
                                                            {club.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                                                                {club.type}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed h-10">
                                                            {club.description || 'Bu kulüp için henüz açıklama girilmemiş.'}
                                                        </p>
                                                    </div>

                                                    {/* Footer stats */}
                                                    <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center gap-1 group-hover:text-stone-600 transition-colors">
                                                                <Users size={12} /> {club.memberCount}
                                                            </span>
                                                            <span className="flex items-center gap-1 group-hover:text-stone-600 transition-colors">
                                                                <Calendar size={12} /> 3 Etkinlik
                                                            </span>
                                                        </div>
                                                        <div className="group-hover:translate-x-1 transition-transform">
                                                            <ArrowRight size={14} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="col-span-full py-20 text-center"
                                    >
                                        <div className="inline-flex p-6 rounded-full bg-stone-100 text-stone-300 mb-4">
                                            <Search size={48} strokeWidth={1} />
                                        </div>
                                        <h3 className="font-serif text-lg font-bold text-stone-700 mb-1">Sonuç Bulunamadı</h3>
                                        <p className="text-stone-400 text-sm">Arama kriterlerinizi değiştirerek tekrar deneyiniz.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClubReviews;
