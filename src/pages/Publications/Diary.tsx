import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, Quote, Music2, Maximize2, Move } from 'lucide-react';
import { cn } from '../../lib/utils';

// --- DATA ---
const EXHIBITION_CONTENT = {
    manifesto: {
        title: "Kol Düğmeleri",
        subtitle: "Bir Hafıza Sergisi",
        text: "Zaman çizgisel değildir. Anılar uzay boşluğunda asılı duran yıldızlar gibidir. Çizgileri takip et.",
    },
    shadows: [
        { id: 1, src: "https://images.unsplash.com/photo-1544533038-f94d9370004c?q=80&w=600&auto=format&fit=crop", caption: "1978, İlk Okul", note: "Masumiyet." },
        { id: 2, src: "https://images.unsplash.com/photo-1517482529235-9856f777fb61?q=80&w=600&auto=format&fit=crop", caption: "Yazlık", note: "Sonsuzluk." },
        { id: 3, src: "https://images.unsplash.com/photo-1469504512102-900f29606341?q=80&w=600&auto=format&fit=crop", caption: "Radyo", note: "Cızırtı." },
        { id: 4, src: "https://images.unsplash.com/photo-1605367035652-3286f7797b5e?q=80&w=600&auto=format&fit=crop", caption: "Oyuncak", note: "Kayıp." },
        { id: 5, src: "https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?q=80&w=600&auto=format&fit=crop", caption: "Mektup", note: "Okunmamış." },
        { id: 6, src: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=600&auto=format&fit=crop", caption: "Pencere", note: "Bekleyiş." },
    ],
    writings: [
        { id: 'w1', title: "Yankı", type: "Şiir", content: ["Duvarlar konuşur mu?", "Bazen hıçkırır sadece."] },
        { id: 'w2', title: "Gece", type: "Deneme", content: ["Uyku, vicdanı rahat", "olanların sığınağıdır."] },
        { id: 'w3', title: "Boşluk", type: "Fragman", content: ["Doldurmaya çalıştıkça", "büyüyen boşluk."] },
        { id: 'w4', title: "Saatler", type: "Anı", content: ["Tik tak, tik tak...", "Zamanın çürüyen sesi."] },
    ]
};

// --- COMPONENTS ---

// Image Modal (Unchanged)
const ImageModal = ({ src, caption, onClose }: { src: string, caption: string, onClose: () => void }) => (
    <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-8 cursor-zoom-out"
        onClick={onClose}
    >
        <div className="relative pointer-events-none">
            <img src={src} alt={caption} className="max-h-[85vh] object-contain shadow-[0_0_50px_rgba(255,255,255,0.1)] border border-stone-800" />
            <p className="absolute -bottom-12 left-0 text-stone-500 font-serif italic">{caption}</p>
        </div>
    </motion.div>
);

const DiaryPage: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<{ src: string, caption: string } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Physics based spring for smooth dragging
    const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0, config: { friction: 30, tension: 200, mass: 1.5 } }));

    // Drag Logic
    const bind = useDrag(({ offset: [ox, oy], down }) => {
        // Limit boundaries roughly? Or infinite? Let's keep it semi-infinite but centered
        api.start({ x: ox, y: oy, immediate: down });
    }, {
        from: () => [x.get(), y.get()],
        bounds: { left: -1500, right: 1500, top: -1500, bottom: 1500 }, // Safe bounds
        rubberband: true
    });

    // Center on load
    useEffect(() => {
        // Initial animation pop-in?
    }, []);

    return (
        <div className="fixed inset-0 bg-[#080808] text-[#a8a29e] font-sans overflow-hidden cursor-grab active:cursor-grabbing selection:bg-red-900/30">

            {/* 1. LAYER: NOISE & ATMOSPHERE */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

            {/* 2. LAYER: UI OVERLAY (FIXED) */}
            <Link
                to="/yayinlar"
                className="fixed top-6 right-6 z-50 flex items-center gap-3 text-stone-600 hover:text-red-500 transition-colors group"
            >
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">Çıkış</span>
                <div className="p-3 bg-black/50 backdrop-blur-md rounded-full border border-stone-800 group-hover:border-red-900 transition-colors">
                    <X size={18} />
                </div>
            </Link>

            <div className="fixed bottom-6 left-6 z-50 pointer-events-none opacity-50 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-stone-600">
                    <Move size={12} />
                    <span>Keşfetmek için sürükle</span>
                </div>
                <div className="text-[9px] text-stone-700 font-mono">X: {Math.round(x.get())} / Y: {Math.round(y.get())}</div>
            </div>

            {/* 3. LAYER: INFINITE CANVAS */}
            <motion.div
                {...bind()}
                style={{ x, y }}
                className="absolute top-1/2 left-1/2 w-0 h-0 flex items-center justify-center touch-none"
            >

                {/* --- PETRICITE GRID LINES (The "Map") --- */}
                {/* Center to Right Connection */}
                <div className="absolute left-0 top-0 w-[600px] h-[1px] bg-gradient-to-r from-stone-800 to-transparent opacity-30 transform translate-x-32" />
                {/* Center to Bottom Connection */}
                <div className="absolute left-0 top-0 h-[600px] w-[1px] bg-gradient-to-b from-stone-800 to-transparent opacity-30 transform translate-y-32" />

                {/* Decorative Circles (Demacia Style) */}
                <div className="absolute border border-stone-800/30 rounded-full w-[800px] h-[800px] pointer-events-none" />
                <div className="absolute border border-stone-800/20 rounded-full w-[1200px] h-[1200px] pointer-events-none" />


                {/* === REGION: CENTER (MANIFESTO) === */}
                <div className="absolute w-[80vw] max-w-md -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center p-8 select-none">
                    <span className="text-[9px] text-red-900 font-bold uppercase tracking-[0.4em] mb-6 animate-pulse">Merkez</span>
                    <h1 className="text-6xl md:text-8xl font-serif font-black text-[#e5e5e5] mb-6 leading-[0.85] tracking-tighter mix-blend-difference drop-shadow-2xl">
                        KOL<br />DÜĞMELERİ
                    </h1>
                    <p className="text-sm md:text-lg font-serif text-stone-500 italic leading-relaxed max-w-xs">
                        "{EXHIBITION_CONTENT.manifesto.text}"
                    </p>
                </div>


                {/* === REGION: RIGHT (The Past - Photo Grid) === */}
                {/* Coordinates: X: +600px, Y: 0 */}
                <div className="absolute left-[600px] top-0 -translate-y-1/2 w-[300px] md:w-[600px]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px w-12 bg-stone-700" />
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Geçmişin Gölgeleri</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4 p-4 border-l border-stone-800 pl-8 bg-gradient-to-r from-stone-900/10 to-transparent">
                        {EXHIBITION_CONTENT.shadows.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ scale: 1.05, zIndex: 10 }}
                                onClick={() => setSelectedImage({ src: item.src, caption: item.caption })}
                                className="aspect-square bg-stone-900 border border-stone-800 relative group cursor-pointer overflow-hidden shadow-lg"
                            >
                                <img src={item.src} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-500" />
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 translate-y-full group-hover:translate-y-0 transition-transform">
                                    <span className="text-[10px] text-stone-300 font-bold block">{item.caption}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>


                {/* === REGION: BOTTOM (The Search - Writings) === */}
                {/* Coordinates: X: 0, Y: +600px */}
                <div className="absolute top-[600px] left-0 -translate-x-1/2 w-[320px] md:w-[800px] text-center">
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="h-12 w-px bg-stone-700" />
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Arayış</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {EXHIBITION_CONTENT.writings.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ y: -5, backgroundColor: "rgba(28, 25, 23, 0.8)" }}
                                className="bg-stone-950/50 border border-stone-900 p-4 markdown-card text-left backdrop-blur-sm transition-colors"
                            >
                                <span className="text-[9px] text-red-900/70 font-bold uppercase block mb-2">{item.type}</span>
                                <h3 className="text-lg font-serif text-stone-300 mb-3">{item.title}</h3>
                                <div className="space-y-1">
                                    {item.content.map((l, i) => <p key={i} className="text-[10px] md:text-xs text-stone-600 leading-relaxed font-serif">{l}</p>)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>


                {/* === REGION: TOP (Epilogue) === */}
                <div className="absolute top-[-500px] left-0 -translate-x-1/2 flex flex-col items-center opacity-30">
                    <Music2 size={32} className="text-stone-700 mb-4 animate-spin-slow" />
                    <span className="text-[9px] uppercase tracking-[0.5em] text-stone-800">Sessizlik</span>
                </div>

            </motion.div>

            {/* MODAL */}
            <AnimatePresence>
                {selectedImage && <ImageModal src={selectedImage.src} caption={selectedImage.caption} onClose={() => setSelectedImage(null)} />}
            </AnimatePresence>

        </div>
    );
};

export default DiaryPage;
