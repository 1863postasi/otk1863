import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { PUBLICATIONS } from './data';

const PublicationDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const publication = PUBLICATIONS.find(p => p.id === id);

    if (!publication) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center">
                    <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">Yayın Bulunamadı</h1>
                    <Link to="/yayinlar" className="text-boun-blue hover:underline">Kütüphaneye Dön</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 pb-24 font-serif">
            {/* Header / Hero */}
            <div className="relative bg-stone-900 text-stone-100 py-20 px-4 md:px-8">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <button
                        onClick={() => navigate('/yayinlar')}
                        className="absolute top-4 left-4 md:-left-12 p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {/* Cover Image */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full md:w-1/3 aspect-[3/4] rounded-lg shadow-2xl overflow-hidden border-2 border-stone-700 bg-stone-800"
                    >
                        <img
                            src={publication.coverImage}
                            alt={publication.title}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    {/* Metadata */}
                    <div className="flex-1 pt-4">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-3 py-1 bg-boun-blue/20 text-boun-blue text-xs font-bold rounded-full mb-4 uppercase tracking-wider"
                        >
                            {publication.type}
                        </motion.span>

                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
                        >
                            {publication.title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg text-stone-400 mb-8 max-w-2xl leading-relaxed"
                        >
                            {publication.description}
                        </motion.p>

                        <div className="flex flex-wrap gap-6 text-sm text-stone-500">
                            {publication.frequency && (
                                <div className="flex flex-col">
                                    <span className="uppercase text-xs font-bold text-stone-600 mb-1">Sıklık</span>
                                    <span className="text-stone-300">{publication.frequency}</span>
                                </div>
                            )}
                            {publication.author && (
                                <div className="flex flex-col">
                                    <span className="uppercase text-xs font-bold text-stone-600 mb-1">Yazar</span>
                                    <span className="text-stone-300">{publication.author}</span>
                                </div>
                            )}
                            {publication.instagram && (
                                <div className="flex flex-col">
                                    <span className="uppercase text-xs font-bold text-stone-600 mb-1">Instagram</span>
                                    <a href={`https://instagram.com/${publication.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-boun-blue hover:underline">
                                        {publication.instagram}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Issues Grid */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
                <h2 className="text-2xl font-bold text-stone-900 mb-8 pb-4 border-b border-stone-200">
                    Sayılar & Arşiv
                </h2>

                {publication.issues && publication.issues.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {publication.issues.map((issue, index) => (
                            <motion.div
                                key={issue.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.5 }}
                                className="group relative bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all"
                            >
                                <div className="aspect-[3/4] overflow-hidden bg-stone-100 relative">
                                    <img
                                        src={issue.cover || publication.coverImage}
                                        alt={issue.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        <button className="bg-white text-stone-900 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-stone-100 transform hover:scale-105 transition-all shadow-lg">
                                            <BookOpen size={14} /> Oku
                                        </button>
                                        <button className="bg-stone-900 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-stone-800 transform hover:scale-105 transition-all shadow-lg">
                                            <Download size={14} /> İndir
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/50 backdrop-blur-sm relative z-10 -mt-2 mx-1 rounded-t-lg">
                                    <h3 className="font-bold text-stone-900 text-sm line-clamp-1" title={issue.title}>{issue.title}</h3>
                                    <p className="text-xs text-stone-500 mt-1">{issue.date}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-stone-100 rounded-lg border border-dashed border-stone-300 p-8 text-center max-w-2xl mx-auto">
                        <BookOpen size={48} className="mx-auto text-stone-400 mb-4" />
                        <h3 className="text-xl font-bold text-stone-700 mb-2">Dijital Arşiv Hazırlanıyor</h3>
                        <p className="text-stone-500 mb-6">
                            Bu yayının eski sayıları henüz dijitalleştirilmemiş olabilir.
                            Fiziksel kopyalara ulaşmak veya güncel sayıları temin etmek için kulüp ile iletişime geçebilirsiniz.
                        </p>
                        {publication.instagram && (
                            <a
                                href={`https://instagram.com/${publication.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full font-bold hover:bg-stone-800 transition-colors"
                            >
                                Instagram'dan Ulaş
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicationDetail;
