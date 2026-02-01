import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Search, Lock, User, LogOut, Settings, LogIn, UserPlus, Mail, Briefcase, Gamepad2 } from 'lucide-react';
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
    { name: 'Boundle', path: '/boundle', status: 'active' },
    { name: 'Forum', path: '#', status: 'passive' },
    { name: 'Yayınlar', path: '#', status: 'passive' },
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
    <header className="sticky top-0 z-50 w-full bg-stone-100/90 backdrop-blur-md border-b border-stone-300 shadow-sm font-serif h-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">

        {/* MAIN HEADER CONTAINER */}
        <div className="grid grid-cols-5 md:flex md:justify-between items-center h-full w-full">

          {/* 1. LOGO AREA */}
          <div className="col-span-3 flex items-center justify-start min-w-0">
            <Link to="/" className="flex items-center gap-2 md:gap-4">
              <img
                src="https://cdn.1863postasi.org/bg/otk-logo.png"
                alt="ÖTK Logo"
                className="h-6 md:h-9 w-auto object-contain flex-shrink-0"
              />
              <div className="h-4 md:h-6 w-px bg-stone-300"></div>
              <img
                src="https://cdn.1863postasi.org/bg/otk-arsiv.png"
                alt="ÖTK Arşiv Logo"
                className="h-6 md:h-9 w-auto object-contain flex-shrink-0"
              />
            </Link>
          </div>

          {/* 2. DESKTOP NAVIGATION */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
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
                  <span className="text-xs lg:text-sm font-medium text-stone-400 cursor-not-allowed flex items-center gap-1">
                    {link.name}
                    <Lock size={10} />
                  </span>
                )}
              </div>
            ))}
          </nav>

          {/* 3. SPACER */}
          <div className="col-span-1 md:hidden"></div>

          {/* 4. ACTIONS / MENU */}
          <div className="col-span-1 flex items-center justify-end gap-2">

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                aria-label="Arama yap"
                className="text-stone-600 hover:text-boun-blue transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-boun-blue rounded"
              >
                <Search size={18} aria-hidden="true" />
              </button>

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
                          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
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
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex justify-end">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
                className="text-stone-800 p-2 focus:outline-none focus:ring-2 focus:ring-boun-blue rounded"
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                      <X size={24} />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                      <Menu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            layout
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={SPRINGS.snappy}
            style={{ transformOrigin: 'top', willChange: 'transform, opacity' }}
            className="md:hidden bg-stone-100 border-t border-stone-200 overflow-hidden absolute w-full shadow-xl"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                link.status === 'active' ? (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-boun-blue hover:bg-stone-200"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <div key={link.name} className="flex items-center justify-between px-3 py-2 text-stone-400">
                    <span>{link.name}</span>
                    <Lock size={14} />
                  </div>
                )
              ))}

              <div className="border-t border-stone-200 my-2 pt-2">
                {currentUser ? (
                  <>
                    <div className="px-3 py-2 text-sm font-bold text-stone-500 uppercase tracking-wider">{userProfile?.username || "Kullanıcı"}</div>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-stone-700 hover:bg-stone-200 rounded flex items-center gap-2">
                      <User size={16} /> Profilim
                    </Link>
                    {isManager && (
                      <Link to="/yonetim" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-stone-700 hover:bg-stone-200 rounded flex items-center gap-2 font-bold">
                        <Briefcase size={16} /> Kulüp Yönetimi
                      </Link>
                    )}
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded flex items-center gap-2">
                      <LogOut size={16} /> Görüşürüz
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-stone-700 hover:bg-stone-200 rounded flex items-center gap-2">
                      <LogIn size={16} /> Kampüse Gir
                    </Link>
                    <Link to="/auth/register" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-stone-700 hover:bg-stone-200 rounded flex items-center gap-2">
                      <UserPlus size={16} /> Topluluğa Katıl
                    </Link>
                  </>
                )}
                <button onClick={handleContactClick} className="w-full mt-2 bg-stone-800 text-stone-100 px-4 py-2 rounded-md font-sans text-sm">
                  Bize Ulaşın
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;