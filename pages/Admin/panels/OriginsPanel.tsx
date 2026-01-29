import React, { useState, useEffect } from 'react';
import { Header, Input, Select, TextArea, FileUploader } from '../components/SharedUI';
import { Plus, X, Image as ImageIcon, Save, Loader2, Trash2, Youtube, Tag, Edit3, Link as LinkIcon, Film } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, onSnapshot, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { uploadFile } from '../../../lib/storage';
import { cn } from '../../../lib/utils';

// --- CONSTANTS ---
const CATEGORIES = [
    { val: 'Kampüs Anıları', label: 'Kampüs Anıları' },
    { val: 'Efsane', label: 'Efsane' },
    { val: 'Portreler & Simalar', label: 'Portreler & Simalar' },
    { val: 'Mekan & Manzara', label: 'Mekan & Manzara' },
    { val: 'Objeler & Yadigarlar', label: 'Objeler & Yadigarlar' },
    { val: 'Gelenekler', label: 'Gelenekler' },
    { val: 'Alıntılar', label: 'Alıntılar' },
    { val: 'Basın & Medya', label: 'Basın & Medya' },
    { val: 'Tarihi Anlar', label: 'Tarihi Anlar' }
];

export const OriginsPanel = () => {
  // --- STATE ---
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
      title: '',
      category: 'Kampüs Anıları',
      year: new Date().getFullYear().toString(),
      source: '',
      content: '',
      youtubeUrl: '',
      externalUrl: '',
      tagsInput: ''
  });
  
  // Media Logic: Mutual Exclusion
  // 'upload': Local files (images/videos) via R2
  // 'youtube': External YouTube Link
  const [mediaSource, setMediaSource] = useState<'upload' | 'youtube'>('upload');
  
  // Stores URLs of uploaded files (Images or Video)
  const [uploadedMedia, setUploadedMedia] = useState<string[]>([]); 

  // --- FETCH DATA ---
  useEffect(() => {
      const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setStories(data);
      });
      return () => unsubscribe();
  }, []);

  // --- HANDLERS ---

  const handleInputChange = (field: string, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (files: File | FileList) => {
      if (!files) return;
      
      const fileArray = files instanceof FileList ? Array.from(files) : [files];
      setUploading(true);

      try {
          const newUrls: string[] = [];
          for (const file of fileArray) {
              const path = `kokler-hikayeler/${new Date().getFullYear()}`;
              const result = await uploadFile(file, path);
              newUrls.push(result.url);
          }
          setUploadedMedia(prev => [...prev, ...newUrls]);
      } catch (error) {
          console.error(error);
          alert("Yükleme sırasında hata oluştu.");
      } finally {
          setUploading(false);
      }
  };

  const removeMedia = (index: number) => {
      setUploadedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
      if (!formData.title || !formData.content) {
          alert("Lütfen en azından Başlık ve Hikaye Metni giriniz.");
          return;
      }

      setLoading(true);
      try {
          // Process Tags
          const tagsArray = formData.tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);

          // Determine final media
          // If 'youtube' mode is selected, we ignore uploaded files.
          // If 'upload' mode is selected, we ignore youtubeUrl field.
          const finalImages = mediaSource === 'upload' ? uploadedMedia : [];
          const finalYoutubeUrl = mediaSource === 'youtube' ? formData.youtubeUrl : '';

          const payload = {
              title: formData.title,
              category: formData.category,
              year: formData.year,
              source: formData.source || 'Anonim',
              content: formData.content,
              images: finalImages, // Now contains both images and videos from R2
              youtubeUrl: finalYoutubeUrl,
              externalUrl: formData.externalUrl || '',
              tags: tagsArray,
              updatedAt: serverTimestamp()
          };

          if (editingId) {
              await updateDoc(doc(db, "stories", editingId), payload);
              alert("Hikaye güncellendi.");
              setEditingId(null);
          } else {
              await addDoc(collection(db, "stories"), {
                  ...payload,
                  createdAt: serverTimestamp()
              });
              alert("Hikaye paylaşıldı.");
          }

          // Reset Form
          setFormData({
              title: '', category: 'Kampüs Anıları', year: new Date().getFullYear().toString(),
              source: '', content: '', youtubeUrl: '', externalUrl: '', tagsInput: ''
          });
          setUploadedMedia([]);
          setMediaSource('upload');

      } catch (error) {
          console.error(error);
          alert("Hata oluştu.");
      } finally {
          setLoading(false);
      }
  };

  const handleEdit = (item: any) => {
      setEditingId(item.id);
      setFormData({
          title: item.title,
          category: item.category,
          year: item.year,
          source: item.source,
          content: item.content,
          youtubeUrl: item.youtubeUrl || '',
          externalUrl: item.externalUrl || '',
          tagsInput: item.tags ? item.tags.join(', ') : ''
      });
      
      // Determine mode based on existing data
      if (item.youtubeUrl) {
          setMediaSource('youtube');
          setUploadedMedia([]);
      } else {
          setMediaSource('upload');
          setUploadedMedia(item.images || []);
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
      if (confirm("Bu hikayeyi silmek istediğinize emin misiniz?")) {
          await deleteDoc(doc(db, "stories", id));
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <Header title="Kökler ve Hikayeler" desc="Kampüs hafızasını oluşturan hikayeleri, fotoğrafları ve anıları yönetin." />

      <div className={cn("bg-white p-8 rounded-xl border shadow-sm transition-colors", editingId ? "border-boun-blue/50 ring-2 ring-boun-blue/10" : "border-stone-200")}>
          <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2">
                  {editingId ? <Edit3Icon/> : <Plus size={20}/>}
                  {editingId ? "Hikayeyi Düzenle" : "Yeni Hikaye Ekle"}
              </h3>
              {editingId && <button onClick={() => { setEditingId(null); setUploadedMedia([]); setFormData(prev => ({...prev, title: ''})); }} className="text-sm text-red-500 hover:underline">Vazgeç</button>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2 space-y-4">
                  <Input label="Hikaye Başlığı" placeholder="Örn: Manzara'da İlk Çay" value={formData.title} onChange={(v: string) => handleInputChange('title', v)} />
                  <div className="grid grid-cols-2 gap-4">
                      <Select label="Kategori" options={CATEGORIES} value={formData.category} onChange={(v: string) => handleInputChange('category', v)} />
                      <Input label="Yıl" placeholder="1990" value={formData.year} onChange={(v: string) => handleInputChange('year', v)} />
                  </div>
                  <Input label="Kaynak / Anlatan" placeholder="Örn: Anonim Mezun, Boğaziçi Memories" value={formData.source} onChange={(v: string) => handleInputChange('source', v)} />
                  <div className="relative">
                      <Input 
                        label="Harici Bağlantı / Kaynak Linki (Opsiyonel)" 
                        placeholder="https://..." 
                        value={formData.externalUrl} 
                        onChange={(v: string) => handleInputChange('externalUrl', v)} 
                      />
                      <LinkIcon size={14} className="absolute top-0 right-0 text-stone-400 mt-1 mr-1" />
                  </div>
              </div>

              {/* MEDIA SELECTION AREA */}
              <div className="md:col-span-1 bg-stone-50 p-4 rounded-lg border border-stone-200 flex flex-col h-full">
                  <div className="mb-4">
                      <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Medya Türü</label>
                      <div className="flex bg-stone-200 p-1 rounded">
                          <button 
                              onClick={() => setMediaSource('upload')}
                              className={cn("flex-1 text-xs font-bold py-1.5 rounded transition-all", mediaSource === 'upload' ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-700")}
                          >
                              Dosya Yükle
                          </button>
                          <button 
                              onClick={() => setMediaSource('youtube')}
                              className={cn("flex-1 text-xs font-bold py-1.5 rounded transition-all", mediaSource === 'youtube' ? "bg-white shadow-sm text-red-600" : "text-stone-500 hover:text-stone-700")}
                          >
                              YouTube
                          </button>
                      </div>
                  </div>

                  {mediaSource === 'youtube' ? (
                      <div className="mt-auto mb-auto animate-in fade-in">
                          <Youtube size={32} className="text-red-500 mb-2 mx-auto" />
                          <Input label="YouTube Linki" placeholder="https://..." value={formData.youtubeUrl} onChange={(v: string) => handleInputChange('youtubeUrl', v)} />
                          <p className="text-[10px] text-stone-400 mt-2 text-center">Video otomatik olarak oynatıcıya dönüşecektir.</p>
                      </div>
                  ) : (
                      <div className="animate-in fade-in flex flex-col h-full">
                          <div className="flex-1 overflow-y-auto max-h-[150px] grid grid-cols-3 gap-2 mb-2 content-start custom-scrollbar">
                              {uploadedMedia.map((url, idx) => (
                                  <div key={idx} className="relative aspect-square rounded overflow-hidden group bg-stone-200">
                                      {url.endsWith('.mp4') || url.endsWith('.webm') ? (
                                          <video src={url} className="w-full h-full object-cover" muted />
                                      ) : (
                                          <img src={url} className="w-full h-full object-cover" />
                                      )}
                                      <button onClick={() => removeMedia(idx)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><X size={16}/></button>
                                  </div>
                              ))}
                              {uploading && <div className="aspect-square flex items-center justify-center bg-stone-200 rounded"><Loader2 className="animate-spin text-stone-400"/></div>}
                          </div>
                          <FileUploader 
                              label="Fotoğraf veya Video Seç" 
                              allowMultiple={true}
                              isFolder={false}
                              accept="image/*,video/*"
                              onFileSelect={handleFileSelect}
                              selectedFileName={uploadedMedia.length > 0 ? `${uploadedMedia.length} dosya eklendi` : ""}
                          />
                          <p className="text-[10px] text-stone-400 mt-2 text-center">Birden fazla fotoğraf veya kısa video yükleyebilirsiniz.</p>
                      </div>
                  )}
              </div>
          </div>

          <div className="space-y-4">
              <TextArea label="Hikaye Metni" className="h-48 font-serif text-lg" placeholder="Bir zamanlar..." value={formData.content} onChange={(v: string) => handleInputChange('content', v)} />
              
              <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Tag size={12}/> Etiketler (Virgülle Ayırın)
                  </label>
                  <input 
                      type="text" 
                      placeholder="kuzey kampüs, kedi, yemekhane, 90lar"
                      value={formData.tagsInput}
                      onChange={(e) => handleInputChange('tagsInput', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded text-stone-900 outline-none focus:border-stone-800 transition-all font-sans text-sm"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tagsInput.split(',').filter(t => t.trim().length > 0).map((tag, i) => (
                          <span key={i} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded font-bold border border-stone-200">#{tag.trim()}</span>
                      ))}
                  </div>
              </div>
          </div>

          <div className="mt-8 flex justify-end">
              <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-stone-900 text-white px-8 py-3 rounded font-bold text-sm hover:bg-stone-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-70"
              >
                  {loading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                  {editingId ? "Güncelle" : "Hikayeyi Paylaş"}
              </button>
          </div>
      </div>

      {/* STORY LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => {
              const hasYoutube = !!story.youtubeUrl;
              const hasMedia = story.images && story.images.length > 0;
              
              return (
              <div key={story.id} className="bg-white p-0 rounded-lg border border-stone-200 overflow-hidden group shadow-sm hover:shadow-md transition-all">
                  <div className="h-48 bg-stone-100 relative overflow-hidden">
                      {hasYoutube ? (
                          <div className="w-full h-full flex items-center justify-center bg-black text-white">
                              <img 
                                src={`https://img.youtube.com/vi/${story.youtubeUrl.split('v=')[1] || story.youtubeUrl.split('/').pop()}/hqdefault.jpg`} 
                                className="w-full h-full object-cover opacity-60" 
                              />
                              <Youtube size={32} className="absolute z-10"/>
                          </div>
                      ) : hasMedia ? (
                          <>
                            {story.images[0].endsWith('.mp4') ? (
                                <div className="w-full h-full flex items-center justify-center bg-black">
                                    <Film size={32} className="text-white"/>
                                </div>
                            ) : (
                                <img src={story.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            )}
                            {story.images.length > 1 && (
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                                    +{story.images.length - 1}
                                </div>
                            )}
                          </>
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300"><ImageIcon size={32}/></div>
                      )}
                      <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{story.category}</div>
                  </div>
                  <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                          <h4 className="font-serif font-bold text-lg leading-tight line-clamp-1">{story.title}</h4>
                          <span className="text-xs font-mono text-stone-400 font-bold">{story.year}</span>
                      </div>
                      <p className="text-sm text-stone-500 line-clamp-2 mb-4">{story.content}</p>
                      
                      {story.externalUrl && (
                          <div className="mb-3 text-[10px] text-blue-600 font-bold flex items-center gap-1">
                              <LinkIcon size={10} /> Bağlantı Mevcut
                          </div>
                      )}

                      <div className="flex justify-end gap-2 border-t border-stone-100 pt-3">
                          <button onClick={() => handleEdit(story)} className="p-1.5 text-stone-400 hover:text-boun-blue hover:bg-blue-50 rounded"><Edit3Icon/></button>
                          <button onClick={() => handleDelete(story.id)} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                      </div>
                  </div>
              </div>
          )})}
      </div>
    </div>
  );
};

// Helper Icon
const Edit3Icon = () => <Edit3 size={16} />;