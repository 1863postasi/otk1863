import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Plus, Trash2, Search, FileText, UploadCloud, 
  CheckCircle, Filter, BookOpen, Loader2, X, Link as LinkIcon, User, Calendar, Youtube, Check, XCircle, Info
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { uploadFile } from '../../../lib/storage';
import { Header, Input, Select, FileUploader } from '../components/SharedUI';
import { cn, formatDate } from '../../../lib/utils';

// --- CONSTANTS ---
const RESOURCE_TYPES = [
    { val: 'Ders Notu', label: 'Ders Notu' },
    { val: 'Midterm Soruları', label: 'Midterm Soruları' },
    { val: 'Final Soruları', label: 'Final Soruları' },
    { val: 'Proje/Ödev', label: 'Proje / Ödev' },
    { val: 'Kitap/Kaynak', label: 'Kitap / Kaynak' },
    { val: 'Syllabus', label: 'Syllabus' }
];

const SEMESTERS = [
    { val: 'Güz', label: 'Güz' },
    { val: 'Bahar', label: 'Bahar' },
    { val: 'Yaz', label: 'Yaz' }
];

export const AcademicPoolPanel = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Split Inputs State
  const [codeDept, setCodeDept] = useState('');
  const [codeNum, setCodeNum] = useState('');
  const [termYear, setTermYear] = useState(new Date().getFullYear().toString());
  const [termSem, setTermSem] = useState('Güz');

  // Form State
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [formData, setFormData] = useState({
      resourceType: 'Ders Notu',
      title: '',
      instructor: '',
      linkUrl: '',
      rights: '' // New Admin Field
  });
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // --- FETCH DATA ---
  useEffect(() => {
      // FIX: Removed orderBy from query to prevent "Missing Index" issues in Firestore.
      // We sort the data client-side inside the snapshot callback.
      const q = query(
          collection(db, "academic_resources"), 
          where("status", "==", activeTab)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Client-side sorting (Newest first)
          data.sort((a: any, b: any) => {
              const dateA = a.createdAt?.seconds || 0;
              const dateB = b.createdAt?.seconds || 0;
              return dateB - dateA;
          });

          setResources(data);
      });
      return () => unsubscribe();
  }, [activeTab]);

  // --- HANDLERS ---

  const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCodeInput = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
      setter(value.replace(/\s/g, '').toUpperCase());
  };

  const handleUpload = async () => {
      // Validation
      if (!codeDept || !codeNum || !formData.title) {
          alert("Lütfen Ders Kodu ve Başlık alanlarını doldurunuz.");
          return;
      }
      if (uploadType === 'file' && !pendingFile) {
          alert("Lütfen bir dosya seçiniz.");
          return;
      }
      if (uploadType === 'link' && !formData.linkUrl) {
          alert("Lütfen link adresini giriniz.");
          return;
      }

      setUploading(true);
      try {
          // Concatenate Logic
          const fullCourseCode = `${codeDept}${codeNum}`;
          const fullTerm = `${termYear} ${termSem}`;

          let finalUrl = formData.linkUrl;
          let mimeType = 'application/link';
          let fileSize = '-';

          // Determine Content Type
          if (uploadType === 'link') {
              if (finalUrl.includes('youtube.com') || finalUrl.includes('youtu.be')) {
                  mimeType = 'video/youtube';
              }
          } else if (pendingFile) {
              // R2 Upload - FIX: Standardized Path (No Department/Pending folder separation)
              const storagePath = `akademik-havuz/${fullCourseCode}`;
              const uploadResult = await uploadFile(pendingFile, storagePath);
              finalUrl = uploadResult.url;
              mimeType = pendingFile.type;
              fileSize = uploadResult.size;
          }

          // Save to Firestore (Auto-Approved since Admin added it)
          await addDoc(collection(db, "academic_resources"), {
              courseCode: fullCourseCode,
              resourceType: formData.resourceType,
              title: formData.title,
              instructor: formData.instructor,
              term: fullTerm,
              rights: formData.rights,
              url: finalUrl,
              mimeType: mimeType,
              size: fileSize,
              status: 'approved',
              uploaderName: 'Admin',
              createdAt: serverTimestamp()
          });

          // Reset Form
          setFormData({ ...formData, title: '', linkUrl: '', rights: '' });
          setPendingFile(null);
          alert("Kaynak başarıyla havuza eklendi.");

      } catch (error) {
          console.error(error);
          alert("Yükleme sırasında hata oluştu.");
      } finally {
          setUploading(false);
      }
  };

  const handleApprove = async (id: string) => {
      try {
          await updateDoc(doc(db, "academic_resources", id), {
              status: 'approved'
          });
      } catch (e) {
          console.error(e);
          alert("Onaylama başarısız.");
      }
  };

  const handleReject = async (id: string) => {
      if (window.confirm("Bu kaynağı reddetmek ve silmek istediğinize emin misiniz?")) {
          await deleteDoc(doc(db, "academic_resources", id));
      }
  };

  // --- FILTERING ---
  const filteredResources = resources.filter(res => 
      res.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      res.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.uploaderName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <Header title="Akademik Havuz Yönetimi" desc="Ders notları, sınav soruları ve akademik kaynakları yönetin." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. UPLOAD FORM */}
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                  <h3 className="font-serif font-bold text-lg text-stone-900 mb-4 flex items-center gap-2">
                      <Plus size={18} className="text-boun-blue"/> Yeni Kaynak Ekle
                  </h3>
                  
                  <div className="space-y-4">
                      {/* Split Course Code */}
                      <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Ders Kodu</label>
                          <div className="flex items-center gap-2">
                              <input 
                                  type="text" placeholder="CMPE" maxLength={8}
                                  className="flex-1 px-3 py-2.5 border border-stone-300 rounded text-sm focus:ring-2 focus:ring-stone-800 outline-none uppercase font-mono"
                                  value={codeDept}
                                  onChange={(e) => handleCodeInput(setCodeDept, e.target.value)}
                              />
                              <span className="text-stone-400 font-bold">-</span>
                              <input 
                                  type="text" placeholder="150" maxLength={5}
                                  className="w-24 px-3 py-2.5 border border-stone-300 rounded text-sm focus:ring-2 focus:ring-stone-800 outline-none font-mono"
                                  value={codeNum}
                                  onChange={(e) => handleCodeInput(setCodeNum, e.target.value)}
                              />
                          </div>
                      </div>
                      
                      {/* Split Term */}
                      <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Dönem</label>
                          <div className="flex gap-2">
                              <input 
                                  type="number" placeholder="2023" min="1950" max="2030"
                                  className="flex-1 px-3 py-2.5 border border-stone-300 rounded text-sm focus:ring-2 focus:ring-stone-800 outline-none"
                                  value={termYear}
                                  onChange={(e) => setTermYear(e.target.value)}
                              />
                              <select 
                                  className="flex-1 px-3 py-2.5 border border-stone-300 rounded text-sm bg-white focus:ring-2 focus:ring-stone-800 outline-none"
                                  value={termSem}
                                  onChange={(e) => setTermSem(e.target.value)}
                              >
                                  {SEMESTERS.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
                              </select>
                          </div>
                      </div>

                      <Input label="Dersi Veren Hoca" placeholder="Tuna Tuğcu" value={formData.instructor} onChange={(v: string) => handleInputChange('instructor', v)} />
                      <Select label="Kaynak Türü" options={RESOURCE_TYPES} value={formData.resourceType} onChange={(v: string) => handleInputChange('resourceType', v)} />
                      <Input label="Başlık" placeholder="Midterm Çözümleri" value={formData.title} onChange={(v: string) => handleInputChange('title', v)} />
                      
                      {/* Admin-Only Field */}
                      <Input label="Telif / Kaynak (Opsiyonel)" placeholder="Anonim veya Kaynak Adı" value={formData.rights} onChange={(v: string) => handleInputChange('rights', v)} />

                      <div className="flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-100 text-blue-800 text-[10px]">
                          <Info size={14} className="shrink-0"/>
                          <span>Listede dosya adı yerine <b>Başlık</b> görünecektir.</span>
                      </div>

                      {/* File vs Link Toggle */}
                      <div className="bg-stone-100 p-1 rounded-lg flex gap-1 mb-2">
                          <button 
                              onClick={() => setUploadType('file')}
                              className={cn("flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all", uploadType === 'file' ? "bg-white shadow text-stone-900" : "text-stone-500 hover:text-stone-700")}
                          >
                              <FileText size={14}/> Dosya
                          </button>
                          <button 
                              onClick={() => setUploadType('link')}
                              className={cn("flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all", uploadType === 'link' ? "bg-white shadow text-stone-900" : "text-stone-500 hover:text-stone-700")}
                          >
                              <LinkIcon size={14}/> Link / Video
                          </button>
                      </div>

                      {uploadType === 'file' ? (
                          <FileUploader 
                              label="Dosya Seç"
                              onFileSelect={(f) => { setPendingFile(f as File); if(!formData.title) handleInputChange('title', (f as File).name); }}
                              selectedFileName={pendingFile?.name}
                          />
                      ) : (
                          <Input label="Link URL (Drive, YouTube vb.)" placeholder="https://..." value={formData.linkUrl} onChange={(v: string) => handleInputChange('linkUrl', v)} />
                      )}

                      <button 
                          onClick={handleUpload}
                          disabled={uploading}
                          className="w-full bg-stone-900 text-white font-bold py-3 rounded hover:bg-stone-700 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                          {uploading ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={18}/>}
                          {uploading ? 'Yükleniyor...' : 'Onayla ve Ekle'}
                      </button>
                  </div>
              </div>
          </div>

          {/* 2. RESOURCE LIST & APPROVAL */}
          <div className="lg:col-span-2">
              <div className="bg-stone-50 rounded-xl border border-stone-200 overflow-hidden flex flex-col h-[700px]">
                  
                  {/* Tabs & Search */}
                  <div className="p-4 border-b border-stone-200 bg-white flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                          <div className="flex bg-stone-100 p-1 rounded-lg">
                              <button 
                                  onClick={() => setActiveTab('approved')}
                                  className={cn("px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2", activeTab === 'approved' ? "bg-white shadow-sm text-stone-900" : "text-stone-500")}
                              >
                                  <CheckCircle size={14} /> Yayındakiler
                              </button>
                              <button 
                                  onClick={() => setActiveTab('pending')}
                                  className={cn("px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 relative", activeTab === 'pending' ? "bg-white shadow-sm text-stone-900" : "text-stone-500")}
                              >
                                  <Loader2 size={14} /> Onay Bekleyenler
                                  {activeTab !== 'pending' && resources.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-boun-red rounded-full"></span>}
                              </button>
                          </div>
                          <div className="relative w-64">
                              <input 
                                  type="text" 
                                  placeholder="Ara..." 
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded text-sm outline-none focus:border-stone-400"
                              />
                              <Search size={14} className="absolute left-3 top-3 text-stone-400" />
                          </div>
                      </div>
                  </div>

                  {/* List Table */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-stone-100 text-stone-500 font-bold sticky top-0 z-10 text-xs uppercase">
                              <tr>
                                  <th className="p-4">Ders / Hoca</th>
                                  <th className="p-4">Tür</th>
                                  <th className="p-4">Başlık</th>
                                  <th className="p-4">Yükleyen</th>
                                  <th className="p-4 text-right">İşlem</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200 bg-white">
                              {filteredResources.length === 0 && (
                                  <tr>
                                      <td colSpan={5} className="p-8 text-center text-stone-400 italic">Kayıt bulunamadı.</td>
                                  </tr>
                              )}
                              {filteredResources.map((res) => (
                                  <tr key={res.id} className="hover:bg-stone-50 transition-colors group">
                                      <td className="p-4">
                                          <div className="font-bold text-stone-900">{res.courseCode}</div>
                                          <div className="text-xs text-stone-500">{res.instructor || '-'}</div>
                                          <div className="text-[10px] text-stone-400">{res.term}</div>
                                      </td>
                                      <td className="p-4">
                                          <div className="flex flex-col gap-1">
                                              <span className="text-xs font-bold text-stone-700">{res.resourceType}</span>
                                              {res.mimeType?.includes('video') ? (
                                                  <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded w-fit flex items-center gap-1"><Youtube size={10}/> Video</span>
                                              ) : res.url.startsWith('http') && !res.url.includes('r2.dev') ? (
                                                  <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded w-fit flex items-center gap-1"><LinkIcon size={10}/> Link</span>
                                              ) : (
                                                  <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded w-fit">Dosya</span>
                                              )}
                                          </div>
                                      </td>
                                      <td className="p-4">
                                          <div className="font-medium text-stone-800 max-w-[180px] truncate" title={res.title}>
                                              {res.url ? <a href={res.url} target="_blank" className="hover:underline hover:text-boun-blue">{res.title}</a> : res.title}
                                          </div>
                                          <div className="text-xs text-stone-400">{res.size || 'N/A'}</div>
                                      </td>
                                      <td className="p-4 text-xs">
                                          <div className="flex items-center gap-1 text-stone-600">
                                              <User size={12} /> {res.uploaderName || 'Anonim'}
                                          </div>
                                          <div className="text-[10px] text-stone-400 mt-0.5">
                                              {res.createdAt?.toDate ? formatDate(res.createdAt.toDate().toISOString()) : '-'}
                                          </div>
                                      </td>
                                      <td className="p-4 text-right">
                                          <div className="flex justify-end gap-2">
                                              {activeTab === 'pending' && (
                                                  <button 
                                                      onClick={() => handleApprove(res.id)}
                                                      className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded transition-colors"
                                                      title="Onayla"
                                                  >
                                                      <Check size={16} />
                                                  </button>
                                              )}
                                              <button 
                                                  onClick={() => handleReject(res.id)}
                                                  className={cn(
                                                      "p-2 rounded transition-colors",
                                                      activeTab === 'pending' ? "bg-red-50 text-red-600 hover:bg-red-100" : "text-stone-400 hover:text-red-600 hover:bg-red-50"
                                                  )}
                                                  title={activeTab === 'pending' ? "Reddet" : "Sil"}
                                              >
                                                  {activeTab === 'pending' ? <XCircle size={16} /> : <Trash2 size={16} />}
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};