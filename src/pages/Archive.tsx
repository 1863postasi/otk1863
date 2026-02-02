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
    // Fixed height container for single-screen feel on Lobby
    <div className="h-dvh md:h-[calc(100vh-56px)] bg-[#f5f5f4] font-sans relative overflow-hidden flex flex-col">

      <AnimatePresence mode="wait">

        {/* LOBBY VIEW */}
        {activeView === 'lobby' ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col justify-center items-center overflow-hidden relative"
          >
            {/* Center Container */}
            <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4 md:px-8 space-y-8 md:space-y-12 -mt-12 md:-mt-0">

              {/* 1. HEADER (Logo & Title) */}
              <div className="text-center flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="mb-4 md:mb-6"
                >
                  <img src="https://cdn.1863postasi.org/bg/kh-logo.png" alt="Kolektif Hamlin Logo" className="h-16 md:h-20 w-auto object-contain opacity-90 drop-shadow-sm" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h1 className="font-serif text-2xl md:text-4xl text-stone-900 font-bold tracking-tight mb-2">
                    KOLEKTİF HAMLİN
                  </h1>
                  <p className="font-serif text-stone-500 font-medium text-xs md:text-sm tracking-wide uppercase">
                    ÖTK Arşivi ve BogaziciMemories katkılarıyla...
                  </p>
                </motion.div>
              </div>

              {/* 2. GRID (Ghost Buttons) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 md:gap-y-6 w-full">
                {categories.map((cat, idx) => (
                  <motion.button
                    key={cat.id}
                    onClick={() => setActiveView(cat.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + (idx * 0.1) }}
                    className={cn(
                      "group relative flex items-center gap-4 p-4 md:p-6 rounded-xl transition-all duration-300",
                      "hover:bg-stone-200/50", // Ghost style: transparent normally, subtle gray on hover
                      "text-left"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "p-3 rounded-full bg-stone-200/50 group-hover:bg-white transition-colors shrink-0 text-stone-700 group-hover:text-black shadow-sm",
                      cat.color
                    )}>
                      {cat.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <h3 className="font-serif text-base md:text-lg font-bold text-stone-700 group-hover:text-black uppercase tracking-wide transition-colors">
                        {cat.title}
                      </h3>
                    </div>

                    {/* Hover Arrow */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 text-stone-400">
                      <ArrowRight size={20} />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* 3. FOOTER */}
              <div className="text-center pt-8 md:pt-12">
                <p className="font-serif italic text-stone-400 text-[10px] md:text-xs font-medium tracking-wide opacity-70">
                  Bu arşiv, Boğaziçi Üniversitesi öğrencilerinin ortak mirasıdır.
                </p>
              </div>

            </div>
          </motion.div>
        ) : (
          /* SUB VIEWS CONTAINER - Rendered directly to fix Exit Animation/White Screen */
          <motion.div
            key="subview-container" // Key needs to match for AnimatePresence to detect swap
            className="h-full w-full overflow-hidden bg-[#f5f5f4]"
          >
            <motion.div
              key={activeView} // Inner key triggers the transition between views if wanted, or just mount/unmount
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full w-full overflow-y-auto custom-scrollbar"
            >
              {activeView === 'resistance' && <ResistanceView onBack={() => setActiveView('lobby')} />}
              {activeView === 'roots' && <RootsView onBack={() => setActiveView('lobby')} />}
              {activeView === 'campus' && <CampusView onBack={() => setActiveView('lobby')} />}
              {activeView === 'institutional' && <InstitutionalView onBack={() => setActiveView('lobby')} />}
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Archive;