import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Send, MessageSquare, BookOpen, GraduationCap, Link2, CheckCircle2, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const ONBOARDING_KEY = 'otk1863_academic_onboarding_v2';

const AcademicOnboarding: React.FC = () => {
    const { userProfile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const hasShown = localStorage.getItem(ONBOARDING_KEY);
        if (!hasShown) {
            // First time entry delay for better UX
            const timer = setTimeout(() => {
                setIsOpen(true);
                setIsMinimized(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        setIsMinimized(true);
        localStorage.setItem(ONBOARDING_KEY, 'true');
    };

    const handleSubmitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                userId: userProfile?.uid || 'anonymous',
                userEmail: userProfile?.email || 'anonymous',
                type: 'academic_error',
                message: feedback,
                timestamp: serverTimestamp(),
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    screen: `${window.innerWidth}x${window.innerHeight}`
                },
                status: 'pending'
            });
            setSubmitted(true);
            setFeedback('');
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Geri bildirim gönderilemedi. Lütfen tekrar deneyin.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* FLOATING ACTION BUTTON (Minimized State) */}
            <AnimatePresence>
                {isMinimized && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => {
                            setIsOpen(true);
                            setIsMinimized(false);
                        }}
                        className="fixed bottom-[108px] md:bottom-24 right-6 z-[60] w-12 h-12 bg-stone-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group will-change-transform"
                    >
                        <HelpCircle size={24} />
                        <span className="absolute right-full mr-3 px-2 py-1 bg-stone-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
                            Nasıl Kullanılır?
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* MODAL OVERLAY */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-[#fcfcfc] w-full max-w-lg rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 will-change-transform"
                        >
                            {/* Header */}
                            <div className="p-6 md:p-8 pb-4 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-serif font-black text-stone-900 leading-tight">Akademik Rehber</h2>
                                    <p className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Sistem Nasıl Çalışır?</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 md:p-3 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors shadow-sm"
                                >
                                    <X size={18} className="text-stone-500" />
                                </button>
                            </div>

                            <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-6 md:space-y-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
                                {/* Info Cards */}
                                <div className="grid grid-cols-1 gap-3 md:gap-4">
                                    <div className="flex gap-4 p-4 md:p-5 bg-blue-50/50 rounded-2xl md:rounded-3xl border border-blue-100">
                                        <div className="w-10 h-10 rounded-xl md:rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                            <BookOpen size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-stone-800 text-xs md:text-sm mb-1 text-left">Ders & Hoca Ayrımı</h4>
                                            <p className="text-[11px] md:text-xs text-stone-600 leading-relaxed text-left">
                                                Dersler ve Hocalar ayrı veritabanlarındadır. Bir dersin puanı içeriği, hoca puanı ise genel tutumu ifade eder.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 p-4 md:p-5 bg-emerald-50/50 rounded-2xl md:rounded-3xl border border-emerald-100">
                                        <div className="w-10 h-10 rounded-xl md:rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <GraduationCap size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-stone-800 text-xs md:text-sm mb-1 text-left">Ders-Hoca Eşleşmesi</h4>
                                            <p className="text-[11px] md:text-xs text-stone-600 leading-relaxed text-left">
                                                Hoca listesinden seçim yaparak o hocanın ilgili dersteki özel performansını ayrıca değerlendirebilirsiniz.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 p-4 md:p-5 bg-amber-50/50 rounded-2xl md:rounded-3xl border border-amber-100">
                                        <div className="w-10 h-10 rounded-xl md:rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                            <Link2 size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-stone-800 text-xs md:text-sm mb-1 text-left">Veri Ekleme</h4>
                                            <p className="text-[11px] md:text-xs text-stone-600 leading-relaxed text-left">
                                                Sistemde olmayan bir dersi veya hocayı "Katkıda Bulun" butonuyla ekleyebilir, derslerin içine hoca bağlayabilirsiniz.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback Form */}
                                <div className="pt-4 border-t border-stone-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <MessageSquare size={16} className="text-stone-400" />
                                        <h4 className="font-bold text-stone-800 text-xs md:text-sm">Hata Bildir veya Öneri Yap</h4>
                                    </div>
                                    <form onSubmit={handleSubmitFeedback} className="space-y-3">
                                        <textarea
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            placeholder="Eksik veri, yanlış eşleşme veya bir hata mı gördün? Buraya yazabilirsin..."
                                            className="w-full bg-stone-100 border-2 border-transparent focus:border-stone-900 rounded-2xl md:rounded-3xl p-4 md:p-5 text-xs md:text-sm font-medium text-stone-800 outline-none transition-all placeholder:text-stone-400"
                                            rows={2}
                                            disabled={submitting || submitted}
                                        />
                                        <button
                                            type="submit"
                                            disabled={submitting || submitted || !feedback.trim()}
                                            className={cn(
                                                "w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg",
                                                submitted
                                                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                                    : "bg-stone-900 text-white shadow-stone-900/20 hover:bg-black disabled:opacity-50"
                                            )}
                                        >
                                            {submitting ? <Loader2 size={16} className="animate-spin" /> : (
                                                submitted ? <><CheckCircle2 size={16} /> GÖNDERİLDİ</> : <><Send size={16} /> GÖNDER</>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AcademicOnboarding;
