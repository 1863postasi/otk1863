import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Users, Building2, Megaphone, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

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
      icon: Scroll
    },
    {
      id: 'campus',
      path: '/arsiv/kampus',
      title: "KULÜPLER ARŞİVİ",
      desc: "Öğrenci kulüplerinin tarihi, logoları, yayınları ve yerleşke haritasındaki konumları.",
      icon: Users
    },
    {
      id: 'institutional',
      path: '/arsiv/belgeler',
      title: "ÖTK VE AKADEMİ",
      desc: "Ders notları havuzu, çıkmış sorular, ÖTK tutanakları ve kurumsal belgeler.",
      icon: Building2
    },
    {
      id: 'resistance',
      path: '/arsiv/direnis',
      title: "DİRENİŞ HAFIZASI",
      desc: "1976'dan bugüne, akademik özgürlük mücadelesinin görsel ve yazılı kronolojisi.",
      icon: Megaphone
    }
  ];

  return (
    <div className="h-dvh md:h-[calc(100vh-56px)] bg-[#f5f5f4] font-sans relative overflow-hidden flex flex-col items-center justify-center">

      <div className="w-full max-w-3xl px-6 md:px-8 space-y-10 md:space-y-12 -mt-16 md:-mt-0">

        {/* HEADER */}
        <div className="text-center flex flex-col items-center">
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
