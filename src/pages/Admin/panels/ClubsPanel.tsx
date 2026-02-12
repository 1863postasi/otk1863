import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, ArrowLeft, FolderOpen, Link as LinkIcon, File, MapPin, Loader2, UploadCloud, X, Calendar, Info } from 'lucide-react';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { uploadFile } from '../../../lib/storage';
import { Header, Input, TextArea, FileUploader, ActionButtons } from '../components/SharedUI';
import { cn } from '../../../lib/utils';
import { ClubEventsTab } from '../../../components/Shared/ClubEventsTab';

export const ClubsPanel = ({ setSelectedItemId }: { setSelectedItemId?: (id: string | null) => void }) => {
    // Internal State for View Management
    const [clubView, setClubView] = useState<'list' | 'create' | 'edit'>('list');
    const [activeTab, setActiveTab] = useState<'info' | 'events'>('info'); // New Tab State

    const [formData, setFormData] = useState<any>({ contents: [] });
    const [clubs, setClubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Content Upload State
    const [contentUploading, setContentUploading] = useState(false);
    const [contentTab, setContentTab] = useState<'file' | 'link'>('file');
    const [newContentData, setNewContentData] = useState({ title: '', date: '', desc: '', url: '' });

    // Pending File State (For Confirmation)
    const [pendingFiles, setPendingFiles] = useState<File | FileList | null>(null);

    // Fetch Clubs from Firestore
    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const q = query(collection(db, "clubs"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setClubs(data);
            } catch (error) {
                console.error("Clubs fetch error:", error);
            }
        };
        fetchClubs();
    }, []);

    // When edit mode triggers
    useEffect(() => {
        if (clubView === 'edit' && editingId) {
            const club = clubs.find(c => c.id === editingId);
            if (club) {
                setFormData({
                    clubName: club.name,
                    clubShort: club.shortName,
                    clubFull: club.fullName || club.name,
                    clubCategories: club.categories || (club.type ? [club.type] : []),
                    clubFounded: club.founded,
                    clubWeb: club.website,
                    address: club.address || '',
                    instagram: club.instagram || '',
                    twitter: club.twitter || '',
                    clubDesc: club.description,
                    locX: club.location?.x || 50,
                    locY: club.location?.y || 50,
                    logoUrl: club.logoUrl,
                    bannerUrl: club.bannerUrl,
                    contents: club.contents || []
                });
            }
            setActiveTab('info'); // Reset to info tab on open
        } else if (clubView === 'create') {
            setFormData({ contents: [], clubCategories: [] });
            setLogoFile(null);
            setBannerFile(null);
            setEditingId(null);
            setActiveTab('info');
        }
        setPendingFiles(null);
    }, [clubView, editingId, clubs]);

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        handleInputChange('locX', Math.round(x));
        handleInputChange('locY', Math.round(y));
    };

    // --- CONTENT HANDLING (ARCHIVE) ---

    const handleFileSelect = (files: File | FileList) => {
        setPendingFiles(files);
    };

    const confirmUpload = async () => {
        if (!pendingFiles) return;

        // 1. Validation
        if (!formData.clubShort) {
            alert("Lütfen önce Kulüp Kısaltmasını girin (Dosya yolu için gereklidir).");
            return;
        }
        if (!newContentData.title || !newContentData.date) {
            alert("Lütfen içerik için Başlık ve Tarih (Yıl) giriniz.");
            return;
        }

        setContentUploading(true);
        try {
            const clubShort = formData.clubShort.toUpperCase();
            const itemsToAdd: any[] = [];
            const files = pendingFiles;

            // 2. Upload Logic
            if (files instanceof FileList) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const relativePath = file.webkitRelativePath || file.name;
                    const folderStructure = relativePath.includes('/') ? relativePath.substring(0, relativePath.lastIndexOf('/')) : '';
                    const storageFolder = `kulupler-arsivi/${clubShort}${folderStructure ? '/' + folderStructure : ''}`;

                    const uploadResult = await uploadFile(file, storageFolder);

                    itemsToAdd.push({
                        type: 'file',
                        subType: file.type.includes('image') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'doc',
                        title: newContentData.title,
                        fileName: file.name,
                        folderName: newContentData.title,
                        date: newContentData.date,
                        description: newContentData.desc,
                        url: uploadResult.url,
                        size: uploadResult.size
                    });
                }
            } else {
                const path = `kulupler-arsivi/${clubShort}`;
                const uploadResult = await uploadFile(files as File, path);

                itemsToAdd.push({
                    type: 'file',
                    subType: (files as File).type.includes('image') ? 'image' : (files as File).type.includes('pdf') ? 'pdf' : 'doc',
                    title: newContentData.title,
                    date: newContentData.date,
                    description: newContentData.desc,
                    url: uploadResult.url,
                    size: uploadResult.size
                });
            }

            // 3. Save Logic
            if (editingId) {
                const clubRef = doc(db, "clubs", editingId);
                for (const item of itemsToAdd) {
                    await updateDoc(clubRef, {
                        contents: arrayUnion(item)
                    });
                }
                setFormData((prev: any) => ({
                    ...prev,
                    contents: [...(prev.contents || []), ...itemsToAdd]
                }));
                alert("Dosyalar yüklendi ve kulübe eklendi.");
            } else {
                const updatedContents = [...(formData.contents || []), ...itemsToAdd];
                handleInputChange('contents', updatedContents);
                alert("Dosyalar listeye eklendi. (Kulübü kaydetmeyi unutmayın)");
            }

            setNewContentData({ title: '', date: '', desc: '', url: '' });
            setPendingFiles(null); // Clear pending

        } catch (e) {
            console.error(e);
            alert("Dosya yüklenirken hata oluştu.");
        } finally {
            setContentUploading(false);
        }
    };

    const handleLinkAdd = async () => {
        if (!newContentData.title || !newContentData.date || !newContentData.url) {
            alert("Lütfen Başlık, Tarih ve Bağlantı URL giriniz.");
            return;
        }

        const newItem = {
            type: 'link',
            subType: newContentData.url.includes('youtube') || newContentData.url.includes('youtu.be') ? 'video' : 'link',
            title: newContentData.title,
            date: newContentData.date,
            description: newContentData.desc,
            url: newContentData.url
        };

        if (editingId) {
            try {
                setLoading(true);
                await updateDoc(doc(db, "clubs", editingId), {
                    contents: arrayUnion(newItem)
                });
                setFormData((prev: any) => ({
                    ...prev,
                    contents: [...(prev.contents || []), newItem]
                }));
                alert("Bağlantı eklendi.");
            } catch (e) {
                console.error(e);
                alert("Hata oluştu.");
            } finally {
                setLoading(false);
            }
        } else {
            const updatedContents = [...(formData.contents || []), newItem];
            handleInputChange('contents', updatedContents);
        }

        setNewContentData({ title: '', date: '', desc: '', url: '' });
    };

    const handleDeleteContent = async (index: number) => {
        const itemToDelete = formData.contents[index];

        if (confirm("Bu içeriği listeden silmek istediğinize emin misiniz?")) {
            if (editingId) {
                try {
                    await updateDoc(doc(db, "clubs", editingId), {
                        contents: arrayRemove(itemToDelete)
                    });
                    const updatedContents = [...formData.contents];
                    updatedContents.splice(index, 1);
                    handleInputChange('contents', updatedContents);
                } catch (e) {
                    console.error(e);
                    alert("Silinirken hata oluştu.");
                }
            } else {
                const updatedContents = [...formData.contents];
                updatedContents.splice(index, 1);
                handleInputChange('contents', updatedContents);
            }
        }
    };

    const handleClubSave = async () => {
        if (!formData.clubName || !formData.clubShort || !formData.clubDesc) {
            alert("Lütfen Kulüp Adı, Kısaltması ve Açıklamasını giriniz.");
            return;
        }

        setLoading(true);
        try {
            let logoUrl = formData.logoUrl || "";
            let bannerUrl = formData.bannerUrl || "";

            if (logoFile) {
                const path = `kulupler-arsivi/${formData.clubShort.toUpperCase()}`;
                const uploadResult = await uploadFile(logoFile, path);
                logoUrl = uploadResult.url;
            }

            if (bannerFile) {
                const path = `kulupler-arsivi/${formData.clubShort.toUpperCase()}/banner`;
                const uploadResult = await uploadFile(bannerFile, path);
                bannerUrl = uploadResult.url;
            }

            const clubData = {
                name: formData.clubName,
                shortName: formData.clubShort,
                fullName: formData.clubFull || formData.clubName,
                categories: formData.clubCategories || [],
                founded: formData.clubFounded || "2000",
                description: formData.clubDesc,
                website: formData.clubWeb || "",
                address: formData.address || "",
                instagram: formData.instagram || "",
                twitter: formData.twitter || "",
                logoUrl: logoUrl,
                bannerUrl: bannerUrl,
                location: {
                    x: Number(formData.locX) || 50,
                    y: Number(formData.locY) || 50
                },
                updatedAt: serverTimestamp()
            };

            if (editingId) {
                await updateDoc(doc(db, "clubs", editingId), clubData);
                alert("Kulüp bilgileri güncellendi.");
            } else {
                await addDoc(collection(db, "clubs"), {
                    ...clubData,
                    contents: formData.contents || [],
                    createdAt: serverTimestamp()
                });
                alert("Kulüp oluşturuldu.");
            }
            setClubView('list');
        } catch (error) {
            console.error("Kulüp kayıt hatası:", error);
            alert("Hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Bu kulübü silmek istediğinize emin misiniz?")) {
            await deleteDoc(doc(db, "clubs", id));
        }
    };

    // --- LIST VIEW ---
    if (clubView === 'list') {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <Header title="Kulüpler Arşivi" desc="Kulüp sayfalarını, logolarını ve harita konumlarını yönetin." />
                    <button onClick={() => { setClubView('create'); setEditingId(null); }} className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-stone-700 transition-colors">
                        <Plus size={16} /> Yeni Kulüp Ekle
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clubs.map(club => (
                        <div key={club.id} className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm hover:border-boun-gold transition-colors group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 overflow-hidden border border-stone-200">
                                    {club.logoUrl ? <img src={club.logoUrl} className="w-full h-full object-cover" /> : club.shortName.substring(0, 2)}
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => { setEditingId(club.id); setClubView('edit'); }} className="p-2 text-stone-400 hover:text-boun-blue bg-stone-50 rounded"><Edit3 size={16} /></button>
                                    <button onClick={() => handleDelete(club.id)} className="p-2 text-stone-400 hover:text-red-600 bg-stone-50 rounded"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <h3 className="font-serif font-bold text-xl">{club.name}</h3>
                            <p className="text-stone-500 text-sm mt-1">{club.fullName}</p>
                            <div className="mt-4 flex gap-2 text-xs font-mono text-stone-400">
                                <span>X: {club.location?.x}%</span>
                                <span>Y: {club.location?.y}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- CREATE / EDIT VIEW ---
    const isEdit = clubView === 'edit';
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => setClubView('list')} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 text-sm font-bold">
                    <ArrowLeft size={16} /> Kulüp Listesine Dön
                </button>

                {/* TAB SWITCHER */}
                {isEdit && (
                    <div className="flex bg-stone-200 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={cn("px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all", activeTab === 'info' ? "bg-white shadow text-stone-900" : "text-stone-500")}
                        >
                            <Info size={14} /> Bilgiler & Arşiv
                        </button>
                        <button
                            onClick={() => setActiveTab('events')}
                            className={cn("px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all", activeTab === 'events' ? "bg-white shadow text-stone-900" : "text-stone-500")}
                        >
                            <Calendar size={14} /> Etkinlik Yönetimi
                        </button>
                    </div>
                )}
            </div>

            <Header title={isEdit ? "Kulübü Düzenle" : "Yeni Kulüp Ekle"} desc="Kulüp detaylarını, logoyu ve harita konumunu girin." />

            {activeTab === 'info' ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-4 bg-white p-6 rounded-lg border border-stone-200">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Kısaltma (ID)" placeholder="Örn: BÜMK" value={formData['clubShort'] || ""} onChange={(v: string) => handleInputChange('clubShort', v)} />
                                <Input label="Kuruluş Yılı" placeholder="1974" value={formData['clubFounded'] || ""} onChange={(v: string) => handleInputChange('clubFounded', v)} />
                            </div>
                            <Input label="Kulüp Adı" placeholder="Müzik Kulübü" value={formData['clubName'] || ""} onChange={(v: string) => handleInputChange('clubName', v)} />
                            <Input label="Tam Adı (Resmi)" placeholder="Boğaziçi Üniversitesi Müzik Kulübü" value={formData['clubFull'] || ""} onChange={(v: string) => handleInputChange('clubFull', v)} />
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Kategoriler</label>
                                <div className="flex flex-wrap gap-2">
                                    {["Kültür & Sanat", "Spor", "Akademik", "Kariyer", "Sosyal Sorumluluk", "Teknoloji", "Fikir & Düşünce", "Yaşam & Hobiler", "Doğa & Çevre"].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                const current = formData.clubCategories || [];
                                                const updated = current.includes(cat)
                                                    ? current.filter((c: string) => c !== cat)
                                                    : [...current, cat];
                                                handleInputChange('clubCategories', updated);
                                            }}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                                                (formData.clubCategories || []).includes(cat)
                                                    ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                                                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <TextArea label="Adres" placeholder="Kuzey Kampüs, 1. Yurt Altı..." className="h-20" value={formData['address'] || ''} onChange={(v: string) => handleInputChange('address', v)} />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input label="Web Sitesi" placeholder="https://..." value={formData['clubWeb'] || ''} onChange={(v: string) => handleInputChange('clubWeb', v)} />
                                <Input label="Instagram" placeholder="kullaniciadi (veya link)" value={formData['instagram'] || ''} onChange={(v: string) => handleInputChange('instagram', v)} />
                                <Input label="Twitter (X)" placeholder="kullaniciadi (veya link)" value={formData['twitter'] || ''} onChange={(v: string) => handleInputChange('twitter', v)} />
                            </div>
                            <TextArea label="Tanıtım Yazısı" placeholder="Kulüp hakkında genel bilgi..." className="h-32" value={formData['clubDesc'] || ''} onChange={(v: string) => handleInputChange('clubDesc', v)} />

                            {/* --- ADVANCED CONTENT MANAGEMENT --- */}
                            <div className="border-t border-stone-200 pt-6 mt-6">
                                <h4 className="font-bold text-stone-800 text-sm mb-4 flex items-center gap-2"><FolderOpen size={16} /> Arşive Eser/Belge Ekle</h4>

                                <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 mb-6">
                                    {/* Content Meta Form */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <Input
                                            label="Eser Başlığı / Etkinlik Adı"
                                            placeholder="Örn: 2005 Taşoda Konserleri"
                                            value={newContentData.title}
                                            onChange={(v: string) => setNewContentData({ ...newContentData, title: v })}
                                        />
                                        <Input
                                            label="Tarih (Yıl veya Tam Tarih)"
                                            type="text"
                                            placeholder="YYYY-MM-DD veya 2005"
                                            value={newContentData.date}
                                            onChange={(v: string) => setNewContentData({ ...newContentData, date: v })}
                                        />
                                    </div>
                                    <Input
                                        label="Açıklama (Opsiyonel)"
                                        placeholder="Kısa bir açıklama ekle..."
                                        value={newContentData.desc}
                                        onChange={(v: string) => setNewContentData({ ...newContentData, desc: v })}
                                    />

                                    {/* Type Switcher */}
                                    <div className="flex gap-4 my-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={contentTab === 'file'} onChange={() => setContentTab('file')} className="accent-stone-900" />
                                            <span className="text-sm font-bold text-stone-700">Dosya / Klasör Yükle</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={contentTab === 'link'} onChange={() => setContentTab('link')} className="accent-stone-900" />
                                            <span className="text-sm font-bold text-stone-700">Video / Link Ekle</span>
                                        </label>
                                    </div>

                                    {/* Uploader / Link Input */}
                                    {contentTab === 'file' ? (
                                        <div className="space-y-4">
                                            {!pendingFiles && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FileUploader
                                                        label="Tek Dosya"
                                                        onFileSelect={handleFileSelect}
                                                    />
                                                    <FileUploader
                                                        label="Klasör (Toplu)"
                                                        isFolder={true}
                                                        onFileSelect={handleFileSelect}
                                                    />
                                                </div>
                                            )}

                                            {/* Pending File Confirmation UI */}
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
                                                        <button onClick={() => setPendingFiles(null)} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
                                                    </div>
                                                    <button
                                                        onClick={confirmUpload}
                                                        disabled={contentUploading}
                                                        className="w-full py-2 bg-boun-blue text-white rounded font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        {contentUploading ? <Loader2 size={16} className="animate-spin" /> : "Yüklemeyi Başlat"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-end gap-2">
                                            <Input
                                                label="Bağlantı Adresi (URL)"
                                                placeholder="https://youtube.com/..."
                                                value={newContentData.url}
                                                onChange={(v: string) => setNewContentData({ ...newContentData, url: v })}
                                            />
                                            <button
                                                onClick={handleLinkAdd}
                                                disabled={loading}
                                                className="mb-0.5 px-6 py-2.5 bg-stone-900 text-white rounded font-bold text-sm hover:bg-stone-700 transition-colors disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 size={16} className="animate-spin" /> : "Ekle"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Content List */}
                                <div className="bg-stone-50 rounded border border-stone-200 overflow-hidden">
                                    <div className="p-3 bg-stone-100 border-b border-stone-200 flex justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
                                        <span>Eklenen İçerikler</span>
                                        <span>İşlem</span>
                                    </div>
                                    <div className="divide-y divide-stone-200 max-h-60 overflow-y-auto custom-scrollbar">
                                        {formData.contents?.length === 0 && <div className="p-4 text-center text-stone-400 text-sm">Henüz içerik eklenmedi.</div>}
                                        {formData.contents?.map((file: any, idx: number) => (
                                            <div key={idx} className="p-3 flex items-center justify-between bg-white hover:bg-stone-50">
                                                <div className="flex items-center gap-3">
                                                    {file.type === 'link' ? <LinkIcon size={16} className="text-blue-500" /> : <File size={16} className="text-stone-400" />}
                                                    <div>
                                                        <div className="text-sm font-bold text-stone-700">{file.title || file.fileName}</div>
                                                        <div className="text-xs text-stone-400 flex gap-2">
                                                            <span>{file.date}</span>
                                                            {file.folderName && <span className="bg-stone-100 px-1 rounded text-stone-500">{file.folderName}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteContent(idx)} className="text-red-500 hover:text-red-700 p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side Configs (Logo & Map) */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg border border-stone-200">
                                <FileUploader
                                    label="Kulüp Logosu"
                                    onFileSelect={(f) => setLogoFile(f as File)}
                                    selectedFileName={logoFile?.name || (formData.logoUrl ? "Mevcut Logo Yüklü" : "")}
                                />
                                {formData.logoUrl && !logoFile && (
                                    <div className="mt-4 flex justify-center p-4 bg-stone-100 rounded">
                                        <img src={formData.logoUrl} className="h-20 w-auto object-contain" />
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-stone-100">
                                    <FileUploader
                                        label="Kulüp Vitrin Görseli (Banner)"
                                        onFileSelect={(f) => setBannerFile(f as File)}
                                        selectedFileName={bannerFile?.name || (formData.bannerUrl ? "Mevcut Banner Yüklü" : "")}
                                    />
                                    {formData.bannerUrl && !bannerFile && (
                                        <div className="mt-4 flex justify-center p-4 bg-stone-100 rounded">
                                            <img src={formData.bannerUrl} className="h-24 w-full object-cover rounded-md" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-stone-200">
                                <h4 className="font-bold text-stone-800 text-sm mb-4 border-b pb-2 flex items-center gap-2"><MapPin size={16} /> Harita Konumu</h4>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <Input label="X Konumu (%)" type="number" placeholder="50" value={formData['locX'] || 50} onChange={(v: string) => handleInputChange('locX', v)} />
                                    <Input label="Y Konumu (%)" type="number" placeholder="50" value={formData['locY'] || 50} onChange={(v: string) => handleInputChange('locY', v)} />
                                </div>
                                <div
                                    className="relative w-full aspect-video bg-stone-200 rounded overflow-hidden border border-stone-300 cursor-crosshair group"
                                    onClick={handleMapClick}
                                >
                                    {/* Mock Map Background for Preview */}
                                    <img src="https://cdn.1863postasi.org/kulupler-arsivi/kroki.png" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <div
                                        className="absolute w-4 h-4 bg-red-600 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 shadow-md transition-all pointer-events-none"
                                        style={{ left: `${formData['locX'] || 50}%`, top: `${formData['locY'] || 50}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-stone-400 mt-2 text-center">Haritaya tıklayarak konumu seçebilirsiniz.</p>
                            </div>
                        </div>
                    </div>
                    <ActionButtons loading={loading} onSave={handleClubSave} isEditing={isEdit} onCancel={() => setClubView('list')} />
                </>
            ) : (
                /* EVENTS TAB */
                <div className="bg-white p-6 rounded-xl border border-stone-200">
                    {editingId ? (
                        <ClubEventsTab clubId={editingId} clubName={formData.clubShort} />
                    ) : (
                        <div className="text-center text-stone-400">Lütfen önce kulübü kaydedin.</div>
                    )}
                </div>
            )}
        </div>
    );
};