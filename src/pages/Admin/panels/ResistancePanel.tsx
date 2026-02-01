import React, { useState, useEffect } from 'react';
import { UploadCloud, Globe, Save, Loader2, Filter, Edit3, Trash2, X } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { uploadFile } from '../../../lib/storage';
import { Header, Input, Select, TextArea, FileUploader } from '../components/SharedUI';
import { cn } from '../../../lib/utils';

const MONTHS = [
    { val: '01', label: 'Ocak' }, { val: '02', label: 'Şubat' }, { val: '03', label: 'Mart' },
    { val: '04', label: 'Nisan' }, { val: '05', label: 'Mayıs' }, { val: '06', label: 'Haziran' },
    { val: '07', label: 'Temmuz' }, { val: '08', label: 'Ağustos' }, { val: '09', label: 'Eylül' },
    { val: '10', label: 'Ekim' }, { val: '11', label: 'Kasım' }, { val: '12', label: 'Aralık' }
];

export const ResistancePanel = () => {
    const [formData, setFormData] = useState<any>({
        year: new Date().getFullYear().toString(),
        month: String(new Date().getMonth() + 1).padStart(2, '0'),
        day: '',
        type: 'file',
        title: '',
        source: '',
        url: '',
        description: '' 
    });
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filterYear, setFilterYear] = useState('all');
    
    // Pending File State
    const [pendingFiles, setPendingFiles] = useState<File | FileList | null>(null);

    // Use Client-Side Sorting to avoid Index Issues during dev
    useEffect(() => {
        const q = query(collection(db, "resistance_content")); // Basic Query
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Manual Sort: Year DESC -> Month DESC -> Day DESC
            data.sort((a: any, b: any) => {
                if (b.year !== a.year) return b.year - a.year;
                if (b.month !== a.month) return b.month.localeCompare(a.month);
                return (b.day || 0) - (a.day || 0);
            });
            setItems(data);
        });
        return () => unsubscribe();
    }, []);

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleFileSelect = (files: File | FileList) => {
        setPendingFiles(files);
    };

    const confirmFileUpload = async () => {
        if (!pendingFiles) return;

        if (!formData.year || !formData.month) {
            alert("Lütfen önce Yıl ve Ay seçiniz.");
            return;
        }

        const itemsToAdd: any[] = [];
        const fileArray = pendingFiles instanceof FileList ? Array.from(pendingFiles) : [pendingFiles];

        setLoading(true);
        try {
            for (const file of fileArray) {
                const storagePath = `direnis-arsivi/${formData.year}/${formData.month}`;
                const uploadResult = await uploadFile(file, storagePath);

                itemsToAdd.push({
                    type: file.type.includes('image') ? 'image' : file.type.includes('video') ? 'video' : 'pdf',
                    title: formData.title || file.name,
                    url: uploadResult.url,
                    fileName: file.name,
                    year: formData.year,
                    month: formData.month,
                    day: formData.day || '01',
                    description: formData.description || '',
                    source: 'Arşiv',
                    createdAt: serverTimestamp()
                });
            }
            
            for (const item of itemsToAdd) {
                await addDoc(collection(db, "resistance_content"), item);
            }
            
            alert(`${itemsToAdd.length} dosya başarıyla arşivlendi.`);
            setFormData({ ...formData, title: '', description: '' });
            setPendingFiles(null);

        } catch (error) {
            console.error(error);
            alert("Yükleme sırasında hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleLinkSave = async () => {
        if (!formData.title || !formData.url || !formData.source) {
            alert("Lütfen Başlık, URL ve Kaynak giriniz.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                type: formData.url.includes('youtube') ? 'video' : 'news',
                title: formData.title,
                url: formData.url,
                source: formData.source,
                year: formData.year,
                month: formData.month,
                day: formData.day || '01',
                description: formData.description || '',
                createdAt: serverTimestamp()
            };

            if (editingId) {
                await updateDoc(doc(db, "resistance_content", editingId), payload);
                alert("İçerik güncellendi.");
                setEditingId(null);
            } else {
                await addDoc(collection(db, "resistance_content"), payload);
                alert("Bağlantı kaydedildi.");
            }
            
            setFormData({ ...formData, title: '', url: '', source: '', description: '' });
        } catch (e) {
            console.error(e);
            alert("Hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Bu içeriği silmek istediğinize emin misiniz?")) {
            await deleteDoc(doc(db, "resistance_content", id));
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setFormData({
            year: item.year,
            month: item.month,
            day: item.day,
            type: item.type === 'image' || item.type === 'pdf' ? 'file' : 'link',
            title: item.title,
            source: item.source || '',
            url: item.url,
            description: item.description || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredItems = items.filter(i => filterYear === 'all' || i.year === filterYear);

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
            <Header title="Akıllı Tarih Arşivcisi" desc="Direniş belleğini tarih bazlı dijitalleştirin." />

            <div className={cn("p-6 rounded-xl border shadow-sm", editingId ? "bg-blue-50 border-blue-200" : "bg-white border-stone-200")}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-stone-900">{editingId ? "İçerik Düzenle" : "Yeni İçerik Ekle"}</h3>
                    {editingId && <button onClick={() => { setEditingId(null); setFormData({ ...formData, title: '' }); }} className="text-sm text-red-500 underline">Vazgeç</button>}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <Input label="Yıl (Örn: 2021)" type="number" value={formData.year} onChange={(v: string) => handleInputChange('year', v)} />
                    <Select label="Ay" options={MONTHS} value={formData.month} onChange={(v: string) => handleInputChange('month', v)} />
                    <Input label="Gün (Opsiyonel)" type="number" placeholder="Örn: 4" value={formData.day} onChange={(v: string) => handleInputChange('day', v)} />
                </div>

                <div className="flex gap-4 mb-6 border-b border-stone-100 pb-6">
                    <button 
                        onClick={() => handleInputChange('type', 'file')}
                        className={cn(
                            "flex-1 py-3 rounded-lg border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all",
                            formData.type === 'file' ? "border-stone-900 bg-stone-50 text-stone-900" : "border-transparent bg-white text-stone-400 hover:bg-stone-50"
                        )}
                    >
                        <UploadCloud size={20} /> Dosya / Klasör Yükle
                    </button>
                    <button 
                        onClick={() => handleInputChange('type', 'link')}
                        className={cn(
                            "flex-1 py-3 rounded-lg border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all",
                            formData.type === 'link' ? "border-boun-blue bg-blue-50 text-boun-blue" : "border-transparent bg-white text-stone-400 hover:bg-stone-50"
                        )}
                    >
                        <Globe size={20} /> Haber Linki / Video
                    </button>
                </div>

                {formData.type === 'file' ? (
                    <div className="space-y-4">
                        <Input label="Genel Başlık / Etiket (Opsiyonel)" placeholder="Örn: Güney Meydan Eylemi" value={formData.title} onChange={(v: string) => handleInputChange('title', v)} />
                        <TextArea label="Açıklama / Detay (Opsiyonel)" placeholder="Bu belge hakkında..." value={formData.description} onChange={(v: string) => handleInputChange('description', v)} />
                        
                        {!editingId && !pendingFiles && (
                            <div className="grid grid-cols-2 gap-4">
                                <FileUploader 
                                    label="Tekil Dosya (PDF/Resim)" 
                                    onFileSelect={handleFileSelect} 
                                />
                                <FileUploader 
                                    label="Klasör Yükle (Toplu)" 
                                    isFolder={true}
                                    onFileSelect={handleFileSelect}
                                />
                            </div>
                        )}

                        {pendingFiles && (
                            <div className="bg-white p-4 rounded border border-boun-blue/30 shadow-sm flex flex-col gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-boun-blue/10 text-boun-blue rounded">
                                        <UploadCloud size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-sm text-stone-800">
                                            {pendingFiles instanceof FileList 
                                                ? `${pendingFiles.length} Dosya Seçildi` 
                                                : pendingFiles.name}
                                        </h5>
                                        <p className="text-xs text-stone-500">Yüklemeyi onaylıyor musunuz?</p>
                                    </div>
                                    <button onClick={() => setPendingFiles(null)} className="text-stone-400 hover:text-stone-600"><X size={18}/></button>
                                </div>
                                <button 
                                    onClick={confirmFileUpload}
                                    disabled={loading}
                                    className="w-full py-2 bg-boun-blue text-white rounded font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Yüklemeyi Başlat"}
                                </button>
                            </div>
                        )}

                        {editingId && <p className="text-sm text-stone-500 italic bg-stone-100 p-2 rounded">Dosya değişimi düzenleme modunda desteklenmez. Lütfen silip yeniden yükleyin.</p>}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Input label="Haber / İçerik Başlığı" placeholder="Örn: 50 Öğrenci Gözaltına Alındı" value={formData.title} onChange={(v: string) => handleInputChange('title', v)} />
                        <TextArea label="Açıklama / Özet" placeholder="Haberin içeriği..." value={formData.description} onChange={(v: string) => handleInputChange('description', v)} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Bağlantı Adresi (URL)" placeholder="https://bianet.org/..." value={formData.url} onChange={(v: string) => handleInputChange('url', v)} />
                            <Input label="Kaynak (Mecra)" placeholder="Örn: Diken, YouTube" value={formData.source} onChange={(v: string) => handleInputChange('source', v)} />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button 
                                onClick={handleLinkSave}
                                disabled={loading}
                                className="bg-stone-900 text-white px-8 py-3 rounded-md font-bold text-sm hover:bg-stone-700 transition-colors flex items-center gap-2"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {editingId ? "Güncelle" : "Arşive Kaydet"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2"><Filter size={18}/> Mevcut İçerikler</h3>
                    <select 
                        className="bg-white border border-stone-300 rounded px-3 py-1 text-sm font-bold text-stone-600"
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                    >
                        <option value="all">Tüm Yıllar</option>
                        {[...new Set(items.map(i => i.year))].sort().reverse().map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-stone-200 text-stone-600 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-3">Tarih</th>
                                <th className="p-3">Tür</th>
                                <th className="p-3">Başlık</th>
                                <th className="p-3">Kaynak</th>
                                <th className="p-3 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 bg-white">
                            {filteredItems.map(item => (
                                <tr key={item.id} className="hover:bg-stone-50">
                                    <td className="p-3 font-mono text-stone-500">{item.day || '--'}.{item.month}.{item.year}</td>
                                    <td className="p-3"><span className="bg-stone-100 px-2 py-1 rounded text-xs font-bold">{item.type}</span></td>
                                    <td className="p-3 font-bold text-stone-800 max-w-xs truncate" title={item.title}>{item.title}</td>
                                    <td className="p-3 text-stone-500">{item.source || '-'}</td>
                                    <td className="p-3 text-right flex justify-end gap-2">
                                        <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit3 size={16}/></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-stone-400 italic">İçerik bulunamadı.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};