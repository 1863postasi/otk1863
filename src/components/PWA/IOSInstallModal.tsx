import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, PlusSquare, Compass } from 'lucide-react';
import { createPortal } from 'react-dom';

interface IOSInstallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const IOSInstallModal: React.FC<IOSInstallModalProps> = ({ isOpen, onClose }) => {
    // Portal root check
    const portalRoot = document.getElementById('portal-root') || document.body;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[9998]"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#fcfbf9] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-stone-200 pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="bg-stone-100 px-6 py-4 flex items-center justify-between border-b border-stone-200">
                                <h3 className="font-serif text-lg font-bold text-stone-900">Uygulamayı Yükle</h3>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
                                    <p className="text-stone-700 text-sm leading-relaxed flex gap-3">
                                        <Compass size={24} className="text-blue-500 shrink-0 mt-0.5" />
                                        <span>
                                            Bu işlem yalnızca <strong>Safari</strong> tarayıcısında çalışır. Eğer Chrome veya Instagram/X içi tarayıcıdaysanız lütfen Safari'ye geçin.
                                        </span>
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* Step 1 */}
                                    <div className="flex items-start gap-4">
                                        <div className="bg-stone-100 p-3 rounded-xl shrink-0">
                                            <Share size={24} className="text-boun-blue" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-stone-900 text-sm mb-1">1. "Paylaş" Butonuna Basın</p>
                                            <p className="text-xs text-stone-500">
                                                Ekranın altındaki araç çubuğunda bulunan kare içindeki ok ikonuna dokunun.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex items-start gap-4">
                                        <div className="bg-stone-100 p-3 rounded-xl shrink-0">
                                            <PlusSquare size={24} className="text-stone-800" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-stone-900 text-sm mb-1">2. Ana Ekrana Ekle</p>
                                            <p className="text-xs text-stone-500">
                                                Açılan menüyü aşağı kaydırın ve <strong>"Ana Ekrana Ekle"</strong> seçeneğini bulun.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex items-start gap-4">
                                        <div className="bg-stone-100 p-3 rounded-xl shrink-0">
                                            <span className="text-lg font-serif font-bold text-stone-900 w-6 h-6 flex items-center justify-center">3</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-stone-900 text-sm mb-1">3. Onaylayın</p>
                                            <p className="text-xs text-stone-500">
                                                Sağ üst köşedeki <strong>"Ekle"</strong> butonuna basarak işlemi tamamlayın.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-stone-50 px-6 py-4 border-t border-stone-200">
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 bg-stone-900 text-stone-100 font-bold rounded-xl hover:bg-stone-800 transition-colors active:scale-95 text-sm"
                                >
                                    Anlaşıldı, Teşekkürler
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        portalRoot
    );
};

export default IOSInstallModal;
