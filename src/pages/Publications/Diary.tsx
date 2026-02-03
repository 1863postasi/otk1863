import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CloudRain, Wind, Calendar, X, Quote, Coffee, Music2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

// --- TYPES & DATA ---
interface DiaryEntry {
    id: string;
    date: string;
    day: string;
    title: string;
    excerpt: string;
    content: string[];
    mood: string;
    weather: 'rainy' | 'cloudy' | 'snowy' | 'clear';
    song?: string;
}

const ENTRIES: DiaryEntry[] = [
    {
        id: '1',
        date: '2 Ekim 2023',
        day: 'Pazartesi',
        title: 'Kuzey\'in Griliği',
        excerpt: "Bugün okulun ilk günüydü. Kuzey'in o kendine has griliği yine üzerindeydi...",
        content: [
            "Bugün okulun ilk günüydü. Kuzey'in o kendine has griliği yine üzerindeydi ama insanı çeken bir tarafı da var. Kütüphanede yer bulmak için sabahın köründe kalktım.",
            "İnsanların yüzünde o telaşlı ifade, herkes bir yerlere yetişmeye çalışıyor. Ben ise sadece durup izlemek istedim. O beton binaların arasında, ağaçların yapraklarının rüzgarla dans edişini izledim.",
            "Yine de o manzaraya karşı bir kahve içmek her şeye değiyor. Belki de bu yalnızlık hissi, kalabalıklar içindeki en güvenli limanım."
        ],
        mood: 'Düşünceli',
        weather: 'cloudy',
        song: 'The Smiths - Asleep'
    },
    {
        id: '2',
        date: '15 Kasım 2023',
        day: 'Çarşamba',
        title: 'Uykusuzluk ve Kediler',
        excerpt: "Uyku düzenim tamamen bozuldu. Günde 3 saat uykuyla ayakta duruyorum...",
        content: [
            "Uyku düzenim tamamen bozuldu. Günde 3 saat uykuyla ayakta duruyorum. Zihnim bulanık, sanki bir rüyanın içinde yürüyormuşum gibi.",
            "Kediler bile halime acıyor sanırım, bugün biri yanıma gelip kucağıma yattı. Belki de sadece ısınmak istiyordu, bilmiyorum. Ama o anlık, saf huzur paha biçilemezdi. Onun mırıltısında dünyanın bütün gürültüsü sustu.",
            "Vizeler, notlar, gelecek kaygısı... Hepsi o mırıltının içinde eriyip gitti bir anlığına."
        ],
        mood: 'Yorgun',
        weather: 'rainy',
        song: 'Radiohead - No Surprises'
    },
    {
        id: '3',
        date: '20 Aralık 2023',
        day: 'Cuma',
        title: 'Beyaz Sessizlik',
        excerpt: "Güney Kampüs beyaza büründü. Manzara o kadar büyüleyici ki...",
        content: [
            "Güney Kampüs beyaza büründü bugün. Kar yağdığında şehir susar derler, gerçekten öyle. O kaotik İstanbul uğultusu yerini pamuk gibi bir sessizliğe bıraktı.",
            "Manzara o kadar büyüleyici ki derse girmek yerine saatlerce dışarıda yürüdüm. Herkes fotoğraf çekiyor, gülüyor, kar topu oynuyor. Ben ise ellerim cebimde, yüzüme çarpan soğuk rüzgarı hissettim sadece.",
            "Boğaziçi kışın bir başka güzel, bir başka hüzünlü oluyor."
        ],
        mood: 'Melankolik',
        weather: 'snowy',
        song: 'Sigur Rós - Hoppípolla'
    },
    {
        id: '4',
        date: '14 Şubat 2024',
        day: 'Çarşamba',
        title: 'Yalnızlar Rıhtımı',
        excerpt: "Bugün kampüsün her köşesinde kırmızı güller ve çiftler vardı...",
        content: [
            "Bugün kampüsün her köşesinde kırmızı güller ve el ele tutuşan çiftler vardı. Bebek sahilinde yürürken denizin o koyu mavisi bile daha bir yalnız hissettirdi.",
            "İnsanların mutluluğu neden bazen başkalarına hüzün verir? Kıskançlık değil bu, sadece kendi içindeki boşluğun yankısını duymak gibi.",
            "Belki de bazıları için hayat, hep uzaktan izlenen bir film sahnesidir."
        ],
        mood: 'Yalnız',
        weather: 'clear',
        song: 'Teoman - İstanbul\'da Sonbahar'
    }
];

// --- COMPONENTS ---

const WeatherIcon = ({ type }: { type: DiaryEntry['weather'] }) => {
    switch (type) {
        case 'rainy': return <CloudRain size={16} />;

        case 'snowy': return <Wind size={16} />; // Wind representing cold/snow for now or generic
        case 'clear': return <div className="w-4 h-4 rounded-full border border-stone-500" />;
        default: return <CloudRain size={16} />;
    }
};

const DiaryPage: React.FC = () => {
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const selectedEntry = ENTRIES.find(e => e.id === selectedEntryId);

    // Scroll to top when modal opens
    useEffect(() => {
        if (selectedEntryId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedEntryId]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[#888] font-serif selection:bg-stone-800 selection:text-white">

            {/* NOISE OVERLAY */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* HEADER */}
            <nav className="fixed top-0 left-0 right-0 z-40 p-6 md:p-8 flex justify-between items-start bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none">
                <Link
                    to="/yayinlar"
                    className="pointer-events-auto flex items-center gap-2 text-stone-600 hover:text-stone-300 transition-all duration-500 text-xs font-sans tracking-widest uppercase hover:-translate-x-1"
                >
                    <ArrowLeft size={14} />
                    <span>Geri Dön</span>
                </Link>
            </nav>

            {/* MAIN CONTENT */}
            <main className="max-w-3xl mx-auto px-6 pt-32 pb-32 relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-24 text-center md:text-left"
                >
                    <h1 className="text-5xl md:text-7xl font-bold text-[#e5e5e5] mb-4 tracking-tighter leading-tight">
                        Gizli<br /><span className="text-stone-700">Notlar</span>
                    </h1>
                    <p className="max-w-md text-stone-500 font-light italic text-lg leading-relaxed">
                        "Burada yazılanlar, kampüsün gölgesinde kalmış, söylenmemiş sözlerdir. Sadece sen, ben ve Boğaziçi'nin rüzgarı."
                    </p>
                </motion.div>

                {/* DIARY LIST */}
                <div className="space-y-16 border-l border-stone-900/50 pl-8 md:pl-12 relative">
                    {/* Timeline Line Decor */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-stone-800 to-transparent" />

                    {ENTRIES.map((entry, idx) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + idx * 0.15, duration: 0.8 }}
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedEntryId(entry.id)}
                        >
                            {/* Timeline Dot */}
                            <div className="absolute -left-[37px] md:-left-[53px] top-2 w-3 h-3 rounded-full bg-[#0a0a0a] border border-stone-700 group-hover:border-stone-400 group-hover:scale-125 transition-all duration-500" />

                            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 mb-2">
                                <span className="text-xs font-sans font-bold tracking-widest text-stone-600 uppercase group-hover:text-stone-400 transition-colors">
                                    {entry.date}
                                </span>
                                <span className="text-xs font-sans text-stone-700 hidden md:inline-block">/</span>
                                <span className="text-xs font-sans text-stone-700 italic group-hover:text-stone-500 transition-colors">
                                    {entry.day}
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-[#d4d4d4] group-hover:text-white transition-colors duration-300 mb-3">
                                {entry.title}
                            </h2>

                            <p className="text-stone-500 font-light leading-relaxed line-clamp-2 max-w-xl group-hover:text-stone-400 transition-colors duration-300">
                                {entry.excerpt}
                            </p>

                            <div className="mt-4 flex items-center gap-4 text-xs font-sans text-stone-700 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="flex items-center gap-1.5">
                                    <WeatherIcon type={entry.weather} />
                                    <span className="capitalize">{entry.weather === 'cloudy' ? 'Bulutlu' : entry.weather === 'rainy' ? 'Yağmurlu' : entry.weather === 'snowy' ? 'Karlı' : 'Açık'}</span>
                                </div>
                                {entry.song && (
                                    <div className="flex items-center gap-1.5">
                                        <Music2 size={14} />
                                        <span className="line-clamp-1 max-w-[150px]">{entry.song}</span>
                                    </div>
                                )}
                                <span className="ml-auto text-stone-500 group-hover:translate-x-1 transition-transform">
                                    Oku &rarr;
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="mt-32 pt-12 border-t border-stone-900 text-center text-xs font-sans text-stone-800 uppercase tracking-widest">
                    1863 Postası &copy; {new Date().getFullYear()} &bull; Gizli Arşiv
                </div>

            </main>

            {/* READING MODAL */}
            <AnimatePresence>
                {selectedEntry && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center isolate">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEntryId(null)}
                            className="absolute inset-0 bg-[#000000]/90 backdrop-blur-sm"
                        />

                        <motion.div
                            layoutId={`entry-${selectedEntry.id}`} // Shared layout ID if we had one on the list for smoother transition
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.5, type: "spring", bounce: 0 }}
                            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#111111] border border-stone-800/50 shadow-2xl rounded-sm mx-4 scrollbar-hide"
                        >
                            <button
                                onClick={() => setSelectedEntryId(null)}
                                className="sticky top-0 right-0 p-6 float-right text-stone-500 hover:text-white transition-colors z-20"
                            >
                                <X size={24} strokeWidth={1} />
                            </button>

                            <div className="p-8 md:p-16">
                                <div className="flex flex-col items-center mb-12 text-center">
                                    <div className="text-xs font-sans font-bold tracking-[0.2em] text-stone-600 uppercase mb-4">
                                        {selectedEntry.date} &bull; {selectedEntry.day}
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-bold text-[#e5e5e5] mb-6 leading-tight">
                                        {selectedEntry.title}
                                    </h2>
                                    <div className="h-px w-12 bg-stone-800" />
                                </div>

                                <div className="prose prose-invert prose-stone prose-lg mx-auto font-light leading-loose text-[#a8a29e]">
                                    {selectedEntry.content.map((paragraph, i) => (
                                        <p key={i} className="mb-6 first-letter:text-3xl first-letter:font-serif first-letter:mr-1 first-letter:float-left first-letter:text-stone-500">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>

                                <div className="mt-16 pt-8 border-t border-stone-900/50 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-sans text-stone-600">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2" title="Hava Durumu">
                                            <WeatherIcon type={selectedEntry.weather} />
                                            <span className="capitalize">{selectedEntry.weather === 'rainy' ? 'Yağmurlu' : selectedEntry.weather === 'cloudy' ? 'Bulutlu' : selectedEntry.weather === 'snowy' ? 'Karlı' : 'Açık'}</span>
                                        </div>
                                        <div className="w-px h-3 bg-stone-800" />
                                        <div title="Ruh Hali">{selectedEntry.mood}</div>
                                    </div>

                                    {selectedEntry.song && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-900/50 bg-[#0f0f0f]">
                                            <Music2 size={12} className="animate-pulse" />
                                            <span className="opacity-70">Çalıyor:</span>
                                            <span className="font-semibold text-stone-400">{selectedEntry.song}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default DiaryPage;
