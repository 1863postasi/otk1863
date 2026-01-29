import React, { useState, useEffect } from 'react';
import { Header, Input, Select, ActionButtons } from '../components/SharedUI';
import { User, Plus, Edit3, Trash2, CheckCircle, AlertCircle, Mail, Phone, ShieldCheck } from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { MOCK_FACULTIES } from '../../../lib/data';
import { cn } from '../../../lib/utils';

interface Representative {
    id: string;
    name: string;
    faculty: string;
    department: string;
    roles: string;
    status: 'Resmî' | 'Fiilî';
    contact: string;
    isExec: boolean;
}

export const OTKRepresentativesPanel = () => {
  // Navigation State
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  
  // Data State
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
      name: '',
      roles: 'Bölüm Temsilcisi',
      status: 'Resmî',
      contact: '',
      isExec: false
  });

  // Derived Data
  const facultyOptions = MOCK_FACULTIES.map(f => ({ val: f.name, label: f.name }));
  const departmentOptions = selectedFaculty 
      ? MOCK_FACULTIES.find(f => f.name === selectedFaculty)?.departments.map(d => ({ val: d.name, label: d.name })) || []
      : [];

  // Fetch Logic
  useEffect(() => {
      // We fetch all reps for simplicity in client-side filtering, 
      // but in a larger app we would query by faculty/dept.
      const q = query(collection(db, "otk_representatives"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Representative[];
          setRepresentatives(data);
      });
      return () => unsubscribe();
  }, []);

  // Filtered List based on selection
  const filteredReps = representatives.filter(r => 
      (!selectedFaculty || r.faculty === selectedFaculty) && 
      (!selectedDepartment || r.department === selectedDepartment)
  );

  const handleSave = async () => {
      if (!selectedFaculty || !selectedDepartment) {
          alert("Lütfen önce Fakülte ve Bölüm seçiniz.");
          return;
      }
      if (!formData.name) {
          alert("Temsilci Adı zorunludur.");
          return;
      }

      setLoading(true);
      try {
          const payload = {
              name: formData.name,
              faculty: selectedFaculty,
              department: selectedDepartment,
              roles: formData.roles,
              status: formData.status,
              contact: formData.contact,
              isExec: formData.isExec
          };

          if (editingId) {
              await updateDoc(doc(db, "otk_representatives", editingId), payload);
          } else {
              await addDoc(collection(db, "otk_representatives"), payload);
          }
          
          setIsAdding(false);
          setEditingId(null);
          setFormData({ name: '', roles: 'Bölüm Temsilcisi', status: 'Resmî', contact: '', isExec: false });

      } catch (e) {
          console.error(e);
          alert("Kaydedilirken hata oluştu.");
      } finally {
          setLoading(false);
      }
  };

  const handleEdit = (rep: Representative) => {
      // Must set navigation context first
      setSelectedFaculty(rep.faculty);
      setSelectedDepartment(rep.department);
      
      setEditingId(rep.id);
      setIsAdding(true);
      setFormData({
          name: rep.name,
          roles: rep.roles,
          status: rep.status,
          contact: rep.contact || '',
          isExec: rep.isExec || false
      });
  };

  const handleDelete = async (id: string) => {
      if (confirm("Silmek istediğinize emin misiniz?")) {
          await deleteDoc(doc(db, "otk_representatives", id));
      }
  };

  const toggleExec = async (rep: Representative) => {
      try {
          await updateDoc(doc(db, "otk_representatives", rep.id), {
              isExec: !rep.isExec
          });
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Header title="ÖTK Temsilci Yönetimi" desc="Fakülte ve bölümlere göre temsilcileri atayın." />

      {/* 1. HIERARCHICAL SELECTION */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Fakülte Seçiniz</label>
              <select 
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 outline-none"
                  value={selectedFaculty}
                  onChange={(e) => { setSelectedFaculty(e.target.value); setSelectedDepartment(''); setIsAdding(false); setEditingId(null); }}
              >
                  <option value="">Seçim Yapın...</option>
                  {facultyOptions.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
              </select>
          </div>
          <div className="flex-1">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Bölüm Seçiniz</label>
              <select 
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 outline-none disabled:opacity-50"
                  value={selectedDepartment}
                  onChange={(e) => { setSelectedDepartment(e.target.value); setIsAdding(false); setEditingId(null); }}
                  disabled={!selectedFaculty}
              >
                  <option value="">Seçim Yapın...</option>
                  {departmentOptions.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
              </select>
          </div>
      </div>

      {/* 2. REPRESENTATIVE LIST (Only if department selected) */}
      {selectedDepartment && (
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                  <h3 className="font-bold text-stone-800 flex items-center gap-2">
                      <User size={18}/> {selectedDepartment} Temsilcileri
                  </h3>
                  {!isAdding && !editingId && (
                      <button 
                          onClick={() => { setIsAdding(true); setFormData({ name: '', roles: 'Bölüm Temsilcisi', status: 'Resmî', contact: '', isExec: false }); }}
                          className="flex items-center gap-2 bg-stone-900 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-stone-700 transition-colors"
                      >
                          <Plus size={14} /> Yeni Ekle
                      </button>
                  )}
              </div>

              {/* LIST AREA */}
              <div className="divide-y divide-stone-100">
                  {filteredReps.length === 0 && !isAdding && (
                      <div className="p-8 text-center text-stone-400 text-sm italic">Bu bölüme henüz temsilci eklenmemiş.</div>
                  )}
                  {filteredReps.map(rep => (
                      <div key={rep.id} className={cn("p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors", editingId === rep.id ? "bg-blue-50/50" : "hover:bg-stone-50")}>
                          <div className="flex items-center gap-4">
                              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0", rep.status === 'Resmî' ? "bg-boun-blue" : "bg-amber-500")}>
                                  {rep.name.charAt(0)}
                              </div>
                              <div>
                                  <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-stone-900">{rep.name}</h4>
                                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-bold", rep.status === 'Resmî' ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-amber-100 text-amber-700 border-amber-200")}>
                                          {rep.status}
                                      </span>
                                  </div>
                                  <p className="text-xs text-stone-500">{rep.roles}</p>
                                  {rep.contact && <p className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1"><Mail size={10}/> {rep.contact}</p>}
                              </div>
                          </div>

                          <div className="flex items-center gap-4 pl-14 md:pl-0">
                              {/* Exec Toggle */}
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                  <input type="checkbox" checked={rep.isExec} onChange={() => toggleExec(rep)} className="accent-boun-gold w-4 h-4 rounded cursor-pointer" />
                                  <span className={cn("text-xs font-bold", rep.isExec ? "text-boun-gold" : "text-stone-400")}>
                                      {rep.isExec ? "Üst Kurul" : "Üst Kurul?"}
                                  </span>
                              </label>

                              <div className="flex gap-2">
                                  <button onClick={() => handleEdit(rep)} className="p-2 bg-white border border-stone-200 text-stone-500 hover:text-boun-blue hover:border-boun-blue rounded transition-colors"><Edit3 size={16}/></button>
                                  <button onClick={() => handleDelete(rep.id)} className="p-2 bg-white border border-stone-200 text-stone-500 hover:text-red-600 hover:border-red-600 rounded transition-colors"><Trash2 size={16}/></button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>

              {/* 3. ADD/EDIT FORM */}
              {(isAdding || editingId) && (
                  <div className="bg-stone-50 p-6 border-t border-stone-200 animate-in slide-in-from-bottom duration-300">
                      <h4 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                          {editingId ? <Edit3 size={16}/> : <Plus size={16}/>}
                          {editingId ? "Temsilciyi Düzenle" : "Bu Bölüme Temsilci Ekle"}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <Input label="Ad Soyad" placeholder="Ali Veli" value={formData.name} onChange={(v: string) => setFormData(p => ({...p, name: v}))} />
                          <Input label="Görevler (Virgülle)" placeholder="Bölüm Temsilcisi, Fakülte Kurulu" value={formData.roles} onChange={(v: string) => setFormData(p => ({...p, roles: v}))} />
                          
                          <div>
                              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Statü</label>
                              <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="status" checked={formData.status === 'Resmî'} onChange={() => setFormData(p => ({...p, status: 'Resmî'}))} className="accent-boun-blue"/>
                                      <span className="text-sm font-bold text-stone-700">Resmî (Seçilmiş)</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="status" checked={formData.status === 'Fiilî'} onChange={() => setFormData(p => ({...p, status: 'Fiilî'}))} className="accent-amber-500"/>
                                      <span className="text-sm font-bold text-stone-700">Fiilî (Gönüllü)</span>
                                  </label>
                              </div>
                          </div>

                          <Input label="İletişim (Email/Tel)" placeholder="Opsiyonel" value={formData.contact} onChange={(v: string) => setFormData(p => ({...p, contact: v}))} />
                      </div>

                      <div className="mb-4">
                          <label className="flex items-center gap-2 p-3 border border-stone-300 rounded bg-white cursor-pointer hover:border-boun-gold transition-colors w-fit">
                              <input type="checkbox" checked={formData.isExec} onChange={(e) => setFormData(p => ({...p, isExec: e.target.checked}))} className="accent-boun-gold w-5 h-5" />
                              <div>
                                  <span className="block text-sm font-bold text-stone-800">Üst Kurul Üyesi</span>
                                  <span className="text-xs text-stone-500">Ana sayfada 'Üst Kurul' sekmesinde de görünür.</span>
                              </div>
                          </label>
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
      )}
    </div>
  );
};