import React, { useEffect, useState } from 'react';
import { HERO_IMAGES, MOCK_ANNOUNCEMENTS } from '../../lib/data';
import { Calendar, Bell, ArrowLeft, ArrowRight, Instagram, Twitter, Download } from 'lucide-react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const motion = m as any;

interface HeroSectionProps {
  onNavigate: (section: 'calendar' | 'announcements') => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [bgImage, setBgImage] = useState(HERO_IMAGES[0]);
  const [hasUnread, setHasUnread] = useState(false);
  const { supportsPWA, isInstalled, install } = usePWAInstall();

  useEffect(() => {
    // Select random image on mount
    const randomImg = HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];
    setBgImage(randomImg);
  }, []);

  // Check for unread announcements
  useEffect(() => {
    const checkUnread = () => {
      const readIds = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
      // Check if there is any announcement ID in the Mock Data that is NOT in the readIds array
      const unreadExists = MOCK_ANNOUNCEMENTS.some(item => !readIds.includes(item.id));
      setHasUnread(unreadExists);
    };

    checkUnread();

    // Poll every 2 seconds to update badge if user comes back from announcements without full reload
    const interval = setInterval(checkUnread, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-stone-900/60 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto w-full flex flex-col items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 md:mb-16 mt-[-40px] md:mt-[-60px]"
        >
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-stone-100 mb-4 tracking-tight drop-shadow-2xl">
            1863 Postası
          </h1>
          <p className="font-serif italic text-xl md:text-2xl text-stone-300 font-light">
            “Bu işte Hamlin’in bir parmağı var.”
          </p>
        </motion.div>

        {/* Navigation Buttons Container */}
        <div className="flex flex-col gap-6 items-center w-full">
          <motion.div
            className="flex flex-row items-end justify-between md:justify-center gap-4 md:gap-24 w-full px-2 md:px-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >

            {/* Left: Calendar (Maps to Left Swipe/Page) */}
            <button
              onClick={() => onNavigate('calendar')}
              className="w-full md:w-auto px-4 md:px-6 py-4 bg-stone-100 text-stone-900 rounded-sm font-serif text-base md:text-lg font-semibold hover:bg-white transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(68,64,60,1)] hover:shadow-[2px_2px_0px_0px_rgba(68,64,60,1)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2 md:gap-3 group"
            >
              <ArrowLeft size={20} className="text-stone-500 group-hover:text-stone-900 transition-colors" />
              <Calendar className="w-5 h-5 group-hover:text-boun-red transition-colors shrink-0" />
              <span className="hidden sm:inline">Takvime Göz At</span>
              <span className="sm:hidden">Takvim</span>
            </button>

            {/* Right: Announcements (Maps to Right Swipe/Page) */}
            <div className="relative w-full md:w-auto">
              <button
                onClick={() => onNavigate('announcements')}
                className="w-full md:w-auto px-4 md:px-6 py-4 bg-transparent border-2 border-stone-300 text-stone-100 rounded-sm font-serif text-base md:text-lg font-semibold hover:bg-stone-800/50 hover:border-white transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 md:gap-3 group"
              >
                <span className="hidden sm:inline">Duyurular</span>
                <span className="sm:hidden">Duyuru</span>
                <Bell className="w-5 h-5 group-hover:text-boun-gold transition-colors shrink-0" />
                <ArrowRight size={20} className="text-stone-400 group-hover:text-stone-100 transition-colors" />
              </button>

              {/* Notification Badge */}
              <AnimatePresence>
                {hasUnread && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-boun-red rounded-full border-2 border-stone-900 shadow-md"
                  >
                    <span className="absolute inset-0 rounded-full bg-boun-red animate-ping opacity-75"></span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Install PWA Button (Mobile Only & If Supported) */}
          <AnimatePresence>
            {supportsPWA && !isInstalled && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                onClick={install}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-stone-400/50 text-stone-100 rounded-full font-sans text-sm font-medium hover:bg-white/20 transition-all active:scale-95 shadow-lg"
              >
                <Download size={16} />
                <span>Uygulamayı Ana Ekrana Ekle</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* SOCIAL MEDIA LINKS (Footer) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-24 md:bottom-12 flex items-center gap-8"
        >
          <a
            href="https://www.instagram.com/boun_otk/"
            target="_blank"
            rel="noreferrer"
            className="text-stone-400 hover:text-white transition-colors transform hover:scale-110 duration-300"
            aria-label="Instagram"
          >
            <Instagram size={28} strokeWidth={1.5} />
          </a>
          <div className="w-px h-6 bg-stone-600/50"></div>
          <a
            href="https://x.com/boun_otk"
            target="_blank"
            rel="noreferrer"
            className="text-stone-400 hover:text-white transition-colors transform hover:scale-110 duration-300"
            aria-label="Twitter / X"
          >
            <Twitter size={28} strokeWidth={1.5} />
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;