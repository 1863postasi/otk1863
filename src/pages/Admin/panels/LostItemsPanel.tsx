import React, { useState, useEffect } from 'react';
import { HelpCircle, Trash2, AlertTriangle, CheckCircle, MessageCircle, User } from 'lucide-react';
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { formatDate, cn } from '../../../lib/utils';
import { Header } from '../components/SharedUI';

export const LostItemsPanel = () => {
    const [lostTab, setLostTab] = useState<'pending' | 'active'>('pending');
    const [items, setItems] = useState<any[]>([]);
    const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

    useEffect(() => {
        let q;
        if (lostTab === 'pending') {
            q = query(collection(db, "lost-items"), where("status", "==", "pending"));
        } else {
            q = query(collection(db, "lost-items"), where("status", "in", ["approved", "resolved"]));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort: Newest first
            data.sort((a: any, b: any) => {
                const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
                const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
                return tB - tA;
            });
            setItems(data);
        });

        return () => unsubscribe();
    }, [lostTab]);

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
                <Header title="Kayıp & Buluntu Yönetimi" desc="İlanları onaylayın ve gelen notları denetleyin." />
                <div className="flex bg-stone-200 p-1 rounded-lg">
                    <button
                        onClick={() => setLostTab('pending')}
                        className={cn(
                            "px-4 py-2 rounded-md text-xs font-bold transition-all",
                            lostTab === 'pending' ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-700"
                        )}
                    >
                        Onay Bekleyenler ({items.length})
                    </button>
                    <button
                        onClick={() => setLostTab('active')}
                        className={cn(
                            "px-4 py-2 rounded-md text-xs font-bold transition-all",
                            lostTab === 'active' ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-700"
                        )}
                    >
                        Yayındakiler/Arşiv
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {items.length === 0 && <div className="col-span-full py-12 text-center text-stone-400">İlan bulunamadı.</div>}
                {items.map(item => (
                    <div key={item.id} className={cn("bg-white p-4 rounded-lg border shadow-sm flex flex-col gap-3 group relative overflow-hidden", item.status === 'resolved' ? 'opacity-70 bg-stone-50' : '')}>

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
                                {item.status === 'resolved' && <span className="text-[10px] bg-stone-200 px-2 py-0.5 rounded font-bold text-stone-600">ÇÖZÜLDÜ</span>}
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-20 h-20 bg-stone-100 rounded overflow-hidden shrink-0 border border-stone-200">
                                {item.imageURL ? (
                                    <img src={item.imageURL} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300"><HelpCircle size={24} /></div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-stone-900 text-lg">{item.title}</h4>
                                <div className="text-sm text-stone-600 mb-1">{item.category}</div>

                                {/* Owner Info */}
                                <div className="flex flex-wrap gap-4 text-xs text-stone-500 mt-2 bg-stone-50 p-2 rounded border border-stone-100">
                                    <div className="flex items-center gap-1"><User size={12} /> <b>Sahibi:</b> {item.ownerName} ({item.ownerDepartment})</div>
                                    <div><b>İletişim:</b> {item.contactValue} ({item.contactType}) {item.contactHidden && <span className="text-red-500 font-bold">(Gizli)</span>}</div>
                                </div>
                            </div>
                        </div>



                        <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 mt-2">
                            {lostTab === 'pending' ? (
                                <button onClick={() => handleStatusUpdate(item.id, 'approved')} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700 transition-colors shadow-sm">Yayına Al</button>
                            ) : (
                                item.status !== 'resolved' && (
                                    <button onClick={() => handleStatusUpdate(item.id, 'resolved')} className="px-4 py-2 bg-stone-100 text-stone-600 text-sm font-bold rounded hover:bg-stone-200 transition-colors">Çözüldü İşaretle</button>
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};