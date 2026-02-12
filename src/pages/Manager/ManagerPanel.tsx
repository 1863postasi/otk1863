import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadFile } from '../../lib/storage';
import { Header, Input, TextArea, ActionButtons, FileUploader } from '../Admin/components/SharedUI';
import { ClubEventsTab } from '../../components/Shared/ClubEventsTab';
import { Loader2, Users, Settings, LogOut, ArrowLeft, Info, Calendar, FolderOpen, UploadCloud, Link as LinkIcon, File, Trash2, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

import { Club } from '../Forum/types';

export default function ManagerPanel() {
    const { userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [authorizedClubs, setAuthorizedClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);

    // Selection & Editing
    const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'events'>('info');

    // Form State (General Info)
    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    // --- Content Upload State ---
    const [contentUploading, setContentUploading] = useState(false);
    const [contentTab, setContentTab] = useState<'file' | 'link'>('file');
    const [newContentData, setNewContentData] = useState({ title: '', date: '', desc: '', url: '' });
    const [pendingFiles, setPendingFiles] = useState<File | FileList | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    // Fetch Authorized Clubs
    useEffect(() => {
        const fetchClubs = async () => {
            if (!userProfile?.clubRoles) {
                setLoading(false);
                return;
            }

            const clubIds = Object.keys(userProfile.clubRoles);
            if (clubIds.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // Assuming a student manages < 10 clubs.
                const q = query(collection(db, "clubs"), where("__name__", "in", clubIds));
                const snapshot = await getDocs(q);
                const clubs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Club[];
                setAuthorizedClubs(clubs);
            } catch (error) {
                console.error("Error fetching managed clubs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClubs();
    }, [userProfile]);

    // Handle Selection
    const handleSelectClub = (club: Club) => {
        setSelectedClubId(club.id);
        setFormData({
            description: club.description || '',
            website: club.website || '',
            name: club.name,
            shortName: club.shortName,
            founded: club.founded,
            categories: club.categories || [],
            bannerUrl: club.bannerUrl
        });
        setActiveTab('info');
        setPendingFiles(null);
        setBannerFile(null);
        setNewContentData({ title: '', date: '', desc: '', url: '' });
    };

    const handleSaveInfo = async () => {
        if (!selectedClubId) return;
        setSaving(true);
        try {
            let bannerUrl = formData.bannerUrl;

            if (bannerFile) {
                const activeClub = authorizedClubs.find(c => c.id === selectedClubId);
                const path = `kulupler-arsivi/${activeClub?.shortName.toUpperCase()}/banner`;
                const uploadResult = await uploadFile(bannerFile, path);
                bannerUrl = uploadResult.url;
            }

            await updateDoc(doc(db, "clubs", selectedClubId), {
                description: formData.description,
                website: formData.website,
                bannerUrl: bannerUrl
            });
            alert("Kulüp bilgileri güncellendi.");
        } catch (error) {
            console.error(error);
            alert("Hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    // --- Content Management Logic ---

    const handleFileSelect = (files: File | FileList) => {
        setPendingFiles(files);
    };

    const confirmUpload = async (clubShort: string) => {
        if (!pendingFiles || !selectedClubId) return;

        if (!newContentData.title || !newContentData.date) {
            alert("Lütfen içerik için Başlık ve Tarih (Yıl) giriniz.");
            return;
        }

        setContentUploading(true);
        try {
            const itemsToAdd: any[] = [];
            const files = pendingFiles;
            const clubRef = doc(db, "clubs", selectedClubId);

            // Upload Logic
            if (files instanceof FileList) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    // Simple path for manager uploads
                    const storageFolder = `kulupler-arsivi/${clubShort.toUpperCase()}/${new Date().getFullYear()}`;

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
                const path = `kulupler-arsivi/${clubShort.toUpperCase()}/${new Date().getFullYear()}`;
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

            // Save to Firestore
            for (const item of itemsToAdd) {
                await updateDoc(clubRef, {
                    contents: arrayUnion(item)
                });
            }

            // Update Local State for UI
            setAuthorizedClubs(prev => prev.map(c => {
                if (c.id === selectedClubId) {
                    return { ...c, contents: [...(c.contents || []), ...itemsToAdd] };
                }
                return c;
            }));

            alert("Dosyalar başarıyla eklendi.");
            setNewContentData({ title: '', date: '', desc: '', url: '' });
            setPendingFiles(null);

        } catch (e) {
            console.error(e);
            alert("Dosya yüklenirken hata oluştu.");
        } finally {
            setContentUploading(false);
        }
    };

    const handleLinkAdd = async () => {
        if (!selectedClubId) return;
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

        try {
            setContentUploading(true);
            await updateDoc(doc(db, "clubs", selectedClubId), {
                contents: arrayUnion(newItem)
            });

            // Update Local State
            setAuthorizedClubs(prev => prev.map(c => {
                if (c.id === selectedClubId) {
                    return { ...c, contents: [...(c.contents || []), newItem] };
                }
                return c;
            }));

            alert("Bağlantı eklendi.");
            setNewContentData({ title: '', date: '', desc: '', url: '' });
        } catch (e) {
            console.error(e);
            alert("Hata oluştu.");
        } finally {
            setContentUploading(false);
        }
    };

    const handleDeleteContent = async (itemToDelete: any) => {
        if (!selectedClubId) return;

        if (confirm("Bu içeriği listeden silmek istediğinize emin misiniz?")) {
            try {
                await updateDoc(doc(db, "clubs", selectedClubId), {
                    contents: arrayRemove(itemToDelete)
                });

                // Update Local State
                setAuthorizedClubs(prev => prev.map(c => {
                    if (c.id === selectedClubId) {
                        const newContents = c.contents?.filter(x => x !== itemToDelete) || [];
                        return { ...c, contents: newContents };
                    }
                    return c;
                }));

            } catch (e) {
                console.error(e);
                alert("Silinirken hata oluştu.");
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#efede6]">
                <Loader2 className="animate-spin text-stone-400" size={32} />
            </div>
        );
    }

    if (selectedClubId) {
        const activeClub = authorizedClubs.find(c => c.id === selectedClubId);
        if (!activeClub) return null;

        return (
            <div className="min-h-screen bg-[#efede6] pb-20">
                {/* Header */}
                <div className="bg-stone-900 text-white p-6 sticky top-0 z-30 shadow-md">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedClubId(null)} className="p-2 hover:bg-stone-800 rounded-full transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="font-serif text-xl font-bold">{activeClub.name}</h1>
                                <p className="text-xs text-stone-400 uppercase tracking-wider font-bold">Yönetim Paneli</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={cn("px-4 py-2 rounded text-sm font-bold transition-colors flex items-center gap-2", activeTab === 'info' ? "bg-white text-stone-900" : "text-stone-400 hover:text-white")}
                            >
                                <Info size={16} /> Bilgiler
                            </button>
                            <button
                                onClick={() => setActiveTab('events')}
                                className={cn("px-4 py-2 rounded text-sm font-bold transition-colors flex items-center gap-2", activeTab === 'events' ? "bg-white text-stone-900" : "text-stone-400 hover:text-white")}
                            >
                                <Calendar size={16} /> Etkinlikler
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto mt-8 px-4">
                    {activeTab === 'info' ? (
                        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4">
                            <Header title="Kulüp Bilgileri" desc="Kulüp tanıtım yazısı ve iletişim bilgilerini güncelleyin." />

                            <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6 text-amber-800 text-sm flex gap-3">
                                <Info className="shrink-0" size={20} />
                                <p>Kulüp Adı, Kısaltma, Kuruluş Yılı ve Harita Konumu gibi temel bilgileri değiştirme yetkiniz yoktur. Değişiklik için ÖTK Yönetimi ile iletişime geçiniz.</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Kulüp Adı</label>
                                        <div className="p-3 bg-stone-100 border border-stone-200 rounded text-stone-600 font-bold text-sm">{formData.name}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Kısaltma</label>
                                        <div className="p-3 bg-stone-100 border border-stone-200 rounded text-stone-600 font-bold text-sm">{formData.shortName}</div>
                                    </div>
                                </div>

                                <Input
                                    label="Web Sitesi / Instagram"
                                    placeholder="https://..."
                                    value={formData.website}
                                    onChange={(v: string) => setFormData({ ...formData, website: v })}
                                />

                                <div className="bg-white rounded-lg border border-stone-200 p-4">
                                    <FileUploader
                                        label="Kulüp Vitrin Görseli (Banner)"
                                        onFileSelect={(f) => setBannerFile(f as File)}
                                        selectedFileName={bannerFile?.name || (formData.bannerUrl ? "Mevcut Banner Yüklü" : "")}
                                    />
                                    {formData.bannerUrl && !bannerFile && (
                                        <div className="mt-2 text-xs text-stone-500">Mevcut görsel sistemde kayıtlı.</div>
                                    )}
                                </div>

                                <TextArea
                                    label="Tanıtım Yazısı"
                                    placeholder="Kulübünüzün hikayesini anlatın..."
                                    value={formData.description}
                                    onChange={(v: string) => setFormData({ ...formData, description: v })}
                                    className="min-h-[150px]"
                                />
                                <div className="flex justify-end">
                                    <ActionButtons loading={saving} onSave={handleSaveInfo} isEditing={true} onCancel={() => setSelectedClubId(null)} />
                                </div>
                            </div>

                            {/* --- CONTENT MANAGEMENT SECTION --- */}
                            <div className="border-t border-stone-200 pt-8 mt-8">
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
                                                        onClick={() => confirmUpload(activeClub.shortName)}
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
                                                disabled={contentUploading}
                                                className="mb-0.5 px-6 py-2.5 bg-stone-900 text-white rounded font-bold text-sm hover:bg-stone-700 transition-colors disabled:opacity-50"
                                            >
                                                {contentUploading ? <Loader2 size={16} className="animate-spin" /> : "Ekle"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Content List */}
                                <div className="bg-stone-50 rounded border border-stone-200 overflow-hidden">
                                    <div className="p-3 bg-stone-100 border-b border-stone-200 flex justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
                                        <span>Mevcut Arşiv Kayıtları</span>
                                        <span>İşlem</span>
                                    </div>
                                    <div className="divide-y divide-stone-200 max-h-60 overflow-y-auto custom-scrollbar">
                                        {(!activeClub.contents || activeClub.contents.length === 0) && <div className="p-4 text-center text-stone-400 text-sm">Henüz içerik eklenmedi.</div>}
                                        {activeClub.contents?.map((file: any, idx: number) => (
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
                                                <button onClick={() => handleDeleteContent(file)} className="text-red-500 hover:text-red-700 p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4">
                            <ClubEventsTab clubId={activeClub.id} clubName={activeClub.shortName} />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default: List of Clubs
    return (
        <div className="min-h-screen bg-[#efede6] p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-stone-900">Hoş Geldin, {userProfile?.username}</h1>
                        <p className="text-stone-500 mt-1">Yönetim yetkisine sahip olduğun kulüpler.</p>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 text-red-600 font-bold text-sm hover:bg-red-50 px-4 py-2 rounded transition-colors">
                        <LogOut size={16} /> Çıkış Yap
                    </button>
                </div>

                {authorizedClubs.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl border border-stone-200 text-center text-stone-400">
                        <Settings size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Yönetim yetkiniz bulunan kulüp bulunamadı.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {authorizedClubs.map(club => (
                            <button
                                key={club.id}
                                onClick={() => handleSelectClub(club)}
                                className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-boun-gold transition-all text-left group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center font-bold text-stone-500 group-hover:bg-stone-900 group-hover:text-boun-gold transition-colors">
                                        {club.shortName.substring(0, 2)}
                                    </div>
                                    <div className="flex gap-1 items-center">
                                        {(club.categories || []).slice(0, 1).map((cat, idx) => (
                                            <span key={idx} className="bg-stone-100 px-2 py-1 rounded text-[10px] font-bold text-stone-500 whitespace-nowrap">{cat}</span>
                                        ))}
                                    </div>
                                </div>
                                <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-boun-blue transition-colors">{club.name}</h3>
                                <p className="text-stone-500 text-sm mt-2 line-clamp-2">{club.description || 'Açıklama girilmemiş.'}</p>
                                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs font-bold text-stone-400 group-hover:text-stone-600">
                                    <Settings size={14} /> Yönetim Paneline Git
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}