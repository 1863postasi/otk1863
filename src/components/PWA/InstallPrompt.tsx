import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRINGS } from '../../lib/animations';

export const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Don't show immediately, maybe wait for a good moment or show a small indicator
            // For now, we'll show it if it's available
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    if (!showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={SPRINGS.snappy}
                onClick={handleInstall}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-game-paper px-6 py-3 rounded-full shadow-xl flex items-center gap-3 font-bold border-2 border-game-gold"
            >
                <Download size={20} />
                <span>Uygulamayı Yükle</span>
            </motion.button>
        </AnimatePresence>
    );
};
