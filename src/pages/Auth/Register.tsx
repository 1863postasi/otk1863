import React, { useState, useEffect } from 'react';
import * as router from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { isUsernameUnique } from '../../lib/firestore_users';
import { MOCK_FACULTIES } from '../../lib/data'; // For department list
import { Lock, ArrowLeft, Loader2, CheckCircle, XCircle, Mail, User, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CLARIFICATION_TEXT, PRIVACY_AGREEMENT } from '../../lib/legal-content';
import LegalModal from '../../components/Shared/LegalModal';

const { useNavigate, Link } = router;

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
    // department removed - handled in onboarding
  });

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [agreements, setAgreements] = useState({
    clarification: false,
    privacy: false
  });
  const [modalOpen, setModalOpen] = useState<'clarification' | 'privacy' | null>(null);

  // Department selection moved to Onboarding Modal

  // Debounced Username Check
  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username.length < 3) {
        setUsernameStatus('idle');
        return;
      }
      setUsernameStatus('checking');
      const isUnique = await isUsernameUnique(formData.username);
      setUsernameStatus(isUnique ? 'available' : 'taken');
    };

    const timeoutId = setTimeout(() => {
      if (formData.username) checkUsername();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Validations
      if (!formData.email.endsWith('@std.bogazici.edu.tr')) {
        throw new Error("Sadece 'std.bogazici.edu.tr' uzantılı okul mailleriyle kayıt olabilirsiniz.");
      }
      if (usernameStatus === 'taken') {
        throw new Error("Bu kullanıcı adı alınmış.");
      }
      if (formData.password.length < 6) {
        throw new Error("Şifre en az 6 karakter olmalıdır.");
      }
      if (formData.password !== formData.passwordConfirm) {
        throw new Error("Şifreler eşleşmiyor.");
      }
      if (!agreements.clarification || !agreements.privacy) {
        throw new Error("Lütfen Aydınlatma Metni'ni ve Üyelik Sözleşmesi'ni onaylayınız.");
      }

      // 2. Create Auth User
      const userCredential = await auth.createUserWithEmailAndPassword(formData.email, formData.password);
      const user = userCredential.user;

      if (!user) throw new Error("Kullanıcı oluşturulamadı.");

      // 3. Send Verification Email
      await user.sendEmailVerification();

      // 4. Create Firestore Document
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: formData.email,
        username: formData.username,
        username_lower: formData.username.toLowerCase(),
        department: "", // Will be set in onboarding
        role: "student",
        emailVerified: false,
        createdAt: serverTimestamp(),
        lastUsernameChange: serverTimestamp(),
        badges: [],
        clubRoles: {},
        termsAccepted: true,
        privacyPolicyAccepted: true,
        agreementsLastVersion: "v1.0",
        termsAcceptedAt: serverTimestamp()
      });

      // 5. Success State
      await auth.signOut(); // Sign out immediately so they have to login after verification
      setSuccess(true);

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kullanımda.');
      } else {
        setError(err.message || 'Kayıt sırasında bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#efede6] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-lg shadow-xl max-w-md text-center border border-stone-200"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={40} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">Doğrulama Bağlantısı Gönderildi</h2>
          <p className="text-stone-600 mb-6 leading-relaxed">
            Kayıt işlemini tamamlamak için lütfen <strong>{formData.email}</strong> adresine gönderdiğimiz doğrulama bağlantısına tıklayın.
            <br /><span className="text-xs text-stone-400 mt-2 block">(Spam/Gereksiz kutusunu kontrol etmeyi unutmayın)</span>
          </p>
          <Link to="/auth/login" className="block w-full bg-stone-900 text-white font-bold py-3 rounded hover:bg-stone-700 transition-colors">
            Giriş Sayfasına Dön
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efede6] flex items-center justify-center p-4 relative font-sans py-12">

      <Link to="/" className="absolute top-6 left-6 text-stone-500 hover:text-stone-900 flex items-center gap-2 font-bold text-sm transition-colors">
        <ArrowLeft size={16} /> Ana Sayfa
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden border border-stone-200"
      >
        <div className="bg-stone-900 p-6 text-center">
          <h1 className="text-2xl font-serif font-bold text-stone-100">Aramıza Katıl</h1>
          <p className="text-stone-400 text-sm mt-1">Sadece Boğaziçililere özel platform.</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 text-boun-red px-4 py-3 rounded border border-red-100 text-sm font-bold flex items-center gap-2">
              <XCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Okul E-postası</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 outline-none text-sm"
                  placeholder="isim.soyisim@std.bogazici.edu.tr"
                  required
                />
                <Mail className="absolute left-3 top-3.5 text-stone-400" size={18} />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">* Sadece @std.bogazici.edu.tr kabul edilir.</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Kullanıcı Adı</span>
                {usernameStatus === 'checking' && <span className="text-stone-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Kontrol ediliyor</span>}
                {usernameStatus === 'available' && <span className="text-green-600 flex items-center gap-1"><CheckCircle size={10} /> Uygun</span>}
                {usernameStatus === 'taken' && <span className="text-red-500 flex items-center gap-1"><XCircle size={10} /> Alınmış</span>}
              </label>
              <div className="relative">
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') }))}
                  className={`w-full pl-10 pr-4 py-3 bg-stone-50 border rounded text-stone-900 outline-none text-sm transition-colors ${usernameStatus === 'available' ? 'border-green-300 focus:ring-green-200' :
                    usernameStatus === 'taken' ? 'border-red-300 focus:ring-red-200' : 'border-stone-200 focus:ring-stone-800'
                    }`}
                  placeholder="kullanici_adin"
                  required
                  minLength={3}
                />
                <User className="absolute left-3 top-3.5 text-stone-400" size={18} />
              </div>
            </div>

            {/* Department - REMOVED */}

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Şifre</label>
                <div className="relative">
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-3 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 outline-none text-sm"
                    placeholder="••••••"
                    required
                    minLength={6}
                  />
                  <Lock className="absolute left-3 top-3.5 text-stone-400" size={16} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Şifre Tekrar</label>
                <div className="relative">
                  <input
                    name="passwordConfirm"
                    type="password"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-3 bg-stone-50 border rounded text-stone-900 focus:ring-2 outline-none text-sm ${formData.passwordConfirm && formData.password !== formData.passwordConfirm ? 'border-red-300 focus:ring-red-200' : 'border-stone-200 focus:ring-stone-800'
                      }`}
                    placeholder="••••••"
                    required
                  />
                  <Lock className="absolute left-3 top-3.5 text-stone-400" size={16} />
                </div>
              </div>
            </div>

            {/* Legal Agreements */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={agreements.clarification}
                    onChange={(e) => setAgreements(prev => ({ ...prev, clarification: e.target.checked }))}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-stone-300 bg-stone-50 checked:bg-stone-900 checked:border-stone-900 transition-all"
                  />
                  <CheckCircle size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                </div>
                <span className="text-xs text-stone-600 leading-snug select-none">
                  <button type="button" onClick={(e) => { e.preventDefault(); setModalOpen('clarification'); }} className="font-bold text-stone-800 hover:text-boun-gold underline decoration-stone-300 underline-offset-2 transition-colors">
                    Aydınlatma Metnini
                  </button> okudum, anladım.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={(e) => setAgreements(prev => ({ ...prev, privacy: e.target.checked }))}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-stone-300 bg-stone-50 checked:bg-stone-900 checked:border-stone-900 transition-all"
                  />
                  <CheckCircle size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                </div>
                <span className="text-xs text-stone-600 leading-snug select-none">
                  <button type="button" onClick={(e) => { e.preventDefault(); setModalOpen('privacy'); }} className="font-bold text-stone-800 hover:text-boun-gold underline decoration-stone-300 underline-offset-2 transition-colors">
                    Üyelik Sözleşmesi
                  </button>'ni okudum, kabul ediyorum.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || usernameStatus === 'taken'}
              className="w-full bg-stone-900 text-white font-bold py-3.5 rounded hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Topluluğa Katıl'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-600">
            Zaten hesabınız var mı? <Link to="/auth/login" className="font-bold text-boun-blue hover:underline">Kampüse Gir</Link>
          </div>
        </div>
      </motion.div>

      <LegalModal
        isOpen={!!modalOpen}
        onClose={() => setModalOpen(null)}
        title={modalOpen === 'clarification' ? "Aydınlatma Metni" : "Üyelik Sözleşmesi"}
        content={modalOpen === 'clarification' ? CLARIFICATION_TEXT : PRIVACY_AGREEMENT}
      />
    </div >
  );
};

export default Register;