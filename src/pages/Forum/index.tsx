import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Users, MessageCircle, ShoppingBag, ArrowRight } from 'lucide-react';

const ForumHub: React.FC = () => {
    const categories = [
        {
            id: 'academic',
            title: 'Akademik Değerlendirme',
            desc: 'Dersler ve hocalar hakkında şeffaf yorumlar.',
            icon: GraduationCap,
            color: 'bg-blue-50 text-blue-600',
            path: '/forum/akademik',
            delay: 0.1
        },
        {
            id: 'clubs',
            title: 'Kulüp ve Etkinlikler',
            desc: 'Kampüs hayatının kalbi burada atıyor.',
            icon: Users,
            color: 'bg-purple-50 text-purple-600',
            path: '/forum/kulupler',
            delay: 0.2
        },
        {
            id: 'community',
            title: 'Topluluk ve Tartışma',
            desc: 'Öğrenciler arası özgür fikir platformu.',
            icon: MessageCircle,
            color: 'bg-amber-50 text-amber-600',
            path: '/forum/topluluk',
            delay: 0.3
        },
        {
            id: 'marketplace',
            title: 'Pazar Yeri',
            desc: 'Öğrenciden öğrenciye güvenli alışveriş.',
            icon: ShoppingBag,
            color: 'bg-emerald-50 text-emerald-600',
            path: '/forum/pazar',
            delay: 0.4
        }
    ];

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-stone-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    {categories.map((cat) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: cat.delay, duration: 0.4 }}
                            className="group"
                        >
                            <Link
                                to={cat.path}
                                className="block h-full bg-white rounded-2xl border border-stone-100 p-6 md:p-8 hover:shadow-xl hover:border-boun-blue/20 transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1"
                            >
                                {/* Background Gradient Effect */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-stone-50 to-transparent rounded-bl-full opacity-50 group-hover:scale-150 transition-transform duration-500" />

                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3.5 rounded-xl ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                                            <cat.icon size={32} strokeWidth={1.5} />
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                                            <ArrowRight className="text-stone-300 group-hover:text-boun-blue" />
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl md:text-2xl font-bold text-stone-800 mb-2 group-hover:text-boun-blue transition-colors">
                                            {cat.title}
                                        </h2>
                                        <p className="text-stone-500 text-sm md:text-base leading-relaxed">
                                            {cat.desc}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ForumHub;
