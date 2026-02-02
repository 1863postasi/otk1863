import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Heart, MapPin, Tag, ShoppingBag, Book, Laptop, Home, Coffee } from 'lucide-react';

// MOCK DATA
const MOCK_ITEMS = [
    {
        id: 1,
        title: "Calculus 1 (Thomas Calculus) - Temiz",
        price: 450,
        currency: "₺",
        category: "kitap",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
        seller: "Ahmet Y.",
        location: "Kuzey Kampüs",
        date: "2 saat önce"
    },
    {
        id: 2,
        title: "iPad Air 5. Nesil + Pencil",
        price: 18500,
        currency: "₺",
        category: "elektronik",
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400",
        seller: "Zeynep K.",
        location: "Güney Kampüs",
        date: "5 saat önce"
    },
    {
        id: 3,
        title: "Ikea Çalışma Masası",
        price: 1200,
        currency: "₺",
        category: "ev-esbasi",
        image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=400",
        seller: "Mehmet A.",
        location: "Uçaksavar",
        date: "1 gün önce"
    },
    {
        id: 4,
        title: "Sosyolojiye Giriş Ders Notları",
        price: 0,
        currency: "₺",
        category: "notlar",
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400",
        seller: "Elif S.",
        location: "Online",
        date: "3 gün önce"
    }
];

const CATEGORIES = [
    { id: 'all', name: 'Tümü', icon: ShoppingBag },
    { id: 'kitap', name: 'Kitap & Kırtasiye', icon: Book },
    { id: 'elektronik', name: 'Elektronik', icon: Laptop },
    { id: 'ev-esbasi', name: 'Ev Eşyası', icon: Home },
    { id: 'diger', name: 'Diğer', icon: Coffee },
];

const Marketplace: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = MOCK_ITEMS.filter(item => {
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-stone-50 pb-20 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900 mb-2">Pazar Yeri</h1>
                        <p className="text-stone-500">Boğaziçi öğrencilerinden güvenli ikinci el alışveriş.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 active:scale-95">
                        <Plus size={20} />
                        <span>İlan Ver</span>
                    </button>
                </div>

                {/* SEARCH & FILTERS */}
                <div className="sticky top-20 z-30 bg-stone-50/95 backdrop-blur-sm py-2 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">

                        {/* Search Bar */}
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-hover:text-emerald-600 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Ne arıyorsun? (Kitap, masa, kulaklık...)"
                                className="w-full bg-white border border-stone-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Categories */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all border ${activeCategory === cat.id
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                            : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-200 hover:text-emerald-600'
                                        }`}
                                >
                                    <cat.icon size={18} />
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ITEMS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map(item => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                layout
                                className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            >
                                {/* Image Area */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <button className="bg-white/90 backdrop-blur p-2 rounded-full text-stone-400 hover:text-red-500 transition-colors shadow-sm">
                                            <Heart size={18} />
                                        </button>
                                    </div>
                                    {item.price === 0 && (
                                        <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                                            ÜCRETSİZ
                                        </div>
                                    )}
                                </div>

                                {/* Content Area */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-bold text-stone-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
                                            {item.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-lg font-bold text-emerald-600">
                                            {item.price === 0 ? 'Bedava' : `${item.price} ${item.currency}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 pt-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-stone-200 overflow-hidden">
                                                <img src={`https://ui-avatars.com/api/?name=${item.seller}&background=random`} alt={item.seller} />
                                            </div>
                                            <span className="font-medium">{item.seller}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin size={14} />
                                            <span>{item.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Empty State */}
                {filteredItems.length === 0 && (
                    <div className="text-center py-20">
                        <div className="bg-stone-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                            <Search size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 mb-2">Sonuç bulunamadı</h3>
                        <p className="text-stone-500">Aramanızla eşleşen ilan yok.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Marketplace;
