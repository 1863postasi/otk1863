import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Users, Building2, Megaphone, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Archive: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle Legacy Redirects & Deep Links
  useEffect(() => {
    const viewParam = searchParams.get('view');
    const commissionId = searchParams.get('commission');
    const storyId = searchParams.get('storyId');

    if (viewParam === 'roots') {
      navigate(`/arsiv/kokenler?${searchParams.toString()}`, { replace: true });
    } else if (viewParam === 'campus') {
      navigate('/arsiv/kampus', { replace: true });
    } else if (viewParam === 'resistance') {
      navigate('/arsiv/direnis', { replace: true });
    } else if (viewParam === 'institutional') {
      navigate(`/arsiv/belgeler?${searchParams.toString()}`, { replace: true });
    } else if (commissionId) {
      navigate(`/arsiv/belgeler?commission=${commissionId}`, { replace: true });
    } else if (storyId) {
      navigate(`/arsiv/kokenler?storyId=${storyId}`, { replace: true });
    }
  }, [searchParams, navigate]);

  const categories = [
    {
      id: 'roots',
      path: '/arsiv/kokenler',
      title: "KÖKLER VE HİKAYELER",
      desc: "RC Yıllıkları, Padişah Mektupları, Boğaziçi Memories anlatıları ve kampüs efsaneleri.",
      icon: <Scroll size={28} strokeWidth={1.5} />,
      color: "text-stone-700",
      borderColor: "group-hover:border-stone-400"
    },
    {
      id: 'campus',
      path: '/arsiv/kampus',
      title: "KULÜPLER ARŞİVİ",
      desc: "Öğrenci kulüplerinin tarihi, logoları, yayınları ve yerleşke haritasındaki konumları.",
      icon: <Users size={28} strokeWidth={1.5} />,
      color: "text-stone-700",
      borderColor: "group-hover:border-stone-400"
    },
    {
      id: 'institutional',
      path: '/arsiv/belgeler',
      title: "ÖTK VE AKADEMİ",
      desc: "Ders notları havuzu, çıkmış sorular, ÖTK tutanakları ve kurumsal belgeler.",
      icon: <Building2 size={28} strokeWidth={1.5} />,
      color: "text-stone-700",
      borderColor: "group-hover:border-stone-400"
    },
    {
      id: 'resistance',
      path: '/arsiv/direnis',
      title: "DİRENİŞ HAFIZASI",
      desc: "1976'dan bugüne, akademik özgürlük mücadelesinin görsel ve yazılı kronolojisi.",
      icon: <Megaphone size={28} strokeWidth={1.5} />,
      color: "text-stone-700",
      borderColor: "group-hover:border-stone-400"
    }
  ];

  return (
    // Fixed height container for single-screen feel on Lobby
    <div className="h-[calc(100vh-64px)] bg-[#f5f5f4] font-sans relative overflow-hidden flex flex-col">

      <AnimatePresence>
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
                  ÖTK Arşivi ve Boğaziçi Memories katkılarıyla...
                </p>
              </motion.div>
            </div>

            {/* 2. GRID (Ghost Buttons) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 md:gap-y-6 w-full">
              {categories.map((cat, idx) => (
                <motion.button
                  key={cat.id}
                  onClick={() => navigate(cat.path)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + (idx * 0.1) }}
                  className={cn(
                    "group relative flex items-center gap-4 p-4 md:p-6 rounded-xl transition-all duration-300",
                    "hover:bg-stone-200/50", // Ghost style
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
      </AnimatePresence>
    </div>
  );
};

export default Archive;