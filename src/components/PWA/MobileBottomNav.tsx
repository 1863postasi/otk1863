import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Archive, Gamepad2, Users, BookOpen, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const MobileBottomNav: React.FC = () => {
    const navItems = [
        { name: 'ÖTK', path: '/otk', icon: Users, disabled: false },
        { name: 'Arşiv', path: '/arsiv', icon: Archive, disabled: false },
        { name: 'Boundle', path: '/boundle', icon: Gamepad2, isCenter: true, disabled: false },
        { name: 'Forum', path: '/forum', icon: MessageCircle, disabled: false },
        { name: 'Yayınlar', path: '/yayinlar', icon: BookOpen, disabled: false },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
            {/* Shortened Background Strip */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" />

            {/* Icons Container */}
            <div className="relative z-10 flex justify-around items-end h-20 pb-2 pointer-events-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    if (item.disabled) {
                        return (
                            <div key={item.name} className="flex flex-col items-center justify-end w-full h-full pb-1 text-stone-300">
                                <Icon size={24} strokeWidth={1.5} />
                                <span className="text-[10px] font-medium mt-1">{item.name}</span>
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex flex-col items-center justify-end w-full h-full pb-1 transition-all duration-300 relative group",
                                isActive ? "text-boun-blue" : "text-stone-500 hover:text-stone-700",
                                item.isCenter && "justify-end pb-0" // Center item specific align
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Content */}
                                    <div className={cn(
                                        "flex flex-col items-center transition-transform duration-300",
                                        isActive ? "-translate-y-2" : "translate-y-0", // Active item pops up slightly
                                        item.isCenter && "mb-1"
                                    )}>
                                        {item.isCenter ? (
                                            /* Boundle Button (Floating) */
                                            <div className="flex flex-col items-center gap-1">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border",
                                                    isActive
                                                        ? "bg-boun-blue text-white border-boun-blue scale-110 shadow-boun-blue/30"
                                                        : "bg-white text-stone-600 border-stone-200"
                                                )}>
                                                    <Icon size={24} fill={isActive ? "currentColor" : "none"} strokeWidth={1.5} />
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-medium transition-all",
                                                    isActive ? "font-bold text-boun-blue" : "text-stone-500"
                                                )}>
                                                    {item.name}
                                                </span>
                                            </div>
                                        ) : (
                                            /* Standard Icon */
                                            <>
                                                <div className={cn(
                                                    "p-1 rounded-full transition-all duration-300 bg-white/0 border border-transparent",
                                                    isActive && "bg-white border-stone-100 shadow-sm" // Active state gets a subtle background circle backing
                                                )}>
                                                    <Icon size={24} fill={isActive ? "currentColor" : "none"} strokeWidth={1.5} />
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-medium mt-1 transition-all",
                                                    isActive ? "font-bold" : ""
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
