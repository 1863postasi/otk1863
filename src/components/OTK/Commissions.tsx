import React, { useState } from 'react';
import { MOCK_COMMISSIONS } from '../../lib/data';
import { ChevronDown, Users } from 'lucide-react';
import { motion as m, AnimatePresence, LayoutGroup } from 'framer-motion';

const motion = m as any;

const Commissions: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="font-serif text-3xl text-stone-900 mb-8 text-center">Komisyonlar</h2>
      
      <LayoutGroup>
        <div className="space-y-4">
          {MOCK_COMMISSIONS.map((commission) => (
            <motion.div 
              layout // Essential for smooth sibling shifting
              key={commission.id}
              initial={{ borderRadius: 8 }}
              className={`border overflow-hidden transition-colors duration-300 ${
                expandedId === commission.id ? 'border-stone-400 shadow-md bg-white' : 'border-stone-200 bg-stone-50 hover:bg-white'
              }`}
              style={{ willChange: 'transform, height' }}
            >
              <motion.button
                layout="position"
                onClick={() => toggleExpand(commission.id)}
                className="w-full px-6 py-4 flex items-center justify-between focus:outline-none"
              >
                <div className="flex items-center gap-4 text-left">
                  <motion.div layout className={`p-2 rounded-full flex-shrink-0 ${commission.status === 'active' ? 'bg-boun-blue/10 text-boun-blue' : 'bg-stone-200 text-stone-400'}`}>
                      <Users size={20} />
                  </motion.div>
                  <div>
                    <motion.h3 layout="position" className="font-serif font-bold text-lg text-stone-800">{commission.name}</motion.h3>
                    <motion.p layout="position" className="text-sm text-stone-500 font-sans hidden sm:block">{commission.description}</motion.p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedId === commission.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="text-stone-400" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                  {expandedId === commission.id && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 pt-2 border-t border-stone-100">
                           {/* Fixed width inner container prevents text reflow during height animation */}
                           <div className="w-full">
                              <p className="text-stone-700 leading-relaxed font-sans">
                                {commission.detailedContent}
                              </p>
                              
                              {commission.status === 'active' && (
                                <div className="mt-4 flex gap-3">
                                   <button className="text-xs font-bold text-boun-blue border border-boun-blue px-3 py-1 rounded hover:bg-boun-blue hover:text-white transition-colors">
                                     Son Raporlar
                                   </button>
                                   <button className="text-xs font-bold text-stone-600 border border-stone-300 px-3 py-1 rounded hover:bg-stone-100 transition-colors">
                                     Üyeler
                                   </button>
                                </div>
                              )}
                              {commission.status === 'coming_soon' && (
                                <div className="mt-2 inline-block bg-stone-200 text-stone-600 text-xs px-2 py-1 rounded">
                                  Bu komisyon kurulum aşamasındadır.
                                </div>
                              )}
                           </div>
                        </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
};

export default Commissions;