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

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = swipePower(offset.x, velocity.x);
    const distanceThreshold = windowWidth / 3; // Must drag at least 1/3rd of screen if moving slowly

    // Swipe LEFT (Dragging content to the left, moving to Right Index)
    if (swipe < -swipeConfidenceThreshold || offset.x < -distanceThreshold) {
      if (activeSection === 'calendar') setActiveSection('hero');
      else if (activeSection === 'hero') setActiveSection('announcements');
    }
    // Swipe RIGHT (Dragging content to the right, moving to Left Index)
    else if (swipe > swipeConfidenceThreshold || offset.x > distanceThreshold) {
      if (activeSection === 'announcements') setActiveSection('hero');
      else if (activeSection === 'hero') setActiveSection('calendar');
    }
    // If threshold not met, the component state doesn't change, 
    // and the `animate` prop will automatically snap it back to original position.
  };

  return (
    // UPDATED: Used 100dvh (dynamic viewport height) minus 56px (header h-14)
    <div className="relative w-full h-[calc(100dvh-56px)] overflow-hidden bg-stone-900 touch-pan-y">

      {/* Sliding Container */}
      <motion.div
        className="flex w-[300vw] h-full absolute left-[-100vw] touch-pan-y"

        // Animate based on index: x = -1 * index * width
        // Index -1 (Calendar) -> x = 100vw (Shift Right)
        // Index 0 (Hero) -> x = 0
        // Index 1 (Announcements) -> x = -100vw (Shift Left)
        animate={{ x: -currentIndex * windowWidth }}

        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ willChange: 'transform' }}

        // Enable Direct Manipulation
        drag="x"
        dragElastic={0.1} // Resistance at edges
        dragMomentum={false} // Disable momentum so it snaps immediately on release

        // Constraints: 
        // When at Hero (0): Can go Left (-WW) or Right (WW) -> limits are correct.
        // When at Calendar (-1): animate x is WW. We want to stop dragging Right (>WW). constraint Right: WW.
        // When at Announcements (1): animate x is -WW. We want to stop dragging Left (<-WW). constraint Left: -WW.
        dragConstraints={{ left: -windowWidth, right: windowWidth }}

        onDragEnd={handleDragEnd}
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