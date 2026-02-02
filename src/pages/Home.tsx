import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useAnimation,
  PanInfo
} from 'framer-motion';
import HeroSection from '../components/Home/HeroSection';
import CalendarSection from '../components/Home/CalendarSection';
import AnnouncementsSection from '../components/Home/AnnouncementsSection';
import { SPRINGS } from '../lib/animations';

type SectionID = 'calendar' | 'hero' | 'announcements';

const Home: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // MotionValues for high-performance animation
  const x = useMotionValue(0);
  const controls = useAnimation();

  // Track current index in a ref to avoid stale closures in event handlers
  // -1: Calendar | 0: Hero | 1: Announcements
  const indexRef = useRef(0);

  // State for responsive width
  const [windowWidth, setWindowWidth] = useState(0);

  // Initialize width on mount and handle resize
  useEffect(() => {
    // Initial set
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      // Snap immediately to correct position without animation during resize
      // This prevents the layout from breaking when resizing window/rotating phone
      x.set(-indexRef.current * width);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [x]);

  // Unified navigation function
  const snapToSection = (newIndex: number) => {
    const width = containerRef.current?.offsetWidth || window.innerWidth || 0;

    // Clamp index between -1 and 1
    const targetIndex = Math.max(-1, Math.min(1, newIndex));
    indexRef.current = targetIndex;

    // Animate to the new position
    controls.start({
      x: -targetIndex * width,
      transition: {
        type: "spring",
        ...SPRINGS.snappy,
        stiffness: 280,
        damping: 30, // Slightly higher damping to prevent overshoot on large movements
        mass: 0.8
      }
    });
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const width = containerRef.current?.offsetWidth || window.innerWidth || 0;
    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) * velocity.x;
    const swipeThreshold = 5000;

    // Determine direction
    let newIndex = indexRef.current;

    // Logic: 
    // If dragged more than 25% of screen OR flicked with sufficient velocity
    if (offset.x < -width * 0.25 || (offset.x < 0 && swipe < -swipeThreshold)) {
      // Swiped Left -> Go Right (Next)
      newIndex = newIndex + 1;
    } else if (offset.x > width * 0.25 || (offset.x > 0 && swipe > swipeThreshold)) {
      // Swiped Right -> Go Left (Prev)
      newIndex = newIndex - 1;
    }

    snapToSection(newIndex);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100dvh-56px)] overflow-hidden bg-stone-900 touch-pan-y"
    >
      <motion.div
        className="flex w-[300%] h-full absolute top-0 left-[-100%]"

        // Connect MotionValue x to the style prop for performant transforms
        style={{
          x,
          touchAction: 'pan-y' // Vital for vertical scrolling on mobile while swiping horizontally
        }}

        animate={controls}

        drag="x"
        dragConstraints={{
          left: -windowWidth,
          right: windowWidth
        }}
        dragElastic={0.05} // Minimal resistance at edges
        dragMomentum={false} // Disable momentum so we control the snap manually
        onDragEnd={handleDragEnd}
      >

        {/* Left Section: Calendar (-1) */}
        <div className="w-1/3 h-full relative overflow-hidden">
          <CalendarSection onBack={() => snapToSection(0)} />
        </div>

        {/* Center Section: Hero (0) */}
        <div className="w-1/3 h-full relative">
          <HeroSection
            onNavigate={(section) => {
              if (section === 'calendar') snapToSection(-1);
              if (section === 'announcements') snapToSection(1);
            }}
          />
        </div>

        {/* Right Section: Announcements (1) */}
        <div className="w-1/3 h-full relative overflow-hidden bg-stone-100">
          <AnnouncementsSection onBack={() => snapToSection(0)} />
        </div>

      </motion.div>
    </div>
  );
};

export default Home;