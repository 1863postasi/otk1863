import React from 'react';
import { Camera } from 'lucide-react';

interface IdentityCardProps {
    userProfile: any;
    fileInputRef: React.RefObject<HTMLInputElement>;
    avatarUploading: boolean;
    clubNames: Record<string, string>;
    myItemsCount: number;
    savedEventsCount: number;
    onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEditClick: () => void;
}

const IdentityCard: React.FC<IdentityCardProps> = ({
    userProfile,
    fileInputRef,
    avatarUploading,
    clubNames,
    myItemsCount,
    savedEventsCount,
    onAvatarUpload,
    onEditClick
}) => {
    return (
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center relative overflow-hidden">

                {/* Avatar */}
                <div className="relative w-32 h-32 mx-auto mb-6 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#efede6] shadow-inner bg-stone-100 relative">
                        {userProfile.photoUrl ? (
                            <img src={userProfile.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-stone-800 text-boun-gold font-serif text-4xl font-bold">
                                {userProfile.displayName?.charAt(0) || userProfile.username.charAt(0)}
                            </div>
                        )}
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onAvatarUpload} />
                    {avatarUploading && <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full"><div className="animate-spin w-6 h-6 border-2 border-stone-800 border-t-transparent rounded-full"></div></div>}
                </div>

                {/* Name & Info */}
                <h1 className="font-serif text-2xl font-bold text-stone-900 mb-1">{userProfile.displayName || "İsimsiz"}</h1>
                <p className="text-stone-400 text-sm font-medium mb-4">@{userProfile.username}</p>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-full text-xs font-bold text-stone-600 mb-6">
                    <span className="truncate max-w-[200px]">{userProfile.department}</span>
                </div>

                {/* Badges / Roles */}
                {userProfile.clubRoles && Object.keys(userProfile.clubRoles).length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {Object.keys(userProfile.clubRoles).map(clubId => (
                            <span key={clubId} className="px-2 py-1 bg-boun-blue/10 text-boun-blue text-[10px] font-bold uppercase rounded border border-boun-blue/20">
                                {clubNames[clubId] ? `${clubNames[clubId]} Yetkilisi` : '...'}
                            </span>
                        ))}
                    </div>
                )}

                <button onClick={onEditClick} className="w-full py-2 border border-stone-300 rounded-lg text-stone-600 font-bold text-sm hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
                    Profili Düzenle
                </button>
            </div>

            {/* Stats / Info Box */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 flex justify-around text-center">
                <div>
                    <div className="font-serif text-2xl font-bold text-stone-900">{myItemsCount}</div>
                    <div className="text-xs text-stone-500 font-bold uppercase tracking-wider mt-1">İlan</div>
                </div>
                <div className="w-px bg-stone-100"></div>
                <div>
                    <div className="font-serif text-2xl font-bold text-stone-900">{savedEventsCount}</div>
                    <div className="text-xs text-stone-500 font-bold uppercase tracking-wider mt-1">Etkinlik</div>
                </div>
            </div>
        </div>
    );
};

export default IdentityCard;
