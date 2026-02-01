import React, { useState } from 'react';
import { Search, FolderOpen, Calendar, FileType, BookOpen, Filter, X, Archive as ArchiveIcon } from 'lucide-react';
import ArchiveList from './ArchiveList';
import TimelineView from './TimelineView';
import { cn } from '../../lib/utils';
import { motion as m, AnimatePresence, LayoutGroup } from 'framer-motion';

const motion = m as any;

type ViewMode = 'list' | 'timeline';

const Archive: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSpecialArchive, setSelectedSpecialArchive] = useState<string | null>(null);

  const handleSelectionMobile = () => {
    // Only close sidebar on mobile when a selection is made
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setSelectedSpecialArchive(null);
    setViewMode('list');
    handleSelectionMobile();
  };

  const handleSpecialArchiveClick = (archiveName: string) => {
    setSelectedSpecialArchive(archiveName);
    setViewMode('timeline');
    handleSelectionMobile();
  };

  const clearSpecialArchive = () => {
    setSelectedSpecialArchive(null);
    setViewMode('list');
    setActiveFilter('all');
    handleSelectionMobile();
  };

  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden flex flex-col">
      
      {/* Header Area */}
      <div className="bg-stone-100 border-b border-stone-200 px-4 py-6 md:px-8 shadow-sm z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button 
                  onClick={() => setSidebarOpen(!isSidebarOpen)}
                  className="p-2 md:hidden bg-stone-200 rounded-md text-stone-700 hover:bg-stone-300 transition-colors"
                >
                    <Filter size={20} />
                </button>
                
                {/* KH Square Logo - font-sans used for thicker lines */}
                <div className="w-12 h-12 bg-stone-800 text-boun-gold rounded flex items-center justify-center font-sans font-bold text-xl border-2 border-boun-gold shrink-0">
                    KH
                </div>

                <div className="hidden sm:block">
                  <h1 className="font-serif text-2xl md:text-3xl text-stone-900 leading-none">Kolektif Hamlin</h1>
                  <p className="text-stone-500 font-sans text-xs md:text-sm">Öğrenci Hafıza Merkezi</p>
                </div>
            </div>
            
            <div className="w-full md:w-1/3 relative">
                <input 
                  type="text" 
                  placeholder="Belge veya tarihçe ara..." 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-stone-300 rounded-md shadow-inner focus:ring-2 focus:ring-boun-blue focus:border-transparent outline-none font-serif text-sm"
                />
                <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
            </div>
        </div>
      </div>

      <LayoutGroup>
        <div className="flex flex-1 relative max-w-7xl mx-auto w-full">
            
            {/* Sidebar Backdrop (Mobile Only) */}
            <AnimatePresence>
            {isSidebarOpen && (
                <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-stone-900/50 z-20 md:hidden"
                style={{ willChange: 'opacity' }}
                />
            )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside 
                layout
                className={cn(
                    "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-stone-200 overflow-y-auto",
                    "md:static md:block md:bg-transparent md:border-r-0 md:h-auto" // Desktop styles
                )}
                // Mobile animation logic handled via variants or animate prop based on isSidebarOpen + media query check
                // However, simpler is to control the "x" value based on state and window width.
                // Since Tailwind controls visibility on desktop (md:static), we mainly animate for mobile here.
                animate={{ 
                    x: (isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) ? 0 : "-100%" 
                }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                style={{ willChange: 'transform' }}
            >
            <div className="p-4 md:p-6 space-y-6">
                <div className="flex justify-between items-center md:hidden mb-4">
                    <span className="font-serif font-bold text-lg">Filtreler</span>
                    <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
                </div>

                {/* Reset Button */}
                {(selectedSpecialArchive || activeFilter !== 'all') && (
                    <button 
                    onClick={clearSpecialArchive}
                    className="w-full py-2 bg-boun-red text-white text-sm font-bold rounded shadow-md hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={14} /> Filtreleri Temizle
                    </button>
                )}
                
                {/* 1. Kategoriler */}
                <div className="space-y-2">
                <h3 className="font-serif font-bold text-stone-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <FolderOpen size={16} /> Kategoriler
                </h3>
                <ul className="space-y-1 text-sm font-sans">
                    {['ÖTK Belgeleri', 'Ders Notları', 'Kulüp Yayınları', 'Resmi Tutanaklar'].map(cat => (
                    <li key={cat}>
                        <button 
                        onClick={() => handleFilterClick(cat)}
                        className={cn(
                            "w-full text-left px-3 py-2 rounded transition-colors",
                            activeFilter === cat 
                            ? "bg-boun-blue text-white font-medium shadow-md" 
                            : "text-stone-600 hover:bg-stone-100"
                        )}
                        >
                        {cat}
                        </button>
                    </li>
                    ))}
                </ul>
                </div>

                {/* 2. Dosya Formatı */}
                <div className="space-y-2">
                <h3 className="font-serif font-bold text-stone-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <FileType size={16} /> Dosya Formatı
                </h3>
                <div className="flex flex-wrap gap-2">
                    {['PDF', 'DOCX', 'IMG', 'MP4'].map(type => (
                        <label key={type} className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer bg-stone-100 px-2 py-1 rounded hover:bg-stone-200">
                            <input type="checkbox" className="accent-boun-blue rounded" />
                            {type}
                        </label>
                    ))}
                </div>
                </div>

                {/* 3. Tarih Aralığı */}
                <div className="bg-white p-3 rounded-md border border-stone-200">
                <h3 className="font-serif font-bold text-stone-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Calendar size={16} /> Tarih Aralığı
                </h3>
                <input type="range" min="1990" max="2024" className="w-full accent-stone-800 h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between text-xs text-stone-500 mt-2 font-mono">
                    <span>1990</span>
                    <span>2024</span>
                </div>
                </div>

                {/* 4. Özel Arşivler */}
                <div className="bg-stone-800 text-stone-100 p-4 rounded-md shadow-lg bg-stone-texture">
                <h3 className="font-serif font-bold text-boun-gold mb-3 flex items-center gap-2 border-b border-stone-600 pb-2">
                    <BookOpen size={16} /> Özel Arşivler
                </h3>
                <ul className="space-y-2 text-sm">
                    {['Direniş Arşivi', 'Üniversite Tarihi', 'Kulüpler Arşivi'].map((archive) => (
                    <li key={archive}>
                        <button 
                        onClick={() => handleSpecialArchiveClick(archive)}
                        className={cn(
                            "w-full text-left px-3 py-2 rounded border border-stone-600 hover:bg-stone-700 transition-colors flex items-center justify-between group",
                            selectedSpecialArchive === archive ? "bg-boun-red border-boun-red text-white" : "text-stone-300"
                        )}
                        >
                        {archive}
                        {selectedSpecialArchive === archive && <ArchiveIcon size={14} />}
                        </button>
                    </li>
                    ))}
                </ul>
                </div>

            </div>
            </motion.aside>

            {/* Main Content Area */}
            <motion.main 
                layout 
                className="flex-1 p-4 md:p-8 transition-all duration-300 ease-in-out w-full min-w-0"
            >
            <AnimatePresence mode="wait">
                <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                >
                    {/* Title for selected section */}
                    <div className="mb-6 flex items-center gap-3">
                        <div className="h-8 w-1 bg-boun-gold"></div>
                        <h2 className="font-serif text-2xl text-stone-800">
                            {selectedSpecialArchive ? selectedSpecialArchive : "Tüm Belgeler"}
                        </h2>
                        {selectedSpecialArchive && (
                            <span className="px-3 py-1 bg-boun-red/10 text-boun-red text-xs font-bold rounded-full">
                                Zaman Çizelgesi Görünümü
                            </span>
                        )}
                    </div>

                    {viewMode === 'list' ? <ArchiveList /> : <TimelineView />}
                </motion.div>
            </AnimatePresence>
            </motion.main>
        </div>
      </LayoutGroup>
    </div>
  );
};

export default Archive;