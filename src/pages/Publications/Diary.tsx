import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, Share2, Info, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

// --- CONTENT DATA (Linearized) ---
const STAGES = [
    {
        id: 'intro',
        title: "GİRİŞ",
        subtitle: "Başlangıç Noktası",
        content: "Burası hafızamın giriş kapısı. Sağa doğru atacağın her adım, seni daha derinlere götürecek.",
        theme: "light", // Introduction is lighter
        depth: 0
    },
    {
        id: 'surface',
        title: "YÜZEY",
        subtitle: "Şimdiki Zaman",
        content: "Günlük notlar, kahve lekeleri ve aceleyle yazılmış satırlar. Hayatın koşturmacası içinde kaybolan anlar.",
        theme: "dim",
        depth: 1
    },
    {
        id: 'deep',
        title: "DERİNLİK",
        subtitle: "Geçmişin İzleri",
        content: "Eski fotoğraflar, unutulmuş arkadaşlar ve çocukluk anıları. Burası biraz daha sessiz.",
        theme: "dark",
        depth: 2
    },
    {
        id: 'abyss',
        title: "MAHZEN",
        subtitle: "Bilinçaltı",
        content: "Rüyalar, korkular ve hiç kimseye anlatılmayan sırlar. Sadece cesur olanlar buraya kadar iner.",
        theme: "abyss",
        depth: 3
    }
];

// --- COMPONENTS ---

// 1. Petricite Background (Animated)
const PetriciteBackground = ({ activeIndex }: { activeIndex: number }) => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black transition-colors duration-1000">
            {/* Base Gradient Changes with Index */}
            <div className={cn("absolute inset-0 transition-opacity duration-1000 opacity-60",
                activeIndex === 0 ? "bg-gradient-to-b from-stone-800 to-black" :
                    activeIndex === 1 ? "bg-gradient-to-b from-stone-900 to-black" :
                        activeIndex === 2 ? "bg-gradient-to-b from-[#1c1917] to-black" :
                            "bg-gradient-to-b from-[#0f0505] to-black"
            )} />

            {/* Geometric Patterns (Petricite) */}
            <div className="absolute inset-0 opacity-[0.10]">
                <svg width="100%" height="100%">
                    <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Noise Overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};

// 2. Page/Slide Component
const DiarySlide = ({ data, isActive }: { data: typeof STAGES[0], isActive: boolean }) => {
    return (
        <div className="w-full h-full flex-shrink-0 flex items-center justify-center p-6 snap-center relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                    opacity: isActive ? 1 : 0.4,
                    scale: isActive ? 1 : 0.95,
                    filter: isActive ? 'blur(0px)' : 'blur(4px)'
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-lg aspect-[3/4] md:aspect-[4/3] bg-stone-950/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl"
            >
                <div className="mb-6">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-stone-500 uppercase">{data.subtitle}</span>
                    <h2 className={cn("text-4xl md:text-5xl font-serif font-bold mt-2",
                        data.depth === 0 ? "text-stone-200" :
                            data.depth === 1 ? "text-stone-300" :
                                data.depth === 2 ? "text-amber-100/90" : "text-red-100/80"
                    )}>
                        {data.title}
                    </h2>
                </div>

                <p className="text-lg md:text-xl text-stone-400 font-serif leading-relaxed max-w-md">
                    "{data.content}"
                </p>

                {/* Decorative Element */}
                <div className={cn("w-12 h-1 mt-12 rounded-full",
                    data.depth === 0 ? "bg-stone-700" :
                        data.depth === 1 ? "bg-stone-600" :
                            data.depth === 2 ? "bg-amber-900/50" : "bg-red-900/50"
                )} />

                {isActive && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 px-6 py-2 border border-white/10 hover:bg-white/5 rounded-full text-xs font-bold text-stone-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        Keşfet
                    </motion.button>
                )}
            </motion.div>
        </div>
    );
};


// --- MAIN PAGE ---
const DiaryPage = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Scroll Handler to determine Active Index
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollLeft = scrollRef.current.scrollLeft;
        const width = scrollRef.current.offsetWidth;
        const index = Math.round(scrollLeft / width);
        setActiveIndex(index);
    };

    return (
        <div className="fixed inset-0 bg-black font-sans overflow-hidden">
            <PetriciteBackground activeIndex={activeIndex} />

            {/* PWA HEADER: Transparent & Centered */}
            <div className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4">
                <Link to="/" className="p-2 -ml-2 text-stone-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="absolute left-1/2 -translate-x-1/2">
                    <h1 className="text-lg font-bold font-serif text-stone-200 tracking-widest">GÜNLÜK</h1>
                </div>
                <button className="p-2 -mr-2 text-stone-400 hover:text-white">
                    <Info size={24} />
                </button>
            </div>

            {/* SCROLL CONTAINER (Horizontal Snap) */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="absolute inset-0 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
            >
                {STAGES.map((stage, index) => (
                    <DiarySlide key={stage.id} data={stage} isActive={activeIndex === index} />
                ))}
            </div>

            {/* BOTTOM INDICATORS */}
            <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center gap-2">
                {STAGES.map((_, i) => (
                    <div
                        key={i}
                        className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300",
                            activeIndex === i ? "bg-white scale-125 w-4" : "bg-white/20"
                        )}
                    />
                ))}
            </div>

            {/* NAVIGATION HINTS (Desktop) */}
            <div className="hidden md:block fixed z-40 inset-y-0 w-full pointer-events-none">
                {/* Only show arrows if not at ends */}
                {activeIndex > 0 && (
                    <button
                        onClick={() => scrollRef.current?.scrollBy({ left: -window.innerWidth, behavior: 'smooth' })}
                        className="absolute left-8 top-1/2 -translate-y-1/2 p-4 text-white/20 hover:text-white/80 pointer-events-auto transition-colors"
                    >
                        <ArrowLeft size={48} />
                    </button>
                )}
                {activeIndex < STAGES.length - 1 && (
                    <button
                        onClick={() => scrollRef.current?.scrollBy({ left: window.innerWidth, behavior: 'smooth' })}
                        className="absolute right-8 top-1/2 -translate-y-1/2 p-4 text-white/20 hover:text-white/80 pointer-events-auto transition-colors"
                    >
                        <ArrowRight size={48} />
                    </button>
                )}
            </div>

            {/* DEPTH METER */}
            <div className="fixed bottom-8 left-8 z-40 hidden md:flex items-center gap-2 font-mono text-[10px] text-stone-600">
                <BookOpen size={12} />
                <span>BÖLÜM: {activeIndex + 1}/{STAGES.length}</span>
            </div>

        </div>
    );
};

export default DiaryPage;
