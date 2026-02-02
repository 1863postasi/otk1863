import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Filter,
    Search,
    MessageCircle,
    ExternalLink,
    Heart,
    MapPin,
    Tag,
    ChevronLeft,
    ChevronRight,
    ShoppingBag
} from 'lucide-react';
import { MarketplaceListing } from './types';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// --- MOCK DATA ---
const MOCK_LISTINGS: MarketplaceListing[] = [
    {
        id: 'item-1',
        title: 'Calculus 1 (Thomas) - 14. Baskı',
        content: 'Çok az kullanıldı, içinde karalama yok. Sıfır gibi.',
        price: 450,
        currency: '₺',
        condition: 'like-new',
        images: [
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'ikinci-el',
        authorId: 'user-1',
        authorName: 'Ahmet Y.',
        authorPhotoUrl: 'https://ui-avatars.com/api/?name=Ahmet+Y&background=random',
        tags: ['kitap', 'akademik'],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        likes: 12,
        replyCount: 2,
        sellerContact: '905551234567'
    },
    {
        id: 'item-2',
        title: 'IKEA Çalışma Masası ve Sandalye',
        content: 'Mezuniyet nedeniyle satıyorum. Masanın kenarında ufak bir çizik var.',
        price: 1200,
        currency: '₺',
        condition: 'good',
        images: [
            'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'ikinci-el',
        authorId: 'user-2',
        authorName: 'Zeynep K.',
        authorPhotoUrl: 'https://ui-avatars.com/api/?name=Zeynep+K&background=random',
        tags: ['ev-esya', 'mobilya'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        likes: 5,
        replyCount: 0,
        sellerContact: '905559876543'
    },
    {
        id: 'item-3',
        title: 'Apple iPad Air 4. Nesil + Pencil',
        content: 'Sorunsuz çalışıyor, pil sağlığı %90. Kılıf hediyeli.',
        price: 13500,
        currency: '₺',
        condition: 'good',
        images: [
            'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'ikinci-el',
        authorId: 'user-3',
        authorName: 'Mehmet S.',
        authorPhotoUrl: 'https://ui-avatars.com/api/?name=Mehmet+S&background=random',
        tags: ['elektronik', 'tablet'],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        likes: 24,
        replyCount: 8,
        isSold: true
    },
    {
        id: 'item-4',
        title: 'North Face Mont (M Beden)',
        content: 'Rengi bana uymadığı için satıyorum. Etiketi üzerinde.',
        price: 3500,
        currency: '₺',
        condition: 'new',
        images: [
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop'
        ],
        category: 'ikinci-el',
        authorId: 'user-4',
        authorName: 'Elif B.',
        authorPhotoUrl: 'https://ui-avatars.com/api/?name=Elif+B&background=random',
        tags: ['giyim', 'kışlık'],
        createdAt: new Date(Date.now() - 432000000).toISOString(),
        likes: 8,
        replyCount: 1
    }
];

const CONDITION_LABELS = {
    'new': { label: 'Sıfır', color: 'bg-green-100 text-green-700 border-green-200' },
    'like-new': { label: 'Yeni Gibi', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    'good': { label: 'İyi Durumda', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    'fair': { label: 'İdare Eder', color: 'bg-orange-100 text-orange-700 border-orange-200' }
};

const MarketplaceView: React.FC = () => {
    const [listings, setListings] = useState<MarketplaceListing[]>(MOCK_LISTINGS);
    const [filterOpen, setFilterOpen] = useState(false);

    return (
        <div className="space-y-6">

            {/* HERADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                        <ShoppingBag className="text-boun-blue" />
                        Kampüs Pazar Yeri
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">
                        Güvenli elden teslim, öğrenci dostu fiyatlar.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="İlanlarda ara..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-boun-blue/20 outline-none transition-all shadow-sm"
                        />
                        <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
                    </div>

                    <button
                        onClick={() => setFilterOpen(!filterOpen)}
                        className={`p-2.5 rounded-xl border transition-colors ${filterOpen ? 'bg-boun-blue/10 border-boun-blue text-boun-blue' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                    >
                        <Filter size={20} />
                    </button>

                    <button className="bg-boun-blue hover:bg-boun-blue-dark text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-boun-blue/20 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap">
                        <Tag size={18} />
                        <span className="hidden sm:inline">İlan Ver</span>
                        <span className="sm:hidden">Sat</span>
                    </button>
                </div>
            </div>

            {/* FILTERS (Collapsible) */}
            <AnimatePresence>
                {filterOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
                            <select className="form-select text-sm rounded-lg border-stone-200">
                                <option>Tüm Kategoriler</option>
                                <option>Kitap & Kırtasiye</option>
                                <option>Elektronik</option>
                                <option>Ev Eşyası</option>
                            </select>
                            <select className="form-select text-sm rounded-lg border-stone-200">
                                <option>Fiyat Aralığı</option>
                                <option>0 - 500 ₺</option>
                                <option>500 - 2000 ₺</option>
                                <option>2000 ₺ +</option>
                            </select>
                            <select className="form-select text-sm rounded-lg border-stone-200">
                                <option>Durum</option>
                                <option>Sıfır</option>
                                <option>Yeni Gibi</option>
                            </select>
                            <button className="text-sm text-stone-500 hover:text-stone-900 font-medium">
                                Filtreleri Temizle
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item, index) => (
                    <ProductCard key={item.id} item={item} index={index} />
                ))}
            </div>

            {listings.length === 0 && (
                <div className="text-center py-20 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50">
                    <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-stone-900">İlan Bulunamadı</h3>
                    <p className="text-stone-500 max-w-sm mx-auto mt-2">
                        Aradığın kriterlere uygun ilan yok. İlk ilanı sen vermek ister misin?
                    </p>
                </div>
            )}
        </div>
    );
};

// --- SUB COMPONENTS ---

const ProductCard: React.FC<{ item: MarketplaceListing; index: number }> = ({ item, index }) => {
    const [currentImage, setCurrentImage] = useState(0);

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (item.images && item.images.length > 1) {
            setCurrentImage((prev) => (prev + 1) % item.images!.length);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (item.images && item.images.length > 1) {
            setCurrentImage((prev) => (prev - 1 + item.images!.length) % item.images!.length);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500 overflow-hidden flex flex-col h-full relative"
        >
            {/* SOLD OVERLAY */}
            {item.isSold && (
                <div className="absolute inset-0 z-20 bg-stone-900/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <div className="bg-red-500 text-white px-6 py-2 rounded-full font-bold transform -rotate-12 shadow-xl border-2 border-white">
                        SATILDI
                    </div>
                </div>
            )}

            {/* IMAGE CAROUSEL */}
            <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImage}
                        src={item.images?.[currentImage]}
                        alt={item.title}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full object-cover"
                    />
                </AnimatePresence>

                {/* Price Tag */}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-white/50 z-10">
                    <span className="font-bold text-lg text-stone-900">
                        {item.price} {item.currency}
                    </span>
                </div>

                {/* Like Button */}
                <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-stone-400 hover:text-red-500 hover:bg-white transition-all z-10 shadow-sm">
                    <Heart size={18} />
                </button>

                {/* Navigation Dots/Arrows */}
                {item.images && item.images.length > 1 && (
                    <>
                        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/50 hover:bg-white text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/50 hover:bg-white text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={16} />
                        </button>
                        <div className="absolute bottom-3 right-3 flex gap-1">
                            {item.images.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImage ? 'bg-white' : 'bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* CONTENT */}
            <div className="p-4 flex flex-col flex-1">
                {/* Meta */}
                <div className="flex items-center justify-between mb-2">
                    <div className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border", CONDITION_LABELS[item.condition].color)}>
                        {CONDITION_LABELS[item.condition].label}
                    </div>
                    <span className="text-xs text-stone-400">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: tr })}
                    </span>
                </div>

                <h3 className="font-bold text-stone-900 mb-1 leading-snug group-hover:text-boun-blue transition-colors line-clamp-1">
                    {item.title}
                </h3>

                <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-1">
                    {item.content}
                </p>

                {/* Footer User & Action */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        <img src={item.authorPhotoUrl} alt={item.authorName} className="w-6 h-6 rounded-full bg-stone-100" />
                        <span className="text-xs font-medium text-stone-600 truncate max-w-[80px]">
                            {item.authorName}
                        </span>
                    </div>

                    <a
                        href={`https://wa.me/${item.sellerContact}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MessageCircle size={14} />
                        <span>WhatsApp</span>
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

export default MarketplaceView;
