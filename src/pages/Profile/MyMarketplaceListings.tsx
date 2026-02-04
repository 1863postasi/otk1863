import React from 'react';
import { ShoppingBag, CheckCircle, Tag, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate, cn } from '../../lib/utils';
import { Listing } from '../Forum/types';

interface MyMarketplaceListingsProps {
    items: Listing[];
    loading: boolean;
    onMarkSold: (id: string) => void;
}

const MyMarketplaceListings: React.FC<MyMarketplaceListingsProps> = ({ items, loading, onMarkSold }) => {
    if (loading) {
        return <div className="text-center py-16">Yükleniyor...</div>;
    }

    return (
        <motion.div
            key="market-listings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
        >
            {items.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-300">
                    <ShoppingBag size={48} className="mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-500 font-medium">Henüz bir ilan paylaşmadınız.</p>
                </div>
            )}

            {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col md:flex-row gap-4 p-4">
                    <div className="w-full md:w-32 h-32 bg-stone-100 rounded-lg overflow-hidden shrink-0 relative">
                        {item.images && item.images[0] ? (
                            <img src={item.images[0]} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300"><ShoppingBag size={24} /></div>
                        )}
                        {item.status === 'sold' && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white font-bold text-xs uppercase tracking-wider border border-white px-2 py-1 -rotate-12">Satıldı</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-lg text-stone-900 truncate">{item.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-stone-500">
                                    <span className="font-bold text-emerald-600">{item.price} {item.currency}</span>
                                    <span>•</span>
                                    <span>{formatDate(item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toISOString() : new Date().toISOString())}</span>
                                </div>
                            </div>
                            <button className="text-stone-400 hover:text-stone-600"><MoreHorizontal size={20} /></button>
                        </div>

                        <div className="mt-2 text-sm text-stone-600 line-clamp-2">
                            {item.description}
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            {item.status !== 'sold' && (
                                <button
                                    onClick={() => onMarkSold(item.id)}
                                    className="px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-200 transition-colors flex items-center gap-1"
                                >
                                    <CheckCircle size={14} /> Satıldı İşaretle
                                </button>
                            )}
                            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100 flex items-center gap-1">
                                <Tag size={14} /> {item.category}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

export default MyMarketplaceListings;
