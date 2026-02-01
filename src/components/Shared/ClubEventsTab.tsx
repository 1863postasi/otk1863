import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Link as LinkIcon, Trash2, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadFile } from '../../lib/storage';
import { Input, TextArea, FileUploader } from '../../pages/Admin/components/SharedUI';
import { formatDate } from '../../lib/utils';

interface EventData {
    id: string;
    title: string;
    shortDescription: string;
    details: string;
    startDate: string;
    endDate: string;
    location: string;
    link: string;
    posterUrl?: string;
    clubId: string;
    clubName: string;
}

interface ClubEventsTabProps {
    clubId: string;
    clubName: string;
}

export const ClubEventsTab: React.FC<ClubEventsTabProps> = ({ clubId, clubName }) => {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        details: '',
        date: '', // YYYY-MM-DD
        startTime: '12:00',
        endTime: '14:00',
        location: '',
        link: ''
    });
    const [posterFile, setPosterFile] = useState<File | null>(null);

    // Fetch Events
    useEffect(() => {
        const q = query(collection(db, "events"), where("clubId", "==", clubId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EventData[];
            // Sort client side
            data.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
            setEvents(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [clubId]);

    const handleSave = async () => {
        if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
            alert("Lütfen başlık, tarih ve saat bilgilerini giriniz.");
            return;
        }

        setUploading(true);
        try {
            let posterUrl = "";
            if (posterFile) {
                const path = `afisler/${clubId}/${new Date().getFullYear()}`;
                const result = await uploadFile(posterFile, path);
                posterUrl = result.url;
            }

            // Construct ISO Strings
            const startDateTime = new Date(`${formData.date}T${formData.startTime}`).toISOString();
            const endDateTime = new Date(`${formData.date}T${formData.endTime}`).toISOString();

            // Link processing: Ensure absolute URL
            let processedLink = formData.link.trim();
            if (processedLink && !/^https?:\/\//i.test(processedLink)) {
                processedLink = 'https://' + processedLink;
            }

            await addDoc(collection(db, "events"), {
                clubId,
                clubName,
                title: formData.title,
                shortDescription: formData.shortDescription,
                details: formData.details,
                startDate: startDateTime,
                endDate: endDateTime,
                location: formData.location || 'Kampüs',
                link: processedLink,
                posterUrl,
                createdAt: serverTimestamp()
            });

            setIsModalOpen(false);
            setFormData({ title: '', shortDescription: '', details: '', date: '', startTime: '12:00', endTime: '14:00', location: '', link: '' });
            setPosterFile(null);
            alert("Etkinlik oluşturuldu.");

        } catch (error) {
            console.error(error);
            alert("Hata oluştu.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Bu etkinliği silmek istediğinize emin misiniz?")) {
            await deleteDoc(doc(db, "events", id));
        }
    };

    const now = new Date();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-stone-50 p-4 rounded-lg border border-stone-200">
                <div>
                    <h3 className="font-bold text-stone-800">Etkinlik Takvimi</h3>
                    <p className="text-xs text-stone-500">{events.length} kayıtlı etkinlik</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded text-xs font-bold hover:bg-stone-700 transition-colors"
                >
                    <Plus size={14} /> Yeni Etkinlik
                </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {events.length === 0 && <div className="text-center py-8 text-stone-400 text-sm italic">Henüz etkinlik eklenmemiş.</div>}
                {events.map(event => {
                    const isPast = new Date(event.endDate) < now;
                    return (
                        <div key={event.id} className={`flex gap-4 p-4 rounded-lg border ${isPast ? 'bg-stone-100 border-stone-200 opacity-70' : 'bg-white border-stone-200 shadow-sm'}`}>
                            <div className="w-16 h-16 bg-stone-200 rounded overflow-hidden shrink-0 flex items-center justify-center">
                                {event.posterUrl ? (
                                    <img src={event.posterUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <Calendar size={24} className="text-stone-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-stone-800 truncate">{event.title}</h4>
                                    {isPast && <span className="text-[10px] bg-stone-200 px-2 py-0.5 rounded text-stone-500 font-bold uppercase">Geçmiş</span>}
                                </div>
                                <div className="text-xs text-stone-500 mt-1 flex flex-wrap gap-3">
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {formatDate(event.startDate)}</span>
                                    <span className="flex items-center gap-1"><MapPin size={12}/> {event.location}</span>
                                </div>
                                <p className="text-xs text-stone-600 mt-2 line-clamp-1">{event.shortDescription}</p>
                            </div>
                            <button onClick={() => handleDelete(event.id)} className="text-stone-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>
                        </div>
                    );
                })}
            </div>

            {/* ADD EVENT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                            <h3 className="font-bold text-lg text-stone-800">Yeni Etkinlik Ekle</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-stone-400"/></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-4">
                            <Input label="Etkinlik Başlığı" placeholder="Örn: Tanışma Toplantısı" value={formData.title} onChange={(v: string) => setFormData(p => ({...p, title: v}))} />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Tarih" type="date" value={formData.date} onChange={(v: string) => setFormData(p => ({...p, date: v}))} />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input label="Başlangıç" type="time" value={formData.startTime} onChange={(v: string) => setFormData(p => ({...p, startTime: v}))} />
                                    <Input label="Bitiş" type="time" value={formData.endTime} onChange={(v: string) => setFormData(p => ({...p, endTime: v}))} />
                                </div>
                            </div>

                            <Input label="Konum" placeholder="Örn: NH 101" value={formData.location} onChange={(v: string) => setFormData(p => ({...p, location: v}))} />
                            <Input label="Takvim Açıklaması (Kısa)" placeholder="Takvimde görünecek kısa özet" value={formData.shortDescription} onChange={(v: string) => setFormData(p => ({...p, shortDescription: v}))} />
                            <TextArea label="Detaylı Açıklama" placeholder="Etkinlik detayları..." className="h-24" value={formData.details} onChange={(v: string) => setFormData(p => ({...p, details: v}))} />
                            <Input label="Kayıt / Bilgi Linki" placeholder="https://..." value={formData.link} onChange={(v: string) => setFormData(p => ({...p, link: v}))} />

                            <FileUploader 
                                label="Etkinlik Afişi" 
                                accept="image/*"
                                onFileSelect={(f) => setPosterFile(f as File)}
                                selectedFileName={posterFile?.name}
                            />
                        </div>

                        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end gap-2">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-stone-500 hover:bg-stone-200 rounded">İptal</button>
                            <button 
                                onClick={handleSave} 
                                disabled={uploading}
                                className="px-6 py-2 bg-stone-900 text-white rounded font-bold text-sm hover:bg-stone-700 transition-colors flex items-center gap-2"
                            >
                                {uploading ? <Loader2 size={16} className="animate-spin"/> : <Calendar size={16}/>}
                                {uploading ? 'Kaydediliyor...' : 'Oluştur'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};