import React from 'react';
import HeroTimeline from '../components/OTK/HeroTimeline';
import CommissionsCarousel from '../components/OTK/CommissionsCarousel';
import Representatives from '../components/OTK/Representatives';

const OTK: React.FC = () => {
  return (
    <div className="bg-stone-50 min-h-screen flex flex-col">

      {/* 1. Cinematic Hero Section */}
      <HeroTimeline />

      {/* 2. Commissions Interactive Section */}
      <CommissionsCarousel />

      {/* 
        ========================================================================================
        !!! DİKKAT !!! 
        TEMSİLCİLER LİSTESİ ŞU AN GİZLİDİR.
        
        Geri açmak için aşağıdaki <Representatives /> bileşenini yorum satırından çıkarın.
        Veritabanı ve panel çalışmaktadır, veriler hazırdır.
        ========================================================================================
      
      <Representatives />

      */}

    </div>
  );
};

export default OTK;