import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight, Lock, BookOpen, Quote } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PUBLICATIONS } from './data';

// --- COMPONENTS ---

// Hero Section
const Hero = () => {
    return (
        <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-stone-900 text-stone-100">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2428&auto=format&fit=crop"
                    alt="Library Background"
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent" />
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl font-serif font-bold mb-4 tracking-tight"
                >
                    Kütüphane
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto font-light"
                >
                    Kampüsün hafızası, öğrencilerin sesi ve kulüplerin emeği burada dijitalleşiyor.
                </motion.p>
            </div>
        </section>
    );
}

// Section Header
const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <div className="mb-8 md:mb-12 px-4 md:px-0">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 sticky top-0 bg-white/50 backdrop-blur-sm py-2 z-20 w-fit pr-4 rounded-r-lg">
            {title}
        </h2>
        {subtitle && <p className="text-stone-500 mt-2 text-sm md:text-base max-w-xl">{subtitle}</p>}
        <div className="h-1 w-24 bg-boun-blue mt-4 rounded-full" />
    </div>
);

// Publication Card
const PubCard = ({ item }: { item: typeof PUBLICATIONS[0] }) => {
    return (
        <Link to={`/yayinlar/${item.id}`}>
            <motion.div
                whileHover={{ y: -8 }}
                className="group relative flex-shrink-0 w-72 md:w-80 h-[420px] bg-white rounded-xl shadow-md border border-stone-200 overflow-hidden cursor-pointer"
            >
                {/* Cover Image */}
                <div className="h-3/5 w-full overflow-hidden bg-stone-200 relative">
                    <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded">
                        {item.type}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col h-2/5 justify-between">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-stone-900 group-hover:text-boun-blue transition-colors line-clamp-2">
                            {item.title}
                        </h3>
                        <p className="text-sm text-stone-500 mt-2 line-clamp-3 leading-relaxed">
                            {item.description}
                        </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
                        <span>{item.frequency || item.author}</span>
                        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-boun-blue">
                            İncele <ArrowRight size={14} />
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

// Diary Teaser (Secret-ish)
const DiaryTeaser = () => {
    return (
        <Link to="/yayinlar-gunluk" className="block relative group overflow-hidden rounded-2xl border border-stone-800 shadow-2xl bg-[#1a1a1a] max-w-4xl mx-auto my-24">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-20 pointer-events-none" />

            <div className="md:flex h-full min-h-[300px]">
                <div className="md:w-1/3 relative bg-black/50 overflow-hidden">
                    {/* Glitchy/Dark Image */}
                    <img
                        src="https://images.unsplash.com/photo-1544412217-1f727bc7bf08?q=80&w=2670&auto=format&fit=crop"
                        alt="Hidden Diary"
                        className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
                </div>

                <div className="md:w-2/3 p-8 md:p-12 flex flex-col justify-center relative">
                    <div className="absolute top-4 right-4 text-stone-600 opacity-50">
                        <Lock size={16} />
                    </div>

                    <h3 className="text-2xl md:text-4xl font-serif font-bold text-stone-200 mb-4 font-handwriting">
                        Bir Öğrencinin Günlüğü
                    </h3>

                    <p className="text-stone-400 mb-8 italic leading-relaxed text-sm md:text-base border-l-2 border-stone-700 pl-4">
                        "Bugün yine Kuzey Kampüs'ün o soğuk rüzgarı yüzüme çarptı. Finaller yaklaşırken herkesin yüzündeki o gergin ifade... Kütüphanede yer bulmak imkansızlaştı."
                    </p>

                    <span className="inline-flex items-center text-sm text-stone-500 group-hover:text-stone-300 transition-colors duration-300">
                        <span className="border-b border-transparent group-hover:border-stone-500 pb-0.5">Okumaya devam et</span>
                        <ChevronRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                    </span>
                </div>
            </div>
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

            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-24">

                {/* 1. SECTION: PERIODICALS */}
                <section>
                    <SectionHeader title="Süreli Yayınlar" subtitle="Kulüplerimizin ve topluluklarımızın düzenli olarak çıkardığı dergiler, bültenler ve gazeteler." />

                    {/* Horizontal Scroll Container */}
                    <div className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {periodicals.map(pub => <PubCard key={pub.id} item={pub} />)}

                        {/* More placeholders to show scroll */}
                        {[1, 2].map((i) => (
                            <div key={i} className="flex-shrink-0 w-72 md:w-80 h-[420px] bg-stone-100 rounded-xl border border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400">
                                <BookOpen size={48} className="mb-4 opacity-50" />
                                <span className="text-sm font-medium">Yakında Eklenecek</span>
                            </div>
                        ))}
                    </div>
                </section>


                {/* 2. SECTION: FANZINES */}
                <section>
                    <SectionHeader title="Fanzinler" subtitle="Bağımsız, özgür ve filtresiz. Öğrencilerin kendi imkanlarıyla çıkardığı fanzinler ve broşürler." />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fanzines.map(fanzine => (
                            <motion.div
                                key={fanzine.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => navigate(`/yayinlar/${fanzine.id}`)}
                                className="bg-[#f0f0f0] rounded-lg overflow-hidden border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition-all cursor-pointer p-6 flex flex-col relative"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Quote size={64} />
                                </div>

                                <span className="text-xs font-bold font-mono text-stone-500 mb-2 uppercase tracking-widest text-boun-red">FANZİN // 001</span>

                                <h3 className="text-2xl font-black text-stone-900 mb-3 uppercase leading-none">
                                    {fanzine.title}
                                </h3>

                                <p className="text-sm font-medium text-stone-700 leading-tight mb-6 line-clamp-3">
                                    {fanzine.description}
                                </p>

                                <div className="mt-auto flex items-center justify-between border-t-2 border-stone-300 pt-4">
                                    <span className="text-xs font-bold text-stone-500">{fanzine.author}</span>
                                    <ArrowRight size={18} />
                                </div>
                            </motion.div>
                        ))}

                        {/* Empty State / Call to Action */}
                        <div className="bg-transparent rounded-lg border-2 border-dashed border-stone-300 p-6 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity min-h-[250px]">
                            <p className="font-serif font-bold text-lg text-stone-600 mb-2">Senin de bir fanzinin mi var?</p>
                            <p className="text-xs text-stone-500 mb-4 max-w-[200px]">Dijital kütüphanemizde yayınlanması için bizimle iletişime geç.</p>
                            <button className="text-xs bg-stone-900 text-white px-4 py-2 rounded-full font-bold hover:bg-stone-800 transition-colors">
                                İletişime Geç
                            </button>
                        </div>
                    </div>
                </section>

                {/* 3. SECTION: THE SECRET DIARY */}
                <DiaryTeaser />

            </div>
        </div>
    );
};

export default PublicationsPage;
