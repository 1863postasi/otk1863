import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, Maximize2, Info, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

// --- TYPES & DATA ---
interface Region {
    id: string;
    title: string;
    subtitle: string;
    x: number; // -2 to 2
    y: number; // 0 to 2
    content: React.ReactNode;
    image?: string; // Optional bg image for card
    theme: 'light' | 'dim' | 'dark' | 'abyss';
}

// Map User's Grid Request (5x3)
// Y Coordinates: 0 (Top), 1 (Middle), 2 (Bottom)
// X Coordinates: -2 (Far Left) to 2 (Far Right)
// (0,0) is Center Top (Giris)

const REGIONS: Region[] = [
    // ROW 0 (Top)
    { id: 'ortaokul', x: -2, y: 0, title: 'Ortaokul Günlükleri', subtitle: 'Hafıza Kırıntıları', theme: 'light', content: "13 yaşımın tozlu sayfaları..." },
    { id: 'eskizler', x: -1, y: 0, title: 'Eskizler', subtitle: 'Karalamalar', theme: 'light', content: "Yarım kalmış çizimler ve fikirler." },
    { id: 'giris', x: 0, y: 0, title: 'GİRİŞ', subtitle: 'Başlangıç Noktası', theme: 'light', content: "Hoş geldin. Burası zihnimin haritası." },
    { id: 'gunluk-notlar', x: 1, y: 0, title: 'Günlük Notlar', subtitle: 'Bugün', theme: 'light', content: "Kahve lekeleri ve acele satırlar." },
    { id: 'siirler', x: 2, y: 0, title: 'Şiirler', subtitle: 'Dizeler', theme: 'light', content: "Kafiyesiz hezeyanlar." },

    // ROW 1 (Middle)
    { id: 'kokler', x: -2, y: 1, title: 'Kökler', subtitle: 'Geçmiş', theme: 'dim', content: "Nereden geldim?" },
    { id: 'goc', x: -1, y: 1, title: 'Göç', subtitle: 'Hareket', theme: 'dim', content: "Yolculuk notları." },
    { id: 'ayna', x: 0, y: 1, title: 'AYNA', subtitle: 'Yansıma', theme: 'dim', content: "Kendimle yüzleşmeler." },
    { id: 'efsaneler', x: 1, y: 1, title: 'Efsaneler', subtitle: 'Hikayeler', theme: 'dim', content: "Gerçekle kurgu arasında." },
    { id: 'annem', x: 2, y: 1, title: 'Annem', subtitle: 'Kutsal', theme: 'dim', content: "Ona dair her şey." },

    // ROW 2 (Bottom)
    { id: 'yaralar', x: -2, y: 2, title: 'Yaralar', subtitle: 'İz', theme: 'dark', content: "İyileşmeyen kesikler." },
    { id: 'unutulanlar', x: -1, y: 2, title: 'Unutulanlar', subtitle: 'Kayıp', theme: 'dark', content: "Silinmeye yüz tutmuş anılar." },
    { id: 'hiclik', x: 0, y: 2, title: 'HİÇLİK', subtitle: 'Merkez', theme: 'abyss', content: "Yokluk ve varlık." },
    { id: 'ruyalar', x: 1, y: 2, title: 'Rüyalar', subtitle: 'Bilinçaltı', theme: 'dark', content: "Sabah uyanınca hatırladıklarım." },
    { id: 'kokular', x: 2, y: 2, title: 'Kokular ve Sesler', subtitle: 'Duyu', theme: 'dark', content: "Sinestezi deneyimleri." },
];


// --- COMPONENT: GRID CELL ---
const GridCell = ({ region, isActive, onClick }: { region: Region, isActive: boolean, onClick: () => void }) => {
    return (
        <div
            className="absolute flex items-center justify-center p-6 md:p-12 transition-all duration-700 ease-out"
            style={{
                width: '100vw',
                height: '100vh',
                left: `${(region.x + 2) * 100}vw`, // Map -2..2 to 0..4
                top: `${region.y * 100}vh`,       // Map 0..2 to 0..2
            }}
        >
            <motion.div
                onClick={onClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "relative w-full max-w-sm md:max-w-md aspect-[3/4] md:aspect-[4/5] rounded-xl overflow-hidden cursor-pointer shadow-2xl transition-all duration-500 border border-white/10 group",
                    isActive ? "opacity-100 scale-100 blur-0 grayscale-0" : "opacity-30 scale-90 blur-sm grayscale hover:opacity-50 hover:blur-0"
                )}
            >
                {/* Background Texture (Petricite Stone) */}
                <div className={cn("absolute inset-0 transition-colors duration-700",
                    region.theme === 'light' ? "bg-[#e6e2d3]" :
                        region.theme === 'dim' ? "bg-[#a8a29e]" :
                            region.theme === 'dark' ? "bg-[#57534e]" : "bg-[#1c1917]"
                )}>
                    {/* Noise Texture */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                    {/* Marble Veins (CSS Radial Gradients) */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-black via-transparent to-transparent"></div>
                </div>

                {/* Content Container */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                    <span className={cn("text-[10px] font-bold tracking-[0.3em] uppercase mb-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-500",
                        region.theme === 'abyss' ? "text-white/60" : "text-stone-900/60"
                    )}>
                        {region.subtitle}
                    </span>

                    <h2 className={cn("text-3xl md:text-5xl font-serif font-black tracking-tight leading-none mb-2 mix-blend-multiply",
                        region.theme === 'abyss' ? "text-white/90 mix-blend-normal" : "text-stone-900/80"
                    )}>
                        {region.title}
                    </h2>

                    <div className={cn("w-12 h-1 rounded-full mt-6 transition-all duration-500 group-hover:w-24",
                        region.theme === 'abyss' ? "bg-white/20" : "bg-stone-900/20"
                    )} />

                    <div className="absolute bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500">
                        <Maximize2 size={12} />
                        <span>İncele</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- COMPONENT: DETAIL MODAL ---
const RegionDetail = ({ region, onClose }: { region: Region, onClose: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-100/90 backdrop-blur-xl flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-white/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">{region.subtitle}</span>
                    <h2 className="text-xl font-serif font-bold text-stone-900">{region.title}</h2>
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-20">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-2xl mx-auto prose prose-stone prose-lg prose-p:font-serif prose-headings:font-serif"
                >
                    <p className="text-2xl leading-relaxed text-stone-800 italic indent-8 mb-12">
                        "{region.content}"
                    </p>
                    <hr className="my-12 border-stone-200" />

                    {/* Dummy Content generator since we don't have real data yet */}
                    <div className="space-y-12">
                        <section>
                            <h3>Bölüm I: Hatıralar</h3>
                            <p>
                                Buraya uzun yazılar, hikayeler ve anılar gelecek. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                                quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                        </section>

                        <div className="aspect-video bg-stone-200 rounded-lg overflow-hidden relative group">
                            <div className="absolute inset-0 flex items-center justify-center text-stone-400 font-bold">
                                FOTOĞRAF ALBÜMÜ VEYA MEDYA
                            </div>
                        </div>

                        <section>
                            <h3>Bölüm II: Yansımalar</h3>
                            <p>
                                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            </p>
                        </section>
                    </div>
                </motion.div>
                <div className="h-32" />{/* Bottom Spacer */}
            </div>
        </motion.div>
    );
};

// --- COMPONENT: MINI MAP ---
const MiniMap = ({ x, y }: { x: number, y: number }) => {
    // x is drag value (pixels). Convert to Grid coords.
    // Width = window.innerWidth. Grid is 5 cols wide.
    // Center (0,0 user coord) is physically at 200vw, 0vh? No, (0,0) is TOP MIDDLE.
    // Let's rely on activeRegion index calculation logic.
    return (
        <div className="fixed bottom-8 right-8 z-40 hidden md:block">
            <div className="grid grid-cols-5 gap-1 p-2 bg-black/20 backdrop-blur-md rounded-lg mx-auto">
                {Array.from({ length: 15 }).map((_, i) => {
                    const row = Math.floor(i / 5);
                    const col = i % 5;
                    // User coords: col 0..4 -> User -2..2. Row 0..2 remains 0..2
                    const userX = col - 2;
                    const userY = row;

                    // Check active. We need props passed or derive from drag values
                    // Actually calculating this precisely in real-time might be expensive for just a dot.
                    // Let's simplify: Just a static valid map visual.
                    return (
                        <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-colors",
                            // This is just a visual placemat, logic requires state
                            "bg-white/20"
                        )} />
                    );
                })}
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
export default function Diary() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeRegion, setActiveRegion] = useState<Region>(REGIONS[2]); // Start at 'giris' (0,0)
    const [expandedRegion, setExpandedRegion] = useState<Region | null>(null);

    // Motion Values for Drag
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Initial Position (Center Top: x=0 (user) -> 200vw (phys), y=0 (user) -> 0vh (phys))
    // Wait, Drag Logic: 
    // If I want to see (0,0), the CONTAINER needs to be shifted so that (0,0) is in Viewport.
    // (0,0) is at col=2 (indexes 0,1,2,3,4). So left: 200vw.
    // To CENTER it, translate should be -200vw.
    // Start X: -200vw. Start Y: 0.

    // Convert vw/vh to pixels for initial state? motion values handle it?
    // Let's set initial on the motion.div directly.

    const handleDragEnd = (event: any, info: PanInfo) => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Current position (negative values usually)
        const currentX = x.get();
        const currentY = y.get();

        // Calculate Target Grid Index (0..4, 0..2)
        // Offset is negative. 
        // Index 0 (Leftmost) is at 0px translate? No. 
        // 5 Cols. Width = 5 * W. 
        // If translate is 0, we see Col 0.
        // If translate is -W, we see Col 1.
        // If translate is -2W, we see Col 2 (Center).

        const targetCol = Math.round(Math.abs(currentX) / width);
        const targetRow = Math.round(Math.abs(currentY) / height);

        // Clamp
        const clampedCol = Math.max(0, Math.min(4, targetCol));
        const clampedRow = Math.max(0, Math.min(2, targetRow));

        // Snap To
        const snapX = -(clampedCol * width);
        const snapY = -(clampedRow * height);

        // Animate Snap
        // We can't easily animate useMotionValue outside of 'drag'. 
        // Actually we can use animate(x, snapX).
        // But simpler to just let Framer `motion.div` animate prop handle it if we switch to controlled state?
        // Or using `modifyTarget` in dragTransition? 
        // Let's use controlled `animate` prop based on state.
    };

    // SIMPLIFIED APPROACH: State-based Navigation
    // Instead of free drag, let's use Swipe Gestures (like a PageView) but 2D?
    // OR Free Drag with Constraints and Snap.

    // Let's stick to Free Drag for that "Map" feel, but snap on release.
    const [viewX, setViewX] = useState(-200); // vh/vw percentage
    const [viewY, setViewY] = useState(0);

    // Initial mount: Set to center
    useEffect(() => {
        // -200vw is Center Column (Index 2)
        // 0vh is Top Row (Index 0)
    }, []);

    // Helper to find closest region based on viewX/Y
    useEffect(() => {
        // viewX is -0, -100, -200...
        const col = Math.abs(viewX / 100);
        const row = Math.abs(viewY / 100);

        // Convert to User Coords
        // Col 0 -> x=-2. Col 2 -> x=0.
        const userX = col - 2;
        const userY = row;

        const region = REGIONS.find(r => r.x === userX && r.y === userY);
        if (region) setActiveRegion(region);

    }, [viewX, viewY]);

    return (
        <div className="fixed inset-0 bg-stone-900 overflow-hidden font-sans">
            {/* PWA Header */}
            <div className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 pointer-events-none">
                <Link to="/" className="p-2 -ml-2 text-white/50 hover:text-white transition-colors pointer-events-auto bg-black/10 backdrop-blur-lg rounded-full">
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex flex-col items-center drop-shadow-md">
                    <span className="text-[10px] text-white/60 tracking-[0.3em] font-bold">OTK ARŞİV</span>
                    <h1 className="text-lg font-serif font-bold text-white tracking-widest leading-none">GÜNLÜK</h1>
                </div>
                <div className="w-10" />
            </div>

            {/* EXPANDED CONTENT MODAL */}
            <AnimatePresence>
                {expandedRegion && (
                    <RegionDetail region={expandedRegion} onClose={() => setExpandedRegion(null)} />
                )}
            </AnimatePresence>

            {/* DRAGGABLE WORLD */}
            <motion.div
                className="absolute flex flex-col"
                style={{
                    width: '500vw',
                    height: '300vh',
                    x: viewX + 'vw',
                    y: viewY + 'vh'
                }}
                animate={{ x: viewX + 'vw', y: viewY + 'vh' }}
                transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
                drag
                dragConstraints={{
                    left: -400 * (window.innerWidth / 100), // Approx logic, but strictly using state snapping is safer
                    right: 0,
                    top: -200 * (window.innerHeight / 100),
                    bottom: 0
                }}
                // Custom Drag End Logic to Snap
                onDragEnd={(e, { offset, velocity }) => {
                    const swipeThreshold = 50;
                    const velocityThreshold = 0.2;

                    let newX = viewX;
                    let newY = viewY;

                    // Horizontal Snap
                    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
                        if (offset.x > 0 && viewX < 0) newX += 100; // Swipe Right -> Go Left (Index decrease)
                        else if (offset.x < 0 && viewX > -400) newX -= 100; // Swipe Left -> Go Right
                    }

                    // Vertical Snap
                    if (Math.abs(offset.y) > swipeThreshold || Math.abs(velocity.y) > velocityThreshold) {
                        if (offset.y > 0 && viewY < 0) newY += 100; // Swipe Down -> Go Up (Row decrease)
                        else if (offset.y < 0 && viewY > -200) newY -= 100; // Swipe Up -> Go Down
                    }

                    setViewX(newX);
                    setViewY(newY);
                }}
            >
                {/* Background Layer (Parallax could go here) */}
                <div className="absolute inset-0 bg-stone-900 -z-10" />

                {/* Render All Regions */}
                {REGIONS.map(region => (
                    <GridCell
                        key={region.id}
                        region={region}
                        isActive={activeRegion.id === region.id}
                        onClick={() => setExpandedRegion(region)}
                    />
                ))}
            </motion.div>

            {/* NAVIGATION HINTS / HUD */}
            <div className="fixed bottom-6 w-full flex justify-center z-30 pointer-events-none">
                <div className="flex flex-col items-center gap-1 opacity-50">
                    <div className="flex gap-1">
                        {/* Row Indicators */}
                        {[0, 1, 2].map(r => (
                            <div key={r} className={cn("w-1 h-3 rounded-full transition-colors",
                                Math.abs(viewY / 100) === r ? "bg-white" : "bg-white/20"
                            )} />
                        ))}
                    </div>
                    <div className="text-[9px] text-white font-mono uppercase tracking-widest">
                        {activeRegion.x}, {activeRegion.y}
                    </div>
                </div>
            </div>

        </div>
    );
}
