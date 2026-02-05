import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, Maximize2, Info, BookOpen, Edit2, Save, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { DiaryRegion } from './types';
import { onAuthStateChanged, User } from 'firebase/auth';

// --- TYPES & DATA ---
// Row 0 (Top), Row 1 (Middle), Row 2 (Bottom)
// Col -2 to 2
const INITIAL_REGIONS: DiaryRegion[] = [
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
const GridCell = ({ region, isActive, onClick }: { region: DiaryRegion, isActive: boolean, onClick: () => void }) => {
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

// --- COMPONENT: DETAIL MODAL (With Edit Support) ---
const RegionDetail = ({ region, onClose, isOwner }: { region: DiaryRegion, onClose: () => void, isOwner: boolean }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(region.content);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'diary_regions', region.id), {
                ...region,
                content: editContent,
                updatedAt: new Date()
            }, { merge: true });
            setIsEditing(false);
        } catch (error) {
            console.error("Kaydetme hatası:", error);
            alert("Kaydedilemedi!");
        } finally {
            setSaving(false);
        }
    };

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
                <div className="flex items-center gap-2">
                    {isOwner && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center text-amber-800 transition-colors"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}
                    {isEditing && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="h-10 px-4 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-800 transition-colors gap-2 text-sm font-bold"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Kaydet
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-20">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-2xl mx-auto prose prose-stone prose-lg prose-p:font-serif prose-headings:font-serif"
                >
                    {isEditing ? (
                        <div className="w-full">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full h-[60vh] p-4 bg-white border border-stone-300 rounded shadow-inner font-serif text-lg leading-relaxed focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                            />
                        </div>
                    ) : (
                        <div className="whitespace-pre-line text-2xl leading-relaxed text-stone-800 italic indent-8 mb-12">
                            "{region.content}"
                        </div>
                    )}

                    {!isEditing && (
                        <>
                            <hr className="my-12 border-stone-200" />
                            {/* Static Decoration */}
                            <div className="flex justify-center opacity-30">
                                <BookOpen size={24} />
                            </div>
                        </>
                    )}
                </motion.div>
                <div className="h-32" />{/* Bottom Spacer */}
            </div>
        </motion.div>
    );
};

// --- MAIN COMPONENT ---
export default function Diary() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [regions, setRegions] = useState<DiaryRegion[]>(INITIAL_REGIONS);
    const [activeRegion, setActiveRegion] = useState<DiaryRegion>(INITIAL_REGIONS[2]); // Start at 'giris' (0,0) index 2
    const [expandedRegion, setExpandedRegion] = useState<DiaryRegion | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Auth Subscription
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    // Firestore Subscription
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'diary_regions'), (snapshot) => {
            if (snapshot.empty) return;

            const updatedRegions = [...INITIAL_REGIONS];
            snapshot.forEach((doc) => {
                const data = doc.data() as Partial<DiaryRegion>;
                const index = updatedRegions.findIndex(r => r.id === doc.id);
                if (index !== -1) {
                    updatedRegions[index] = { ...updatedRegions[index], ...data };
                }
            });
            setRegions(updatedRegions);

            // Update active/expanded if they were modified
            if (expandedRegion) {
                const current = updatedRegions.find(r => r.id === expandedRegion.id);
                if (current) setExpandedRegion(current);
            }
        });

        return () => unsubscribe();
    }, [expandedRegion]); // expandedRegion dependency to ensure modal gets updates


    // Motion Values for Drag
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const [viewX, setViewX] = useState(-200); // vh/vw percentage
    const [viewY, setViewY] = useState(0);

    // Helper to find closest region based on viewX/Y
    useEffect(() => {
        const col = Math.abs(viewX / 100);
        const row = Math.abs(viewY / 100);

        // Convert to User Coords
        const userX = col - 2;
        const userY = row;

        const region = regions.find(r => r.x === userX && r.y === userY);
        if (region) setActiveRegion(region);

    }, [viewX, viewY, regions]);

    return (
        <div className="fixed inset-0 bg-stone-900 overflow-hidden font-sans">
            {/* PWA Header */}
            <div className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 pointer-events-none">
                <Link to="/yayinlar" className="p-2 -ml-2 text-white/50 hover:text-white transition-colors pointer-events-auto bg-black/10 backdrop-blur-lg rounded-full">
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
                    <RegionDetail
                        region={expandedRegion}
                        onClose={() => setExpandedRegion(null)}
                        isOwner={!!currentUser} // Simple auth check for now
                    />
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
                    left: -400 * (window.innerWidth / 100),
                    right: 0,
                    top: -200 * (window.innerHeight / 100),
                    bottom: 0
                }}
                onDragEnd={(e, { offset, velocity }) => {
                    const swipeThreshold = 50;
                    const velocityThreshold = 0.2;

                    let newX = viewX;
                    let newY = viewY;

                    // Horizontal Snap
                    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
                        if (offset.x > 0 && viewX < 0) newX += 100;
                        else if (offset.x < 0 && viewX > -400) newX -= 100;
                    }

                    // Vertical Snap
                    if (Math.abs(offset.y) > swipeThreshold || Math.abs(velocity.y) > velocityThreshold) {
                        if (offset.y > 0 && viewY < 0) newY += 100;
                        else if (offset.y < 0 && viewY > -200) newY -= 100;
                    }

                    setViewX(newX);
                    setViewY(newY);
                }}
            >
                {/* Background Layer (Parallax could go here) */}
                <div className="absolute inset-0 bg-stone-900 -z-10" />

                {/* Render All Regions */}
                {regions.map(region => (
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
