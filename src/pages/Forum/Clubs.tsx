import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ForumSidebar from '../../components/Forum/Sidebar';
import { Input } from '../../pages/Admin/components/SharedUI';

interface ClubData {
    id: string;
    name: string;
    shortName: string;
    description: string;
    logoUrl?: string; // Assuming we might store logos properly later, or generate avatars
    type: string;
    memberCount?: number; // Mock or future real data
    rating?: number; // Mock for now
}

const ClubReviews: React.FC = () => {
    const [clubs, setClubs] = useState<ClubData[]>([]);
    const [filteredClubs, setFilteredClubs] = useState<ClubData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('Tümü');

    const clubTypes = ['Tümü', 'Kültür', 'Spor', 'Akademik', 'Sosyal'];

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const q = query(collection(db, "clubs"), orderBy("name")); // Sort alphabetically
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Mock additional data for UI richness until backend has it
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
            result = result.filter(c => c.type === filterType); // Ensure 'type' matches exact strings in DB
        }

        setFilteredClubs(result);
    }, [searchTerm, filterType, clubs]);

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* SIDEBAR */}
                    <div className="hidden lg:block w-64 shrink-0">
                        <ForumSidebar />
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="flex-1 min-w-0">

                        {/* HEADER & FILTERS */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Kulüpler & Etkinlikler</h1>
                            <p className="text-stone-500 mb-6">Kampüsün en aktif kulüplerini keşfet, etkinlikleri oyla.</p>

                            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Kulüp ara..."
                                        className="w-full bg-stone-50 pl-10 pr-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-boun-blue/20 outline-none transition-all hidden-placeholder-on-focus"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                                    {clubTypes.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFilterType(type)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors border ${filterType === type
                                                ? 'bg-stone-900 text-white border-stone-900'
                                                : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CLUB LIST */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <div key={n} className="bg-white rounded-xl h-64 border border-stone-200 animate-pulse bg-gradient-to-br from-stone-50 to-stone-100" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredClubs.length > 0 ? (
                                    filteredClubs.map(club => (
                                        <Link
                                            key={club.id}
                                            to={`/forum/kulupler/${club.id}`}
                                            className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-boun-gold/50 transition-all duration-300 flex flex-col h-full"
                                        >
                                            {/* Header / Banner */}
                                            <div className="h-24 bg-stone-100 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-stone-900/5 group-hover:bg-boun-blue/5 transition-colors" />
                                                {/* Mock Pattern */}
                                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-stone-200/50 rounded-full blur-2xl group-hover:bg-boun-gold/20 transition-colors" />
                                            </div>

                                            <div className="p-6 flex-1 flex flex-col relative">
                                                {/* Logo Wrapper */}
                                                <div className="absolute -top-10 left-6 w-16 h-16 rounded-xl bg-white p-1 border border-stone-100 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                    <div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center font-bold text-stone-700 text-xl">
                                                        {club.shortName.substring(0, 2)}
                                                    </div>
                                                </div>

                                                <div className="mt-8 mb-4">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="font-bold text-lg text-stone-900 leading-tight group-hover:text-boun-blue transition-colors">{club.name}</h3>
                                                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                                                            <Star size={12} fill="currentColor" />
                                                            {club.rating}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-2">{club.type}</p>
                                                    <p className="text-sm text-stone-600 line-clamp-2">{club.description || 'Açıklama bulunmuyor.'}</p>
                                                </div>

                                                <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                                                    <div className="flex items-center gap-4">
                                                        <span className="flex items-center gap-1"><Users size={14} /> {club.memberCount} Üye</span>
                                                        <span className="flex items-center gap-1"><Calendar size={14} /> 5 Etkinlik</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center text-stone-500">
                                        Aradığınız kriterlere uygun kulüp bulunamadı.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubReviews;
