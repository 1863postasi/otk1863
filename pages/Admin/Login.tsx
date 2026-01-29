import React, { useState } from 'react';
import * as router from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { Lock, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const { useNavigate, Link } = router;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await auth.signInWithEmailAndPassword(email, password);
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('E-posta adresi veya şifre hatalı.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.');
      } else {
        setError('Giriş yapılırken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efede6] flex items-center justify-center p-4 relative font-sans">
      
      {/* Back to Home Button */}
      <Link to="/" className="absolute top-6 left-6 text-stone-500 hover:text-stone-900 flex items-center gap-2 font-bold text-sm transition-colors">
        <ArrowLeft size={16} /> Ana Sayfa
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden border border-stone-200"
      >
        <div className="bg-stone-900 p-8 text-center">
           <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-boun-gold">
              <Lock className="text-boun-gold" size={24} />
           </div>
           <h1 className="text-2xl font-serif font-bold text-stone-100">Yönetici Paneli</h1>
           <p className="text-stone-400 text-sm mt-2">Lütfen yetkili hesap bilgilerinizle giriş yapın.</p>
        </div>

        <div className="p-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 bg-red-50 text-boun-red px-4 py-3 rounded border border-red-100 flex items-start gap-3 text-sm"
            >
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">E-Posta Adresi</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-none transition-all"
                placeholder="admin@boun.edu.tr"
                required
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Şifre</label>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-stone-900 text-white font-bold py-3.5 rounded hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Giriş Yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-stone-50 p-4 text-center border-t border-stone-100">
           <p className="text-xs text-stone-400">
             © {new Date().getFullYear()} Boğaziçi ÖTK. Sadece yetkili personel içindir.
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;