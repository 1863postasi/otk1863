import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Quote } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PUBLICATIONS } from './data';

// --- COMPONENTS ---

// Hero Section with Overlapping Background
const Hero = () => {
    return (
        <section className="relative h-[30vh] min-h-[280px] flex items-center justify-center overflow-visible bg-stone-900 text-stone-100">
            {/* Background Image with Overlay - Extends Down */}
            <div className="absolute inset-0 z-0" style={{ height: '150%' }}>
                <img
                    src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2428&auto=format&fit=crop"
                    alt="Library Background"
                    className="w-full h-full object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-900/60 to-transparent" />
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-3xl md:text-6xl font-serif font-bold mb-2 md:mb-3 tracking-tight"
                >
                    Kütüphane
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-sm md:text-lg text-stone-300 max-w-2xl mx-auto font-light px-4"
                >
                    Kampüsün hafızası, öğrencilerin sesi ve kulüplerin emeği burada dijitalleşiyor.
                </motion.p>
            </div>
        </section>
    );
}

// Section Header - White text for visibility on dark background
const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <div className="mb-6 md:mb-8 px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)' }}>
            {title}
        </h2>
        {subtitle && <p className="text-white/95 mt-1.5 text-xs md:text-sm max-w-xl" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>{subtitle}</p>}
        <div className="h-0.5 w-16 bg-white/90 mt-3 rounded-full shadow-2xl" />
    </div>
);

// Publication Card - Minimized
const PubCard = ({ item }: { item: typeof PUBLICATIONS[0] }) => {
    return (
        <Link to={`/yayinlar/${item.id}`}>
            <motion.div
                whileHover={{ y: -6 }}
                className="group relative flex-shrink-0 w-44 md:w-60 h-[300px] md:h-[320px] bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden cursor-pointer"
            >
                {/* Cover Image */}
                <div className="h-[60%] w-full overflow-hidden bg-stone-200 relative">
                    <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                        {item.type}
                    </div>
                </div>

                {/* Content */}
                <div className="p-3.5 flex flex-col h-[40%] justify-between">
                    <div>
                        <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-boun-blue transition-colors line-clamp-2 leading-tight">
                            {item.title}
                        </h3>
                        <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
                            {item.description}
                        </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-stone-400 font-medium mt-2">
                        <span className="truncate">{item.frequency || item.author}</span>
                        <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform text-boun-blue flex-shrink-0">
                            <ArrowRight size={12} />
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}


const PublicationsPage = () => {
    const periodicals = PUBLICATIONS.filter(p => p.type === 'Dergi');
    const fanzines = PUBLICATIONS.filter(p => p.type === 'Fanzin');
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-transparent pb-32 relative">
            <Hero />

            {/* Content starts overlapping hero background - NO WHITE BACKGROUND */}
            <div className="relative z-20 max-w-7xl mx-auto -mt-[15vh] px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-20">

                {/* 1. SECTION: PERIODICALS */}
                <section>
                    <SectionHeader title="Süreli Yayınlar" subtitle="Kulüplerimizin ve topluluklarımızın düzenli olarak çıkardığı dergiler, bültenler ve gazeteler." />

                    {/* Horizontal Scroll Container */}
                    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {periodicals.map(pub => <PubCard key={pub.id} item={pub} />)}

                        {/* More placeholders to show scroll */}
                        {[1, 2].map((i) => (
                            <div key={i} className="flex-shrink-0 w-52 md:w-60 h-[320px] bg-stone-100/80 rounded-lg border border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400">
                                <BookOpen size={32} className="mb-2 opacity-40" />
                                <span className="text-xs font-medium">Yakında</span>
                            </div>
                        ))}
                    </div>
                </section>


                {/* 2. SECTION: FANZINES */}
                <section className="bg-stone-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 rounded-2xl">
                    <SectionHeader title="Fanzinler" subtitle="Bağımsız, özgür ve filtresiz. Öğrencilerin kendi imkanlarıyla çıkardığı fanzinler ve broşürler." />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {fanzines.map(fanzine => (
                            <motion.div
                                key={fanzine.id}
                                whileHover={{ scale: 1.01 }}
                                onClick={() => navigate(`/yayinlar/${fanzine.id}`)}
                                className="bg-white rounded-lg overflow-hidden border border-stone-300 hover:border-stone-400 shadow-sm hover:shadow-md transition-all cursor-pointer p-4 flex flex-col relative"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-5">
                                    <Quote size={48} />
                                </div>

                                <span className="text-[10px] font-bold font-mono text-stone-400 mb-1.5 uppercase tracking-widest">FANZİN</span>

                                <h3 className="text-lg font-bold text-stone-900 mb-2 leading-tight">
                                    {fanzine.title}
                                </h3>

                                <p className="text-xs text-stone-600 leading-snug mb-4 line-clamp-3">
                                    {fanzine.description}
                                </p>

                                <div className="mt-auto flex items-center justify-between border-t border-stone-200 pt-3">
                                    <span className="text-[10px] font-bold text-stone-500">{fanzine.author}</span>
                                    <ArrowRight size={14} className="text-stone-400" />
                                </div>
                            </motion.div>
                        ))}

                        {/* Empty State / Call to Action */}
                        <div className="bg-transparent rounded-lg border border-dashed border-stone-300 p-4 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity min-h-[200px]">
                            <p className="font-serif font-bold text-sm text-stone-600 mb-1.5">Senin de bir fanzinin mi var?</p>
                            <p className="text-[10px] text-stone-500 mb-3 max-w-[180px]">Dijital kütüphanemizde yayınlanması için bizimle iletişime geç.</p>
                            <button className="text-[10px] bg-stone-900 text-white px-3 py-1.5 rounded-full font-bold hover:bg-stone-800 transition-colors">
                                İletişime Geç
                            </button>
                        </div>
                    </div>
                </section>

            </div>

            {/* Mysterious Diary Footer Bar - ENHANCED */}
            <Link to="/yayinlar-gunluk" className="fixed bottom-0 left-0 right-0 z-40 group">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="relative"
                >
                    {/* Vertical Mysterious Line */}
                    <div className="h-2 w-full bg-gradient-to-r from-transparent via-stone-800/60 to-transparent group-hover:via-amber-700/80 transition-all duration-700 shadow-2xl" />

                    {/* Hover Content - Bottom Sheet Style */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap">
                        <div className="bg-stone-900/98 backdrop-blur-xl px-6 py-3 rounded-t-2xl border-t-2 border-x-2 border-amber-700/40 shadow-2xl">
                            <p className="text-xs text-stone-300 italic font-serif mb-1">"Unutulan anılar, yazılmayı bekliyor..."</p>
                            <p className="text-[10px] text-amber-500 font-bold tracking-widest text-center">BİR ÖĞRENCİNİN GÜNLÜĞÜ</p>
                        </div>
                    </div>
                </motion.div>
            </Link>
        </div>
    );
};

export default PublicationsPage;
