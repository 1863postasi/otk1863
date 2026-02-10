import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalLoaderProps {
    isLoading: boolean;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({ isLoading }) => {
    // Prevent scrolling when loading
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
            // Also remove the static loader from DOM if it exists, to avoid duplicate layers
            const staticLoader = document.getElementById('initial-loader');
            if (staticLoader) {
                staticLoader.style.opacity = '0';
                setTimeout(() => {
                    staticLoader.remove();
                }, 500);
            }
        } else {
            document.body.style.overflow = '';
        }
    }, [isLoading]);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] bg-white flex items-center justify-center pointer-events-none"
                >
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1,
                            ease: "easeInOut",
                            repeat: Infinity
                        }}
                        className="w-10 h-10 border-4 border-stone-200 border-t-stone-900 rounded-full"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GlobalLoader;
