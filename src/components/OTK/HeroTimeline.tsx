import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_TIMELINE } from '../../lib/data';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const HeroTimeline: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(MOCK_TIMELINE.length - 1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload images for buttery smooth transitions
  useEffect(() => {
    MOCK_TIMELINE.forEach((item) => {
      const img = new Image();
      img.src = item.image;
    });
  }, []);

  const handleNext = () => setActiveIndex((prev) => Math.min(MOCK_TIMELINE.length - 1, prev + 1));
  const handlePrev = () => setActiveIndex((prev) => Math.max(0, prev - 1));

  // Swipe logic
  const onDragEnd = (event: any, info: any) => {
    if (info.offset.x < -50) handleNext();
    else if (info.offset.x > 50) handlePrev();
  };

  const activeItem = MOCK_TIMELINE[activeIndex];

  return (
    <div
      className="relative w-full h-[85vh] md:h-[80vh] min-h-[600px] bg-stone-950 overflow-hidden flex flex-col justify-end group select-none"
      ref={containerRef}
    >

      {/* 1. CINEMATIC BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} // Custom ease for "premium" feel
            className="absolute inset-0"
          >
            {/* Dark Overlay Gradient - Mobile Optimized */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/30 z-10" />

            <img
              src={activeItem.image}
              alt={activeItem.title}
              className="w-full h-full object-cover object-center opacity-70"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. CONTENT LAYER */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 pb-32 md:pb-40 flex flex-col md:flex-row items-end md:items-center justify-between gap-8 pointer-events-none">

        {/* Left: Text Content */}
        <div className="flex-1 text-left pointer-events-auto">
          <motion.div
            key={`text-${activeIndex}`}
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-12 h-[2px] bg-boun-gold/80" />
              <span className="text-boun-gold font-bold tracking-[0.2em] text-sm md:text-base uppercase shadow-black drop-shadow-lg">
                {activeItem.year}
              </span>
            </div>

            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-bold leading-[1.1] mb-6 drop-shadow-xl tracking-tight">
              {activeItem.title}
            </h1>

            <p className="text-stone-300 font-sans text-lg md:text-xl font-light leading-relaxed max-w-prose drop-shadow-md border-l-2 border-stone-600 pl-6">
              {activeItem.desc}
            </p>
          </motion.div>
        </div>

        {/* Right: Progress Circle (Desktop Only) */}
        <div className="hidden md:flex flex-col items-center gap-4 shrink-0">
          <div className="relative w-1 h-32 bg-stone-800 rounded-full overflow-hidden">
            <motion.div
              initial={false}
              animate={{ height: `${((activeIndex + 1) / MOCK_TIMELINE.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="absolute top-0 w-full bg-boun-gold"
            />
          </div>
          <span className="text-stone-500 font-mono text-xs font-bold -rotate-90">
            {activeIndex + 1} / {MOCK_TIMELINE.length}
          </span>
        </div>
      </div>

      {/* 3. INTERACTIVE TIMELINE STRIP (BOTTOM NAV) */}
      <div className="absolute bottom-0 w-full h-24 md:h-28 z-30 bg-stone-900/80 backdrop-blur-xl border-t border-stone-800 flex flex-col justify-center">

        {/* Mobile Swipe Handler Overlay */}
        <motion.div
          className="absolute inset-x-0 bottom-24 top-0 z-40 md:hidden"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={onDragEnd}
        />

        <div className="max-w-7xl mx-auto w-full px-4 md:px-12 flex items-center justify-between">

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="p-3 rounded-full hover:bg-white/5 active:bg-white/10 text-stone-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all md:mr-8"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Timeline Ticks */}
          <div className="flex-1 flex items-center justify-between md:justify-center md:gap-16 overflow-hidden px-4 relative h-16">
            {/* Mask Gradients for smooth edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-stone-900/80 to-transparent z-10 md:hidden" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-stone-900/80 to-transparent z-10 md:hidden" />

            {MOCK_TIMELINE.map((item, idx) => {
              // Calculate relative distance for opacity/scale logic
              const dist = Math.abs(idx - activeIndex);
              const isVisibleMobile = dist <= 1; // Only show neighbors on mobile

              return (
                <button
                  key={item.year}
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    "flex flex-col items-center gap-2 transition-all duration-500 group relative py-2",
                    // Mobile visibility logic
                    !isVisibleMobile ? "hidden md:flex" : "flex"
                  )}
                >
                  {/* Dot */}
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500",
                    idx === activeIndex
                      ? "bg-boun-gold w-3 h-3 shadow-[0_0_10px_rgba(200,160,80,0.5)]"
                      : "bg-stone-600 group-hover:bg-stone-400"
                  )} />

                  {/* Year text */}
                  <span className={cn(
                    "font-serif text-sm md:text-lg font-bold transition-all duration-500",
                    idx === activeIndex
                      ? "text-white scale-110"
                      : "text-stone-600 group-hover:text-stone-400"
                  )}>
                    {item.year}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={activeIndex === MOCK_TIMELINE.length - 1}
            className="p-3 rounded-full hover:bg-white/5 active:bg-white/10 text-stone-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all md:ml-8"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroTimeline;