import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Users, Building2, Megaphone, ArrowRight, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const Archive: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showWarning, setShowWarning] = React.useState(false);

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
      desc: "BoğaziçiMemories anlatıları ve efsaneler.",
      icon: Scroll
    },
    {
      id: 'campus',
      path: '/arsiv/kampus',
      title: "KULÜPLER ARŞİVİ",
      desc: "Öğrenci kulüplerinin tarihi.",
      icon: Users
    },
    {
      id: 'institutional',
      path: '/arsiv/belgeler',
      title: "ÖTK VE AKADEMİ",
      desc: "Ders notu havuzu ve ÖTK belgeleri.",
      icon: Building2
    },
    {
      id: 'resistance',
      path: '/arsiv/direnis',
      title: "DİRENİŞ HAFIZASI",
      desc: "Mücadelenin görsel ve yazılı kronolojisi.",
      icon: Megaphone
    }
  ];

  return (
    <div className="h-dvh md:h-[calc(100vh-56px)] bg-[#f5f5f4] font-sans relative overflow-hidden flex flex-col items-center justify-center">

      {/* DEV WARNING BUTTON (Desktop Only) */}
      <div className="hidden md:block absolute top-4 right-4 md:top-8 md:right-8 z-50">
        <button
          onClick={() => setShowWarning(!showWarning)}
          className="p-2 md:p-3 rounded-full bg-amber-100/80 text-amber-700 hover:bg-amber-200 transition-all shadow-sm flex items-center gap-2 backdrop-blur-sm"
        >
          {/* Pulsing Dot */}
          <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-amber-600"></span>
          </span>
          <span className="font-bold text-[10px] md:text-xs uppercase tracking-wide">Bilgi</span>
        </button>

        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-12 right-0 w-64 p-4 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-stone-200 text-sm font-serif text-stone-600 z-50"
            >
              <div className="flex items-start gap-3">
                <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p>Veri yüklemesine site geliştirme aşamasından çıktıktan sonra başlanacaktır.</p>
              </div>
              <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-t border-l border-stone-200 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-3xl px-6 md:px-8 space-y-10 md:space-y-12 -mt-16 md:-mt-0">

        {/* HEADER */}
        <div className="text-center flex flex-col items-center relative">

          {/* MOBILE WARNING BUTTON (Hidden on Desktop) */}
          <div className="md:hidden mb-6 w-full flex flex-col items-center justify-center relative z-50">
            <button
              onClick={() => setShowWarning(!showWarning)}
              className="animate-pulse px-6 py-2 rounded-full bg-red-100 text-red-700 border border-red-200 shadow-sm flex items-center gap-2"
            >
              <Info size={18} className="text-red-600" />
              <span className="font-bold text-xs uppercase tracking-widest">DİKKAT</span>
            </button>
            <AnimatePresence>
              {showWarning && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute top-12 w-64 p-4 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-stone-200 text-sm font-serif text-stone-600 z-50 text-left"
                >
                  <p>Veri yüklemesine site geliştirme aşamasından çıktıktan sonra başlanacaktır.</p>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-stone-200 transform rotate-45"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-4"
          >
            <img src="https://cdn.1863postasi.org/bg/kh-logo.png" alt="Kolektif Hamlin Logo" className="h-16 md:h-20 w-auto object-contain opacity-90 drop-shadow-sm" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-serif text-3xl md:text-5xl text-stone-900 font-bold tracking-tight mb-2 uppercase">
              KOLEKTİF HAMLİN
            </h1>
            <p className="font-serif text-stone-500 font-medium text-xs md:text-sm tracking-wide uppercase">
              ÖTK Arşivi ve Boğaziçi Memories katkılarıyla...
            </p>
          </motion.div>
        </div>

        {/* GRID - Compact & Elegant */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 w-full">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + (idx * 0.1) }}
            >
              <Link
                to={cat.path}
                className="group relative flex items-center gap-4 p-3 md:p-5 rounded-xl transition-all duration-300 hover:bg-stone-200/50 text-left border border-transparent hover:border-stone-200/50"
              >
                {/* Icon Container - Smaller on mobile */}
                <div className="p-2.5 md:p-3 rounded-full bg-stone-200/50 group-hover:bg-white transition-colors shrink-0 text-stone-600 group-hover:text-black shadow-none group-hover:shadow-sm">
                  <cat.icon size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-sm md:text-base font-bold text-stone-700 group-hover:text-black uppercase tracking-wide transition-colors truncate">
                    {cat.title}
                  </h3>
                  <p className="text-[10px] md:text-xs text-stone-400 group-hover:text-stone-500 transition-colors truncate font-medium">
                    {cat.desc}
                  </p>
                </div>

                {/* Arrow - Subtle Reveal */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 text-stone-400">
                  <ArrowRight size={16} className="md:w-5 md:h-5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FOOTER NOTE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <p className="font-serif italic text-stone-300 text-[10px] md:text-xs tracking-wide">
            Bu arşiv, Boğaziçi Üniversitesi öğrencilerinin ortak mirasıdır.
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default Archive;
