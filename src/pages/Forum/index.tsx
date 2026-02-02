import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, MessageSquare, ArrowRight, Star, GraduationCap, PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';

const Forum: React.FC = () => {
    const categories = [
        {
            id: 'academic',
            title: 'Akademik Değerlendirme',
            description: 'Dersler ve hocalar hakkında deneyimlerini paylaş, dönemini daha iyi planla.',
            icon: GraduationCap,
            color: 'bg-blue-500',
            textColor: 'text-blue-500',
            gradient: 'from-blue-500 to-cyan-400',
            stats: '150+ Ders, 80+ Hoca',
            link: '/forum/akademik',
            featured: true
        },
        {
            id: 'clubs',
            title: 'Kulüpler & Etkinlikler',
            description: 'Kampüsün kalbini atan kulüpleri ve etkinlikleri oyla, yorumla.',
            icon: PartyPopper,
            color: 'bg-purple-500',
            textColor: 'text-purple-500',
            gradient: 'from-purple-500 to-pink-500',
            stats: '45 Kulüp, 120+ Etkinlik',
            link: '/forum/kulupler'
        },
        {
            id: 'community',
            title: 'Topluluk & Tartışma',
            description: 'Kampüs gündemini takip et, tartışmalara katıl ve sosyalleş.',
            icon: MessageSquare,
            color: 'bg-orange-500',
            textColor: 'text-orange-500',
            gradient: 'from-orange-500 to-amber-400',
            stats: 'Global Gündem',
            link: '/forum/topluluk'
        }
    ];

    return (
        <div className="min-h-screen bg-stone-50 pb-24 md:pb-12 pt-20">

            {/* HERO SECTION */}
            <section className="relative px-4 sm:px-6 lg:px-8 mb-12">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center md:text-left mb-12"
                    >
                        <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 mb-4">
                            Öğrenci Forumu
                        </h1>
                        <p className="text-lg md:text-xl text-stone-600 max-w-2xl">
                            Boğaziçi'nin dijital meydanı. Dersleri değerlendir, etkinlikleri yorumla ve kampüs gündemini belirle.
                        </p>
                    </motion.div>

                    {/* CATEGORY CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link to={category.link} className="group relative block h-full">
                                    <div className="absolute inset-0 bg-white rounded-2xl shadow-xl transform transition-transform group-hover:-translate-y-2 duration-300" />
                                    <div className="relative h-full bg-white rounded-2xl border border-stone-100 p-8 overflow-hidden z-10 transition-colors group-hover:border-stone-200">

                                        {/* Background Gradient Blob */}
                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.gradient} opacity-10 rounded-bl-full transform group-hover:scale-110 transition-transform duration-500`} />

                                        <div className="relative z-10">
                                            <div className={`w-14 h-14 rounded-xl ${category.color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                                <category.icon className={`w-7 h-7 ${category.textColor}`} />
                                            </div>

                                            <h3 className="text-2xl font-bold text-stone-900 mb-3 group-hover:text-stone-700 transition-colors">
                                                {category.title}
                                            </h3>

                                            <p className="text-stone-600 mb-6 leading-relaxed">
                                                {category.description}
                                            </p>

                                            <div className="flex items-center justify-between mt-auto">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 bg-stone-100 px-2 py-1 rounded-md">
                                                    {category.stats}
                                                </span>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-stone-50 group-hover:${category.textColor} transition-colors`}>
                                                    <ArrowRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* RECENT ACTIVITY / TRENDING (Placeholder for now) */}
            <section className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                            <Star className="text-boun-gold" fill="currentColor" />
                            Gündemdekiler
                        </h2>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 text-center text-stone-500">
                        <p>Henüz yeni bir aktivite yok. İlk tartışmayı başlatan sen ol!</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Forum;
