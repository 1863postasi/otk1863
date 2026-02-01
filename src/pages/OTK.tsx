import React from 'react';
import HeroTimeline from '../components/OTK/HeroTimeline';
import CommissionsCarousel from '../components/OTK/CommissionsCarousel';
import Representatives from '../components/OTK/Representatives';

const OTK: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">

      {/* 1. HERO & TIMELINE (Synced Cinematic Section) */}
      <HeroTimeline />

      {/* 2. COMMISSIONS (LoL Universe Focus Carousel) */}
      <CommissionsCarousel />

      {/* 
        ========================================================================================
        !!! DİKKAT !!! BURASI GEÇİCİ OLARAK GİZLENDİ. 
        GERİ AÇMAK İÇİN AŞAĞIDAKİ YORUM SATIRLARINI SİLİN (UNCOMMENT).
        VERİTABANI VE PANEL ÇALIŞMAYA DEVAM EDİYOR, SADECE FRONTEND GİZLENDİ.
        ========================================================================================
      
      <Representatives />
      
      */}

    </div>
  );
};

export default OTK;