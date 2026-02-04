import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, Quote, Music2 } from 'lucide-react';

// --- DATA: THE EXHIBITION ---
const EXHIBITION_CONTENT = {
    manifesto: {
        title: "Kol Düğmeleri",
        subtitle: "Bir Hafıza Sergisi",
        text: "Geçmiş, dümdüz bir çizgi değil; kopuk anların, silik yüzlerin ve yarım kalmış melodilerin oluşturduğu bir kolajdır.",
    },
    shadows: [
        { id: 1, src: "https://images.unsplash.com/photo-1544533038-f94d9370004c?q=80&w=600&auto=format&fit=crop", caption: "1978, İlk Okul", note: "Masumiyet." },
        { id: 2, src: "https://images.unsplash.com/photo-1517482529235-9856f777fb61?q=80&w=600&auto=format&fit=crop", caption: "Yazlık", note: "Sonsuz öğleden sonraları." },
        { id: 3, src: "https://images.unsplash.com/photo-1469504512102-900f29606341?q=80&w=600&auto=format&fit=crop", caption: "Radyo", note: "Cızırtılı sesler." },
        { id: 4, src: "https://images.unsplash.com/photo-1605367035652-3286f7797b5e?q=80&w=600&auto=format&fit=crop", caption: "Oyuncak", note: "Kayıp bir parça." },
        { id: 5, src: "https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?q=80&w=600&auto=format&fit=crop", caption: "Mektup", note: "Okunmamış." },
        { id: 6, src: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=600&auto=format&fit=crop", caption: "Pencere", note: "Bekleyiş." },
    ],
    writings: [
        {
            id: 'w1',
            title: "Yankı",
            type: "Şiir",
            content: ["Duvarlar konuşur mu?", "Bazen hıçkırır sadece."]
        },
        {
            id: 'w2',
            title: "Gece Nöbeti",
            type: "Deneme",
            content: ["Uyku, vicdanı rahat olanların sığınağıdır.", "Bizim gibiler için gece, hesaplaşma vaktidir."]
        },
        {
            id: 'w3',
            title: "Boşluk",
            type: "Fragman",
            content: ["Doldurmaya çalıştıkça büyüyen,", "o muazzam boşluk."]
        },
        {
            id: 'w4',
            title: "Saatler",
            type: "Anı",
            content: ["Tik tak, tik tak...", "Zamanın çürüyen sesi."]
        },
    ]
};

// --- COMPONENTS ---

// 1. Image Modal
const ImageModal = ({ src, caption, onClose }: { src: string, caption: string, onClose: () => void }) => (
    <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        onClick={onClose}
    >
        <div className="relative max-h-full max-w-full">
            <img src={src} alt={caption} className="max-h-[80vh] md:max-h-[90vh] object-contain shadow-2xl border border-stone-800" />
            <p className="absolute -bottom-10 left-0 text-stone-400 font-serif italic text-sm">{caption}</p>
        </div>
    </motion.div>
);

const DiaryPage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollXProgress } = useScroll({ container: containerRef });
    const scaleX = useSpring(scrollXProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const [selectedImage, setSelectedImage] = useState<{ src: string, caption: string } | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // Only horizontal scrolling if not touch device logic or shift key
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                container.scrollLeft += e.deltaY;
                e.preventDefault();
            }
        };
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    return (
        <div className="fixed inset-0 bg-[#050505] text-[#a8a29e] font-sans overflow-hidden">

            {/* 1. NOISE & ATMOSPHERE */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            <div className="absolute inset-0 z-0 bg-gradient-radial from-stone-900/20 via-transparent to-transparent pointer-events-none" />

            {/* 2. PROGRESS BAR */}
            <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-0.5 md:h-1 bg-[#b91c1c] origin-left z-50 mix-blend-screen" />

            {/* 3. NAVIGATION (Compact) */}
            <Link
                to="/yayinlar"
                className="fixed top-4 right-4 md:top-8 md:right-10 z-50 flex items-center gap-2 text-stone-500 hover:text-[#b91c1c] transition-colors duration-300 group"
            >
                <span className="uppercase tracking-widest text-[8px] md:text-[10px] font-bold md:opacity-0 md:group-hover:opacity-100 transition-opacity">Çıkış</span>
                <div className="p-2 md:p-3 rounded-full border border-stone-800 bg-black/50 backdrop-blur-md group-hover:border-[#b91c1c] transition-colors">
                    <X size={16} />
                </div>
            </Link>

            {/* 4. MAIN HORIZONTAL GALLERY CONTAINER */}
            <div
                ref={containerRef}
                className="h-full w-full overflow-x-auto overflow-y-hidden flex items-center snap-x snap-mandatory scrollbar-hide touch-pan-x"
            >

                {/* SECTION 1: COMPACT MANIFESTO */}
                <section className="min-w-[100vw] md:min-w-[80vw] h-full flex flex-col justify-center items-center px-4 snap-start relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="text-center max-w-lg"
                    >
                        <span className="block text-[#b91c1c] tracking-[0.5em] text-[10px] font-bold uppercase mb-4 animate-pulse">Sanal Sergi</span>
                        <h1 className="text-5xl md:text-9xl font-serif font-black text-[#e5e5e5] mb-4 leading-none tracking-tighter mix-blend-difference">
                            KOL<br />DÜĞMELERİ
                        </h1>
                        <p className="text-xs md:text-xl font-light font-serif text-stone-500 italic leading-relaxed">
                            "{EXHIBITION_CONTENT.manifesto.text}"
                        </p>
                        <div className="mt-8 flex justify-center opacity-50">
                            <motion.div animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                <ArrowLeft className="rotate-180" size={14} />
                            </motion.div>
                        </div>
                    </motion.div>
                </section>

                {/* SECTION 2: HIGH DENSITY PHOTO GRID (GEÇMİŞ) */}
                <section className="min-w-[100vw] md:min-w-[100vw] h-full flex flex-col md:flex-row justify-center items-center px-4 md:px-16 snap-start relative border-l border-white/5">
                    <div className="absolute top-4 left-4 md:top-12 md:left-24 text-4xl md:text-8xl font-serif font-bold text-[#1c1917] select-none -z-10 tracking-tighter">
                        GEÇMİŞ
                    </div>

                    <div className="grid grid-rows-2 grid-flow-col gap-2 md:gap-4 h-[70vh] md:h-[60vh] w-full overflow-x-auto p-4 scrollbar-hide items-center">
                        {EXHIBITION_CONTENT.shadows.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ scale: 0.98 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative group cursor-zoom-in w-[40vw] md:w-64 aspect-square bg-stone-900 border border-stone-800 overflow-hidden"
                                onClick={() => setSelectedImage({ src: item.src, caption: item.caption })}
                            >
                                <img
                                    src={item.src}
                                    alt={item.caption}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-[10px] font-bold text-stone-300 font-serif truncate">{item.caption}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* SECTION 3: COMPACT WRITINGS (ARAYIŞ) */}
                <section className="min-w-[100vw] h-full flex flex-col justify-center px-4 md:px-32 snap-start relative bg-[#0a0a0a]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 w-full max-w-6xl mx-auto h-[70vh] items-center content-center">
                        {EXHIBITION_CONTENT.writings.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                whileHover={{ borderColor: "#57534e" }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative border border-stone-900 bg-stone-950/50 p-3 md:p-6 hover:bg-stone-900/50 transition-colors h-full flex flex-col justify-between"
                            >
                                <div>
                                    <span className="text-[9px] md:text-xs text-[#b91c1c] font-bold uppercase tracking-widest mb-1 md:mb-2 block">{item.type}</span>
                                    <h3 className="text-sm md:text-2xl font-serif text-stone-300 mb-2 md:mb-4 leading-tight">{item.title}</h3>
                                </div>
                                <div className="space-y-1 text-stone-600 font-serif text-[10px] md:text-sm leading-relaxed line-clamp-4">
                                    {item.content.map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                                <Quote className="absolute top-2 right-2 text-stone-900 opacity-20 group-hover:opacity-100 group-hover:text-stone-800 transition-all transform scale-50 md:scale-100" />
                            </motion.div>
                        ))}
                    </div>

                    <div className="absolute bottom-4 right-4 text-stone-900 text-[15vw] md:text-[10vw] font-black leading-none opacity-20 pointer-events-none select-none">
                        ARAYIŞ
                    </div>
                </section>

                {/* SECTION 4: MINI EPILOGUE */}
                <section className="min-w-[40vw] md:min-w-[50vw] h-full flex items-center justify-center snap-start">
                    <div className="text-center p-6 border border-stone-900 bg-stone-950/50 backdrop-blur-sm rounded max-w-[200px]">
                        <Music2 size={20} className="mx-auto text-stone-700 mb-3 animate-bounce" />
                        <p className="text-stone-600 font-serif italic text-xs mb-2">"Sessiz çığlık."</p>
                        <div className="text-[8px] text-stone-800 uppercase tracking-widest">
                            Son
                        </div>
                    </div>
                </section>

            </div>

            {/* MODAL */}
            <AnimatePresence>
                {selectedImage && (
                    <ImageModal
                        src={selectedImage.src}
                        caption={selectedImage.caption}
                        onClose={() => setSelectedImage(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DiaryPage;
