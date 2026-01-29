import React, { useState } from 'react';
import { motion as m } from 'framer-motion';

const motion = m as any;

const TimelineView: React.FC = () => {
  // Simple Mock Timeline Data
  const timelineEvents = [
    { year: 2021, title: "Rektörlük Ataması Protestoları", desc: "Güney Meydan nöbetleri başladı." },
    { year: 2022, title: "Mezuniyet Töreni Alternatifi", desc: "Öğrenciler kendi mezuniyetlerini organize etti." },
    { year: 2023, title: "Kulüp Odaları Direnişi", desc: "ÖTK inisiyatifi ile odalar korundu." }
  ];

  return (
    <div className="relative py-10 px-4">
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-stone-300"></div>
      
      {timelineEvents.map((event, idx) => (
        <div key={idx} className={`flex justify-between items-center w-full mb-8 ${idx % 2 === 0 ? 'flex-row-reverse' : ''}`}>
          <div className="w-5/12"></div>
          
          <div className="z-20 flex items-center order-1 bg-stone-800 shadow-xl w-8 h-8 rounded-full justify-center">
            <div className="w-3 h-3 bg-boun-gold rounded-full"></div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="order-1 bg-white rounded-lg shadow-lg w-5/12 px-6 py-4 border border-stone-200 relative"
          >
             {/* Stone texture effect class would go here if using custom image */}
            <h3 className="mb-1 font-serif font-bold text-stone-800 text-xl">{event.year}</h3>
            <h4 className="mb-2 font-bold text-boun-red">{event.title}</h4>
            <p className="text-sm leading-snug tracking-wide text-stone-600 text-opacity-100">{event.desc}</p>
          </motion.div>
        </div>
      ))}
      
      <div className="text-center mt-8">
        <p className="font-serif italic text-stone-500">Daha fazlası yakında dijitalleşecek...</p>
      </div>
    </div>
  );
};

export default TimelineView;