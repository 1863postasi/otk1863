import React, { useState } from 'react';
import { LogOut, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import * as router from 'react-router-dom';

const { useNavigate } = router;

interface SettingsTabProps {
    onPasswordChange: (p1: string, p2: string) => Promise<void>;
    onLogout: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ onPasswordChange, onLogout }) => {
    const navigate = useNavigate();
    const [passForm, setPassForm] = useState({ p1: '', p2: '' });
    const [passLoading, setPassLoading] = useState(false);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passForm.p1 !== passForm.p2) {
            alert("Şifreler eşleşmiyor.");
            return;
        }
        if (passForm.p1.length < 6) {
            alert("Şifre en az 6 karakter olmalıdır.");
            return;
        }
        setPassLoading(true);
        try {
            await onPasswordChange(passForm.p1, passForm.p2);
            alert("Şifreniz başarıyla değiştirildi.");
            setPassForm({ p1: '', p2: '' });
        } catch (error: any) {
            console.error(error);
            alert("Hata: " + error.message);
        } finally {
            setPassLoading(false);
        }
    };

    return (
        <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 space-y-8"
        >
            <div>
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">Şifre Değiştir</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Yeni Şifre</label>
                        <input type="password" value={passForm.p1} onChange={e => setPassForm(p => ({ ...p, p1: e.target.value }))} className="w-full px-3 py-2 border border-stone-300 rounded focus:ring-2 focus:ring-stone-800 outline-none" required minLength={6} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Yeni Şifre (Tekrar)</label>
                        <input type="password" value={passForm.p2} onChange={e => setPassForm(p => ({ ...p, p2: e.target.value }))} className="w-full px-3 py-2 border border-stone-300 rounded focus:ring-2 focus:ring-stone-800 outline-none" required />
                    </div>
                    <button disabled={passLoading} className="px-6 py-2 bg-stone-900 text-white font-bold rounded text-sm hover:bg-stone-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                        <Lock size={16} />
                        {passLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                    </button>
                </form>
            </div>

            <div>
                <h3 className="font-serif text-xl font-bold text-red-700 mb-4 border-b border-stone-100 pb-2">Oturum</h3>
                <button onClick={() => { onLogout(); navigate('/'); }} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 font-bold rounded border border-red-200 hover:bg-red-100 transition-colors">
                    <LogOut size={18} /> Görüşürüz
                </button>
            </div>
        </motion.div>
    );
};

export default SettingsTab;
