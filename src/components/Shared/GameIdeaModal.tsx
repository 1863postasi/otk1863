import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Lightbulb, CheckCircle2, Phone, Mail } from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../../lib/utils';

interface GameIdeaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GameIdeaModal: React.FC<GameIdeaModalProps> = ({ isOpen, onClose }) => {
    const [idea, setIdea] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idea.trim()) return;

        setSubmitting(true);
        try {
            const user = auth.currentUser;
            await addDoc(collection(db, 'feedback'), {
                userId: user?.uid || 'anonymous',
                userEmail: user?.email || 'anonymous',
                username: user?.displayName || user?.email?.split('@')[0] || 'Anonim Oyuncu',
                type: 'game_idea',
                message: idea,
                contactInfo: contactInfo,
                timestamp: serverTimestamp(),
                status: 'pending',
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                }
            });

            setSubmitted(true);
            setIdea('');
            setContactInfo('');
            setTimeout(() => {
                setSubmitted(false);
                onClose();
            }, 2500);
        } catch (error) {
            console.error("Idea submission error:", error);
            alert("Fikir gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
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
                        className="relative bg-[#fcfcfc] w-full max-w-md max-h-[90vh] flex flex-col rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-white/50 will-change-transform"
                    >
                        {/* Header */}
                        <div className="p-6 md:p-8 pb-4 flex justify-between items-start shrink-0">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-serif font-black text-stone-900 leading-tight text-left">Yeni Oyun Fikri</h2>
                                <p className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest mt-1 text-left">Boundle'da Görmek İstediklerin</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 md:p-3 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors shadow-sm"
                            >
                                <X size={18} className="text-stone-500" />
                            </button>
                        </div>

                        <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100/50">
                                <p className="text-[11px] md:text-xs text-purple-800 leading-relaxed font-medium text-left">
                                    Aklındaki harika oyun fikrini bizimle paylaş! Eğer seçilirse, Boundle'da yerini alabilir.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Lightbulb size={14} className="text-stone-400" />
                                        <label className="font-bold text-stone-800 text-xs uppercase tracking-wider">Oyun Fikrin *</label>
                                    </div>
                                    <textarea
                                        value={idea}
                                        onChange={(e) => setIdea(e.target.value)}
                                        placeholder="Oyunun mantığı, kuralları ve neden eğlenceli olacağı hakkında detaylar..."
                                        className="w-full bg-stone-100 border-2 border-transparent focus:border-stone-900 rounded-2xl p-4 md:p-5 text-sm font-medium text-stone-800 outline-none transition-all placeholder:text-stone-400 min-h-[120px] resize-none"
                                        disabled={submitting || submitted}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Phone size={14} className="text-stone-400" />
                                        <label className="font-bold text-stone-800 text-xs uppercase tracking-wider">İletişim (İsteğe Bağlı)</label>
                                    </div>
                                    <input
                                        type="text"
                                        value={contactInfo}
                                        onChange={(e) => setContactInfo(e.target.value)}
                                        placeholder="E-posta, telefon veya Instagram..."
                                        className="w-full bg-stone-100 border-2 border-transparent focus:border-stone-900 rounded-2xl p-4 text-sm font-medium text-stone-800 outline-none transition-all placeholder:text-stone-400"
                                        disabled={submitting || submitted}
                                    />
                                    <p className="text-[9px] text-stone-400 font-medium px-1">
                                        Fikrin hakkında seninle iletişime geçmemizi istersen doldurabilirsin.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || submitted || !idea.trim()}
                                    className={cn(
                                        "w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg mt-2",
                                        submitted
                                            ? "bg-purple-600 text-white shadow-purple-500/20"
                                            : "bg-stone-900 text-white shadow-stone-900/20 hover:bg-black disabled:opacity-50"
                                    )}
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : (
                                        submitted ? <><CheckCircle2 size={16} /> GÖNDERİLDİ</> : <><Send size={16} /> FİKRİ GÖNDER</>
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

export default GameIdeaModal;
