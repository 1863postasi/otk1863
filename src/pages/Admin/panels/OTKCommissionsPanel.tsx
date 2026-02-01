import React, { useState, useEffect } from 'react';
import { Header, Input, TextArea, ActionButtons, Select } from '../components/SharedUI';
import { Plus, Trash2, Edit3, GripVertical, Link as LinkIcon, Users, BookOpen, Camera, MapPin, Scale, AlertTriangle, Clock } from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { cn } from '../../../lib/utils';

interface SubUnit {
    title: string;
    members: string;
}

interface ExternalLink {
    label: string;
    url: string;
}

interface Commission {
    id: string;
    name: string;
    description: string;
    icon: string;
    status: 'active' | 'coming_soon';
    subUnits: SubUnit[];
    externalLinks: ExternalLink[];
    archiveTag: string;
}

const ICON_OPTIONS = [
    { val: 'BookOpen', label: 'BookOpen (Arşiv/Belge)' },
    { val: 'Camera', label: 'Camera (Medya/Sanat)' },
    { val: 'MapPin', label: 'MapPin (Mekan/Yerleşke)' },
    { val: 'Scale', label: 'Scale (Hukuk/Haklar)' },
    { val: 'AlertTriangle', label: 'AlertTriangle (Afet/Acil)' },
    { val: 'Users', label: 'Users (Genel/Topluluk)' },
];

export const OTKCommissionsPanel = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<Commission, 'id'>>({
      name: '',
      description: '',
      icon: 'BookOpen',
      status: 'active',
      subUnits: [],
      externalLinks: [],
      archiveTag: ''
  });

  // Fetch Data
  useEffect(() => {
      const q = query(collection(db, "otk_commissions"), orderBy("createdAt", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Commission[];
          setCommissions(data);
      });
      return () => unsubscribe();
  }, []);

  // --- Handlers ---

  const handleEdit = (comm: Commission) => {
      setEditingId(comm.id);
      setIsAdding(true);
      setFormData({
          name: comm.name,
          description: comm.description,
          icon: comm.icon,
          status: comm.status,
          subUnits: comm.subUnits || [],
          externalLinks: comm.externalLinks || [],
          archiveTag: comm.archiveTag || ''
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
      if (confirm("Bu komisyonu silmek istediğinize emin misiniz?")) {
          await deleteDoc(doc(db, "otk_commissions", id));
      }
  };

  const handleSave = async () => {
      if (!formData.name) {
          alert("Komisyon adı zorunludur.");
          return;
      }

      setLoading(true);
      try {
          const payload = { ...formData, createdAt: serverTimestamp() };
          
          if (editingId) {
              const { createdAt, ...updatePayload } = payload; // Don't update createdAt
              await updateDoc(doc(db, "otk_commissions", editingId), updatePayload);
          } else {
              await addDoc(collection(db, "otk_commissions"), payload);
          }
          
          setIsAdding(false);
          setEditingId(null);
          setFormData({ name: '', description: '', icon: 'BookOpen', status: 'active', subUnits: [], externalLinks: [], archiveTag: '' });
      } catch (e) {
          console.error(e);
          alert("Hata oluştu.");
      } finally {
          setLoading(false);
      }
  };

  // --- Sub Unit Logic ---
  const addSubUnit = () => {
      setFormData(prev => ({ ...prev, subUnits: [...prev.subUnits, { title: '', members: '' }] }));
  };
  const updateSubUnit = (index: number, field: keyof SubUnit, value: string) => {
      const newUnits = [...formData.subUnits];
      newUnits[index][field] = value;
      setFormData(prev => ({ ...prev, subUnits: newUnits }));
  };
  const removeSubUnit = (index: number) => {
      setFormData(prev => ({ ...prev, subUnits: prev.subUnits.filter((_, i) => i !== index) }));
  };

  // --- External Link Logic ---
  const addLink = () => {
      setFormData(prev => ({ ...prev, externalLinks: [...prev.externalLinks, { label: '', url: '' }] }));
  };
  const updateLink = (index: number, field: keyof ExternalLink, value: string) => {
      const newLinks = [...formData.externalLinks];
      newLinks[index][field] = value;
      setFormData(prev => ({ ...prev, externalLinks: newLinks }));
  };
  const removeLink = (index: number) => {
      setFormData(prev => ({ ...prev, externalLinks: prev.externalLinks.filter((_, i) => i !== index) }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Header title="Komisyon Kartı Tasarlayıcı" desc="Esnek yapı sayesinde her komisyonun iç hiyerarşisini özelleştirin." />

      {/* 1. LIST VIEW */}
      {!isAdding && (
          <div className="space-y-4">
              <button 
                  onClick={() => setIsAdding(true)}
                  className="w-full py-4 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 font-bold flex items-center justify-center gap-2 hover:bg-stone-50 hover:border-stone-400 transition-colors"
              >
                  <Plus size={20} /> Yeni Komisyon Ekle
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {commissions.map(comm => (
                      <div key={comm.id} className={cn("p-4 rounded-lg border flex flex-col gap-2 relative group bg-white shadow-sm", comm.status === 'coming_soon' ? 'border-dashed border-stone-300 opacity-70' : 'border-stone-200')}>
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                  <div className="p-2 bg-stone-100 rounded text-stone-600">
                                      {/* Simple icon preview */}
                                      {comm.icon === 'Camera' ? <Camera size={16}/> : comm.icon === 'MapPin' ? <MapPin size={16}/> : <BookOpen size={16}/>}
                                  </div>
                                  <h4 className="font-serif font-bold text-lg text-stone-900">{comm.name}</h4>
                              </div>
                              {comm.status === 'coming_soon' && <span className="text-[10px] bg-stone-100 px-2 py-1 rounded font-bold uppercase text-stone-500">Yakında</span>}
                          </div>
                          
                          <p className="text-sm text-stone-500 line-clamp-2">{comm.description}</p>
                          
                          <div className="flex gap-2 text-xs font-mono text-stone-400 mt-2">
                              <span>{comm.subUnits?.length || 0} Alt Birim</span>
                              <span>•</span>
                              <span>Tag: {comm.archiveTag}</span>
                          </div>

                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(comm)} className="p-1.5 bg-white border border-stone-200 rounded text-stone-500 hover:text-boun-blue"><Edit3 size={14}/></button>
                              <button onClick={() => handleDelete(comm.id)} className="p-1.5 bg-white border border-stone-200 rounded text-stone-500 hover:text-red-600"><Trash2 size={14}/></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* 2. ADD/EDIT FORM */}
      {isAdding && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 md:p-8 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-4">
                  <h3 className="font-bold text-xl text-stone-800">{editingId ? 'Komisyonu Düzenle' : 'Yeni Komisyon Tasarla'}</h3>
                  <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm font-bold text-stone-600 cursor-pointer">
                          <input type="radio" checked={formData.status === 'active'} onChange={() => setFormData(p => ({...p, status: 'active'}))} className="accent-boun-blue"/> Aktif
                      </label>
                      <label className="flex items-center gap-2 text-sm font-bold text-stone-600 cursor-pointer">
                          <input type="radio" checked={formData.status === 'coming_soon'} onChange={() => setFormData(p => ({...p, status: 'coming_soon'}))} className="accent-stone-500"/> Çok Yakında
                      </label>
                  </div>
              </div>

              <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Komisyon Adı" placeholder="Örn: Arşiv ve İletişim" value={formData.name} onChange={(v: string) => setFormData(p => ({...p, name: v}))} />
                      <Select label="İkon" options={ICON_OPTIONS} value={formData.icon} onChange={(v: string) => setFormData(p => ({...p, icon: v}))} />
                  </div>
                  
                  <TextArea label="Kısa Açıklama (Kart Üzerinde Görünür)" placeholder="Komisyonun amacı..." value={formData.description} onChange={(v: string) => setFormData(p => ({...p, description: v}))} />
                  
                  <Input label="Arşiv Etiketi (Deep Link ID)" placeholder="Örn: arsiv_iletisim (Dosyalardaki ID ile eşleşmeli)" value={formData.archiveTag} onChange={(v: string) => setFormData(p => ({...p, archiveTag: v}))} />

                  {/* Sub Units Builder */}
                  <div className="bg-white p-4 rounded-lg border border-stone-200">
                      <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-sm text-stone-700 flex items-center gap-2"><Users size={16}/> Alt Çalışma Grupleri / Birimler</h4>
                          <button onClick={addSubUnit} className="text-xs bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded font-bold text-stone-600 transition-colors">+ Birim Ekle</button>
                      </div>
                      
                      <div className="space-y-3">
                          {formData.subUnits.map((unit, idx) => (
                              <div key={idx} className="flex gap-2 items-start animate-in fade-in">
                                  <div className="mt-3 text-stone-300"><GripVertical size={16}/></div>
                                  <div className="flex-1 space-y-2">
                                      <input 
                                          type="text" 
                                          placeholder="Birim Başlığı (Örn: Sosyal Medya Ekibi)" 
                                          className="w-full px-3 py-2 text-sm border border-stone-200 rounded font-bold text-stone-800 placeholder:font-normal"
                                          value={unit.title}
                                          onChange={(e) => updateSubUnit(idx, 'title', e.target.value)}
                                      />
                                      <textarea 
                                          placeholder="Üyeler (Virgülle ayırın veya alt alta yazın)" 
                                          className="w-full px-3 py-2 text-sm border border-stone-200 rounded min-h-[60px]"
                                          value={unit.members}
                                          onChange={(e) => updateSubUnit(idx, 'members', e.target.value)}
                                      />
                                  </div>
                                  <button onClick={() => removeSubUnit(idx)} className="mt-2 text-stone-400 hover:text-red-500"><Trash2 size={16}/></button>
                              </div>
                          ))}
                          {formData.subUnits.length === 0 && <div className="text-center py-4 text-stone-400 text-xs italic border-2 border-dashed border-stone-100 rounded">Henüz alt birim eklenmedi.</div>}
                      </div>
                  </div>

                  {/* External Links Builder */}
                  <div className="bg-white p-4 rounded-lg border border-stone-200">
                      <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-sm text-stone-700 flex items-center gap-2"><LinkIcon size={16}/> Dış Bağlantılar</h4>
                          <button onClick={addLink} className="text-xs bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded font-bold text-stone-600 transition-colors">+ Link Ekle</button>
                      </div>
                      
                      <div className="space-y-2">
                          {formData.externalLinks.map((link, idx) => (
                              <div key={idx} className="flex gap-2 items-center animate-in fade-in">
                                  <input 
                                      type="text" 
                                      placeholder="Etiket (Örn: Başvuru Formu)" 
                                      className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded"
                                      value={link.label}
                                      onChange={(e) => updateLink(idx, 'label', e.target.value)}
                                  />
                                  <input 
                                      type="text" 
                                      placeholder="URL (https://...)" 
                                      className="flex-[2] px-3 py-2 text-sm border border-stone-200 rounded"
                                      value={link.url}
                                      onChange={(e) => updateLink(idx, 'url', e.target.value)}
                                  />
                                  <button onClick={() => removeLink(idx)} className="text-stone-400 hover:text-red-500"><Trash2 size={16}/></button>
                              </div>
                          ))}
                          {formData.externalLinks.length === 0 && <div className="text-center py-4 text-stone-400 text-xs italic border-2 border-dashed border-stone-100 rounded">Link eklenmedi.</div>}
                      </div>
                  </div>
              </div>

              <ActionButtons 
                  loading={loading} 
                  onSave={handleSave} 
                  isEditing={!!editingId} 
                  onCancel={() => { setIsAdding(false); setEditingId(null); }} 
              />
          </div>
      )}
    </div>
  );
};