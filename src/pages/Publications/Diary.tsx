import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';

// DUMMY DIARY ENTRIES
const ENTRIES = [
    {
        id: 1,
        date: '2 Ekim 2023',
        title: 'Kuzey Kampüs\'te İlk Gün',
        content: "Bugün okulun ilk günüydü. Kuzey'in o kendine has griliği yine üzerindeydi ama insanı çeken bir tarafı da var. Kütüphanede yer bulmak için sabahın köründe kalktım. Yine de o manzaraya karşı bir kahve içmek her şeye değiyor.",
        mood: 'Umutlu',
        weather: 'Bulutlu'
    },
    {
        id: 2,
        date: '15 Kasım 2023',
        title: 'Vize Haftası Çılgınlığı',
        content: "Uyku düzenim tamamen bozuldu. Günde 3 saat uykuyla ayakta duruyorum. Kediler bile halime acıyor sanırım, bugün biri yanıma gelip kucağıma yattı. Belki de sadece ısınmak istiyordu, bilmiyorum. Ama o anlık huzur paha biçilemezdi.",
        mood: 'Yorgun',
        weather: 'Yağmurlu'
    },
    {
        id: 3,
        date: '20 Aralık 2023',
        title: 'Kar Yağışı',
        content: "Güney Kampüs beyaza büründü. Manzara o kadar büyüleyici ki derse girmek yerine saatlerce dışarıda yürüdüm. Herkes fotoğraf çekiyor. Boğaziçi kışın bir başka güzel oluyor gerçekten.",
        mood: 'Mutlu',
        weather: 'Karlı'
    }
];

const DiaryPage = () => {
    const [selectedEntry, setSelectedEntry] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-stone-300 font-serif selection:bg-stone-700 selection:text-white pb-24 relative overflow-hidden">

            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            {/* Navigation */}
            <div className="relative z-10 p-6 md:p-12">
                <Link to="/yayinlar" className="inline-flex items-center text-stone-500 hover:text-stone-300 transition-colors mb-8">
                    <ArrowLeft size={18} className="mr-2" />
                    Kütüphaneye Dön
                </Link>

                <header className="mb-16 md:mb-24 relative">
                    <h1 className="text-4xl md:text-6xl font-bold text-stone-100 mb-2 tracking-tighter">Gizli Günlük</h1>
                    <p className="text-stone-500 italic max-w-lg">
                        Buradaki yazılar bir öğrencinin kişisel notlarıdır.
                        Okuduklarınız aramızda kalsın.
                    </p>
                    <div className="absolute -bottom-8 left-0 w-32 h-1 bg-stone-800 rounded-full"></div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                    {ENTRIES.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.01 }}
                            onClick={() => setSelectedEntry(entry.id)}
                            className="bg-[#2a2a2a] p-6 md:p-8 rounded-sm shadow-2xl border-l-4 border-stone-600 cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-stone-500 select-none">
                                {index + 1}
                            </div>

                            <div className="flex items-center gap-2 text-stone-500 text-xs mb-4 font-mono uppercase tracking-widest">
                                <Calendar size={12} />
                                {entry.date}
                            </div>

                            <h2 className="text-xl md:text-2xl font-bold text-stone-200 mb-4 group-hover:text-white transition-colors">
                                {entry.title}
                            </h2>

                            <p className="text-stone-400 text-sm leading-relaxed line-clamp-4 font-light">
                                {entry.content}
                            </p>

                            <div className="mt-6 pt-4 border-t border-stone-700 flex justify-between items-end text-xs text-stone-500">
                                <span>Mood: {entry.mood}</span>
                                <span className="group-hover:underline">Okumak için tıkla</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Entry Modal */}
            <AnimatePresence>
                {selectedEntry !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedEntry(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#eae5d5] text-stone-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl p-8 md:p-12 relative font-serif"
                            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cardboard.png')" }}
                        >
                            <button
                                onClick={() => setSelectedEntry(null)}
                                className="absolute top-4 right-4 text-stone-500 hover:text-stone-800"
                            >
                                <span className="text-sm font-bold uppercase tracking-widest">Kapat</span>
                            </button>

                            {ENTRIES.find(e => e.id === selectedEntry) && (
                                <>
                                    <div className="flex items-center gap-3 text-stone-500 text-sm mb-6 font-mono border-b border-stone-300 pb-4">
                                        <span>{ENTRIES.find(e => e.id === selectedEntry)?.date}</span>
                                        <span>•</span>
                                        <span>{ENTRIES.find(e => e.id === selectedEntry)?.weather}</span>
                                    </div>

                                    <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-8 font-handwriting">
                                        {ENTRIES.find(e => e.id === selectedEntry)?.title}
                                    </h2>

                                    <div className="prose prose-stone prose-lg max-w-none leading-loose">
                                        {ENTRIES.find(e => e.id === selectedEntry)?.content.split('\n').map((paragraph, i) => (
                                            <p key={i} className="mb-4">{paragraph}</p>
                                        ))}
                                        <p>
                                            Okul kafeteryasında çay içerken kulak misafiri olduğum konuşmalar, kedilerin miyavlamaları, rüzgarın sesi... Hepsi bu kampüsün bir parçası.
                                            Bazen kendimi çok yalnız hissediyorum, bazen de kocaman bir ailenin parçası gibi. İşte böyle garip hisler.
                                        </p>
                                    </div>

                                    <div className="mt-12 pt-8 border-t-2 border-dashed border-stone-300 text-right">
                                        <span className="font-handwriting text-xl text-stone-600 block transform -rotate-2">
                                            - Anonim
                                        </span>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DiaryPage;
