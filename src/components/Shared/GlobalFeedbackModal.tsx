import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../../lib/utils';

interface GlobalFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GlobalFeedbackModal: React.FC<GlobalFeedbackModalProps> = ({ isOpen, onClose }) => {
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) return;

        setSubmitting(true);
        try {
            const user = auth.currentUser;
            await addDoc(collection(db, 'feedback'), {
                userId: user?.uid || 'anonymous',
                userEmail: user?.email || 'anonymous',
                username: user?.displayName || 'Anonim Öğrenci',
                type: 'general_bug',
                message: feedback,
                timestamp: serverTimestamp(),
                status: 'pending',
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                    viewport: `${window.innerWidth}x${window.innerHeight}`
                }
            });

            setSubmitted(true);
            setFeedback('');
            setTimeout(() => {
                setSubmitted(false);
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Feedback error:", error);
            alert("Bildirim gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
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
                        onClick={onClose}
                        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-[#fcfcfc] w-full max-w-md rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 will-change-transform"
                    >
                        {/* Header */}
                        <div className="p-6 md:p-8 pb-4 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-serif font-black text-stone-900 leading-tight text-left">Hata Bildir</h2>
                                <p className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest mt-1 text-left">Sistemi Güzelleştirelim</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 md:p-3 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors shadow-sm"
                            >
                                <X size={18} className="text-stone-500" />
                            </button>
                        </div>

                        <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-6">
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                                <p className="text-[11px] md:text-xs text-amber-800 leading-relaxed font-medium text-left">
                                    Karşılaştığın bir hatayı, eksik bir bilgiyi veya sistemsel bir sorunu buradan bize iletebilirsin.
                                </p>
                            </div>

                            <form onSubmit={handleSubmitFeedback} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MessageSquare size={14} className="text-stone-400" />
                                        <label className="font-bold text-stone-800 text-xs uppercase tracking-wider">Bildiriminiz</label>
                                    </div>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Hata detaylarını buraya yazabilirsin..."
                                        className="w-full bg-stone-100 border-2 border-transparent focus:border-stone-900 rounded-2xl p-4 md:p-5 text-sm font-medium text-stone-800 outline-none transition-all placeholder:text-stone-400 min-h-[120px] resize-none"
                                        disabled={submitting || submitted}
                                    />
                                </div>

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
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GlobalFeedbackModal;
