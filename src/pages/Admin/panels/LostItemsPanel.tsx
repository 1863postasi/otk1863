import React, { useState, useEffect } from 'react';
import { HelpCircle, Trash2, AlertTriangle, CheckCircle, MessageCircle, User, Archive } from 'lucide-react';
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { formatDate, cn } from '../../../lib/utils';
import { Header } from '../components/SharedUI';

export const LostItemsPanel = () => {
    // No more tabs needed, pending items are auto-approved now.
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        // Query only approved (active) and resolved items
        const q = query(
            collection(db, "lost-items"),
            where("status", "in", ["approved", "resolved"])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side sort: Newest first
            data.sort((a: any, b: any) => {
                const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
                const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
                return tB - tA;
            });
            setItems(data);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (window.confirm("Durumu değiştirmek istiyor musunuz?")) {
            try {
                await updateDoc(doc(db, "lost-items", id), { status: newStatus });
            } catch (e) {
                console.error(e);
                alert("Hata oluştu.");
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Bu ilanı kalıcı olarak silmek istediğinize emin misiniz?")) {
            try {
                await deleteDoc(doc(db, "lost-items", id));
            } catch (e) {
                console.error(e);
                alert("Hata oluştu.");
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <Header title="Kayıp & Buluntu Yönetimi" desc="Yayındaki ve arşivlenmiş ilanlar." />
                <div className="bg-stone-100 px-3 py-1 rounded text-xs font-bold text-stone-500">
                    Toplam: {items.length} İlan
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {items.length === 0 && <div className="col-span-full py-12 text-center text-stone-400">İlan bulunamadı.</div>}
                {items.map(item => (
                    <div key={item.id} className={cn("bg-white p-4 rounded-lg border shadow-sm flex flex-col gap-3 group relative overflow-hidden transition-all hover:shadow-md", item.status === 'resolved' ? 'opacity-75 bg-stone-50/80 saturate-0' : '')}>

                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border",
                                    item.type === 'found' ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"
                                )}>
                                    {item.type === 'found' ? 'Buluntu' : 'Kayıp'}
                                </span>
                                <span className="text-xs text-stone-400 font-mono">
                                    {item.createdAt?.toDate ? formatDate(item.createdAt.toDate().toISOString()) : '-'}
                                </span>
                                {item.status === 'resolved' && <span className="text-[10px] bg-stone-800 text-white px-2 py-0.5 rounded font-bold flex items-center gap-1"><CheckCircle size={10} /> ÇÖZÜLDÜ</span>}
                            </div>

                            <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                {item.status !== 'resolved' ? (
                                    <button
                                        onClick={() => handleStatusUpdate(item.id, 'resolved')}
                                        className="p-1.5 text-stone-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors flex items-center gap-1 text-xs font-bold"
                                        title="Çözüldü olarak işaretle"
                                    >
                                        <CheckCircle size={16} /> <span className="hidden sm:inline">Çözüldü</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleStatusUpdate(item.id, 'approved')}
                                        className="p-1.5 text-stone-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors flex items-center gap-1 text-xs font-bold"
                                        title="Tekrar yayına al"
                                    >
                                        <Archive size={16} /> <span className="hidden sm:inline">Geri Al</span>
                                    </button>
                                )}
                                <div className="w-px h-4 bg-stone-200 mx-1" />
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Sil"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-20 h-20 bg-stone-100 rounded overflow-hidden shrink-0 border border-stone-200/50">
                                {item.imageURL ? (
                                    <img src={item.imageURL} className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300"><HelpCircle size={24} /></div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-stone-900 text-lg leading-tight mb-1">{item.title}</h4>
                                <div className="text-sm text-stone-600 mb-2 font-medium">{item.category}</div>

                                {/* Owner Info */}
                                <div className="flex flex-wrap gap-2 text-xs text-stone-500 bg-stone-50/50 p-2 rounded border border-stone-100/50">
                                    <div className="flex items-center gap-1.5 min-w-[150px]"><User size={12} className="text-stone-400" /> <span className="font-bold text-stone-700">{item.ownerName}</span> <span className="opacity-70">({item.ownerDepartment})</span></div>
                                    <div className="flex items-center gap-1.5"><MessageCircle size={12} className="text-stone-400" /> <span className="selectable">{item.contactValue}</span> <span className="opacity-70">({item.contactType})</span> {item.contactHidden && <span className="text-red-500 font-bold text-[10px] ml-1 bg-red-50 px-1 rounded">(Gizli)</span>}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};