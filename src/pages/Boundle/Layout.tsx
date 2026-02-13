import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Trophy, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const BoundleLayout: React.FC = () => {
    const location = useLocation();
    const isHome = location.pathname === '/boundle';

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
            {/* Özel Boundle Header - Mobilde Global Butonlarla Çakışmaması İçin Ortalanmış */}
            <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40 h-14">
                <div className="max-w-md mx-auto h-full px-4 flex items-center justify-center relative">

                    {/* GERİ BUTONU (Sadece alt sayfalarda göster, çünkü ana sayfada global home butonu var) */}
                    {!isHome && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Link to="/boundle" className="p-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
                                <ChevronLeft size={24} />
                            </Link>
                        </div>
                    )}

                    {/* ORTALANMIŞ LOGO/BAŞLIK */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-boun-blue rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-boun-blue/20">
                            B
                        </div>
                        <h1 className="font-serif font-bold text-lg text-stone-800 tracking-tight flex items-center gap-2">
                            Boundle
                            <span className="text-[10px] font-sans font-medium text-stone-500 badge border border-stone-200 px-1.5 py-0.5 rounded-md bg-stone-50">Beta</span>
                        </h1>
                    </div>

                    {/* SAĞ TARAF BOŞ (Global Ayarlar Butonu İçin) */}
                </div>
            </header>

            {/* Ana İçerik Alanı */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 pb-24 md:pb-8 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
};

export default BoundleLayout;
