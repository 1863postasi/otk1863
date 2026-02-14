import React, { useState } from 'react';
import * as router from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { getEmailByUsername } from '../../lib/firestore_users';
import { Lock, ArrowLeft, Loader2, AlertTriangle, User, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import firebase from 'firebase/compat/app';

const { useNavigate, Link } = router;

const Login: React.FC = () => {
  const [loginInput, setLoginInput] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // State for Email Verification Resend
  const [unverifiedUser, setUnverifiedUser] = useState<firebase.User | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUnverifiedUser(null);
    setVerificationSent(false);

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
        // DO NOT SIGN OUT IMMEDIATELY. We need the user signed in to send the verification email.
        // Protected routes will still block them because of the check in ProtectedRoute.tsx
        // As long as we stay on this page, we are fine.

        setUnverifiedUser(user);
        setError('Giriş başarısız. Lütfen önce okul mailinize gelen linke tıklayarak hesabınızı doğrulayın.');
        setLoading(false);
        return;
      }

      // Success
      navigate('/');

    } catch (err: any) {
      console.error(err);
      if (err.message === "USER_NOT_FOUND" || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Kullanıcı adı veya şifre hatalı. Tekrar dener misin');
      } else if (err.code === 'auth/wrong-password') {
        setError('Şifre doğru değil. Bir daha dene');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Çok fazla yanlış deneme. Biraz dinlenip tekrar gel');
      } else {
        setError('Bir şeyler ters gitti. Tekrar dener misin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedUser) return;

    setResendLoading(true);
    try {
      await unverifiedUser.sendEmailVerification();
      setVerificationSent(true);
      setError(''); // Clear error to show success message clearly
      setUnverifiedUser(null); // Clear user so we don't show the button again
      await auth.signOut(); // Now we can sign them out safely, or let them sit here. Better to sign out to enforce fresh login after verification?
      // Actually, if we sign out, they can't verify easily? No, verification is via email link.
      // Signing out is safer to prevent any weird state if they navigate.

    } catch (err: any) {
      console.error("Resend error:", err);
      if (err.code === 'auth/too-many-requests') {
        setError('Çok sık istek gönderdiniz. Lütfen biraz bekleyip e-postanızı kontrol edin.');
      } else {
        setError('E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.');
      }
    } finally {
      setResendLoading(false);
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
          {verificationSent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded border border-green-100 flex items-start gap-3 text-sm"
            >
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
              <span>Doğrulama bağlantısı e-posta adresinize tekrar gönderildi. Lütfen spam kutunuzu da kontrol ediniz.</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 bg-red-50 text-boun-red px-4 py-3 rounded border border-red-100 flex flex-col items-start gap-2 text-sm"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>

              {/* Show Resend Button ONLY if we have an unverified user caught in the specific error block */}
              {unverifiedUser && error.includes('doğrulayın') && (
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="ml-8 mt-1 text-xs bg-red-100 hover:bg-red-200 text-red-800 font-bold py-1.5 px-3 rounded transition-colors flex items-center gap-2"
                >
                  {resendLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                  Bağlantıyı Tekrar Gönder
                </button>
              )}
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
                  placeholder="kullanici_adin veya ogrenci@std.bogazici.edu.tr"
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
                  Kampüse Giriliyor...
                </>
              ) : (
                'Kampüse Gir'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-600">
            Hesabınız yok mu? <Link to="/auth/register" className="font-bold text-boun-blue hover:underline">Topluluğa Katıl</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;