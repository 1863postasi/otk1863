import React, { useState, useEffect } from 'react';
import {
    AlertCircle, Trash2, CheckCircle, Clock, User, MessageSquare,
    Search, RefreshCcw, Monitor, ChevronRight, X
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Header } from '../components/SharedUI';
import { cn, formatDate } from '../../../lib/utils';

export const AcademicReportsPanel = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved'>('all');
    const [selectedReport, setSelectedReport] = useState<any | null>(null);

    useEffect(() => {
        const q = query(
            collection(db, "feedback"),
            where("type", "==", "academic_error")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Client side sorting (newest first)
            data.sort((a: any, b: any) => {
                const dateA = a.timestamp?.seconds || 0;
                const dateB = b.timestamp?.seconds || 0;
                return dateB - dateA;
            });

            setReports(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleToggleStatus = async (report: any) => {
        try {
            const newStatus = report.status === 'resolved' ? 'pending' : 'resolved';
            await updateDoc(doc(db, "feedback", report.id), {
                status: newStatus
            });
            if (selectedReport?.id === report.id) {
                setSelectedReport({ ...report, status: newStatus });
            }
        } catch (e) {
            console.error(e);
            alert("Durum güncellenemedi.");
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Bu raporu kalıcı olarak silmek istediğinize emin misiniz?")) {
            try {
                await deleteDoc(doc(db, "feedback", id));
                if (selectedReport?.id === id) setSelectedReport(null);
            } catch (e) {
                console.error(e);
                alert("Silme başarısız.");
            }
        }
    };

    const filteredReports = reports.filter(r => {
        const matchesSearch = r.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' ? true : r.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Header
                title="Akademik Hata Bildirimleri"
                desc="Kullanıcılar tarafından iletilen eksik veri, yanlış eşleşme veya sistem hatalarını yönetin."
            />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* List Side */}
                <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-stone-200">
                        <div className="flex bg-stone-100 p-1 rounded-xl w-full md:w-auto">
                            {(['all', 'pending', 'resolved'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize",
                                        filterStatus === status ? "bg-white shadow text-stone-900" : "text-stone-500 hover:text-stone-700"
                                    )}
                                >
                                    {status === 'all' ? 'Tümü' : status === 'pending' ? 'Bekleyen' : 'Çözüldü'}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Mesaj veya e-posta ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-stone-900 transition-all font-medium"
                            />
                            <Search size={16} className="absolute left-3.5 top-2.5 text-stone-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {loading ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-4 text-stone-400 bg-white rounded-3xl border border-stone-200 border-dashed">
                                <RefreshCcw size={40} className="animate-spin" />
                                <p className="font-bold text-sm tracking-widest uppercase">Raporlar Yükleniyor...</p>
                            </div>
                        ) : filteredReports.length === 0 ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-4 text-stone-400 bg-white rounded-3xl border border-stone-200 border-dashed">
                                <CheckCircle size={40} />
                                <p className="font-bold text-sm tracking-widest uppercase">Bildirilmiş Bir Hata Yok</p>
                            </div>
                        ) : (
                            filteredReports.map((report) => (
                                <div
                                    key={report.id}
                                    onClick={() => setSelectedReport(report)}
                                    className={cn(
                                        "group bg-white p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-xl hover:shadow-stone-200/50 flex items-start gap-4",
                                        selectedReport?.id === report.id ? "border-stone-900 ring-1 ring-stone-900" : "border-stone-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                        report.status === 'resolved' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                                    )}>
                                        {report.status === 'resolved' ? <CheckCircle size={22} /> : <Clock size={22} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                                                {report.timestamp?.toDate ? formatDate(report.timestamp.toDate().toISOString()) : 'Bilinmeyen Tarih'}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => handleDelete(report.id, e)}
                                                    className="p-1.5 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-stone-900 font-medium text-sm line-clamp-2 mb-2">{report.message}</p>
                                        <div className="flex items-center gap-3 text-xs text-stone-500 font-bold">
                                            <span className="flex items-center gap-1"><User size={12} /> {report.userEmail || 'Anonim'}</span>
                                            <span className="flex items-center gap-1"><Monitor size={12} /> {report.deviceInfo?.platform || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-stone-300 self-center" />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail Side (Sticky) */}
                <div className="lg:w-96 shrink-0">
                    <div className="sticky top-24 bg-white p-6 rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/50">
                        {selectedReport ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-serif font-black text-xl text-stone-900">Rapor Detayı</h3>
                                    <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                                        <X size={20} className="text-stone-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Bildiri Mesajı</label>
                                        <p className="text-stone-800 text-sm leading-relaxed whitespace-pre-wrap">{selectedReport.message}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                                            <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest block mb-1">Kullanıcı</label>
                                            <p className="text-stone-800 text-[11px] font-bold truncate">{selectedReport.userEmail}</p>
                                        </div>
                                        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                                            <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest block mb-1">Tarih</label>
                                            <p className="text-stone-800 text-[11px] font-bold">
                                                {selectedReport.timestamp?.toDate ? formatDate(selectedReport.timestamp.toDate().toISOString()) : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Cihaz Bilgileri</label>
                                        <div className="space-y-2">
                                            <p className="text-stone-600 text-[10px] font-bold flex justify-between"><span>Sistem:</span> <span>{selectedReport.deviceInfo?.platform}</span></p>
                                            <p className="text-stone-600 text-[10px] font-bold flex justify-between"><span>Ekran:</span> <span>{selectedReport.deviceInfo?.screen}</span></p>
                                            <p className="text-stone-400 text-[9px] break-all border-t border-stone-200/50 pt-2 font-medium">{selectedReport.deviceInfo?.userAgent}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        onClick={() => handleToggleStatus(selectedReport)}
                                        className={cn(
                                            "flex-1 py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg",
                                            selectedReport.status === 'resolved'
                                                ? "bg-amber-100 text-amber-700 shadow-amber-100/50"
                                                : "bg-emerald-500 text-white shadow-emerald-500/20"
                                        )}
                                    >
                                        {selectedReport.status === 'resolved' ? (
                                            <><Clock size={16} /> BEKLEMEYE AL</>
                                        ) : (
                                            <><CheckCircle size={16} /> ÇÖZÜLDÜ İŞARETLE</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center gap-4 text-stone-300">
                                <AlertCircle size={48} />
                                <p className="font-bold text-xs uppercase tracking-widest">Detayları görmek için<br />bir rapor seçin</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
