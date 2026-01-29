import React, { useState, useEffect } from 'react';
import { Megaphone, Pin, Edit3, Trash2 } from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { cn, formatDate } from '../../../lib/utils';
import { Input, Select, TextArea, ActionButtons } from '../components/SharedUI';

const ANNOUNCEMENT_CATEGORIES = [
  "Genel",
  "Akademik",
  "Etkinlik",
  "Acil",
  "Ulaşım",
  "Yemekhane",
  "Burs",
  "Kulüpler",
  "Diğer"
];

export const AnnouncementsPanel = () => {
  // State
  const [formData, setFormData] = useState<any>({ category: 'Genel' });
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch Announcements Live
  useEffect(() => {
    const q = query(collection(db, "announcements"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Client-side Sort: Pinned First, Then Date Descending
      const sortedData = data.sort((a: any, b: any) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setAnnouncements(sortedData);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.text || !formData.date) {
      alert("Lütfen başlık, metin ve tarih alanlarını doldurunuz.");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // Update Logic
        await updateDoc(doc(db, "announcements", editingId), {
          title: formData.title,
          summary: formData.text,
          date: formData.date,
          category: formData.category || 'Genel',
          link: formData.link || "",
        });
        alert("Duyuru güncellendi!");
        setEditingId(null);
      } else {
        // Create Logic
        await addDoc(collection(db, "announcements"), {
          title: formData.title,
          summary: formData.text,
          date: formData.date,
          link: formData.link || "",
          category: formData.category || 'Genel',
          type: 'general',
          createdAt: serverTimestamp(),
          isPinned: false
        });
        alert("Duyuru başarıyla yayına alındı!");
      }
      setFormData({ category: 'Genel' }); // Clear form
    } catch (error: any) {
      console.error("Hata:", error);
      alert("İşlem başarısız: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      text: item.summary,
      date: item.date,
      category: item.category || 'Genel',
      link: item.link
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) {
      try {
        await deleteDoc(doc(db, "announcements", id));
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Silinirken bir hata oluştu.");
      }
    }
  };

  const handleTogglePin = async (item: any) => {
    try {
      if (!item.isPinned) {
        // Check limit
        const pinnedCount = announcements.filter(a => a.isPinned).length;
        if (pinnedCount >= 3) {
          alert("En fazla 3 duyuru pinleyebilirsiniz. Lütfen önce birini kaldırın.");
          return;
        }
      }
      
      await updateDoc(doc(db, "announcements", item.id), {
        isPinned: !item.isPinned
      });
    } catch (error) {
      console.error("Pin hatası:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ category: 'Genel' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in duration-500">
      
      {/* LEFT: FORM AREA */}
      <div className="lg:col-span-2 space-y-6">
        <div className={cn("p-6 rounded-xl border transition-colors", editingId ? "bg-blue-50 border-blue-200" : "bg-white border-stone-200")}>
          <div className="mb-6">
             <h3 className={cn("font-serif text-xl font-bold", editingId ? "text-boun-blue" : "text-stone-900")}>
               {editingId ? "Duyuruyu Düzenle" : "Yeni Duyuru Oluştur"}
             </h3>
             <p className="text-stone-500 text-xs mt-1">Kampüs geneli için metin bazlı bildiri.</p>
          </div>

          <div className="space-y-4">
            <Input 
              label="Duyuru Başlığı" 
              placeholder="Örn: Bahar Dönemi Ders Seçimleri" 
              value={formData.title || ''}
              onChange={(v: string) => handleInputChange('title', v)} 
            />
            
            <Select 
              label="Kategori"
              options={ANNOUNCEMENT_CATEGORIES}
              value={formData.category || 'Genel'}
              onChange={(v: string) => handleInputChange('category', v)}
            />

            <TextArea 
              label="Duyuru Metni" 
              placeholder="Duyuru detaylarını buraya girin..." 
              value={formData.text || ''}
              onChange={(v: string) => handleInputChange('text', v)} 
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Tarih" 
                type="date" 
                value={formData.date || ''}
                onChange={(v: string) => handleInputChange('date', v)} 
              />
              <Input 
                label="İlgili Link (Opsiyonel)" 
                placeholder="https://..." 
                value={formData.link || ''}
                onChange={(v: string) => handleInputChange('link', v)} 
              />
            </div>
          </div>
          
          <ActionButtons 
            loading={loading} 
            onSave={handleSave} 
            isEditing={!!editingId} 
            onCancel={handleCancelEdit} 
          />
        </div>
      </div>

      {/* RIGHT: LIVE LIST AREA */}
      <div className="lg:col-span-3">
        <div className="bg-stone-100 rounded-xl border border-stone-200 p-6 h-full flex flex-col">
           <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <Megaphone size={18} /> Yayındaki Duyurular
              </h3>
              <span className="bg-stone-200 text-stone-600 px-2 py-1 rounded text-xs font-bold">
                {announcements.length} Adet
              </span>
           </div>

           <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-[600px]">
              {announcements.length === 0 && (
                <div className="text-center py-12 text-stone-400 text-sm">
                  Henüz duyuru bulunmuyor.
                </div>
              )}
              
              {announcements.map((item) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "bg-white p-4 rounded-lg border shadow-sm transition-all flex flex-col gap-3 group relative",
                    item.isPinned ? "border-boun-red ring-1 ring-boun-red/20" : "border-stone-200 hover:border-stone-300",
                    editingId === item.id && "ring-2 ring-boun-blue border-boun-blue"
                  )}
                >
                   {/* Header Row */}
                   <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-4">
                         <div className="flex items-center gap-2 mb-1">
                            {item.isPinned && (
                              <span className="bg-boun-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Pin size={8} fill="currentColor" /> PİNLİ
                              </span>
                            )}
                            <span className="bg-stone-100 text-stone-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-stone-200">
                              {item.category || 'Genel'}
                            </span>
                            <span className="text-xs text-stone-400 font-mono font-bold">{formatDate(item.date)}</span>
                         </div>
                         <h4 className="font-bold text-stone-800 leading-tight truncate">{item.title}</h4>
                      </div>
                      
                      <div className="flex items-center gap-1">
                         <button 
                           onClick={() => handleTogglePin(item)}
                           className={cn(
                             "p-2 rounded hover:bg-stone-100 transition-colors",
                             item.isPinned ? "text-boun-red" : "text-stone-300 hover:text-stone-500"
                           )}
                           title={item.isPinned ? "Pini Kaldır" : "Pinle (Max 3)"}
                         >
                           <Pin size={16} fill={item.isPinned ? "currentColor" : "none"} />
                         </button>
                         <button 
                           onClick={() => handleEdit(item)}
                           className="p-2 text-stone-400 hover:text-boun-blue hover:bg-blue-50 rounded transition-colors"
                           title="Düzenle"
                         >
                           <Edit3 size={16} />
                         </button>
                         <button 
                           onClick={() => handleDelete(item.id)}
                           className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                           title="Sil"
                         >
                           <Trash2 size={16} />
                         </button>
                      </div>
                   </div>

                   {/* Content Snippet */}
                   <p className="text-xs text-stone-500 line-clamp-2 border-t border-stone-100 pt-2">
                     {item.summary}
                   </p>
                </div>
              ))}
           </div>
        </div>
      </div>

    </div>
  );
};