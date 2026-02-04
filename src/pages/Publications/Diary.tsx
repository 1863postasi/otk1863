import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, ArrowRight, ArrowDown, ArrowUp, ArrowLeft, Grip, BookOpen, Music2, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

// --- TYPES & COORDINATES ---
type Coordinate = { col: number; row: number }; // Col: -2 to 2, Row: 0 to 2

// --- CONTENT MAP (REVISED) ---
const REGIONS: Record<string, { title: string; subtitle: string; content: React.ReactNode; type: 'text' | 'gallery' | 'mixed' }> = {
    "0,0": { title: "GİRİŞ", subtitle: "Başlangıç Noktası", type: 'text', content: "Burası hafızamın giriş kapısı. Aşağıya ve yanlara doğru atacağın her adım, seni daha derinlere götürecek." },

    // ROW 0: YÜZEY (Surface)
    "-1,0": { title: "Eskizler", subtitle: "Yarım Kalanlar", type: 'mixed', content: "Tamamlanmamış çizimler, fikir kırıntıları." },
    "-2,0": { title: "Ortaokul", subtitle: "Saf Zamanlar", type: 'text', content: "O zamanlar dünya daha basitti. Mavi önlükler ve tozlu tebeşirler." },
    "1,0": { title: "Günlük Notlar", subtitle: "Şimdiki Zaman", type: 'text', content: "Bugünden yarına kalan ufak notlar. Kahve lekeleri ve aceleyle yazılmış satırlar." },
    "2,0": { title: "Şiirler", subtitle: "Dizeler", type: 'text', content: "Kelimelerin dansı. Anlam arayışı." },

    // ROW 1: DERİNLİK (Deep)
    "0,1": { title: "Ayna", subtitle: "Yüzleşme", type: 'text', content: "Kendine bakmak, bir uçuruma bakmak gibidir bazen." },
    "-1,1": { title: "Göç", subtitle: "Yolculuk", type: 'mixed', content: "Terk edilen evler, sırtlanan umutlar." },
    "-2,1": { title: "Kökler", subtitle: "Soyağacı", type: 'text', content: "Nereden geldim? Kanımda kimlerin izi var?" },
    "1,1": { title: "Efsaneler", subtitle: "Fısıltılar", type: 'text', content: "Aile büyüklerinin anlattığı masallar. Gerçekle hayalin karıştığı yer." },
    "2,1": { title: "Annem", subtitle: "İlk Yüz", type: 'gallery', content: "Onun çocukluğu, gençliği. Benim tanımadığım kadın." },

    // ROW 2: MAHZEN (Abyss)
    "0,2": { title: "Hiçlik", subtitle: "Sessiz Merkez", type: 'text', content: "Sesin bittiği yer. Sadece varoluş." },
    "-1,2": { title: "Unutulanlar", subtitle: "Kayıp Anılar", type: 'text', content: "Silinmeye yüz tutmuş yüzler." },
    "-2,2": { title: "Yaralar", subtitle: "İzler", type: 'text', content: "Kapanmayan ama kabuk bağlayanlar." },
    "1,2": { title: "Rüyalar", subtitle: "Bilinçaltı", type: 'mixed', content: "Mantığın uyuduğu saatler." },
    "2,2": { title: "Kokular & Sesler", subtitle: "Duyular", type: 'mixed', content: "Bir parfüm kokusu, eski bir şarkı." },
};

// --- VISUALS: PETRICITE PATTERNS ---
const PetriciteOverlay = ({ depth }: { depth: number }) => (
    <div className="absolute inset-0 pointer-events-none z-0 opacity-10 transition-opacity duration-1000">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="petricite-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    {/* Pattern changes slightly based on depth/row */}
                    <path d={depth === 0 ? "M 60 0 L 0 0 0 60" : depth === 1 ? "M 30 0 L 0 30 M 60 30 L 30 60" : "M 0 0 L 60 60 M 60 0 L 0 60"}
                        fill="none" stroke="white" strokeWidth="0.5" opacity={0.5} />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#petricite-grid)" />
            {/* Geometric accents */}
            <circle cx="50%" cy="50%" r="300" stroke="white" strokeWidth="0.5" fill="none" opacity={0.3} />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="0.2" />
        </svg>
    </div>
);

// --- COMPONENT: REGION CELL ---
const RegionCell = ({ regionKey, isActive, depth }: { regionKey: string, isActive: boolean, depth: number }) => {
    const data = REGIONS[regionKey];
    if (!data) return <div className="flex items-center justify-center h-full text-stone-700">Boş Bölge ({regionKey})</div>;

    return (
        <motion.div
            initial={false}
            animate={{
                opacity: isActive ? 1 : 0.3,
                scale: isActive ? 1 : 0.95,
                filter: isActive ? 'blur(0px)' : 'blur(4px)'
            }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex flex-col relative overflow-hidden bg-stone-950/50 border border-stone-800/50 backdrop-blur-sm"
        >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-stone-800/50 flex justify-between items-baseline shrink-0">
                <div>
                    <h2 className={cn("text-3xl md:text-5xl font-serif font-bold text-stone-200 mb-1 transition-colors",
                        depth === 1 && "text-amber-100/80",
                        depth === 2 && "text-red-900/80"
                    )}>
                        {data.title}
                    </h2>
                    <p className="text-stone-500 font-sans text-xs uppercase tracking-widest">{data.subtitle}</p>
                </div>
                <div className="text-stone-700 font-mono text-xs">{regionKey}</div>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-hide">
                <div className="max-w-3xl mx-auto">
                    {/* Placeholder Content Logic */}
                    <p className="text-lg md:text-2xl font-serif text-stone-400 italic leading-loose">
                        "{data.content}"
                    </p>

                    {/* Example High Density Grid for 'Gallery' types */}
                    {data.type === 'gallery' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-square bg-stone-900 border border-stone-800/50 animate-pulse hover:animate-none hover:bg-stone-800 transition-colors cursor-pointer" />
                            ))}
                        </div>
                    )}
                    {/* Example List for 'Mixed' types */}
                    {data.type === 'mixed' && (
                        <div className="space-y-4 mt-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 border-l border-stone-800 pl-4 hover:border-stone-500 transition-colors">
                                    <h4 className="text-stone-300 font-bold text-sm mb-1">Kayıt #{i}</h4>
                                    <p className="text-stone-600 text-xs">Detaylar bekleniyor...</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Decorative Line */}
            <div className={cn("h-1 w-full shrink-0",
                depth === 0 ? "bg-stone-800" : depth === 1 ? "bg-amber-900/30" : "bg-red-900/30"
            )} />
        </motion.div>
    );
};


// --- MAIN PAGE ---
const DiaryPage: React.FC = () => {
    const [pos, setPos] = useState<Coordinate>({ col: 0, row: 0 }); // Start at Entrance
    const [isNavigating, setIsNavigating] = useState(false);

    // Navigation Logic
    const move = (dCol: number, dRow: number) => {
        if (isNavigating) return;

        const newCol = Math.max(-2, Math.min(2, pos.col + dCol));
        const newRow = Math.max(0, Math.min(2, pos.row + dRow));

        if (newCol !== pos.col || newRow !== pos.row) {
            setIsNavigating(true);
            setPos({ col: newCol, row: newRow });
            setTimeout(() => setIsNavigating(false), 500); // Cooldown
        }
    };

    // Keyboard Handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowRight': move(1, 0); break;
                case 'ArrowLeft': move(-1, 0); break;
                case 'ArrowDown': move(0, 1); break;
                case 'ArrowUp': move(0, -1); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pos, isNavigating]);

    // Background Gradient based on Depth
    const getBgStyle = () => {
        switch (pos.row) {
            case 0: return "from-stone-900 via-[#0a0a0a] to-black"; // Surface
            case 1: return "from-[#1c1917] via-[#0c0a09] to-black"; // Deep (Warmer/Darker)
            case 2: return "from-[#0f0505] via-black to-black";     // Abyss (Red tint hint)
            default: return "bg-black";
        }
    };

    return (
        <div className={cn("fixed inset-0 font-sans text-stone-400 transition-colors duration-1000 bg-gradient-to-b", getBgStyle())}>
            {/* Noise & Texture */}
            <div className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
            <PetriciteOverlay depth={pos.row} />

            {/* UI: Controls */}
            <Link to="/yayinlar" className="fixed top-6 right-6 z-50 p-3 rounded-full bg-black/50 border border-stone-800 hover:border-red-900 text-stone-500 hover:text-red-500 transition-all">
                <X size={20} />
            </Link>

            {/* UI: MiniMap */}
            <div className="fixed bottom-8 right-8 z-50 grid grid-cols-5 gap-2 p-3 bg-black/80 backdrop-blur border border-stone-800 rounded-lg">
                {/* Visual Grid representing 5x3 */}
                {Array.from({ length: 3 }).map((_, r) => (
                    Array.from({ length: 5 }).map((_, c) => {
                        const cellCol = c - 2; // 0->-2, 1->-1, 2->0...
                        const cellRow = r;
                        const isCurrent = cellCol === pos.col && cellRow === pos.row;
                        return (
                            <div
                                key={`${r}-${c}`}
                                className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300",
                                    isCurrent ? "bg-stone-200 scale-125 shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "bg-stone-800"
                                )}
                            />
                        );
                    })
                ))}
            </div>

            {/* UI: Navigation Hints */}
            <div className="fixed bottom-8 left-8 z-40 flex flex-col gap-2 font-mono text-[10px] text-stone-600 pointer-events-none">
                <div className="flex items-center gap-2">
                    <MapPin size={12} />
                    <span>POS: ({pos.col}, {pos.row})</span>
                </div>
                <div className="flex items-center gap-2">
                    <BookOpen size={12} />
                    <span className="uppercase">{pos.row === 0 ? "YÜZEY" : pos.row === 1 ? "DERİNLİK" : "MAHZEN"}</span>
                </div>
            </div>


            {/* NAVIGATION ARROWS (Clickable overlays) */}
            <div className="absolute inset-0 z-30 pointer-events-none">
                {/* Right */}
                {pos.col < 2 && (
                    <button onClick={() => move(1, 0)} className="pointer-events-auto absolute top-1/2 right-4 -translate-y-1/2 p-4 text-stone-700 hover:text-white hover:scale-110 transition-all">
                        <ArrowRight size={32} strokeWidth={1} />
                    </button>
                )}
                {/* Left */}
                {pos.col > -2 && (
                    <button onClick={() => move(-1, 0)} className="pointer-events-auto absolute top-1/2 left-4 -translate-y-1/2 p-4 text-stone-700 hover:text-white hover:scale-110 transition-all">
                        <ArrowLeft size={32} strokeWidth={1} />
                    </button>
                )}
                {/* Down */}
                {pos.row < 2 && (
                    <button onClick={() => move(0, 1)} className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 p-4 text-stone-700 hover:text-white hover:translate-y-1 transition-all">
                        <ArrowDown size={32} strokeWidth={1} />
                    </button>
                )}
                {/* Up */}
                {pos.row > 0 && (
                    <button onClick={() => move(0, -1)} className="pointer-events-auto absolute top-4 left-1/2 -translate-x-1/2 p-4 text-stone-700 hover:text-white hover:-translate-y-1 transition-all">
                        <ArrowUp size={32} strokeWidth={1} />
                    </button>
                )}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-12 z-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${pos.col},${pos.row}`}
                        initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="w-full h-full max-w-5xl md:aspect-[16/9]"
                    >
                        <RegionCell
                            regionKey={`${pos.col},${pos.row}`}
                            isActive={true}
                            depth={pos.row}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

        </div>
    );
};

export default DiaryPage;
