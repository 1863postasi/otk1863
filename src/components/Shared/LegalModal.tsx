import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string; // HTML string
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, title, content }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl bg-[#fcfbf9] rounded-xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] md:max-h-[85vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-white">
                                <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
                                    <ShieldCheck size={24} className="text-boun-gold" />
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content (Scrollable) */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                                <div
                                    className="prose prose-stone prose-sm md:prose-base max-w-none leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: content }}
                                />
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="bg-stone-900 text-white font-bold py-2.5 px-6 rounded hover:bg-stone-800 transition-colors shadow-lg active:scale-95"
                                >
                                    Okudum, Anladım
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LegalModal;
