import React, { useState } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { MOCK_TIMELINE } from '../../lib/data';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const motion = m as any;

const HeroTimeline: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(MOCK_TIMELINE.length - 1); // Default to latest

  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => Math.min(MOCK_TIMELINE.length - 1, prev + 1));
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (offset.x < -50 || swipe < -500) {
      handleNext();
    } else if (offset.x > 50 || swipe > 500) {
      handlePrev();
    }
  };

  // Spacing configurations
  const SPACING_MOBILE = 90;
  const SPACING_DESKTOP = 160;

  return (
    // FIX: Fixed height (h-[75vh]) instead of min-h-screen. 
    // Added pt-28 to clear header.
    <div className="relative w-full h-[85vh] md:h-[75vh] min-h-[600px] flex flex-col bg-stone-900 overflow-hidden pt-16 md:pt-28">

      {/* 1. SYNCHRONIZED BACKGROUND */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src={MOCK_TIMELINE[activeIndex].image}
            alt={MOCK_TIMELINE[activeIndex].title}
            className="w-full h-full object-cover opacity-60"
          />
          {/* Dark gradient overlay so white text pops */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-black/60" />
        </motion.div>
      </AnimatePresence>

      {/* 2. HERO CONTENT (MANIFESTO) - CENTERED */}
      {/* Changed to flex-col justify-center items-center for perfect centering */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center px-6 text-center pointer-events-none pb-24">
        <motion.div
          key={`text-${activeIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          // Added max-w-4xl to prevent text from hitting edges uncomfortably
          className="pointer-events-auto max-w-4xl mx-auto"
        >
          <h4 className="text-boun-gold text-sm md:text-base font-bold tracking-[0.2em] uppercase mb-4 drop-shadow-md">
            {MOCK_TIMELINE[activeIndex].year}
          </h4>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-7xl text-stone-100 font-bold leading-tight mb-6 drop-shadow-xl">
            {MOCK_TIMELINE[activeIndex].title}
          </h1>
          <p className="text-stone-200 font-serif text-lg md:text-xl font-light leading-relaxed drop-shadow-md px-4">
            {MOCK_TIMELINE[activeIndex].desc}
          </p>
        </motion.div>
      </div>

      {/* 3. TIMELINE STRIP - ABSOLUTE BOTTOM */}
      <div className="absolute bottom-0 w-full bg-[#e6e2dd] h-20 md:h-24 shrink-0 flex items-center justify-center overflow-hidden border-t-4 border-boun-gold/20 z-20">

        {/* DESKTOP ARROWS (Close to Center) */}
        <div className="hidden md:flex absolute inset-0 max-w-lg mx-auto items-center justify-between z-30 pointer-events-none">
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className={cn(
              "p-2 rounded-full text-[#5d4037] hover:text-[#3e2723] hover:bg-[#d7ccc8]/50 transition-all pointer-events-auto transform hover:scale-110",
              activeIndex === 0 && "opacity-0 pointer-events-none"
            )}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={handleNext}
            disabled={activeIndex === MOCK_TIMELINE.length - 1}
            className={cn(
              "p-2 rounded-full text-[#5d4037] hover:text-[#3e2723] hover:bg-[#d7ccc8]/50 transition-all pointer-events-auto transform hover:scale-110",
              activeIndex === MOCK_TIMELINE.length - 1 && "opacity-0 pointer-events-none"
            )}
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* MOBILE ARROWS (Overlay Edges) */}
        <div className="md:hidden absolute inset-0 z-30 flex items-center justify-between pointer-events-none px-2">
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className={cn(
              "p-1.5 bg-[#d7ccc8]/60 text-[#3e2723] backdrop-blur-sm rounded-full pointer-events-auto active:scale-95 transition-all",
              activeIndex === 0 && "opacity-0"
            )}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            disabled={activeIndex === MOCK_TIMELINE.length - 1}
            className={cn(
              "p-1.5 bg-[#d7ccc8]/60 text-[#3e2723] backdrop-blur-sm rounded-full pointer-events-auto active:scale-95 transition-all",
              activeIndex === MOCK_TIMELINE.length - 1 && "opacity-0"
            )}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Carousel Track */}
        <div
          className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {MOCK_TIMELINE.map((item, index) => {
              const diff = index - activeIndex;
              const isCenter = diff === 0;

              const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
              const spacing = isMobile ? SPACING_MOBILE : SPACING_DESKTOP;

              return (
                <motion.div
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  initial={false}
                  animate={{
                    x: diff * spacing,
                    scale: isCenter ? 1.4 : 0.85,
                    opacity: isCenter ? 1 : 0.4,
                    filter: isCenter ? 'blur(0px)' : 'blur(1px)',
                    zIndex: isCenter ? 10 : 1
                  }}
                  transition={{ type: "spring", stiffness: 250, damping: 25, mass: 0.8 }}
                  className="absolute flex flex-col items-center justify-center cursor-pointer origin-center"
                  style={{
                    left: "50%",
                    top: "50%",
                    marginLeft: "-40px",
                    marginTop: "-16px",
                    width: "80px",
                    height: "32px"
                  }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mb-1 transition-colors duration-300 ${isCenter ? 'bg-[#3e2723]' : 'bg-[#a1887f]'}`} />

                  <span className={`font-serif text-lg md:text-xl font-bold transition-colors duration-300 whitespace-nowrap ${isCenter ? 'text-[#3e2723]' : 'text-[#8d6e63]'}`}>
                    {item.year}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroTimeline;