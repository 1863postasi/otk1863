import React, { useState, useEffect } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { Search, Scroll, Users, Building2, Megaphone, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import * as router from 'react-router-dom';
import ResistanceView from '../components/Archive/Views/ResistanceView';
import RootsView from '../components/Archive/Views/RootsView';
import CampusView from '../components/Archive/Views/CampusView';
import InstitutionalView from '../components/Archive/Views/InstitutionalView';

const motion = m as any;
const { useSearchParams } = router;

// Define the available views
type ArchiveView = 'lobby' | 'roots' | 'campus' | 'institutional' | 'resistance';

const Archive: React.FC = () => {
  // State to manage the current view (like a mini-router)
  const [activeView, setActiveView] = useState<ArchiveView>('lobby');
  const [searchParams] = useSearchParams();

  // Check URL params for deep linking (e.g. from Commissions page or Story Link)
  useEffect(() => {
    const commissionId = searchParams.get('commission');
    const storyId = searchParams.get('storyId');
    const viewParam = searchParams.get('view');

    if (viewParam) {
      setActiveView(viewParam as ArchiveView);
    } else if (commissionId) {
      setActiveView('institutional');
    } else if (storyId) {
      setActiveView('roots');
    }
  }, [searchParams]);

  const categories = [
    {
      id: 'roots' as ArchiveView,
      title: "KÖKLER VE HİKAYELER",
      desc: "RC Yıllıkları, Padişah Mektupları, Boğaziçi Memories anlatıları ve kampüs efsaneleri.",
      icon: <Scroll size={28} strokeWidth={1.5} />,
      color: "text-stone-700",
      borderColor: "group-hover:border-stone-400"
    },
    {
      id: 'campus' as ArchiveView,
      title: "KULÜPLER ARŞİVİ",
      desc: "Öğrenci kulüplerinin tarihi, logoları, yayınları ve yerleşke haritasındaki konumları.",
      icon: <Users size={28} strokeWidth={1.5} />,
      color: "text-stone-700",
      borderColor: "group-hover:border-stone-400"
    },
    {
      id: 'institutional' as ArchiveView,
      title: "ÖTK VE AKADEMİ",
      desc: "Ders notları havuzu, çıkmış sorular, ÖTK tutanakları ve kurumsal belgeler.",
      icon: <Building2 size={28} strokeWidth={1.5} />,
      color: "text-stone-700",
      borderColor: "group-hover:border-stone-400"
    },
    {
      id: 'resistance' as ArchiveView,
      title: "DİRENİŞ HAFIZASI",
      desc: "1976'dan bugüne, akademik özgürlük mücadelesinin görsel ve yazılı kronolojisi.",
      icon: <Megaphone size={28} strokeWidth={1.5} />,
      color: "text-stone-700",
      borderColor: "group-hover:border-stone-400"
    }
  ];

  return (
    // Fixed height container for single-screen feel on Lobby (h-[calc(100vh-56px)])
    <div className="h-dvh md:h-[calc(100vh-56px)] bg-[#f5f5f4] font-sans relative overflow-hidden">

      <AnimatePresence mode="wait">

        {/* LOBBY VIEW */}
        {activeView === 'lobby' ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col justify-center items-center overflow-hidden"
          >
            {/* 1. TOP SECTION (Compact) */}
            <div className="relative w-full flex flex-col items-center text-center z-10 shrink-0 mb-4 md:mb-8">

              {/* Logo Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="mb-2 md:mb-3"
              >
                <img src="https://cdn.1863postasi.org/bg/kh-logo.png" alt="Kolektif Hamlin Logo" className="h-12 md:h-16 w-auto object-contain opacity-90 drop-shadow-sm" />
              </motion.div>

              {/* Main Title Area */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-4"
              >
                <h1 className="font-serif text-2xl md:text-4xl text-stone-900 font-bold tracking-tight mb-1">
                  KOLEKTİF HAMLİN
                </h1>
                <p className="font-serif text-stone-500 font-medium text-xs md:text-sm tracking-wide leading-relaxed uppercase">
                  ÖTK Arşivi ve BogaziciMemories katkılarıyla...
                </p>
              </motion.div>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="w-full max-w-lg px-4 relative group"
              >
                <div className="absolute inset-y-0 left-4 pl-3 flex items-center pointer-events-none">
                  <Search className="text-stone-400 group-focus-within:text-stone-600 transition-colors" size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Akıllı Arşivde Ara... (Belge, Fotoğraf, Olay)"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-full shadow-sm hover:shadow-md focus:shadow-lg focus:ring-0 outline-none font-serif text-stone-700 placeholder:text-stone-400 transition-all text-sm"
                />
              </motion.div>
            </div>

            {/* 2. GRID SECTION (Compact & Centered) */}
            <div className="w-full max-w-5xl mx-auto px-4 md:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
                {categories.map((cat, idx) => (
                  <motion.button
                    key={cat.id}
                    onClick={() => setActiveView(cat.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + (idx * 0.1) }}
                    className={cn(
                      "group relative flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-lg text-left transition-all duration-300",
                      "hover:bg-white hover:shadow-lg bg-transparent border border-transparent hover:border-stone-100",
                      cat.borderColor
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "p-2.5 rounded-full bg-stone-200/50 group-hover:bg-stone-100 transition-colors shrink-0",
                      cat.color
                    )}>
                      {cat.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-base md:text-lg font-bold mb-0.5 text-stone-800 group-hover:text-black truncate">
                        {cat.title}
                      </h3>
                      <p className="font-sans text-[10px] md:text-xs text-stone-500 leading-snug line-clamp-2">
                        {cat.desc}
                      </p>
                    </div>

                    {/* Hover Arrow */}
                    <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
                      <ArrowRight className="text-stone-400" size={20} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 3. FOOTER SECTION */}
            <div className="shrink-0 py-4 text-center mt-4 md:mt-8">
              <p className="font-serif italic text-stone-400 text-[10px] md:text-xs font-medium tracking-wide opacity-80">
                Bu arşiv, Boğaziçi Üniversitesi öğrencilerinin ortak mirasıdır.
              </p>
            </div>
          </motion.div>
        ) : (
          /* SUB VIEWS CONTAINER */
          <motion.div
            key="subview"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full w-full overflow-y-auto custom-scrollbar bg-[#f5f5f4]"
          >
            {activeView === 'resistance' && <ResistanceView onBack={() => setActiveView('lobby')} />}
            {activeView === 'roots' && <RootsView onBack={() => setActiveView('lobby')} />}
            {activeView === 'campus' && <CampusView onBack={() => setActiveView('lobby')} />}
            {activeView === 'institutional' && <InstitutionalView onBack={() => setActiveView('lobby')} />}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Archive;