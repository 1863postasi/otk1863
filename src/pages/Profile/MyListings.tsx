import React from 'react';
import { Archive, CheckCircle, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate, cn } from '../../lib/utils';

interface LostItem {
    id: string;
    type: 'lost' | 'found';
    title: string;
    description: string;
    status: 'pending' | 'approved' | 'resolved';
    createdAt: any;
    imageURL?: string;

}

interface MyListingsProps {
    items: LostItem[];
    loading: boolean;
    onResolve: (id: string) => void;
}

const MyListings: React.FC<MyListingsProps> = ({ items, loading, onResolve }) => {
    if (loading) {
        return <div className="text-center py-16">Yükleniyor...</div>;
    }

    return (
        <motion.div
            key="listings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
        >
            {items.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-300">
                    <Archive size={48} className="mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-500 font-medium">Henüz bir ilan paylaşmadınız.</p>
                </div>
            )}
            {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden group">
                    <div className="p-5 flex flex-col md:flex-row gap-5">
                        <div className="w-full md:w-32 h-32 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-100">
                            {item.imageURL ? <img src={item.imageURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-300"><Archive size={24} /></div>}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border", item.status === 'approved' ? "bg-green-50 text-green-700 border-green-200" : item.status === 'resolved' ? "bg-stone-100 text-stone-500 border-stone-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
                                            {item.status === 'approved' ? 'Yayında' : item.status === 'resolved' ? 'Çözüldü' : 'Onay Bekliyor'}
                                        </span>
                                        <span className="text-xs text-stone-400 font-mono">{formatDate(item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : new Date().toISOString())}</span>
                                    </div>
                                    <h3 className="font-serif font-bold text-lg text-stone-900">{item.title}</h3>
                                </div>
                            </div>



                            {item.status !== 'resolved' && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => onResolve(item.id)}
                                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold rounded flex items-center gap-2 transition-colors"
                                    >
                                        <CheckCircle size={14} /> Çözüldü Olarak İşaretle
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

export default MyListings;
