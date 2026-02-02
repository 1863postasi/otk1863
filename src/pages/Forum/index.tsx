import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, MessageSquare, Store } from 'lucide-react';

const ForumLobby: React.FC = () => {
    const sections = [
        {
            id: 'akademik',
            title: 'Akademik Değerlendirme',
            description: 'Dersleri ve hocaları değerlendir',
            icon: BookOpen,
            path: '/forum/akademik',
            gradient: 'from-blue-500/10 to-blue-600/5',
            iconColor: 'text-blue-600',
            hoverBorder: 'hover:border-blue-500/50',
        },
        {
            id: 'kulupler',
            title: 'Kulüp & Etkinlikler',
            description: 'Kulüpleri keşfet ve yorumla',
            icon: Users,
            path: '/forum/kulupler',
            gradient: 'from-purple-500/10 to-purple-600/5',
            iconColor: 'text-purple-600',
            hoverBorder: 'hover:border-purple-500/50',
        },
        {
            id: 'topluluk',
            title: 'Topluluk & Tartışma',
            description: 'Kampüs gündemini takip et',
            icon: MessageSquare,
            path: '/forum/topluluk',
            gradient: 'from-green-500/10 to-green-600/5',
            iconColor: 'text-green-600',
            hoverBorder: 'hover:border-green-500/50',
        },
        {
            id: 'pazar',
            title: 'Pazar Yeri',
            description: 'Al, sat ve kirala',
            icon: Store,
            path: '/forum/pazar-yeri',
            gradient: 'from-amber-500/10 to-amber-600/5',
            iconColor: 'text-amber-600',
            hoverBorder: 'hover:border-amber-500/50',
        },
    ];

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Main Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {sections.map((section, index) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                to={section.path}
                                className={`group block bg-white rounded-2xl border-2 border-stone-200 ${section.hoverBorder} hover:shadow-xl transition-all duration-300 overflow-hidden h-full`}
                            >
                                {/* Card Content */}
                                <div className={`bg-gradient-to-br ${section.gradient} p-8 h-full flex flex-col items-center justify-center text-center relative`}>

                                    {/* Decorative Background Element */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

                                    {/* Icon */}
                                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                                        <section.icon className={`w-8 h-8 md:w-10 md:h-10 ${section.iconColor}`} />
                                    </div>

                                    {/* Text */}
                                    <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-2 relative z-10">
                                        {section.title}
                                    </h2>
                                    <p className="text-sm md:text-base text-stone-600 relative z-10">
                                        {section.description}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ForumLobby;
