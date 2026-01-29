import React, { useState } from 'react';
import * as router from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { getEmailByUsername } from '../../lib/firestore_users';
import { Lock, ArrowLeft, Loader2, AlertTriangle, User, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const { useNavigate, Link } = router;

const Login: React.FC = () => {
  const [loginInput, setLoginInput] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let emailToAuth = loginInput;

      // 1. Check if input is Username (doesn't contain @)
      if (!loginInput.includes('@')) {
        const retrievedEmail = await getEmailByUsername(loginInput);
        if (!retrievedEmail) {
          throw new Error("USER_NOT_FOUND");
        }
        emailToAuth = retrievedEmail;
      }

      // 2. Attempt Firebase Login
      const userCredential = await auth.signInWithEmailAndPassword(emailToAuth, password);
      const user = userCredential.user;

      // 3. CRITICAL SECURITY CHECK: Is Email Verified?
      if (user && !user.emailVerified) {
        await auth.signOut(); // Immediately kick out
        setError('Giriş başarısız. Lütfen önce okul mailinize gelen linke tıklayarak hesabınızı doğrulayın.');
        setLoading(false);
        return;
      }

      // Success
      navigate('/');
      
    } catch (err: any) {
      console.error(err);
      if (err.message === "USER_NOT_FOUND" || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Kullanıcı bulunamadı veya şifre hatalı.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Şifre hatalı.');
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
      
      {/* Back to Home */}
      <Link to="/" className="absolute top-6 left-6 text-stone-500 hover:text-stone-900 flex items-center gap-2 font-bold text-sm transition-colors">
        <ArrowLeft size={16} /> Ana Sayfa
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden border border-stone-200"
      >
        <div className="bg-stone-900 p-8 text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-boun-gold relative z-10">
              <User className="text-boun-gold" size={28} />
           </div>
           <h1 className="text-2xl font-serif font-bold text-stone-100 relative z-10">Oturum Aç</h1>
           <p className="text-stone-400 text-sm mt-2 relative z-10">1863 Postası'na hoş geldiniz.</p>
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
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                E-posta veya Kullanıcı Adı
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-none transition-all"
                  placeholder="kullaniciadi veya isim@std.bogazici.edu.tr"
                  required
                />
                <User className="absolute left-3 top-3.5 text-stone-400" size={18} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Şifre</label>
                <Link to="/auth/forgot-password" className="text-xs text-boun-blue font-bold hover:underline">Şifremi Unuttum?</Link>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-3 top-3.5 text-stone-400" size={18} />
              </div>
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

          <div className="mt-6 text-center text-sm text-stone-600">
            Hesabınız yok mu? <Link to="/auth/register" className="font-bold text-boun-blue hover:underline">Kayıt Olun</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;