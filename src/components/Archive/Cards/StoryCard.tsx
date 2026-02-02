import React, { memo } from 'react';
import { Film, Youtube, Quote, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

// --- TYPES (Duplicated locally to avoid circular deps or move to types file later) ---
interface Story {
    id: string;
    title: string;
    content: string;
    category: string;
    year: string;
    source: string;
    images?: string[];
    youtubeUrl?: string;
    externalUrl?: string;
    tags?: string[];
}

interface StoryCardProps {
    story: Story;
    isSaved: boolean;
    onClick: (story: Story) => void;
}

// Helper (moved from View)
const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=0` : null;
};

const StoryCard: React.FC<StoryCardProps> = memo(({ story, isSaved, onClick }) => {
    const youtubeEmbed = getYouTubeEmbedUrl(story.youtubeUrl || '');
    const hasMedia = story.images && story.images.length > 0;
    const isVideoFile = hasMedia && (story.images![0].endsWith('.mp4') || story.images![0].endsWith('.webm'));

    return (
        <motion.div
            layoutId={`card-${story.id}`}
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => onClick(story)}
            className="break-inside-avoid bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group relative ring-1 ring-stone-900/5"
        >
            {/* Media Thumbnail */}
            <div className="relative bg-stone-100 overflow-hidden">
                {hasMedia ? (
                    isVideoFile ? (
                        <div className="aspect-video bg-black flex items-center justify-center text-white">
                            <Film size={32} />
                        </div>
                    ) : (
                        <img src={story.images![0]} alt={story.title} className="w-full h-auto object-cover" loading="lazy" />
                    )
                ) : youtubeEmbed ? (
                    <div className="aspect-video bg-black relative">
                        <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center pointer-events-none z-10">
                            <Youtube size={32} className="text-white" />
                        </div>
                        <img
                            src={`https://img.youtube.com/vi/${story.youtubeUrl?.split('v=')[1] || story.youtubeUrl?.split('/').pop()}/0.jpg`}
                            className="w-full h-full object-cover opacity-60"
                        />
                    </div>
                ) : (
                    <div className="aspect-[4/3] flex items-center justify-center text-stone-300 bg-[#fdfbf7] pattern-paper">
                        <Quote size={32} className="opacity-20 text-stone-900" />
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider text-stone-800 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    {story.category}
                </div>

                {isSaved && (
                    <div className="absolute top-2 right-2 text-boun-gold bg-black/80 p-1.5 rounded-full shadow-lg">
                        <Bookmark size={10} fill="currentColor" />
                    </div>
                )}
            </div>

            {/* Content Teaser (Pinterest Style) */}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{story.year}</span>
                </div>
                <h3 className="font-serif font-bold text-stone-900 leading-snug mb-2 text-sm md:text-base group-hover:text-amber-800 transition-colors">
                    {story.title}
                </h3>
                <p className="font-sans text-xs text-stone-500 line-clamp-2 leading-relaxed opacity-80">
                    {story.content}
                </p>

                {/* Tags preview */}
                {story.tags && story.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1 opacity-60">
                        {story.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-[9px] text-stone-500 bg-stone-100 px-1 rounded">#{t}</span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
});

export default StoryCard;
