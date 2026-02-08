import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Search, Lock, User, LogOut, Settings, LogIn, UserPlus, Mail, Briefcase, Gamepad2, Info, Home, HardHat } from 'lucide-react';
import * as router from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion as m, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { SPRINGS } from '../../lib/animations';

const motion = m as any;
const { Link, useLocation } = router;

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { currentUser, userProfile, logout } = useAuth();

  const navLinks = [
    { name: 'Ana Sayfa', path: '/', status: 'active' },
    { name: 'Arşiv', path: '/arsiv', status: 'active' },
    { name: 'ÖTK', path: '/otk', status: 'active' },
    // TEMPORARY: Boundle disabled for maintenance (2026-02-08)
    // { name: 'Boundle', path: '/boundle', status: 'active' }, 
    { name: 'Boundle', path: '/boundle', status: 'construction' },
    { name: 'Forum', path: '/forum', status: 'active' },
    { name: 'Yayınlar', path: '/yayinlar', status: 'active' },
  ];

  // Check if user manages any clubs
  const isManager = userProfile?.clubRoles && Object.keys(userProfile.clubRoles).length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleContactClick = () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSdQOF99htAY91ThqWybYP8i4a5NeOiU8yA3YgJieTEWKNHVYw/viewform?usp=dialog', '_blank');
  };

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  return (
    <header className="fixed md:sticky top-0 z-50 w-full md:bg-stone-100/90 md:backdrop-blur-md md:border-b md:border-stone-300 md:shadow-sm font-serif h-14 transition-all pointer-events-none md:pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">

        {/* MAIN HEADER CONTAINER */}
        <div className="flex justify-between items-center h-full w-full">

          {/* 1. LOGO AREA (Hidden on Mobile) */}
          <div className="hidden md:flex items-center justify-start min-w-0">
            <Link to="/" className="flex items-center gap-2 md:gap-4 pointer-events-auto">
              <img
                src="https://cdn.1863postasi.org/bg/otk-logo.png"
                alt="ÖTK Logo"
                className="md:h-9 w-auto object-contain flex-shrink-0"
              />
              <div className="h-4 md:h-6 w-px bg-stone-300"></div>
              <img
                src="https://cdn.1863postasi.org/bg/otk-arsiv.png"
                alt="ÖTK Arşiv Logo"
                className="md:h-9 w-auto object-contain flex-shrink-0"
              />
            </Link>
          </div>

          {/* 2. DESKTOP NAVIGATION */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8 pointer-events-auto">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group flex items-center">
                {link.status === 'active' ? (
                  <Link
                    to={link.path}
                    className={cn(
                      "text-xs lg:text-sm font-medium transition-colors duration-200 flex items-center gap-1.5",
                      location.pathname === link.path
                        ? "text-boun-blue border-b-2 border-boun-blue pb-0.5"
                        : "text-stone-600 hover:text-boun-blue"
                    )}
                  >
                    {link.name === 'Boundle' && <Gamepad2 size={14} className="text-boun-gold" />}
                    {link.name}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "text-xs lg:text-sm font-medium cursor-not-allowed flex items-center gap-1",
                      link.status === 'construction' ? "text-stone-400/70" : "text-stone-400"
                    )}
                    title={link.status === 'construction' ? "Bakımda" : "Erişim Kısıtlı"}
                  >
                    {link.name}
                    {link.status === 'construction' ? <HardHat size={12} className="text-orange-400" /> : <Lock size={10} />}
                  </span>
                )}
              </div>
            ))}
          </nav>

          {/* 4. ACTIONS / MENU */}
          <div className="flex flex-1 md:flex-none items-center justify-end gap-2 pointer-events-auto">

            {/* Desktop Actions (Search Removed) */}
            <div className="hidden md:flex items-center space-x-3">
              {/* DROPDOWN MENU */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-label={isDropdownOpen ? "Menüyü kapat" : "Menüyü aç"}
                  className="flex items-center gap-2 bg-stone-800 text-stone-100 px-3 py-1.5 rounded-md text-xs font-sans font-medium hover:bg-stone-700 transition-colors shadow-lg shadow-stone-400/50 focus:outline-none focus:ring-2 focus:ring-boun-blue"
                >
                  <span className="max-w-[100px] truncate">
                    {currentUser && userProfile ? userProfile.username : "Menü"}
                  </span>
                  <Settings size={14} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-stone-200 py-1 overflow-hidden"
                    >
                      {currentUser ? (
                        <>
                          <Link to="/profile" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2">
                            <User size={16} /> Profilim
                          </Link>
                          {/* Manager Link */}
                          {isManager && (
                            <Link to="/yonetim" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2 font-bold text-stone-800">
                              <Briefcase size={16} /> Kulüp Yönetimi
                            </Link>
                          )}
                          {/* Admin Link */}
                          {userProfile?.role === 'admin' && (
                            <Link to="/admin" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2 font-bold text-boun-blue">
                              <Lock size={16} /> Admin Paneli
                            </Link>
                          )}
                          <div className="border-t border-stone-100 my-1"></div>
                          <button onClick={handleContactClick} className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2">
                            <Mail size={16} /> Bize Ulaşın
                          </button>
                          {/* About Link (Logged In) */}
                          <Link to="/hakkinda" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2">
                            <Info size={16} /> Hakkında
                          </Link>

                          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-stone-100 mt-1">
                            <LogOut size={16} /> Oturumu Kapat
                          </button>
                        </>
                      ) : (
                        <>
                          <Link to="/auth/login" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2">
                            <LogIn size={16} /> Kampüse Gir
                          </Link>
                          <Link to="/auth/register" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2">
                            <UserPlus size={16} /> Topluluğa Katıl
                          </Link>
                          <div className="border-t border-stone-100 my-1"></div>
                          <button onClick={handleContactClick} className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2">
                            <Mail size={16} /> Bize Ulaşın
                          </button>
                          {/* About Link (Logged Out) */}
                          <Link to="/hakkinda" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2">
                            <Info size={16} /> Hakkında
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu Button (Top Right Floating) */}
            <div className="md:hidden flex w-full justify-between mt-2 px-2 absolute top-0 left-0 z-50 pointer-events-none">

              {/* HOME BUTTON (Top Left - New) */}
              <Link
                to="/"
                className="pointer-events-auto bg-white/90 backdrop-blur text-stone-800 p-2.5 rounded-full shadow-lg border border-stone-200 hover:bg-stone-100 focus:outline-none active:scale-95 transition-all"
              >
                <Home size={20} className="text-stone-800" />
              </Link>

              {/* SETTINGS BUTTON (Top Right - Existing) */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
                className="pointer-events-auto bg-white/90 backdrop-blur text-stone-800 p-2.5 rounded-full shadow-lg border border-stone-200 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-boun-blue active:scale-95 transition-all"
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                      <X size={20} />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                      <Settings size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown (Top Right Styled) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={SPRINGS.snappy}
            className="md:hidden absolute top-16 right-4 w-64 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden z-50 origin-top-right pointer-events-auto"
          >
            <div className="p-4 bg-stone-50 border-b border-stone-100">
              <div className="text-sm font-bold text-stone-900">{userProfile?.username || "Misafir"}</div>
              <div className="text-xs text-stone-500">{userProfile?.role === 'admin' ? 'Yönetici' : 'Üye'}</div>
            </div>

            <div className="px-2 py-2 space-y-1">
              {currentUser ? (
                <>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-3 text-sm font-medium">
                    <User size={18} className="text-stone-400" /> Profilim
                  </Link>
                  {isManager && (
                    <Link to="/yonetim" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-3 text-sm font-bold">
                      <Briefcase size={18} className="text-stone-400" /> Kulüp Yönetimi
                    </Link>
                  )}
                  {userProfile?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-boun-blue hover:bg-blue-50 rounded-lg flex items-center gap-3 text-sm font-bold">
                      <Lock size={18} /> Admin Paneli
                    </Link>
                  )}

                  {/* About Link (Mobile Logged In) */}
                  <Link to="/hakkinda" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-3 text-sm font-medium">
                    <Info size={18} className="text-stone-400" /> Hakkında
                  </Link>

                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3 text-sm font-medium border-t border-stone-100 mt-1">
                    <LogOut size={18} /> Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-3 text-sm font-medium">
                    <LogIn size={18} className="text-stone-400" /> Giriş Yap
                  </Link>
                  <Link to="/auth/register" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-3 text-sm font-medium">
                    <UserPlus size={18} className="text-stone-400" /> Kayıt Ol
                  </Link>
                </>
              )}

              <div className="border-t border-stone-100 my-1 pt-1"></div>
              <button onClick={handleContactClick} className="w-full text-left px-3 py-2 text-stone-500 hover:bg-stone-100 rounded-lg flex items-center gap-3 text-sm">
                <Mail size={18} /> İletişim
              </button>

              {/* About Link (Mobile Logged Out) */}
              {!currentUser && (
                <Link to="/hakkinda" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-stone-500 hover:bg-stone-100 rounded-lg flex items-center gap-3 text-sm">
                  <Info size={18} /> Hakkında
                </Link>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;