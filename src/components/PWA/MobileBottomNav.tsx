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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-stone-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-end h-16 pb-2">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    if (item.disabled) {
                        return (
                            <div key={item.name} className="flex flex-col items-center justify-center w-full h-full text-stone-300">
                                <Icon size={20} strokeWidth={1.5} />
                                <span className="text-[10px] font-medium mt-1">{item.name}</span>
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex flex-col items-center justify-center w-full h-full transition-all duration-200 relative group",
                                isActive ? "text-boun-blue" : "text-stone-500 hover:text-stone-700"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Active Indicator (Top Line) */}
                                    {isActive && (
                                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-boun-blue rounded-full" />
                                    )}

                                    <div className={cn(
                                        "flex flex-col items-center",
                                        item.isCenter && "mb-4" // Lift the center item slightly
                                    )}>
                                        {item.isCenter ? (
                                            <div className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform",
                                                isActive
                                                    ? "bg-boun-blue text-white scale-110"
                                                    : "bg-white border border-stone-200 text-stone-600"
                                            )}>
                                                <Icon size={24} fill={isActive ? "currentColor" : "none"} strokeWidth={1.5} />
                                            </div>
                                        ) : (
                                            <Icon size={24} fill={isActive ? "currentColor" : "none"} strokeWidth={1.5} />
                                        )}

                                        <span className={cn(
                                            "text-[10px] font-medium mt-1 transition-all",
                                            isActive ? "font-bold" : "",
                                            item.isCenter && "absolute -bottom-5" // Position text below lifted icon
                                        )}>
                                            {item.name}
                                        </span>
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
