import { NavLink, useLocation } from 'react-router-dom';
import { MessageSquare, HelpCircle, Store, Megaphone, Trophy, Hash } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const ForumSidebar: React.FC = () => {
    const { userProfile } = useAuth();
    const location = useLocation();

    // Categories for Community Section 
    const communityCategories = [
        { id: 'genel', name: 'Genel Sohbet', icon: MessageSquare, path: '/forum/topluluk?kategori=genel' },
        { id: 'soru-cevap', name: 'Soru & Cevap', icon: HelpCircle, path: '/forum/topluluk?kategori=soru-cevap' },
        { id: 'kampus-gundemi', name: 'Kampüs Gündemi', icon: Megaphone, path: '/forum/topluluk?kategori=kampus-gundemi' },
    ];

    // Other Forum Sections for Quick Access
    const quickAccess = [
        { name: 'Akademik Değerlendirme', path: '/forum/akademik', icon: Hash },
        { name: 'Kulüp & Etkinlik', path: '/forum/kulupler', icon: Trophy },
    ];

    return (
        <aside className="hidden lg:block w-64 shrink-0 pr-6">
            <div className="sticky top-24 space-y-8">

                {/* User Stats Mini Card (Optional) */}
                {userProfile && (
                    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 overflow-hidden">
                            {/* Replace with actual user image if available */}
                            <img
                                src={`https://ui-avatars.com/api/?name=${userProfile.username}&background=random`}
                                alt={userProfile.username}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="font-bold text-sm text-stone-900">{userProfile.username}</div>
                            <div className="text-xs text-stone-500">Mühendislik Fakültesi</div>
                        </div>
                    </div>
                )}

                {/* Community Categories */}
                <nav className="space-y-1">
                    {communityCategories.map((item) => (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                isActive && location.search.includes(item.id)
                                    ? "bg-stone-100 text-stone-900 font-bold"
                                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                            )}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* MARKTPLACE (Highlighted) */}
            <div className="bg-gradient-to-br from-boun-blue/5 to-purple-50 rounded-xl border border-boun-blue/10 overflow-hidden">
                <NavLink
                    to="/forum/topluluk?kategori=ikinci-el"
                    className={({ isActive }) => cn(
                        "flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors group relative",
                        isActive && location.search.includes('ikinci-el')
                            ? "text-boun-blue bg-boun-blue/5"
                            : "text-stone-700 hover:bg-boun-blue/5 hover:text-boun-blue"
                    )}
                >
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-boun-blue group-hover:scale-110 transition-transform duration-300">
                        <Store size={18} />
                    </div>
                    <div>
                        <div className="leading-none mb-1">Pazar Yeri</div>
                        <div className="text-[10px] text-stone-500 font-normal">Al, Sat, Kirala</div>
                    </div>
                </NavLink>
            </div>

            {/* Quick Access */}
            <div>
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 px-2">Hızlı Erişim</h3>
                <nav className="space-y-1">
                    {quickAccess.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                isActive
                                    ? "bg-boun-blue/10 text-boun-blue font-bold"
                                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                            )}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Footer Links */}
            <div className="pt-4 border-t border-stone-100">
                <div className="flex flex-wrap gap-2 text-xs text-stone-400">
                    <NavLink to="/hakkinda" className="hover:underline">Kurallar</NavLink>
                    <span>•</span>
                    <NavLink to="/hakkinda" className="hover:underline">Gizlilik</NavLink>
                    <span>•</span>
                    <span>© 2026 ÖTK</span>
                </div>
            </div>

        </aside>
    );
};

export default ForumSidebar;
