import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Trophy, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const BoundleLayout: React.FC = () => {
    const location = useLocation();
    const isHome = location.pathname === '/boundle';

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
            {/* Özel Boundle Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40 h-14">
                <div className="max-w-md mx-auto h-full px-4 flex items-center justify-between">

                    <div className="flex items-center gap-2">
                        {!isHome ? (
                            <Link to="/boundle" className="p-2 -ml-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
                                <ChevronLeft size={24} />
                            </Link>
                        ) : (
                            <div className="w-8 h-8 bg-boun-blue rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-boun-blue/20">
                                B
                            </div>
                        )}
                        <h1 className="font-serif font-bold text-lg text-stone-800 tracking-tight">
                            Boundle {isHome ? <span className="text-xs font-sans font-normal text-stone-500 ml-1 badge border border-stone-200 px-1.5 py-0.5 rounded-md bg-stone-50">Beta</span> : ''}
                        </h1>
                    </div>

                    <div className="flex items-center gap-1">
                        <button className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
                            <HelpCircle size={22} />
                        </button>
                        <Link to="/boundle/leaderboard" className="p-2 text-boun-gold hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors">
                            <Trophy size={22} />
                        </Link>
                    </div>

                </div>
            </header>

            {/* Ana İçerik Alanı */}
            <main className="flex-1 max-w-md mx-auto w-full p-4 pb-24 md:pb-8">
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
