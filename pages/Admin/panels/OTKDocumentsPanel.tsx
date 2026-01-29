import React, { useState, useEffect } from 'react';
import { 
  Folder, FileText, Plus, UploadCloud, ArrowLeft, Home, 
  Trash2, Download, Search, CornerDownRight, Loader2, X, File, FolderPlus, Settings 
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { uploadFile } from '../../../lib/storage';
import { Header, Input, Select, TextArea, FileUploader } from '../components/SharedUI';
import { cn, formatDate } from '../../../lib/utils';
import { MOCK_COMMISSIONS_EXPANDED } from '../../../lib/data';

const COMMISSION_OPTIONS = [
    { val: '', label: 'Hiçbiri / Genel Belge' },
    ...MOCK_COMMISSIONS_EXPANDED.map(c => ({ val: c.id, label: c.name }))
];

interface Breadcrumb {
  id: string;
  name: string;
}

interface FileSystemItem {
    id: string;
    title: string;
    type: 'root' | 'folder' | 'file';
    parentPath: string;
    url?: string;
    mimeType?: string;
    size?: string;
    createdAt?: any;
    relatedCommissionId?: string;
}

export const OTKDocumentsPanel = () => {
  // --- STATE ---
  
  // 1. Root Categories (Sidebar)
  const [rootCategories, setRootCategories] = useState<FileSystemItem[]>([]);
  const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
  
  // 2. Main Content Navigation
  const [currentPathId, setCurrentPathId] = useState<string>('main'); // 'main' means we are at selection screen
  // Breadcrumbs track the navigation history: [Root Category] -> [Sub Folder 1] -> [Sub Folder 2]
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  
  // 3. Content Data
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 4. Modals
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setFolderModalOpen] = useState(false);
  const [isRootModalOpen, setRootModalOpen] = useState(false); // New: Create Root Category
  
  // 5. Forms
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadFormData, setUploadFormData] = useState({ title: '', description: '', relatedCommissionId: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newRootName, setNewRootName] = useState('');

  // --- FETCH ROOT CATEGORIES (SIDEBAR) ---
  useEffect(() => {
      // Query by parentPath 'main' to get all roots.
      const q = query(
          collection(db, "otk_documents"), 
          where("parentPath", "==", "main")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FileSystemItem[];
          
          // Client-side Sort: Oldest first
          data.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

          setRootCategories(data);
      }, (err) => {
          console.error("Root Fetch Error:", err);
      });
      return () => unsubscribe();
  }, []);

  // --- FETCH FOLDER CONTENT ---
  useEffect(() => {
      if (!currentPathId || currentPathId === 'main') {
          setItems([]);
          return;
      }

      setLoading(true);
      const q = query(
          collection(db, "otk_documents"),
          where("parentPath", "==", currentPathId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FileSystemItem[];
          
          // Manual Sort: Folders > Files, then Date Descending
          data.sort((a, b) => {
              if (a.type === 'folder' && b.type !== 'folder') return -1;
              if (a.type !== 'folder' && b.type === 'folder') return 1;
              return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
          });

          setItems(data);
          setLoading(false);
      }, (err) => {
          console.error("Content Fetch Error:", err);
          setLoading(false);
      });

      return () => unsubscribe();
  }, [currentPathId]);

  // --- NAVIGATION HANDLERS ---

  const handleRootSelect = (root: FileSystemItem) => {
      setSelectedRootId(root.id);
      setCurrentPathId(root.id);
      setBreadcrumbs([{ id: root.id, name: root.title }]);
  };

  const enterFolder = (folder: FileSystemItem) => {
      setCurrentPathId(folder.id);
      setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.title }]);
  };

  const navigateBreadcrumb = (index: number) => {
      const target = breadcrumbs[index];
      setCurrentPathId(target.id);
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  // --- ACTIONS: CREATE ---

  const handleCreateRoot = async () => {
      if (!newRootName.trim()) return;
      try {
          await addDoc(collection(db, "otk_documents"), {
              title: newRootName,
              type: 'root',
              parentPath: 'main', 
              createdAt: serverTimestamp()
          });
          setRootModalOpen(false);
          setNewRootName('');
      } catch (e) {
          console.error(e);
          alert("Kök kategori oluşturulamadı.");
      }
  };

  const handleCreateFolder = async () => {
      if (!newFolderName.trim()) return;
      try {
          await addDoc(collection(db, "otk_documents"), {
              title: newFolderName,
              type: 'folder',
              parentPath: currentPathId,
              createdAt: serverTimestamp(),
              relatedCommissionId: ''
          });
          setFolderModalOpen(false);
          setNewFolderName('');
      } catch (e) {
          console.error(e);
          alert("Klasör oluşturulamadı.");
      }
  };

  const handleFileUpload = async () => {
      if (!pendingFile || !uploadFormData.title) {
          alert("Lütfen dosya seçin ve başlık girin.");
          return;
      }

      setIsUploading(true);
      try {
          // --- DYNAMIC R2 PATH CONSTRUCTION ---
          // Path: otk-belgeleri / [Root Name] / [Sub Folder 1] / [Sub Folder 2] / filename
          const pathSegments = breadcrumbs.map(b => b.name);
          const storagePath = `otk-belgeleri/${pathSegments.join('/')}`;

          console.log("Uploading to:", storagePath);

          const result = await uploadFile(pendingFile, storagePath);

          await addDoc(collection(db, "otk_documents"), {
              title: uploadFormData.title,
              type: 'file',
              parentPath: currentPathId,
              url: result.url,
              storageKey: result.key,
              mimeType: pendingFile.type,
              size: result.size,
              description: uploadFormData.description,
              relatedCommissionId: uploadFormData.relatedCommissionId,
              createdAt: serverTimestamp()
          });

          setUploadModalOpen(false);
          setPendingFile(null);
          setUploadFormData({ title: '', description: '', relatedCommissionId: '' });
          alert("Dosya başarıyla yüklendi.");

      } catch (error: any) {
          console.error("Upload Component Error:", error);
          alert("Yükleme başarısız: " + (error.message || "Bilinmeyen hata"));
      } finally {
          setIsUploading(false);
      }
  };

  const handleDelete = async (item: FileSystemItem) => {
      const msg = item.type === 'folder' || item.type === 'root'
        ? `"${item.title}" klasörünü ve İÇİNDEKİLERİ silmek üzeresiniz. Bu işlem geri alınamaz!` 
        : `"${item.title}" belgesini silmek istediğinize emin misiniz?`;
      
      if (window.confirm(msg)) {
          if (item.type === 'root') {
              if (selectedRootId === item.id) {
                  setSelectedRootId(null);
                  setCurrentPathId('main');
                  setBreadcrumbs([]);
              }
          }
          await deleteDoc(doc(db, "otk_documents", item.id));
      }
  };

  // --- RENDER ---

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in">
      
      {/* LEFT SIDEBAR (ROOT CATEGORIES) */}
      <div className="w-64 bg-stone-50 border-r border-stone-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-stone-200 flex justify-between items-center">
              <div>
                  <h3 className="font-serif font-bold text-stone-800 text-lg">Belgeler</h3>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Kök Dizinler</p>
              </div>
              <button onClick={() => setRootModalOpen(true)} className="p-1.5 bg-stone-200 hover:bg-stone-300 rounded text-stone-600 transition-colors" title="Yeni Kök Dizin">
                  <Plus size={16} />
              </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {rootCategories.length === 0 && (
                  <div className="text-center p-4 text-xs text-stone-400 italic">
                      Henüz bir kök kategori yok. Yukarıdan ekleyin.
                  </div>
              )}
              {rootCategories.map((root) => (
                  <div key={root.id} className="group relative">
                      <button
                          onClick={() => handleRootSelect(root)}
                          className={cn(
                              "w-full text-left px-3 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors pr-8",
                              selectedRootId === root.id 
                                  ? "bg-stone-800 text-white shadow-md" 
                                  : "text-stone-600 hover:bg-stone-200"
                          )}
                      >
                          {selectedRootId === root.id ? <FolderOpenIcon className="text-boun-gold" size={16}/> : <Folder size={16}/>}
                          <span className="truncate">{root.title}</span>
                      </button>
                      <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(root); }}
                          className={cn(
                              "absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                              selectedRootId === root.id ? "text-stone-400 hover:text-red-400" : "text-stone-400 hover:text-red-600 hover:bg-stone-300"
                          )}
                      >
                          <X size={12} />
                      </button>
                  </div>
              ))}
          </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fdfbf7]">
          
          {/* TOOLBAR */}
          <div className="h-16 border-b border-stone-200 flex items-center justify-between px-6 bg-white shrink-0">
              <div className="flex items-center gap-2 text-sm text-stone-600 overflow-hidden whitespace-nowrap mask-linear-fade">
                  {breadcrumbs.length === 0 ? (
                      <span className="text-stone-400 italic">Bir kategori seçin...</span>
                  ) : (
                      breadcrumbs.map((crumb, idx) => (
                          <React.Fragment key={crumb.id}>
                              <button 
                                  onClick={() => navigateBreadcrumb(idx)}
                                  className={cn(
                                      "hover:underline decoration-stone-400 underline-offset-4 flex items-center gap-1",
                                      idx === breadcrumbs.length - 1 ? "font-bold text-stone-900 pointer-events-none" : ""
                                  )}
                              >
                                  {idx === 0 ? <Folder size={16} className="text-amber-600" /> : <FolderOpenIcon size={16} className="text-amber-500" />}
                                  {crumb.name}
                              </button>
                              {idx < breadcrumbs.length - 1 && <span className="text-stone-300">/</span>}
                          </React.Fragment>
                      ))
                  )}
              </div>

              {selectedRootId && (
                  <div className="flex gap-2">
                      <button 
                          onClick={() => setFolderModalOpen(true)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold rounded border border-amber-200 transition-colors"
                      >
                          <Plus size={14} /> Yeni Klasör
                      </button>
                      <button 
                          onClick={() => setUploadModalOpen(true)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 text-white hover:bg-stone-700 text-xs font-bold rounded shadow-sm transition-colors"
                      >
                          <UploadCloud size={14} /> Dosya Yükle
                      </button>
                  </div>
              )}
          </div>

          {/* FILE LIST */}
          <div className="flex-1 overflow-y-auto p-6">
              {!selectedRootId ? (
                  <div className="flex flex-col items-center justify-center h-full text-stone-400">
                      <Settings size={48} className="mb-4 opacity-20" />
                      <p>İşlem yapmak için soldan bir kök kategori seçin veya oluşturun.</p>
                  </div>
              ) : loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-stone-400">
                      <Loader2 className="animate-spin mb-2" size={32} />
                      <span className="text-sm">İçerik yükleniyor...</span>
                  </div>
              ) : items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-stone-200 rounded-lg bg-stone-50/50">
                      <Folder size={48} className="text-stone-300 mb-2" />
                      <p className="text-stone-500 font-serif">Bu klasör boş.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
                      {items.map((item) => (
                          <div 
                              key={item.id}
                              className={cn(
                                  "group relative p-4 rounded-lg border flex flex-col gap-3 transition-all hover:shadow-md cursor-pointer select-none",
                                  item.type === 'folder' 
                                      ? "bg-amber-50/50 border-amber-200 hover:bg-amber-100 hover:border-amber-300" 
                                      : "bg-white border-stone-200 hover:border-boun-blue"
                              )}
                              onDoubleClick={() => item.type === 'folder' ? enterFolder(item) : null}
                          >
                              <div className="flex items-start justify-between">
                                  {item.type === 'folder' ? (
                                      <Folder className="text-amber-400 fill-amber-100" size={36} />
                                  ) : (
                                      <div className="w-10 h-10 bg-stone-100 rounded flex items-center justify-center text-stone-500 font-bold text-xs border border-stone-200">
                                          {item.mimeType?.includes('pdf') ? (
                                              <FileText className="text-red-500" size={20} />
                                          ) : (
                                              <File className="text-blue-500" size={20} />
                                          )}
                                      </div>
                                  )}
                                  
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded transition-all"
                                  >
                                      <Trash2 size={14} />
                                  </button>
                              </div>

                              <div className="mt-1">
                                  <h4 className={cn(
                                      "font-bold text-sm truncate leading-tight",
                                      item.type === 'folder' ? "text-stone-800" : "text-stone-700"
                                  )} title={item.title}>
                                      {item.title}
                                  </h4>
                                  <p className="text-[10px] text-stone-400 mt-1">
                                      {item.type === 'folder' 
                                        ? 'Klasör' 
                                        : item.size || formatDate(item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : new Date().toISOString())}
                                  </p>
                              </div>

                              {item.relatedCommissionId && (
                                  <div className="mt-auto pt-2 border-t border-dashed border-stone-200/50">
                                      <span className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit">
                                          <CornerDownRight size={8} /> Komisyon
                                      </span>
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Create Root Modal */}
      {isRootModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                  <h3 className="font-bold text-lg mb-4 text-stone-800 flex items-center gap-2">
                      <FolderPlus className="text-stone-600" /> Yeni Kök Dizin
                  </h3>
                  <Input 
                      label="Dizin Adı" 
                      placeholder="Örn: Denetleme Kurulu" 
                      value={newRootName}
                      onChange={setNewRootName} 
                  />
                  <div className="flex justify-end gap-2 mt-6">
                      <button onClick={() => setRootModalOpen(false)} className="px-4 py-2 text-sm font-bold text-stone-500 hover:bg-stone-100 rounded">İptal</button>
                      <button onClick={handleCreateRoot} className="px-4 py-2 text-sm font-bold bg-stone-900 text-white rounded hover:bg-stone-700 shadow-sm">Oluştur</button>
                  </div>
              </div>
          </div>
      )}

      {/* 2. Create Folder Modal */}
      {isFolderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                  <h3 className="font-bold text-lg mb-4 text-stone-800 flex items-center gap-2">
                      <Folder className="text-amber-500" /> Yeni Klasör
                  </h3>
                  <Input 
                      label="Klasör Adı" 
                      placeholder="Örn: 2023 Raporları" 
                      value={newFolderName}
                      onChange={setNewFolderName} 
                  />
                  <div className="flex justify-end gap-2 mt-6">
                      <button onClick={() => setFolderModalOpen(false)} className="px-4 py-2 text-sm font-bold text-stone-500 hover:bg-stone-100 rounded">İptal</button>
                      <button onClick={handleCreateFolder} className="px-4 py-2 text-sm font-bold bg-amber-500 text-white rounded hover:bg-amber-600 shadow-sm">Oluştur</button>
                  </div>
              </div>
          </div>
      )}

      {/* 3. Upload File Modal */}
      {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg text-stone-800">Dosya Yükle</h3>
                      <button onClick={() => setUploadModalOpen(false)}><X size={20} className="text-stone-400"/></button>
                  </div>
                  
                  <div className="space-y-4">
                      {/* Destination Info */}
                      <div className="bg-stone-50 p-3 rounded border border-stone-200 text-xs text-stone-500 mb-4 flex flex-col gap-1">
                          <span className="font-bold uppercase tracking-wider">Hedef Konum (R2 Storage):</span>
                          <span className="font-mono text-stone-700 break-all">
                              otk-belgeleri/{breadcrumbs.map(b => b.name).join('/')}
                          </span>
                      </div>

                      <FileUploader 
                          label="Dosya Seç"
                          onFileSelect={(f) => { setPendingFile(f as File); setUploadFormData(prev => ({ ...prev, title: (f as File).name })); }}
                          selectedFileName={pendingFile?.name}
                      />
                      
                      <Input 
                          label="Dosya Başlığı" 
                          placeholder="Dosya adı" 
                          value={uploadFormData.title}
                          onChange={(v: string) => setUploadFormData(p => ({...p, title: v}))} 
                      />
                      
                      <Select 
                          label="İlişkili Komisyon (Opsiyonel)"
                          options={COMMISSION_OPTIONS}
                          value={uploadFormData.relatedCommissionId}
                          onChange={(v: string) => setUploadFormData(p => ({...p, relatedCommissionId: v}))}
                      />

                      <TextArea 
                          label="Açıklama (Opsiyonel)"
                          placeholder="Belge hakkında kısa bilgi..."
                          className="h-20"
                          value={uploadFormData.description}
                          onChange={(v: string) => setUploadFormData(p => ({...p, description: v}))}
                      />
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                      <button 
                          onClick={handleFileUpload}
                          disabled={isUploading}
                          className="w-full py-3 bg-stone-900 text-white font-bold rounded shadow-lg hover:bg-stone-700 disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                          {isUploading ? <Loader2 className="animate-spin" size={18}/> : <UploadCloud size={18}/>}
                          {isUploading ? 'Buluta Yükleniyor...' : 'Kaydet'}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

// Helper Icon
const FolderOpenIcon = ({ size, className }: any) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      stroke="currentColor" 
      strokeWidth="0" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" stroke="none" />
      <path d="M4 6v12h16V8H4z" fillOpacity="0.2" stroke="none" /> 
      <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" fill="none" strokeWidth="2" />
    </svg>
);