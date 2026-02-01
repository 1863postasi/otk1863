import React, { useState } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FileText, Video, Image, Mic, ChevronDown, Download, ExternalLink, Calendar, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

const motion = m as any;

// --- MOCK DATA ---
const RESISTANCE_DATA = [
  {
    id: "r1",
    year: 2024,
    date: "5 Ocak 2024",
    title: "Yemekhane Boykotu",
    summary: "Fahiş zamlara ve düşen porsiyon kalitesine karşı Kuzey Meydan'da kitlesel boykot.",
    description: "Öğrenciler, %100'ü aşan zam oranlarını ve yemekhanedeki hijyen sorunlarını protesto etmek için turnikelerden geçmeyerek alternatif yeryüzü sofrası kurdu. Rektörlük binasına yürüyüş düzenlendi.",
    type: "image",
    tags: ["Fotoğraf", "Basın Açıklaması"],
    mediaUrl: "/demo-boykot.jpg"
  },
  {
    id: "r2",
    year: 2021,
    date: "1 Şubat 2021",
    title: "Güney Meydan Müdahalesi",
    summary: "Güney Kampüs'e polis müdahalesi ve toplu gözaltılar.",
    description: "Okul içinde barışçıl nöbet tutan öğrencilere akşam saatlerinde polis müdahalesi gerçekleşti. 51 öğrenci kampüs içinde gözaltına alındı. Bu olay, üniversite tarihinde kampüs içine yapılan en sert müdahalelerden biri olarak kayıtlara geçti.",
    type: "gallery",
    tags: ["Fotoğraf Galerisi", "Gözaltı Listesi"],
    mediaUrl: "/demo-south.jpg"
  },
  {
    id: "r3",
    year: 2021,
    date: "4 Ocak 2021",
    title: "Melih Bulu Ataması ve İlk Eylem",
    summary: "Kayyum rektör atamasına karşı ilk kitlesel tepki: 'Kabul Etmiyoruz, Vazgeçmiyoruz'.",
    description: "Cumhurbaşkanlığı kararnamesi ile Melih Bulu'nun rektör olarak atanmasının ardından, öğretim üyeleri ve öğrencilerin katılımıyla Güney Meydan'da devir teslim töreni protesto edildi. Cübbeli hocalar rektörlüğe sırtını döndü.",
    type: "video",
    tags: ["Video Kaydı", "PDF Bildiri"],
    mediaUrl: "https://youtube.com/..."
  },
  {
    id: "r4",
    year: 2013,
    date: "Haziran 2013",
    title: "Gezi Direnişi ve Boğaziçi Forumları",
    summary: "Kuzey Park forumları ve akademik dayanışma ağının kuruluşu.",
    description: "Gezi Parkı olayları sırasında kampüste kurulan forumlar, doğrudan demokrasinin işletildiği ve üniversite bileşenlerinin taleplerini ortaklaştırdığı alanlara dönüştü. Bu dönemde alınan kararların tutanakları arşivdedir.",
    type: "pdf",
    tags: ["Forum Tutanakları", "PDF"],
    mediaUrl: "/gezi-tutanak.pdf"
  },
  {
    id: "r5",
    year: 1990,
    date: "12 Kasım 1990",
    title: "Eski YÖK Protestoları",
    summary: "'Özerk Üniversite' talebiyle yapılan tarihi Rektörlük işgali girişimi.",
    description: "90'lı yılların öğrenci hareketliliği kapsamında, YÖK'ün kuruluş yıldönümünde öğrenciler akademik özerklik talebiyle boykot düzenledi. Dönemin gazete küpürleri ve teksir kağıdıyla çoğaltılan bildirileri.",
    type: "doc",
    tags: ["Gazete Küpürü", "Arşiv"],
    mediaUrl: "/arsiv-1990.jpg"
  }
];

// Helper to get Icon based on type
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'pdf': return <FileText size={16} />;
    case 'video': return <Video size={16} />;
    case 'image': return <Image size={16} />;
    case 'doc': return <FileText size={16} />;
    case 'gallery': return <Image size={16} />;
    default: return <FileText size={16} />;
  }
};

interface ResistanceTimelineProps {
  onBack: () => void;
}

const ResistanceTimeline: React.FC<ResistanceTimelineProps> = ({ onBack }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Group data by year for Sticky Headers
  const groupedData = RESISTANCE_DATA.reduce((acc, item) => {
    if (!acc[item.year]) acc[item.year] = [];
    acc[item.year].push(item);
    return acc;
  }, {} as Record<number, typeof RESISTANCE_DATA>);

  const sortedYears = Object.keys(groupedData).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="relative w-full pb-20 font-sans min-h-screen bg-[#f5f5f4]">
      
      {/* HEADER WITH BACK BUTTON */}
      <div className="sticky top-0 z-30 bg-[#f5f5f4]/90 backdrop-blur-sm border-b border-stone-200 px-4 py-4 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-600 hover:text-boun-red transition-colors font-serif font-bold text-sm"
        >
          <ArrowLeft size={18} />
          Lobiye Dön
        </button>
        <h2 className="text-xl font-serif font-bold text-stone-900 ml-auto md:ml-0">Direniş Hafızası</h2>
      </div>
      
      {/* BACKGROUND LINE */}
      {/* Mobile: Left aligned (left-6). Desktop: Center aligned (left-1/2) */}
      <div className="absolute top-20 bottom-0 w-0.5 bg-stone-300 left-6 md:left-1/2 transform md:-translate-x-1/2 z-0" />

      <div className="pt-8 px-4">
        {sortedYears.map((year) => (
            <div key={year} className="mb-12 relative">
            
            {/* STICKY YEAR HEADER */}
            <div className="sticky top-16 z-20 flex justify-start md:justify-center mb-8 pt-4 pb-2">
                <div className="bg-stone-900 text-stone-100 px-4 py-1.5 rounded-full font-serif font-bold text-lg shadow-lg border-2 border-boun-gold ml-12 md:ml-0">
                {year}
                </div>
            </div>

            <div className="flex flex-col gap-8 md:gap-0">
                {groupedData[Number(year)].map((item, index) => {
                const isEven = index % 2 === 0;
                const isExpanded = expandedId === item.id;

                return (
                    <div key={item.id} className="relative w-full md:flex md:items-start md:justify-between group">
                    
                    {/* TIMELINE DOT */}
                    <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 mt-6 z-10">
                        <div className={cn(
                            "w-4 h-4 rounded-full border-2 border-stone-100 shadow-md transition-colors duration-300",
                            isExpanded ? "bg-boun-red scale-125" : "bg-stone-400 group-hover:bg-boun-red"
                        )} />
                    </div>

                    {/* CONTENT CARD WRAPPER */}
                    <div className={cn(
                        "pl-12 pr-4 md:pl-0 md:pr-0 w-full md:w-[45%]",
                        "md:relative",
                        isEven ? "md:mr-auto md:text-right md:pr-12" : "md:ml-auto md:text-left md:pl-12"
                    )}>
                        <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5 }}
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className={cn(
                            "bg-white rounded-lg shadow-sm border border-stone-200 cursor-pointer overflow-hidden relative transition-all duration-300",
                            isExpanded ? "ring-2 ring-boun-red/20 shadow-xl" : "hover:shadow-md hover:border-stone-300"
                        )}
                        >
                            {/* Card Header */}
                            <motion.div layout="position" className="p-4 md:p-5">
                                <div className={cn(
                                    "flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-stone-500",
                                    isEven ? "md:justify-end" : "md:justify-start",
                                    "justify-start"
                                )}>
                                    <Calendar size={12} className="text-boun-red" />
                                    <span>{item.date}</span>
                                    <span className="w-1 h-1 rounded-full bg-stone-300 mx-1" />
                                    <div className="flex items-center gap-1 text-stone-400">
                                        {getTypeIcon(item.type)}
                                        <span>{item.type.toUpperCase()}</span>
                                    </div>
                                </div>

                                <motion.h3 layout="position" className="font-serif text-lg md:text-xl font-bold text-stone-900 leading-tight mb-2 group-hover:text-boun-red transition-colors">
                                    {item.title}
                                </motion.h3>

                                <motion.p layout="position" className="text-sm text-stone-600 font-sans leading-relaxed line-clamp-2">
                                    {item.summary}
                                </motion.p>
                            </motion.div>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border-t border-stone-100 bg-stone-50/50"
                                    >
                                        <div className="p-4 md:p-5 pt-2">
                                            <p className="text-stone-700 text-sm leading-7 mb-4 text-left">
                                                {item.description}
                                            </p>

                                            <div className="w-full h-40 bg-stone-200 rounded-md mb-4 flex items-center justify-center relative overflow-hidden group/media">
                                                {item.type === 'image' || item.type === 'gallery' ? (
                                                    <div className="absolute inset-0 bg-stone-300 flex items-center justify-center text-stone-500">
                                                        <Image size={32} />
                                                        <span className="ml-2 text-xs font-bold">Görsel Önizleme</span>
                                                    </div>
                                                ) : (
                                                    <div className="absolute inset-0 bg-stone-800 flex items-center justify-center text-stone-100">
                                                        <Video size={32} />
                                                        <span className="ml-2 text-xs font-bold">Video Oynat</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <button className="flex-1 flex items-center justify-center gap-2 bg-stone-900 text-white py-2 rounded text-xs font-bold hover:bg-stone-700 transition-colors">
                                                    <ExternalLink size={14} /> Belgeyi Görüntüle
                                                </button>
                                                <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-stone-300 text-stone-700 py-2 rounded text-xs font-bold hover:bg-stone-50 transition-colors">
                                                    <Download size={14} /> İndir
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                    </div>
                );
                })}
            </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default ResistanceTimeline;