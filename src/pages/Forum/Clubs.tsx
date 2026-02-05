import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Users, Star, ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Club } from './types';
import { cn } from '../../lib/utils';

export default function Clubs() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tümü");
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);

    const categories = ["Tümü", "Kültür & Sanat", "Spor", "Akademik", "Sosyal Sorumluluk", "Teknoloji"];

    useEffect(() => {
        const fetchClubs = async () => {
            // 1. Try to load from cache first
            const cachedData = localStorage.getItem("clubs_cache");
            if (cachedData) {
                try {
                    const { data, timestamp } = JSON.parse(cachedData);
                    // Valid cache (e.g. 1 hour) - Optional: logic to expire
                    setClubs(data);
                    setLoading(false); // Show content immediately
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }

            try {
                // 2. Fetch fresh data
                const q = query(collection(db, "clubs"), orderBy("name"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Club[];

                // 3. Update state and cache
                setClubs(data);
                localStorage.setItem("clubs_cache", JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            } catch (error) {
                console.error("Error fetching clubs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClubs();
    }, []);

    const filteredClubs = clubs.filter(club => {
        const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            club.shortName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "Tümü" || club.type === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-stone-50 pb-20">
            {/* Header & Filter Section */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div>
                            <h1 className="text-2xl font-bold font-serif text-stone-900">Kulüpler</h1>
                            <p className="text-sm text-stone-500">Boğaziçi'nin yaşayan renkleri.</p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-boun-blue transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Kulüp ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-stone-100 border-none rounded-full text-sm font-medium focus:ring-2 focus:ring-boun-blue/20 focus:bg-white transition-all placeholder:text-stone-400"
                            />
                        </div>
                    </div>

                    {/* Horizontal Scrollable Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                                    selectedCategory === cat
                                        ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Clubs Grid */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 animate-pulse">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-stone-200 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
                    >
                        <AnimatePresence>
                            {filteredClubs.map(club => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    key={club.id}
                                >
                                    <Link to={`/forum/kulupler/${club.id}`} className="block group h-full relative">
                                        <div className="h-full bg-white rounded-xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md hover:border-boun-gold/50 transition-all duration-300 flex flex-col">
                                            {/* Card Header / Banner Area */}
                                            <div className="aspect-[2/1] bg-stone-100 relative overflow-hidden">
                                                {club.bannerUrl ? (
                                                    <img src={club.bannerUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                ) : (
                                                    <div className="w-full h-full bg-stone-100 flex items-center justify-center opacity-20">
                                                        <div className="w-full h-full bg-[radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                                    </div>
                                                )}

                                                {/* Category Badge */}
                                                <div className="absolute top-2 right-2">
                                                    <span className="bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm text-stone-800 border border-stone-100">
                                                        {club.type}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card Content using Negative Margin specifically for the logo */}
                                            <div className="px-4 pb-4 flex-1 flex flex-col relative">
                                                {/* Logo - Floating Effect */}
                                                <div className="-mt-8 mb-2 self-start rounded-xl p-1 bg-white shadow-sm border border-stone-100 z-10">
                                                    <div className="w-12 h-12 rounded-lg bg-stone-50 overflow-hidden flex items-center justify-center border border-stone-100">
                                                        {club.logoUrl ? (
                                                            <img src={club.logoUrl} alt={club.shortName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-black text-stone-300">{club.shortName.substring(0, 2)}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <h3 className="font-bold text-stone-900 text-sm leading-tight mb-1 group-hover:text-boun-blue transition-colors line-clamp-2">
                                                        {club.name}
                                                    </h3>
                                                    <p className="text-[10px] font-bold text-stone-400 mb-2">{club.shortName}</p>
                                                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                                                        {club.description || "Kulüp açıklaması bulunmuyor."}
                                                    </p>
                                                </div>

                                                {/* Footer Stats */}
                                                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-medium">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        <span>Kuzey Kampüs</span>
                                                    </div>
                                                    {club.founded && (
                                                        <span>Est. {club.founded}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
