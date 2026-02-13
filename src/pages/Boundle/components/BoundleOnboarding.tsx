import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Send, MessageSquare, Timer, Trophy, Star, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import { cn } from '../../../lib/utils';

const ONBOARDING_KEY = 'otk1863_boundle_onboarding_v1';

interface BoundleOnboardingProps {
    isOpen: boolean;
    onClose: () => void;
}

const BoundleOnboarding: React.FC<BoundleOnboardingProps> = ({ isOpen, onClose }) => {
    const { userProfile } = useAuth();
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Auto-open on first visit
    useEffect(() => {
        const hasShown = localStorage.getItem(ONBOARDING_KEY);
        if (!hasShown) {
            const timer = setTimeout(() => {
                onClose(); // Ensure parent state is synced if needed, but here we likely rely on parent passing true initially or we trigger parent.
                // Actually, parent controls isOpen. We just need to signal parent to open if local storage says so.
                // However, standard pattern: Parent checks LS or we check LS and tell parent?
                // Better: This component handles the LS check internally for "automatic" opening ONLY if the parent didn't explicitly open it.
                // But since logic is "Parent passes isOpen", the parent should probably handle the auto-open logic or we provide a callback.
                // Refactoring slightly: The parent (GameHub) will handle the state. We can use a simpler approach:
                // GameHub checks LS on mount.
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        onClose();
    };

    const handleSubmitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                userId: userProfile?.uid || 'anonymous',
                userEmail: userProfile?.email || 'anonymous',
                type: 'boundle_issue',
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
                                <h2 className="text-2xl md:text-3xl font-serif font-black text-stone-900 leading-tight">Boundle Nedir?</h2>
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
                                        <Timer size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-800 text-xs md:text-sm mb-1 text-left">Günlük Meydan Okuma</h4>
                                        <p className="text-[11px] md:text-xs text-stone-600 leading-relaxed text-left">
                                            Boundle'daki oyunlar her gece <strong>00:00'da</strong> yenilenir. Her oyun için günde sadece bir şansın vardır. O günkü bulmacayı çözüp puanını kapmalısın.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-4 md:p-5 bg-amber-50/50 rounded-2xl md:rounded-3xl border border-amber-100">
                                    <div className="w-10 h-10 rounded-xl md:rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                        <Trophy size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-800 text-xs md:text-sm mb-1 text-left">Puanlama ve Sıralama</h4>
                                        <p className="text-[11px] md:text-xs text-stone-600 leading-relaxed text-left">
                                            Başarıyla tamamladığın her oyun için (örneğin Sudoku için +75 Puan) kazanırsın. Bu puanlar "Şampiyonlar Ligi" sıralamasında yerini belirler. Sıralama anlık olarak güncellenir.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-4 md:p-5 bg-purple-50/50 rounded-2xl md:rounded-3xl border border-purple-100">
                                    <div className="w-10 h-10 rounded-xl md:rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                        <Star size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-800 text-xs md:text-sm mb-1 text-left">Süreklilik Önemlidir</h4>
                                        <p className="text-[11px] md:text-xs text-stone-600 leading-relaxed text-left">
                                            Her gün düzenli oynamak, toplam puanını artırmanın en iyi yoludur. Kaçırdığın günlerin telafisi yoktur, o günün puanı sonsuza dek kaybolur.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Feedback Form */}
                            <div className="pt-4 border-t border-stone-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertCircle size={16} className="text-stone-400" />
                                    <h4 className="font-bold text-stone-800 text-xs md:text-sm">Hata Bildir veya Öneri Yap</h4>
                                </div>
                                <form onSubmit={handleSubmitFeedback} className="space-y-3">
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Oyunda bir hata mı var? Veya yeni bir oyun önerin mi var? Buraya yaz..."
                                        className="w-full bg-stone-100 border-2 border-transparent focus:border-stone-900 rounded-2xl md:rounded-3xl p-4 md:p-5 text-xs md:text-sm font-medium text-stone-800 outline-none transition-all placeholder:text-stone-400 resize-none"
                                        rows={3}
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
    );
};

export default BoundleOnboarding;
