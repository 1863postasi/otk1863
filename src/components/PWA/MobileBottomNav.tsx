import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Archive, Users, BookOpen, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const MobileBottomNav: React.FC = () => {
    const navItems = [
        { name: 'ÖTK', path: '/otk', icon: Users, disabled: false },
        { name: 'Arşiv', path: '/arsiv', icon: Archive, disabled: false },

        { name: 'Forum', path: '/forum', icon: MessageCircle, disabled: false },
        { name: 'Yayınlar', path: '/yayinlar', icon: BookOpen, disabled: false },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
            {/* Shortened Background Strip */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" />

            {/* Icons Container */}
            <div className="relative z-10 flex justify-around items-end h-[5.5rem] pb-3 pointer-events-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    if (item.disabled) {
                        return (
                            <div key={item.name} className="flex flex-col items-center justify-end w-full h-full pb-1 text-stone-300">
                                <div className="p-2 rounded-full bg-white/50">
                                    <Icon size={24} strokeWidth={2} />
                                </div>
                                <span className="text-[10px] font-semibold mt-1">{item.name}</span>
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex flex-col items-center justify-end w-full h-full pb-1 transition-colors duration-300 relative group",
                                isActive ? "text-boun-blue" : "text-stone-600 hover:text-stone-800",
                                item.isCenter && "justify-end pb-0" // Center item specific align
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Content */}
                                    <div className={cn(
                                        "flex flex-col items-center transition-transform duration-300 will-change-transform",
                                        isActive ? "-translate-y-3" : "translate-y-0", // Active item pops up slightly
                                        item.isCenter && "mb-2"
                                    )}>
                                        {item.isCenter ? (
                                            /* Boundle Button (Floating) */
                                            <div className="flex flex-col items-center gap-1">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 border will-change-transform",
                                                    isActive
                                                        ? "bg-boun-blue text-white border-boun-blue scale-110 shadow-boun-blue/30"
                                                        : "bg-white text-stone-600 border-stone-200"
                                                )}>
                                                    <Icon size={26} fill={isActive ? "currentColor" : "none"} strokeWidth={2} />
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-semibold transition-opacity duration-300",
                                                    isActive ? "text-boun-blue" : "text-stone-600"
                                                )}>
                                                    {item.name}
                                                </span>
                                            </div>
                                        ) : (
                                            /* Standard Icon */
                                            <>
                                                <div className={cn(
                                                    "p-2 rounded-full transition-all duration-300 border shadow-sm",
                                                    // Always white bg for visibility against image backgrounds
                                                    // Active: blue border, Inactive: stone border (subtle)
                                                    isActive
                                                        ? "bg-white border-stone-200 shadow-md scale-110"
                                                        : "bg-white border-stone-200/50 hover:border-stone-300"
                                                )}>
                                                    <Icon size={22} fill={isActive ? "currentColor" : "none"} strokeWidth={2} />
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] mt-1 transition-all duration-300",
                                                    isActive ? "font-bold" : "font-semibold"
                                                )}>
                                                    {item.name}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
