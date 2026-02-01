import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed (Standalone mode)
        const checkStandalone = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true;
            setIsInstalled(isStandalone);
        };

        checkStandalone();
        window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

        // Capture the event
        const handler = (e: any) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };

        // Check global if it fired before mount
        // @ts-ignore
        if (window.deferredPrompt) {
            setSupportsPWA(true);
            // @ts-ignore
            setPromptInstall(window.deferredPrompt);
        }

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone);
        };
    }, []);

    const install = async () => {
        if (!promptInstall) return;
        promptInstall.prompt();
        const { outcome } = await promptInstall.userChoice;
        if (outcome === 'accepted') {
            setSupportsPWA(false);
            setPromptInstall(null);
            // @ts-ignore
            window.deferredPrompt = null;
        }
    };

    return { supportsPWA, isInstalled, install };
};
