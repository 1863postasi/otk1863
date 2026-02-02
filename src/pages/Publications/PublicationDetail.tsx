import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Download, Share2, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { PUBLICATIONS } from './data';

const PublicationDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const publication = PUBLICATIONS.find(p => p.id === id);

    if (!publication) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f5f4]">
                <div className="text-center p-8 bg-white shadow-xl border border-stone-200 rounded-sm">
                    <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">Yayın Bulunamadı</h1>
                    <button onClick={() => navigate('/yayinlar')} className="text-amber-700 hover:text-amber-900 underline font-medium">
                        Kütüphaneye Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f5f4] text-stone-900 font-serif selection:bg-amber-100 selection:text-amber-900 pb-24">

            {/* --- HERO SECTION --- */}
            <div className="relative bg-[#1c1917] text-stone-100 overflow-hidden">
                {/* Gold Accent Top Bar */}
                <div className="h-1 w-full bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700" />

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 relative z-10">
                    <button
                        onClick={() => navigate('/yayinlar')}
                        className="group flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors mb-8 md:mb-12 text-sm uppercase tracking-widest font-bold"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Geri Dön
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                        {/* Cover Image - LIMITED WIDTH ON MOBILE */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="w-32 md:w-80 flex-shrink-0 relative" // w-32 fixed for mobile to prevent full width
                        >
                            {/* Gold Frame Effect */}
                            <div className="absolute -inset-2 md:-inset-4 border border-stone-700 md:border-stone-600 rounded-sm" />
                            <div className="absolute -inset-0.5 border border-amber-600/30 rounded-sm" />

                            <div className="aspect-[3/4] bg-stone-800 rounded-sm overflow-hidden shadow-2xl relative z-10">
                                <img
                                    src={publication.coverImage}
                                    alt={publication.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </motion.div>

                        {/* Info Content */}
                        <div className="flex-1 min-w-0 pt-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-amber-900/30 border border-amber-700/50 text-amber-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                                        {publication.type}
                                    </span>
                                    {publication.frequency && (
                                        <span className="text-stone-500 text-xs uppercase tracking-widest border-l border-stone-700 pl-3">
                                            {publication.frequency}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[0.9] tracking-tight text-white">
                                    {publication.title}
                                </h1>

                                <p className="text-lg text-stone-400 mb-8 max-w-2xl leading-relaxed border-l-2 border-amber-800 pl-6 font-light italic">
                                    "{publication.description}"
                                </p>

                                {/* Metadata Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 border-t border-stone-800 pt-8">
                                    <div>
                                        <span className="block text-[10px] uppercase tracking-widest text-stone-500 mb-1">Yazar / Kurum</span>
                                        <span className="text-sm font-bold text-stone-200">{publication.author || "Öğrenci Topluluğu"}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] uppercase tracking-widest text-stone-500 mb-1">Sosyal Medya</span>
                                        <a href="#" className="text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors">
                                            {publication.instagram || "@boun"}
                                        </a>
                                    </div>
                                    <div className="col-span-2 md:col-span-1 flex gap-2">
                                        <button className="flex-1 md:flex-none h-10 px-6 bg-stone-100 text-stone-900 text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-2 rounded-sm">
                                            <Share2 size={14} /> Paylaş
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ISSUES / ARCHIVE SECTION --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 md:-mt-16 relative z-20">
                <div className="bg-white rounded-none shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border-t-4 border-amber-600 p-6 md:p-12">
                    <div className="flex items-end justify-between mb-10 pb-4 border-b border-stone-100">
                        <div>
                            <h2 className="text-3xl font-bold text-stone-900 mb-1">Sayılar</h2>
                            <p className="text-stone-500 text-sm">Arşivdeki tüm dijital kopyalar.</p>
                        </div>
                        <span className="text-xs font-mono text-stone-400 hidden md:block">
                            TOPLAM {publication.issues?.length || 0} SAYI
                        </span>
                    </div>

                    {publication.issues && publication.issues.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-8">
                            {publication.issues.map((issue, index) => (
                                <motion.div
                                    key={issue.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-stone-100 shadow-sm border border-stone-200 group-hover:shadow-xl group-hover:border-stone-300 transition-all duration-500">
                                        <img
                                            src={issue.cover || publication.coverImage}
                                            alt={issue.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />

                                        {/* Golden Frame Hover Effect */}
                                        <div className="absolute inset-2 border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {/* Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                                            <button className="w-full bg-white text-stone-900 py-2.5 mb-2 text-xs font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-lg flex items-center justify-center gap-2">
                                                <BookOpen size={14} /> Oku
                                            </button>
                                            <button className="w-full bg-stone-900 text-white py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-lg flex items-center justify-center gap-2">
                                                <Download size={14} /> İndir
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pr-2">
                                        <h3 className="font-bold text-stone-900 text-base leading-tight mb-1 group-hover:text-amber-700 transition-colors line-clamp-2">
                                            {issue.title}
                                        </h3>
                                        <div className="flex items-center text-xs text-stone-400 font-mono">
                                            <span>NO. {publication.issues?.length ? publication.issues.length - index : 0}</span>
                                            <span className="mx-2">•</span>
                                            <span>{issue.date}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-stone-200 bg-stone-50">
                            <Star className="text-amber-400 mb-4 h-10 w-10 opacity-50" />
                            <h3 className="text-xl font-bold text-stone-700 mb-2">Henüz Dijital Sayı Yok</h3>
                            <p className="text-stone-500 max-w-sm mb-6 text-sm">
                                Bu yayının eski sayıları henüz dijital arşivimize eklenmemiş olabilir.
                            </p>
                            <button className="px-6 py-2 bg-stone-900 text-stone-50 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors">
                                Yayımcıya Ulaş
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicationDetail;
