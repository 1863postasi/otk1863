import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, ArrowRight, ArrowDown, ExternalLink, Music2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// --- VISUAL ASSETS: PETRICITE LINES ---
const PetricitePattern = () => (
    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.08]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="petricite-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#petricite-grid)" />
            {/* Diagonal Lines representing "Demacian/Petricite" structure */}
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="0.5" strokeDasharray="10 20" />
            <circle cx="50%" cy="50%" r="200" stroke="white" strokeWidth="0.5" fill="none" opacity="0.5" />
        </svg>
    </div>
);

// --- DATA ---
const EXHIBITION_CONTENT = {
    manifesto: {
        title: "Kol Düğmeleri",
        subtitle: "Bir Hafıza Sergisi",
        text: "Geçmiş düz bir çizgi değildir. Bu sergi, 2 boyutlu bir düzlemde dağılmış, zamanın pas tutmuş köşeleridir.",
    },
    shadows: [
        { id: 1, src: "https://images.unsplash.com/photo-1544533038-f94d9370004c?q=80&w=600", caption: "1978, İlk Okul" },
        { id: 2, src: "https://images.unsplash.com/photo-1517482529235-9856f777fb61?q=80&w=600", caption: "Yazlık" },
        { id: 3, src: "https://images.unsplash.com/photo-1469504512102-900f29606341?q=80&w=600", caption: "Radyo" },
        { id: 4, src: "https://images.unsplash.com/photo-1605367035652-3286f7797b5e?q=80&w=600", caption: "Oyuncak" },
    ],
    writings: [
        { id: 'w1', title: "Yankı", content: ["Duvarlar konuşur mu?", "Bazen hıçkırır sadece."] },
        { id: 'w2', title: "Gece", content: ["Uyku, vicdanı rahat olanların sığınağıdır.", "Bizim için gece hesaplaşmadır."] },
        { id: 'w3', title: "Boşluk", content: ["Doldurmaya çalıştıkça büyüyen,", "o muazzam boşluk."] },
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

// 2. Section Card (Generic container for "Rooms")
const SectionCard = ({ children, className, title }: { children: React.ReactNode, className?: string, title: string }) => (
    <div className={cn("relative p-6 md:p-12 border border-stone-800 bg-[#080808] overflow-hidden group hover:border-stone-700 transition-colors", className)}>
        {/* Decorative Corner lines */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#b91c1c]/50" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-stone-700" />

        <h3 className="absolute top-4 left-6 text-xs text-stone-500 uppercase tracking-[0.3em] font-bold">{title}</h3>
        {children}
    </div>
);


const DiaryPage: React.FC = () => {
    // --- 2D CANVAS STATE ---
    const constraintsRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth springs for x/y
    const springX = useSpring(x, { stiffness: 150, damping: 30 });
    const springY = useSpring(y, { stiffness: 150, damping: 30 });

    const [selectedImage, setSelectedImage] = useState<{ src: string, caption: string } | null>(null);

    // --- MOUSE WHEEL LOGIC (2D PANNING) ---
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const currentX = x.get();
            const currentY = y.get();

            // Adjust sensitivity
            const newX = currentX - e.deltaX;
            const newY = currentY - e.deltaY;

            // Simple constraints (can be improved with measuring container size)
            // Assuming canvas is roughly 200vw width, 200vh height
            // We'll trust the user/drag constraints mostly, but for wheel we limit loosely
            x.set(newX);
            y.set(newY);
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [x, y]);

    return (
        <div className="fixed inset-0 bg-[#030303] text-[#a8a29e] font-sans overflow-hidden cursor-grab active:cursor-grabbing selection:bg-[#b91c1c] selection:text-white">

            {/* A. BACKGROUND LAYERS */}
            {/* 1. Stone/Marble Texture Blend */}
            <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/black-mamba.png')] pointer-events-none" />

            {/* 2. Petricite Geometric Lines */}
            <PetricitePattern />

            {/* 3. Vignette */}
            <div className="absolute inset-0 z-10 bg-gradient-radial from-transparent via-black/40 to-black/90 pointer-events-none" />


            {/* B. UI OVERLAYS (Fixed) */}
            {/* Back Button */}
            <Link
                to="/yayinlar"
                className="fixed top-8 right-8 z-50 flex items-center justify-center w-12 h-12 rounded-full border border-stone-800 bg-black/50 backdrop-blur-md text-stone-500 hover:text-[#b91c1c] hover:border-[#b91c1c] transition-all duration-300 group"
            >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </Link>

            {/* Minimap / Location Hints */}
            <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-2 text-[10px] text-stone-600 font-mono pointer-events-none">
                <div className="flex items-center gap-2">
                    <ArrowRight size={10} />
                    <span>X: </span>
                    <motion.span>{useTransform(springX, (v) => Math.round(v))}</motion.span>
                </div>
                <div className="flex items-center gap-2">
                    <ArrowDown size={10} />
                    <span>Y: </span>
                    <motion.span>{useTransform(springY, (v) => Math.round(v))}</motion.span>
                </div>
            </div>


            {/* C. INFINITE CANVAS (Draggable Area) */}
            <motion.div
                ref={constraintsRef}
                style={{ x: springX, y: springY }}
                drag
                dragMomentum={false} // We handle our own momentum or prefer precise control
                onDrag={(_event, info) => {
                    // Sync MotionValues with drag manually since we are controlling them via state/springs too
                    x.set(x.get() + info.delta.x);
                    y.set(y.get() + info.delta.y);
                }}
                className="absolute top-0 left-0 w-[200vw] h-[200vh] md:w-[150vw] md:h-[150vh] origin-top-left"
            >
                {/* --- SECTIONS ON THE GRID --- */}

                {/* 1. [0,0] ENTRANCE (Top-Left) */}
                <div className="absolute top-[10vh] left-[5vw] w-[80vw] md:w-[40vw]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative z-10"
                    >
                        <h1 className="text-6xl md:text-9xl font-serif font-black text-[#e5e5e5] mb-6 leading-[0.85] tracking-tighter mix-blend-difference select-none">
                            KOL<br />DÜĞMELERİ
                        </h1>
                        <div className="h-px w-32 bg-stone-700 mb-6" />
                        <p className="text-sm md:text-lg font-serif text-stone-400 italic max-w-md leading-relaxed border-l-2 border-[#b91c1c] pl-6">
                            "{EXHIBITION_CONTENT.manifesto.text}"
                        </p>

                        {/* Navigation Guide */}
                        <div className="mt-12 flex items-center gap-8 text-[10px] text-stone-600 uppercase tracking-widest font-bold">
                            <div className="flex items-center gap-2"><div className="w-4 h-4 border border-stone-700 rounded-full animate-ping" /> Sürükle</div>
                            <div className="flex items-center gap-2"><ArrowRight size={14} /> Keşfet</div>
                        </div>
                    </motion.div>
                </div>


                {/* 2. [1,0] THE PAST (Right of Entrance) - High Density Grid */}
                <div className="absolute top-[5vh] left-[95vw] md:left-[50vw] w-[80vw] md:w-[40vw]">
                    <SectionCard title="Geçmişin Gölgeleri" className="min-h-[50vh]">
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 mt-8">
                            {EXHIBITION_CONTENT.shadows.map(item => (
                                <motion.button
                                    key={item.id}
                                    whileHover={{ scale: 0.98 }}
                                    onClick={() => setSelectedImage({ src: item.src, caption: item.caption })}
                                    className="relative aspect-square bg-[#111] border border-stone-800 group/img overflow-hidden"
                                >
                                    <img src={item.src} alt={item.caption} className="w-full h-full object-cover opacity-50 group-hover/img:opacity-100 transition-opacity duration-500 grayscale group-hover/img:grayscale-0" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                        <span className="text-[10px] text-stone-300 font-serif">{item.caption}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </SectionCard>
                </div>


                {/* 3. [0,1] THE SEARCH (Below Entrance) - Vertical list */}
                <div className="absolute top-[80vh] left-[5vw] w-[85vw] md:w-[35vw]">
                    <SectionCard title="Arayış" className="min-h-[40vh]">
                        <div className="mt-8 space-y-4">
                            {EXHIBITION_CONTENT.writings.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="flex gap-4 p-4 border border-stone-900 bg-black/40 hover:bg-[#1a1a1a] transition-colors group/text cursor-default"
                                >
                                    <div className="text-[#b91c1c] font-serif font-bold text-lg opacity-50 group-hover/text:opacity-100 transition-opacity">
                                        0{i + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-stone-300 font-serif font-bold mb-1">{item.title}</h4>
                                        <div className="text-xs text-stone-500 font-serif italic space-y-1">
                                            {item.content.map((l, idx) => <p key={idx}>{l}</p>)}
                                        </div>
                                    </div>
                                    <ExternalLink size={12} className="ml-auto opacity-0 group-hover/text:opacity-50" />
                                </motion.div>
                            ))}
                        </div>
                    </SectionCard>
                </div>


                {/* 4. [1,1] EPILOGUE (Diagonal) */}
                <div className="absolute top-[85vh] left-[100vw] md:left-[55vw] w-[40vw] md:w-[30vw] flex items-center justify-center">
                    <div className="text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                            className="w-16 h-16 mx-auto mb-4 border border-dashed border-stone-700 rounded-full flex items-center justify-center"
                        >
                            <Music2 size={16} className="text-stone-600" />
                        </motion.div>
                        <p className="text-stone-600 text-xs font-serif italic">"Sessizlik en büyük gürültüdür."</p>
                    </div>
                </div>

            </motion.div>

            {/* D. MODAL */}
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
