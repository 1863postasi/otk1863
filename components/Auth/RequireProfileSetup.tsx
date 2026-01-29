import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_FACULTIES } from '../../lib/data';
import { Loader2, ArrowRight } from 'lucide-react';

const RequireProfileSetup: React.FC = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  // Conditions to NOT show the modal
  if (!currentUser) return null; // Not logged in
  if (!userProfile) return null; // Loading profile...
  if (userProfile.displayName) return null; // Profile is complete

  // Extract departments for select list
  const departments = MOCK_FACULTIES.flatMap(f => f.departments.map(d => d.name)).sort();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !department) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        displayName: name.trim(),
        department: department,
        lastDisplayNameChange: serverTimestamp() // Mark change immediately
      });
      
      // Refresh context so modal disappears
      await refreshProfile();
      
    } catch (error) {
      console.error("Profile setup error:", error);
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop with heavy blur and block */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-stone-900/80 backdrop-blur-md"
        />

        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="relative w-full max-w-md bg-[#efede6] rounded-xl shadow-2xl overflow-hidden border border-stone-300"
        >
          {/* Header */}
          <div className="bg-stone-200 px-8 py-6 border-b border-stone-300 text-center">
            <h2 className="font-serif text-2xl font-bold text-stone-900">Hoş Geldin, Boğaziçili.</h2>
            <p className="text-stone-500 text-sm mt-2 font-sans">
              Devam etmeden önce seni tanımamız için profilini tamamla.
            </p>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            
            {/* Display Name Input */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Ad Soyad (Görünen İsim)</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Ali Veli"
                className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-stone-900 focus:ring-2 focus:ring-stone-800 outline-none transition-all font-serif placeholder:font-sans"
                required
              />
              <p className="text-[10px] text-stone-400 mt-1">* Ayda sadece 1 kez değiştirebilirsin.</p>
            </div>

            {/* Department Select */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Bölüm</label>
              <div className="relative">
                <select 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-stone-900 focus:ring-2 focus:ring-stone-800 outline-none appearance-none"
                  required
                >
                  <option value="">Seçiniz...</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                  <ArrowRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !name || !department}
              className="w-full bg-stone-900 text-white font-bold py-4 rounded-lg hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Kaydet ve Devam Et'}
            </button>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RequireProfileSetup;