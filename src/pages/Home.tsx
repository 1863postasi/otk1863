import React, { useState, useEffect } from 'react';
import { motion as m } from 'framer-motion';
import HeroSection from '../components/Home/HeroSection';
import CalendarSection from '../components/Home/CalendarSection';
import AnnouncementsSection from '../components/Home/AnnouncementsSection';
import { SPRINGS } from '../lib/animations';

const motion = m as any;

type Section = 'calendar' | 'hero' | 'announcements';

const Home: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('hero');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Map sections to indices for calculation
  // Calendar (-1) | Hero (0) | Announcements (1)
  const getSectionIndex = (section: Section) => {
    if (section === 'calendar') return -1;
    if (section === 'announcements') return 1;
    return 0;
  };

  const currentIndex = getSectionIndex(activeSection);

  // Swipe threshold logic
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  // Swipe helper
  // const handleDragEnd ... inlined below

  return (
    // UPDATED: Used 100dvh (dynamic viewport height) minus 56px (header h-14)
    <div className="relative w-full h-[calc(100dvh-56px)] overflow-hidden bg-stone-900 touch-pan-y">

      {/* Sliding Container */}
      <motion.div
        className="flex w-[300vw] h-full absolute left-[-100vw] touch-pan-y"

        // Critical: Force animation to current index state
        animate={{ x: -currentIndex * windowWidth }}

        transition={SPRINGS.snappy}
        style={{ willChange: 'transform' }}

        drag="x"
        dragDirectionLock={true} // Lock vertical scroll while swiping horizontally
        dragPropagations={false}
        dragConstraints={{ left: -windowWidth, right: windowWidth }}
        dragElastic={0.2}
        dragMomentum={false} // Keep false for strict snapping control, but rely on updated logic
        dragSnapToOrigin={true}

        onDragEnd={(e, { offset, velocity }) => {
          const swipe = Math.abs(offset.x) * velocity.x;
          const swipeThreshold = 10000;
          const distanceThreshold = windowWidth / 4;

          let newSection = activeSection;

          if (offset.x < -distanceThreshold || swipe < -swipeThreshold) {
            // Swipe Left (Go Right)
            if (activeSection === 'calendar') newSection = 'hero';
            else if (activeSection === 'hero') newSection = 'announcements';
          } else if (offset.x > distanceThreshold || swipe > swipeThreshold) {
            // Swipe Right (Go Left)
            if (activeSection === 'announcements') newSection = 'hero';
            else if (activeSection === 'hero') newSection = 'calendar';
          }

          setActiveSection(newSection);
        }}
      >

        {/* Left Section: Calendar */}
        <div className="w-[100vw] h-full overflow-hidden relative">
          <CalendarSection onBack={() => setActiveSection('hero')} />
        </div>

        {/* Middle Section: Hero */}
        <div className="w-[100vw] h-full relative">
          <HeroSection onNavigate={(s) => setActiveSection(s)} />
        </div>

        {/* Right Section: Announcements */}
        <div className="w-[100vw] h-full overflow-hidden relative bg-stone-100">
          <AnnouncementsSection onBack={() => setActiveSection('hero')} />
        </div>

      </motion.div>
    </div>
  );
};

export default Home;