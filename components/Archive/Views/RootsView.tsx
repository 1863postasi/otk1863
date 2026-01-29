import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Dices, Quote, Image as ImageIcon, Scroll, X, Calendar, MapPin, Tag, BookOpen, ChevronLeft, ChevronRight, Youtube, Eye, Link as LinkIcon, Film, Bookmark } from 'lucide-react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { createPortal } from 'react-dom';
import * as router from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const motion = m as any;
const { useSearchParams } = router;

// --- TYPES ---

interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  year: string;
  source: string;
  images?: string[]; // Can contain video URLs from R2 as well
  youtubeUrl?: string;
  externalUrl?: string;
  tags?: string[];
  createdAt?: any;
}

// --- COMPONENT ---

interface ViewProps {
  onBack: () => void;
}

const RootsView: React.FC<ViewProps> = ({ onBack }) => {
  const { userProfile, toggleBookmark } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('Tümü');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Check URL params for saved filter
  useEffect(() => {
      if (searchParams.get('saved') === 'true') {
          setShowSavedOnly(true);
      }
  }, [searchParams]);

  // Synced with Admin Panel Categories
  const filters = [
      'Tümü', 
      'Kampüs Anıları', 
      'Efsane', 
      'Portreler & Simalar', 
      'Mekan & Manzara', 
      'Objeler & Yadigarlar', 
      'Gelenekler', 
      'Alıntılar',
      'Basın & Medya',
      'Tarihi Anlar'
  ];

  // Fetch Data
  useEffect(() => {
      const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Story[];
          setStories(data);
          setLoading(false);
      });
      return () => unsubscribe();
  }, []);

  // Deep Link Logic (Open story from URL)
  useEffect(() => {
      const storyIdFromUrl = searchParams.get('storyId');
      if (storyIdFromUrl && stories.length > 0) {
          const targetStory = stories.find(s => s.id === storyIdFromUrl);
          if (targetStory) {
              setSelectedStory(targetStory);
              // Clean URL without refreshing
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('storyId');
              // We replace history to keep back button functional but clean current state
              // We won't force URL change to avoid re-renders, just set state.
          }
      }
  }, [stories, searchParams]);

  // Filter Logic
  const filteredStories = useMemo(() => {
    let result = stories;
    
    // 1. Saved Filter
    if (showSavedOnly) {
        const savedIds = userProfile?.savedRootIds || [];
        result = result.filter(s => savedIds.includes(s.id));
    }

    // 2. Category Filter
    if (activeFilter !== 'Tümü') {
        result = result.filter(story => story.category === activeFilter);
    }
    
    return result;
  }, [stories, activeFilter, showSavedOnly, userProfile?.savedRootIds]);

  // Recommendation Engine
  const recommendedStories = useMemo(() => {
      if (!selectedStory) return [];
      const related = stories.filter(s => 
          s.id !== selectedStory.id && 
          s.tags?.some(tag => selectedStory.tags?.includes(tag))
      );
      if (related.length < 3) {
          const others = stories.filter(s => s.id !== selectedStory.id && !related.includes(s));
          return [...related, ...others].slice(0, 4);
      }
      return related.slice(0, 4);
  }, [selectedStory, stories]);

  // Image Gallery Logic
  const handleNextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!selectedStory?.images) return;
      setActiveImageIndex((prev) => (prev + 1) % selectedStory.images!.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!selectedStory?.images) return;
      setActiveImageIndex((prev) => (prev - 1 + selectedStory.images!.length) % selectedStory.images!.length);
  };

  const handleRandomStory = () => {
    if (stories.length > 0) {
        const random = stories[Math.floor(Math.random() * stories.length)];
        setSelectedStory(random);
        setActiveImageIndex(0);
    }
  };

  const openStory = (story: Story) => {
      setSelectedStory(story);
      setActiveImageIndex(0);
  }

  // --- Helper: SAFE URL & EMBED ---

  const ensureAbsoluteUrl = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
      }
      return `https://${url}`;
  };

  const getYouTubeEmbedUrl = (url: string) => {
      if (!url) return null;
      // Strict Regex to capture ID only from valid YouTube URLs
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=0` : null;
  };

  // Determine if current slide is a video file
  const isCurrentSlideVideo = () => {
      if (!selectedStory?.images || selectedStory.images.length === 0) return false;
      const url = selectedStory.images[activeImageIndex];
      return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
  };

  return (
    <div className="min-h-full bg-[#f5f5f4] text-stone-900 font-sans relative pb-20">
       
       {/* 1. HEADER & NAVIGATION */}
       <div className="sticky top-0 z-40 bg-[#f5f5f4]/95 backdrop-blur-md border-b border-stone-200 px-4 py-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-stone-600 hover:text-boun-red transition-colors font-serif font-bold text-sm"
            >
              <ArrowLeft size={18} /> <span className="hidden sm:inline">Lobiye Dön</span>
            </button>
            
            <div className="flex items-center gap-2 overflow-x-auto max-w-[60%] no-scrollbar md:max-w-none">
                <button
                    onClick={() => setShowSavedOnly(!showSavedOnly)}
                    className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-1",
                        showSavedOnly 
                            ? "bg-boun-gold text-white border-boun-gold" 
                            : "bg-white text-stone-500 border-stone-300 hover:border-stone-500"
                    )}
                >
                    <Bookmark size={12} fill={showSavedOnly ? "currentColor" : "none"} />
                    {showSavedOnly ? "Sadece Kaydedilenler" : "Kaydedilenler"}
                </button>
                <div className="w-px h-4 bg-stone-300 mx-1"></div>
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                            activeFilter === filter 
                                ? "bg-stone-800 text-stone-100 border-stone-800" 
                                : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
                        )}
                    >
                        {filter}
                    </button>
                ))}
            </div>
       </div>

       {/* 2. HERO SECTION */}
       <div className="px-4 pt-6 pb-6 max-w-7xl mx-auto flex justify-end">
            <motion.button
                whileTap={{ scale: 0.9, rotate: 180 }}
                onClick={handleRandomStory}
                className="flex items-center gap-2 text-stone-500 hover:text-amber-700 transition-colors text-sm font-bold group bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm"
            >
                <Dices size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>Rastgele Bir Anı</span>
            </motion.button>
       </div>

       {/* 3. MASONRY GRID */}
       <div className="px-4 max-w-7xl mx-auto">
           {loading ? (
               <div className="text-center py-20 text-stone-400 font-serif italic">Arşiv taranıyor...</div>
           ) : filteredStories.length === 0 ? (
               <div className="text-center py-20 text-stone-400 font-serif italic">Bu kategoride henüz hikaye yok.</div>
           ) : (
               <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                   {filteredStories.map((story, idx) => {
                       const youtubeEmbed = getYouTubeEmbedUrl(story.youtubeUrl || '');
                       const hasMedia = story.images && story.images.length > 0;
                       const isVideoFile = hasMedia && (story.images![0].endsWith('.mp4') || story.images![0].endsWith('.webm'));
                       const isSaved = userProfile?.savedRootIds?.includes(story.id);

                       return (
                       <motion.div
                           key={story.id}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.05 }}
                           whileHover={{ y: -4 }}
                           onClick={() => openStory(story)}
                           className="break-inside-avoid bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group relative"
                       >
                           {/* Media Thumbnail */}
                           <div className="relative bg-stone-100 overflow-hidden">
                               {hasMedia ? (
                                   isVideoFile ? (
                                       <div className="aspect-video bg-black flex items-center justify-center text-white">
                                           <Film size={32} />
                                       </div>
                                   ) : (
                                       <img src={story.images![0]} alt={story.title} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                   )
                               ) : youtubeEmbed ? (
                                   <div className="aspect-video bg-black flex items-center justify-center text-white relative">
                                       <img 
                                            src={`https://img.youtube.com/vi/${story.youtubeUrl?.split('v=')[1] || story.youtubeUrl?.split('/').pop()}/0.jpg`} 
                                            className="w-full h-full object-cover opacity-60" 
                                       />
                                       <Youtube size={32} className="absolute z-10" />
                                   </div>
                               ) : (
                                   <div className="aspect-square flex items-center justify-center text-stone-300 bg-[#fdfbf7]">
                                       <Quote size={40} />
                                   </div>
                               )}
                               
                               <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-stone-800 border border-stone-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                   {story.category}
                               </div>
                               
                               {/* Quick Bookmark Indicator */}
                               {isSaved && (
                                   <div className="absolute top-2 right-2 text-boun-gold bg-black/50 p-1 rounded-full">
                                       <Bookmark size={12} fill="currentColor" />
                                   </div>
                               )}
                           </div>

                           {/* Content Teaser */}
                           <div className="p-4">
                               <div className="flex items-baseline justify-between mb-1">
                                   <span className="text-xs font-bold text-amber-700">{story.year}</span>
                               </div>
                               <h3 className="font-serif font-bold text-stone-900 leading-tight mb-2 group-hover:text-amber-800 transition-colors line-clamp-2">
                                   {story.title}
                               </h3>
                               <p className="font-sans text-xs text-stone-500 line-clamp-3 leading-relaxed">
                                   {story.content}
                               </p>
                           </div>
                       </motion.div>
                   )})}
               </div>
           )}
       </div>

       {/* 4. LIGHTBOX MODAL */}
       {createPortal(
           <AnimatePresence>
               {selectedStory && (
                   <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 bg-stone-900/80 backdrop-blur-md">
                       <motion.div 
                           initial={{ opacity: 0 }} 
                           animate={{ opacity: 1 }} 
                           exit={{ opacity: 0 }} 
                           onClick={() => setSelectedStory(null)}
                           className="absolute inset-0"
                       />
                       
                       <motion.div
                           layoutId={selectedStory.id}
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                           transition={{ type: "spring", damping: 25, stiffness: 300 }}
                           className="relative w-full max-w-6xl h-full md:h-[85vh] bg-[#fdfbf7] md:rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
                           onClick={(e) => e.stopPropagation()}
                       >
                           {/* CLOSE BUTTON */}
                           <button 
                               onClick={() => setSelectedStory(null)}
                               className="absolute top-4 right-4 z-50 p-2 bg-white/50 hover:bg-white rounded-full text-stone-800 transition-colors backdrop-blur-sm"
                           >
                               <X size={20} />
                           </button>

                           {/* LEFT: MEDIA (Black Bg) */}
                           <div className="w-full md:w-3/5 bg-black flex items-center justify-center relative overflow-hidden group shrink-0 h-[40vh] md:h-full">
                               {/* 1. YouTube */}
                               {selectedStory.youtubeUrl && getYouTubeEmbedUrl(selectedStory.youtubeUrl) ? (
                                   <iframe 
                                       src={getYouTubeEmbedUrl(selectedStory.youtubeUrl)!} 
                                       className="w-full h-full" 
                                       allowFullScreen 
                                       title="Video"
                                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                   />
                               ) : selectedStory.images && selectedStory.images.length > 0 ? (
                                   /* 2. R2 Files (Images/Videos) */
                                   <div className="relative w-full h-full flex items-center justify-center">
                                       {isCurrentSlideVideo() ? (
                                            <video 
                                                src={selectedStory.images![activeImageIndex]} 
                                                className="w-full h-full object-contain" 
                                                controls 
                                                autoPlay 
                                            />
                                       ) : (
                                            <img 
                                                src={selectedStory.images![activeImageIndex]} 
                                                alt={selectedStory.title} 
                                                className="w-full h-full object-contain" 
                                            />
                                       )}
                                       
                                       {/* Navigation Arrows */}
                                       {selectedStory.images!.length > 1 && (
                                           <>
                                               <button onClick={handlePrevImage} className="absolute left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"><ChevronLeft size={24}/></button>
                                               <button onClick={handleNextImage} className="absolute right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"><ChevronRight size={24}/></button>
                                               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-xs font-bold">
                                                   {activeImageIndex + 1} / {selectedStory.images!.length}
                                               </div>
                                           </>
                                       )}
                                   </div>
                               ) : (
                                   <div className="text-white/50 flex flex-col items-center gap-2">
                                       <ImageIcon size={48} />
                                       <span className="text-sm">Görsel Yok</span>
                                   </div>
                               )}
                           </div>

                           {/* RIGHT: CONTENT (Scrollable) */}
                           <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[#fdfbf7]">
                               <div className="mb-6 border-b border-stone-200 pb-6">
                                   <div className="flex justify-between items-start">
                                       <div className="flex items-center gap-2 mb-2">
                                           <span className="bg-stone-200 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{selectedStory.category}</span>
                                           <span className="text-xs font-bold text-amber-700 flex items-center gap-1"><Calendar size={12}/> {selectedStory.year}</span>
                                       </div>
                                       
                                       {/* BOOKMARK BUTTON */}
                                       <button 
                                            onClick={() => toggleBookmark('story', selectedStory.id)}
                                            className="text-stone-400 hover:text-boun-gold transition-colors"
                                            title="Kaydet"
                                       >
                                           <Bookmark 
                                                size={24} 
                                                fill={userProfile?.savedRootIds?.includes(selectedStory.id) ? "currentColor" : "none"} 
                                                className={userProfile?.savedRootIds?.includes(selectedStory.id) ? "text-boun-gold" : ""}
                                           />
                                       </button>
                                   </div>

                                   <h2 className="font-serif text-3xl font-bold text-stone-900 leading-tight mb-4">{selectedStory.title}</h2>
                                   
                                   {/* Source & External Link */}
                                   <div className="flex flex-wrap gap-4 text-xs text-stone-500 font-sans">
                                       <div className="flex items-center gap-1">
                                           <span className="font-bold text-stone-700">Kaynak:</span> {selectedStory.source}
                                       </div>
                                       {selectedStory.externalUrl && (
                                           <a href={ensureAbsoluteUrl(selectedStory.externalUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline font-bold">
                                               <LinkIcon size={12} /> Bağlantıya Git
                                           </a>
                                       )}
                                   </div>
                               </div>

                               <div className="prose prose-stone prose-sm max-w-none text-stone-800 leading-relaxed whitespace-pre-wrap font-serif">
                                   {selectedStory.content}
                               </div>

                               {/* Tags */}
                               {selectedStory.tags && selectedStory.tags.length > 0 && (
                                   <div className="mt-8 pt-6 border-t border-stone-200">
                                       <div className="flex flex-wrap gap-2">
                                           {selectedStory.tags.map((tag, i) => (
                                               <span key={i} className="text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded border border-stone-200 flex items-center gap-1">
                                                   <Tag size={10} /> {tag}
                                               </span>
                                           ))}
                                       </div>
                                   </div>
                               )}
                           </div>

                       </motion.div>
                   </div>
               )}
           </AnimatePresence>,
           document.body
       )}

    </div>
  );
};

export default RootsView;