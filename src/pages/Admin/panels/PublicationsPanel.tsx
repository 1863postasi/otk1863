import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, ArrowLeft, FolderOpen, Link as LinkIcon, File, MapPin, Loader2, UploadCloud, X, Calendar, Info, BookOpen, Layers } from 'lucide-react';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, arrayUnion, arrayRemove, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { uploadFile } from '../../../lib/storage';
import { Header, Input, TextArea, FileUploader, ActionButtons } from '../components/SharedUI';
import { cn, slugify } from '../../../lib/utils';

export const PublicationsPanel = () => {
    // Internal State for View Management
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [activeTab, setActiveTab] = useState<'info' | 'issues'>('info');

    const [formData, setFormData] = useState<any>({ issues: [] });
    const [publications, setPublications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Issue Upload State
    const [issueUploading, setIssueUploading] = useState(false);
    const [newIssueData, setNewIssueData] = useState({ title: '', date: '', pdfUrl: '' });
    const [issueCoverFile, setIssueCoverFile] = useState<File | null>(null);
    const [issuePdfFile, setIssuePdfFile] = useState<File | null>(null);

    // Fetch Publications from Firestore
    useEffect(() => {
        const fetchPublications = async () => {
            try {
                const q = query(collection(db, "publications"), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPublications(data);
            } catch (error) {
                console.error("Publications fetch error:", error);
            }
        };
        fetchPublications();
    }, [view]); // Refetch when view changes

    // When edit mode triggers
    useEffect(() => {
        if (view === 'edit' && editingId) {
            const pub = publications.find(p => p.id === editingId);
            if (pub) {
                setFormData({
                    title: pub.title,
                    description: pub.description,
                    type: pub.type || 'Süreli Yayın',
                    frequency: pub.frequency,
                    author: pub.author,
                    instagram: pub.instagram,
                    coverImage: pub.coverImage,
                    issues: pub.issues || []
                });
            }
            setActiveTab('info');
        } else if (view === 'create') {
            setFormData({
                type: 'Süreli Yayın',
                issues: [],
                author: 'Bağımsız Öğrenciler' // Default
            });
            setCoverFile(null);
            setEditingId(null);
            setActiveTab('info');
        }
    }, [view, editingId, publications]);

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.title || !formData.type) {
            alert("Lütfen Yayın Adı ve Türü giriniz.");
            return;
        }

        setLoading(true);
        try {
            let coverUrl = formData.coverImage || "";

            if (coverFile) {
                // Main cover upload
                const safeTitle = slugify(formData.title);
                const safeType = slugify(formData.type);
                const path = `yayinlar/${safeType}/${safeTitle}/cover`;
                const uploadResult = await uploadFile(coverFile, path);
                coverUrl = uploadResult.url;
            }

            const pubData = {
                title: formData.title,
                description: formData.description || "",
                type: formData.type,
                frequency: formData.frequency || "",
                author: formData.author || "",
                instagram: formData.instagram || "",
                coverImage: coverUrl,
                updatedAt: serverTimestamp()
            };

            if (editingId) {
                await updateDoc(doc(db, "publications", editingId), pubData);
                alert("Yayın güncellendi.");
            } else {
                await addDoc(collection(db, "publications"), {
                    ...pubData,
                    issues: [], // Initial empty issues
                    createdAt: serverTimestamp()
                });
                alert("Yayın oluşturuldu.");
            }
            setView('list');
        } catch (error) {
            console.error("Kayıt hatası:", error);
            alert("Hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Bu yayını ve tüm sayılarını silmek istediğinize emin misiniz?")) {
            await deleteDoc(doc(db, "publications", id));
            setPublications(prev => prev.filter(p => p.id !== id));
        }
    };

    // --- ISSUE MANAGEMENT ---

    const handleAddIssue = async () => {
        if (!newIssueData.title || !newIssueData.date) {
            alert("Lütfen Sayı Başlığı ve Tarih giriniz.");
            return;
        }
        if (!issuePdfFile && !issueCoverFile) {
            alert("Lütfen en azından bir dosya (Kapak veya PDF) seçiniz.");
            return;
        }

        setIssueUploading(true);
        try {
            let issueCoverUrl = "";
            let issuePdfUrl = "";


            // Upload Logic
            const safePubTitle = slugify(formData.title);
            const safeIssueTitle = slugify(newIssueData.title);
            const basePath = `yayinlar/${safePubTitle}/sayilar/${safeIssueTitle}`;

            if (issueCoverFile) {
                const res = await uploadFile(issueCoverFile, `${basePath}/cover`);
                issueCoverUrl = res.url;
            } else if (formData.coverImage) {
                // Fallback to main cover if specific issue cover not provided
                issueCoverUrl = formData.coverImage;
            }

            if (issuePdfFile) {
                const res = await uploadFile(issuePdfFile, `${basePath}/file`);
                issuePdfUrl = res.url;
            }

            const newIssue = {
                id: Date.now().toString(), // Simple client ID
                title: newIssueData.title,
                date: newIssueData.date,
                cover: issueCoverUrl,
                pdfUrl: issuePdfUrl
            };

            if (editingId) {
                await updateDoc(doc(db, "publications", editingId), {
                    issues: arrayUnion(newIssue)
                });
                setFormData((prev: any) => ({
                    ...prev,
                    issues: [newIssue, ...(prev.issues || [])] // Prepend
                }));
            } else {
                // If in create mode, just add to local state, will be saved with main doc?
                // Actually, usually we force save first. But let's allow local addition if complicated.
                // Better: Require saving publication first before adding issues, like ClubsPanel events tab.
                // ClubsPanel hides Events tab if not editingId.
            }

            setNewIssueData({ title: '', date: '', pdfUrl: '' });
            setIssueCoverFile(null);
            setIssuePdfFile(null);
            alert("Sayı eklendi.");

        } catch (e) {
            console.error(e);
            alert("Sayı eklenirken hata oluştu.");
        } finally {
            setIssueUploading(false);
        }
    };

    const handleDeleteIssue = async (issue: any) => {
        if (!editingId) return;
        if (!confirm("Bu sayıyı silmek istediğinize emin misiniz?")) return;

        try {
            await updateDoc(doc(db, "publications", editingId), {
                issues: arrayRemove(issue)
            });
            setFormData((prev: any) => ({
                ...prev,
                issues: prev.issues.filter((i: any) => i.id !== issue.id)
            }));
        } catch (e) {
            console.error(e);
            alert("Silme hatası.");
        }
    };

    // --- LIST VIEW ---
    if (view === 'list') {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <Header title="Yayınlar" desc="Süreli yayınları ve fanzinleri yönetin." />
                    <button onClick={() => { setView('create'); setEditingId(null); }} className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-stone-700 transition-colors">
                        <Plus size={16} /> Yeni Yayın Ekle
                    </button>
                </div>

                {/* FILTERS could go here */}

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {publications.map(pub => (
                        <div key={pub.id} className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm hover:border-boun-gold transition-all group">
                            <div className="aspect-[2/3] bg-stone-100 rounded-md mb-4 overflow-hidden relative">
                                {pub.coverImage ? (
                                    <img src={pub.coverImage} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                        <BookOpen size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => { setEditingId(pub.id); setView('edit'); }} className="p-2 bg-white rounded-full hover:bg-boun-gold transition-colors"><Edit3 size={16} /></button>
                                    <button onClick={() => handleDelete(pub.id)} className="p-2 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-stone-400">{pub.type}</span>
                            <h3 className="font-serif font-bold text-lg leading-tight mb-1">{pub.title}</h3>
                            <p className="text-xs text-stone-500">{pub.issues?.length || 0} Sayı • {pub.frequency}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- CREATE / EDIT VIEW ---
    const isEdit = view === 'edit';
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 text-sm font-bold">
                    <ArrowLeft size={16} /> Listeye Dön
                </button>

                {isEdit && (
                    <div className="flex bg-stone-200 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={cn("px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all", activeTab === 'info' ? "bg-white shadow text-stone-900" : "text-stone-500")}
                        >
                            <Info size={14} /> Genel Bilgiler
                        </button>
                        <button
                            onClick={() => setActiveTab('issues')}
                            className={cn("px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all", activeTab === 'issues' ? "bg-white shadow text-stone-900" : "text-stone-500")}
                        >
                            <Layers size={14} /> Sayılar & Arşiv
                        </button>
                    </div>
                )}
            </div>

            <Header title={isEdit ? "Yayını Düzenle" : "Yeni Yayın Ekle"} desc="Yayın detaylarını girin." />

            {activeTab === 'info' ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-4 bg-white p-6 rounded-lg border border-stone-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Yayın Türü</label>
                                    <select
                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded font-bold text-sm"
                                        value={formData.type || 'Süreli Yayın'}
                                        onChange={(e) => handleInputChange('type', e.target.value)}
                                    >
                                        <option value="Süreli Yayın">Süreli Yayın</option>
                                        <option value="Fanzin">Fanzin</option>
                                    </select>
                                </div>
                                <Input label="Sıklık / Dönem" placeholder="Örn: Aylık, Güz 2024" value={formData.frequency || ""} onChange={(v: string) => handleInputChange('frequency', v)} />
                            </div>

                            <Input label="Yayın Adı (Başlık)" placeholder="Örn: Kule Dergisi" value={formData.title || ""} onChange={(v: string) => handleInputChange('title', v)} />

                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Yazar / Kurum" placeholder="Örn: Sinema Kulübü" value={formData.author || ""} onChange={(v: string) => handleInputChange('author', v)} />
                                <Input label="Instagram" placeholder="@boun..." value={formData.instagram || ""} onChange={(v: string) => handleInputChange('instagram', v)} />
                            </div>

                            <TextArea label="Açıklama / Tanıtım" placeholder="Yayın hakkında kısa bilgi..." className="h-32" value={formData.description || ''} onChange={(v: string) => handleInputChange('description', v)} />
                        </div>

                        {/* Cover Image Side */}
                        <div className="bg-white p-6 rounded-lg border border-stone-200 h-fit">
                            <h4 className="font-bold text-stone-800 text-sm mb-4 border-b pb-2">Kapak Görseli</h4>
                            <FileUploader
                                label="Kapak Görseli"
                                onFileSelect={(f) => setCoverFile(f as File)}
                                selectedFileName={coverFile?.name || (formData.coverImage ? "Mevcut Kapak Yüklü" : "")}
                            />
                            {(coverFile || formData.coverImage) && (
                                <div className="mt-4 p-2 bg-stone-100 rounded border border-stone-200 flex justify-center">
                                    <img
                                        src={coverFile ? URL.createObjectURL(coverFile) : formData.coverImage}
                                        className="h-48 w-auto object-cover shadow-md"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <ActionButtons loading={loading} onSave={handleSave} isEditing={isEdit} onCancel={() => setView('list')} />
                </>
            ) : (
                /* ISSUES TAB */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-stone-200 h-fit">
                        <h4 className="font-bold text-stone-800 text-sm mb-4 border-b pb-2 flex items-center gap-2"><Plus size={16} /> Yeni Sayı Ekle</h4>

                        <div className="space-y-4">
                            <Input label="Sayı Başlığı" placeholder="Örn: Sayı 42 veya Mart 2024" value={newIssueData.title} onChange={(v: string) => setNewIssueData({ ...newIssueData, title: v })} />
                            <Input label="Tarih" placeholder="YYYY-MM-DD" value={newIssueData.date} onChange={(v: string) => setNewIssueData({ ...newIssueData, date: v })} />

                            <div className="border-t pt-4">
                                <span className="text-xs font-bold text-stone-500 uppercase block mb-2">Dosyalar</span>
                                <div className="space-y-3">
                                    <FileUploader
                                        label="Sayı Kapağı (Opsiyonel)"
                                        onFileSelect={(f) => setIssueCoverFile(f as File)}
                                        selectedFileName={issueCoverFile?.name}
                                    />
                                    <FileUploader
                                        label="Sayı PDF'i"
                                        onFileSelect={(f) => setIssuePdfFile(f as File)}
                                        selectedFileName={issuePdfFile?.name}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleAddIssue}
                                disabled={issueUploading}
                                className="w-full py-2 bg-stone-900 text-white font-bold rounded hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                            >
                                {issueUploading ? <Loader2 size={16} className="animate-spin" /> : "Sayıyı Yükle"}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
                            <div className="p-4 bg-stone-100 border-b border-stone-200 font-bold text-stone-700 flex justify-between">
                                <span>Yüklenen Sayılar ({formData.issues?.length || 0})</span>
                            </div>

                            <div className="divide-y divide-stone-200">
                                {formData.issues?.length === 0 && <div className="p-8 text-center text-stone-400">Henüz sayı eklenmemiş.</div>}
                                {formData.issues?.sort((a: any, b: any) => b.date.localeCompare(a.date)).map((issue: any) => (
                                    <div key={issue.id} className="p-4 flex items-center gap-4 hover:bg-stone-50 group">
                                        <div className="w-12 h-16 bg-stone-200 rounded overflow-hidden flex-shrink-0 border border-stone-300">
                                            <img src={issue.cover || formData.coverImage} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-bold text-stone-900">{issue.title}</h5>
                                            <p className="text-xs text-stone-500">{issue.date}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {issue.pdfUrl && (
                                                <a href={issue.pdfUrl} target="_blank" className="p-2 text-stone-400 hover:text-boun-blue bg-stone-100 rounded">
                                                    <File size={16} />
                                                </a>
                                            )}
                                            <button onClick={() => handleDeleteIssue(issue)} className="p-2 text-stone-400 hover:text-red-600 bg-stone-100 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
