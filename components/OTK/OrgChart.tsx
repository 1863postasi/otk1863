import React from 'react';
import { MOCK_REPS } from '../../lib/data';

const OrgChart: React.FC = () => {
  return (
    <div className="bg-stone-900 py-16 px-4 text-stone-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl mb-12 text-center text-stone-100">
          Organizasyon Şeması
        </h2>

        {/* Executive Board Highlight (Mock) */}
        <div className="flex justify-center mb-16">
             <div className="text-center group">
                <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-4 border-boun-gold shadow-[0_0_15px_rgba(180,142,67,0.3)] mb-4">
                    <img src={MOCK_REPS[0].imageUrl} alt="Başkan" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <h3 className="font-serif text-xl font-bold">{MOCK_REPS[0].name}</h3>
                <p className="text-boun-gold text-sm font-medium tracking-widest uppercase">ÖTK Başkanı</p>
             </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
          {MOCK_REPS.slice(1).map((rep) => (
            <div key={rep.id} className="text-center group">
              <div className="w-24 h-24 mx-auto rounded-md overflow-hidden bg-stone-800 mb-3 relative">
                 <img src={rep.imageUrl} alt={rep.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
                 <div className="absolute inset-0 border border-stone-600 rounded-md"></div>
              </div>
              <h4 className="font-serif font-semibold text-lg leading-tight">{rep.name}</h4>
              <p className="text-stone-400 text-xs mt-1">{rep.department}</p>
              <p className="text-stone-500 text-xs">{rep.role}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
            <button className="text-stone-400 hover:text-white border-b border-stone-600 pb-1 text-sm transition-colors">
                Tüm Listeyi Görüntüle (120 Temsilci)
            </button>
        </div>
      </div>
    </div>
  );
};

export default OrgChart;
