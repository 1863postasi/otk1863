import React, { useState } from 'react';
import * as router from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  HelpCircle,
  Users,
  Scroll,
  FolderOpen,
  GraduationCap,
  FileText,
  UserCircle,
  Briefcase,
  Settings,
  LogOut,
  ChevronRight,
  UserCog,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { auth } from '../../lib/firebase';

// --- IMPORT PANELS ---
import { AnnouncementsPanel } from './panels/AnnouncementsPanel';
import { LostItemsPanel } from './panels/LostItemsPanel';
import { ClubsPanel } from './panels/ClubsPanel';
import { ResistancePanel } from './panels/ResistancePanel';
import { OTKDocumentsPanel } from './panels/OTKDocumentsPanel';
import { AcademicPoolPanel } from './panels/AcademicPoolPanel';
import { OriginsPanel } from './panels/OriginsPanel';
import { OTKRepresentativesPanel } from './panels/OTKRepresentativesPanel';
import { OTKCommissionsPanel } from './panels/OTKCommissionsPanel';
import { UsersPanel } from './panels/UsersPanel';

const { useNavigate } = router;

// --- TYPES ---

type CategoryId =
  | 'announcement'
  | 'lost-found'
  | 'clubs'
  | 'resistance'
  | 'documents'
  | 'academic'
  | 'roots'
  | 'reps'
  | 'commissions'
  | 'users';

const CATEGORIES = [
  { id: 'announcement', label: 'Genel Duyuru', icon: Megaphone },
  { id: 'lost-found', label: 'Kayıp Eşya', icon: HelpCircle },
  { id: 'clubs', label: 'Kulüpler Arşivi', icon: Users },
  { id: 'resistance', label: 'Direniş Arşivi', icon: Scroll },
  { id: 'documents', label: 'ÖTK Belgeleri', icon: FolderOpen },
  { id: 'academic', label: 'Akademik Havuz', icon: GraduationCap },
  { id: 'roots', label: 'Kökenler (Hikaye)', icon: FileText },
  { id: 'reps', label: 'ÖTK Temsilci', icon: UserCircle },
  { id: 'commissions', label: 'ÖTK Komisyon', icon: Briefcase },
  { id: 'users', label: 'Kullanıcılar', icon: UserCog }, // New Panel
];

// --- MAIN DASHBOARD COMPONENT ---

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<CategoryId>('announcement');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close sidebar when active category changes on mobile
  const handleCategoryChange = (id: CategoryId) => {
    setActiveCategory(id);
    setSelectedItemId(null);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'announcement':
        return <AnnouncementsPanel />;
      case 'lost-found':
        return <LostItemsPanel />;
      case 'clubs':
        return <ClubsPanel setSelectedItemId={setSelectedItemId} />;
      case 'resistance':
        return <ResistancePanel />;
      case 'documents':
        return <OTKDocumentsPanel />;
      case 'academic':
        return <AcademicPoolPanel />;
      case 'roots':
        return <OriginsPanel />;
      case 'reps':
        return <OTKRepresentativesPanel />;
      case 'commissions':
        return <OTKCommissionsPanel />;
      case 'users':
        return <UsersPanel />;
      default: return <div className="p-8">Seçim Yapınız</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#efede6] overflow-hidden font-sans text-stone-900 relative">

      {/* MOBILE BACKDROP */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-stone-900 text-stone-100 flex flex-col shrink-0 border-r border-stone-800 transition-transform duration-300 md:static md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Area */}
        <div className="p-6 border-b border-stone-800 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <LayoutDashboard className="text-boun-gold" />
              1863 Panel
            </h1>
            <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest font-bold">İçerik Yönetim Sistemi</p>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-stone-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id as CategoryId)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 text-sm font-medium group",
                activeCategory === cat.id
                  ? "bg-stone-800 text-white shadow-md border-l-4 border-boun-gold"
                  : "text-stone-400 hover:text-stone-100 hover:bg-stone-800/50"
              )}
            >
              <cat.icon size={18} className={cn("group-hover:text-white transition-colors", activeCategory === cat.id ? "text-boun-gold" : "text-stone-500")} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-stone-400 hover:text-white transition-colors">
            <Settings size={16} /> Ayarlar
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-stone-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative w-full">
        {/* Top Bar (Contextual) */}
        <div className="sticky top-0 z-10 bg-[#efede6]/90 backdrop-blur-md border-b border-stone-200 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-2 text-sm font-mono text-stone-500">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1 -ml-1 text-stone-800 hover:bg-stone-200 rounded"
            >
              <Menu size={20} />
            </button>

            <span className="hidden md:inline">Admin</span>
            <ChevronRight size={14} className="hidden md:block" />
            <span className="uppercase text-stone-800 font-bold truncate max-w-[150px] md:max-w-none">{CATEGORIES.find(c => c.id === activeCategory)?.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-300 flex items-center justify-center text-xs font-bold text-stone-600">AD</div>
          </div>
        </div>

        {/* Dynamic Form Area */}
        <div className="p-4 md:p-8 pb-24 max-w-6xl mx-auto">
          {renderContent()}
        </div>

      </main>

    </div>
  );
};

export default Dashboard;