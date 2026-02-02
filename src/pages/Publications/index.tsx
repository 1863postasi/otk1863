import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight, Lock, BookOpen, Sparkles, Feather } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PUBLICATIONS } from './data';

// --- COMPONENTS ---

// Hero Section
const Hero = () => {
    return (
        <section className="relative h-[65vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-stone-900 text-stone-100">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2428&auto=format&fit=crop"
                    alt="Library Background"
                    className="w-full h-full object-cover opacity-40 fixed top-0 left-0" // fixed for parallax-like feel
                    style={{ height: '65vh' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 via-stone-900/60 to-stone-50" />
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium tracking-widest uppercase mb-4 text-stone-300">
                        Boğaziçi Arşivi
                    </span>
                    <h1 className="text-5xl md:text-8xl font-serif font-bold mb-6 tracking-tight leading-tight">
                        Kütüphane
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-xl text-stone-200/90 max-w-2xl mx-auto font-light leading-relaxed"
                >
                    Kampüsün hafızası, öğrencilerin sesi ve kulüplerin emeği.<br className="hidden md:block" /> Geçmişten bugüne dijital bir yolculuk.
                </motion.p>
            </div>
        </section>
    );
}

// Section Header
const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <div className="mb-8 md:mb-10 px-4 md:px-0">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 mb-3 tracking-tight">
            {title}
        </h2>
        {subtitle && (
            <p className="text-stone-500 text-sm md:text-base max-w-lg font-light leading-relaxed">
                {subtitle}
            </p>
        )}
    </div>
);

// Minimalist Publication Card
const PubCard = ({ item }: { item: typeof PUBLICATIONS[0] }) => {
    return (
        <Link to={`/yayinlar/${item.id}`} className="block">
            <motion.div
                whileHover={{ y: -5 }}
                className="group relative flex-shrink-0 w-64 md:w-80 flex flex-col gap-4 cursor-pointer"
            >
                {/* Cover Image - Clean & Sharp */}
                <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-stone-200 shadow-sm relative group-hover:shadow-xl transition-all duration-500">
                    <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                    {/* Minimal Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-stone-900 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {item.frequency || item.type}
                    </div>
                </div>

                {/* Content - Minimal */}
                <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-serif font-bold text-stone-900 group-hover:text-boun-blue transition-colors leading-tight">
                        {item.title}
                    </h3>
                    <p className="text-xs md:text-sm text-stone-500 line-clamp-2 leading-relaxed">
                        {item.description}
                    </p>
                </div>
            </motion.div>
        </Link>
    );
}

// Minimal Fanzine Card
const FanzineCard = ({ fanzine, navigate }: { fanzine: any, navigate: any }) => (
    <motion.div
        whileHover={{ y: -4 }}
        onClick={() => navigate(`/yayinlar/${fanzine.id}`)}
        className="group cursor-pointer flex flex-col h-full"
    >
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4 bg-stone-100">
            <div className="absolute top-0 right-0 p-4 opacity-5 z-10">
                <Feather size={64} />
            </div>

            {/* Abstract/Color Overlay for Fanzines */}
            <div className={`absolute inset-0 opacity-20 mix-blend-multiply transition-colors duration-500 bg-stone-400 group-hover:bg-boun-blue/40`} />

            <div className="absolute bottom-0 left-0 p-6 w-full">
                <span className="text-[10px] font-mono font-bold text-stone-600 mb-1 block uppercase tracking-widest">
                    {fanzine.type}
                </span>
                <h3 className="text-2xl font-serif font-black text-stone-800 leading-none group-hover:text-black transition-colors">
                    {fanzine.title}
                </h3>
            </div>
        </div>

        <div className="flex-1 pr-4">
            <p className="text-sm text-stone-600 leading-relaxed line-clamp-2 group-hover:text-stone-900 transition-colors">
                {fanzine.description}
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-stone-400 group-hover:text-boun-blue transition-colors">
                <span className="mr-2">OKU</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    </motion.div>
);

// The Mystic Diary Strip
const DiaryStrip = () => {
    return (
        <Link to="/yayinlar-gunluk" className="block w-full max-w-5xl mx-auto my-16 md:my-32 group">
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative overflow-hidden rounded-full bg-[#0c0c0c] border border-stone-800 hover:border-stone-700 transition-colors h-14 md:h-20 flex items-center px-6 md:px-12 shadow-2xl"
            >
                {/* Mystic Glow Effect */}
                <div className="absolute top-0 left-1/4 w-1/2 h-full bg-purple-900/20 blur-[40px] opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />

                <div className="flex items-center gap-4 md:gap-8 w-full relative z-10 text-stone-400 group-hover:text-stone-200 transition-colors">
                    <div className="p-2 bg-white/5 rounded-full">
                        <Lock size={14} className="md:w-5 md:h-5 text-stone-500 group-hover:text-purple-300 transition-colors" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-baseline md:gap-4 flex-1">
                        <span className="font-serif italic text-lg md:text-2xl font-medium tracking-wide text-stone-300">
                            Bir Öğrencinin Günlüğü
                        </span>
                        <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest opacity-50 hidden md:block">
                            // Sadece Gözler İçin
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs md:text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="hidden md:inline">Kilidi Aç</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};


const PublicationsPage = () => {
    const periodicals = PUBLICATIONS.filter(p => p.type === 'Dergi');
    const fanzines = PUBLICATIONS.filter(p => p.type === 'Fanzin');
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-stone-50 pb-24">
            <Hero />

            {/* Content Wrapper - Overlapping Hero */}
            <div className="relative z-20 -mt-24 md:-mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 md:space-y-36">

                {/* 1. SECTION: PERIODICALS - Horizontal Scroll */}
                <section>
                    <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-sm border border-white/50">
                        <SectionHeader
                            title="Süreli Yayınlar"
                            subtitle="Kampüsün nabzını tutan köklü mecmualar."
                        />

                        {/* Horizontal Scroll Container */}
                        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-8 pt-2 scrollbar-none md:scrollbar-thin -mx-6 px-6 md:mx-0 md:px-0 snap-x">
                            {periodicals.map(pub => (
                                <div key={pub.id} className="snap-start">
                                    <PubCard item={pub} />
                                </div>
                            ))}

                            {/* "Coming Soon" Placeholder */}
                            <div className="flex-shrink-0 w-48 md:w-64 flex flex-col items-center justify-center text-stone-300 border border-dashed border-stone-200 rounded-lg snap-start h-[320px] md:h-[420px] bg-stone-50/50">
                                <BookOpen size={32} className="mb-2 opacity-50" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Arşiv Genişliyor</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. SECTION: THE SECRET DIARY (The Strip) */}
                <DiaryStrip />

                {/* 3. SECTION: FANZINES - Grid */}
                <section>
                    <div className="px-2 md:px-4">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight mb-2">
                                    Fanzinler
                                </h2>
                                <p className="text-stone-500 text-sm md:text-base max-w-md font-light">
                                    Filtresiz, bağımsız ve özgür sesler.
                                </p>
                            </div>
                            <button className="hidden md:flex items-center gap-2 text-stone-900 border-b border-stone-900 pb-1 text-sm font-bold hover:text-boun-blue hover:border-boun-blue transition-all mt-4 md:mt-0 max-w-xs">
                                <span>Kendi Fanzinini Gönder</span>
                                <ArrowRight size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-8">
                            {fanzines.map(fanzine => (
                                <FanzineCard key={fanzine.id} fanzine={fanzine} navigate={navigate} />
                            ))}

                            {/* Call to Action Card (Small) */}
                            <div className="flex flex-col justify-center items-center text-center p-6 border border-dashed border-stone-300 rounded-lg opacity-60 hover:opacity-100 transition-opacity min-h-[200px] cursor-pointer group">
                                <Sparkles size={24} className="mb-3 text-stone-400 group-hover:text-yellow-500 transition-colors" />
                                <p className="text-sm font-bold text-stone-700 mb-1">Senin Fanzinin?</p>
                                <p className="text-[10px] text-stone-500 mb-3">001 koduyla yayınla.</p>
                                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white transition-colors">
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>

                        <button className="flex md:hidden items-center gap-2 text-stone-900 border-b border-stone-900 pb-1 text-xs font-bold mt-12 mx-auto">
                            <span>Kendi Fanzinini Gönder</span>
                            <ArrowRight size={12} />
                        </button>
                    </div>
                </section>

                {/* Bottom Spacer */}
                <div className="h-32" />
            </div>
        </div>
    );
};

export default PublicationsPage;
