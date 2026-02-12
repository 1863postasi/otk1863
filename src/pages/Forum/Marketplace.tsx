import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, MapPin, Tag, X, MessageCircle, Share2, Heart, Upload, CheckCircle, Loader2, Camera, Phone, Send } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Listing } from './types';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { uploadFile } from '../../lib/storage';

// --- TYPES ---
// Message type for internal notes
interface Message {
    id?: string;
    fromId: string;
    fromName: string;
    toId: string;
    listingId: string;
    listingTitle: string;
    content: string;
    createdAt: any;
    read: boolean;
    contactInfo?: string; // Optional contact info from buyer
}

// --- COMPONENTS ---

// --- UTILS ---
const formatPhoneNumber = (value: string) => {
    // Remove non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Limits the number of digits to 11
    const charCount = numbers.length;
    let formatted = '';

    if (charCount > 0) {
        formatted += numbers.substring(0, 1); // 0
    }
    if (charCount > 1) {
        formatted += ' ' + numbers.substring(1, 4); // 5XX
    }
    if (charCount > 4) {
        formatted += ' ' + numbers.substring(4, 7); // XXX
    }
    if (charCount > 7) {
        formatted += ' ' + numbers.substring(7, 9); // XX
    }
    if (charCount > 9) {
        formatted += ' ' + numbers.substring(9, 11); // XX
    }

    return formatted.trim();
};

const CategoryPill = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-sm touch-manipulation",
            active
                ? "bg-stone-900 text-white border-stone-900 shadow-md transform scale-105"
                : "bg-white text-stone-600 border-stone-200 hover:border-emerald-200"
        )}
    >
        {label}
    </button>
);

const ProductCard = React.memo(({ item, onSelect }: { item: Listing, onSelect: (item: Listing) => void }) => (
    <motion.div
        onClick={() => onSelect(item)}
        className="group relative rounded-xl overflow-hidden cursor-pointer bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col border border-stone-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
    >
        {/* Image */}
        <div className="w-full bg-stone-100 relative aspect-[4/5] sm:aspect-[4/5] overflow-hidden">
            {item.images?.[0] ? (
                <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-300">
                    <Camera size={32} />
                </div>
            )}

            {/* Price Tag */}
            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm z-10">
                <span className="text-xs font-bold text-emerald-800">
                    {item.price === 0 ? "BEDAVA" : `${item.price} ${item.currency || '₺'}`}
                </span>
            </div>

            {/* Sold Overlay */}
            {item.status === 'sold' && (
                <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-[1px]">
                    <span className="border-2 border-white text-white px-3 py-1 font-bold text-lg uppercase -rotate-12 tracking-widest opacity-90">Satıldı</span>
                </div>
            )}
        </div>

        <div className="p-2.5 md:p-3 flex flex-col flex-1">
            <h3 className="font-bold text-stone-800 text-sm leading-tight mb-1 line-clamp-2">{item.title}</h3>
            <div className="mt-auto flex items-center gap-1 text-[10px] text-stone-500">
                <MapPin size={10} />
                <span>{item.location || "Kampüs İçi"}</span>
            </div>
        </div>
    </motion.div>
));


const ProductSheet = ({ item, onClose, onContact }: { item: Listing, onClose: () => void, onContact: () => void }) => {
    if (!item) return null;

    const whatsappLink = item.contact?.whatsapp
        ? (item.contact.whatsapp.startsWith('http') ? item.contact.whatsapp : `https://wa.me/${item.contact.whatsapp.replace(/[^0-9]/g, '')}`)
        : null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
            onClick={onClose}
        >
            <motion.div
                layoutId={`product-${item.id}`}
                className="bg-white w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
                onClick={(e) => e.stopPropagation()}
                drag="y"
                dragConstraints={{ top: 0, bottom: 100 }}
                onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
            >
                {/* Drag Handle */}
                <div className="absolute top-0 left-0 right-0 h-6 flex justify-center pt-2 z-20 pointer-events-none">
                    <div className="w-12 h-1.5 bg-white/50 backdrop-blur-md rounded-full" />
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md">
                    <X size={20} />
                </button>

                {/* Image */}
                <div className="h-64 sm:h-80 bg-stone-100 shrink-0 relative">
                    <img src={item.images?.[0] || "https://source.unsplash.com/random"} className="w-full h-full object-cover" alt={item.title} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-stone-900 leading-tight mb-1">{item.title}</h2>
                            <div className="flex items-center gap-2 text-stone-500 text-sm font-medium">
                                <span className={cn("px-2 py-0.5 rounded text-xs uppercase tracking-wider font-bold",
                                    item.condition === 'new' ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
                                )}>{item.condition || "İkinci El"}</span>
                                <span>•</span>
                                <span>{new Date(item.createdAt?.seconds ? item.createdAt.seconds * 1000 : Date.now()).toLocaleDateString('tr-TR')}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-emerald-600">
                                {item.price === 0 ? "BEDAVA" : `${item.price} ${item.currency || '₺'}`}
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-stone-100 my-4" />

                    {/* Seller */}
                    <div className="flex items-center gap-3 mb-6 p-3 rounded-xl border border-stone-100 bg-stone-50/50">
                        <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden flex items-center justify-center text-stone-500 font-bold text-lg">
                            {item.sellerPhotoUrl ? <img src={item.sellerPhotoUrl} alt={item.sellerName} className="w-full h-full object-cover" /> : item.sellerName?.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-stone-900 text-sm">{item.sellerName || "İsimsiz Satıcı"}</div>
                            <div className="text-xs text-stone-500 flex items-center gap-1">
                                <MapPin size={10} /> {item.location || "Kampüs İçi"}
                            </div>
                        </div>
                    </div>

                    <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
                </div>

                {/* Footer Actions */}
                {/* Footer Actions */}
                <div className="p-4 border-t border-stone-100 bg-white sticky bottom-0 z-10 flex flex-col gap-2 pb-8 md:pb-4 safe-area-bottom">
                    {whatsappLink && (
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg active:scale-95"
                        >
                            <MessageCircle size={18} />
                            WhatsApp ile İletişime Geç
                        </a>
                    )}

                    <button
                        onClick={onContact}
                        className="bg-emerald-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors shadow-lg active:scale-95"
                    >
                        <Send size={18} />
                        Satıcıya Not Bırak
                    </button>

                    {item.contact?.phone && (
                        <div className="text-center text-xs text-stone-400 font-mono mt-1">
                            Tel: {item.contact.phone}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// NOTE MODAL
const SendNoteModal = ({ isOpen, onClose, listing, currentUser }: { isOpen: boolean, onClose: () => void, listing: Listing, currentUser: any }) => {
    const [message, setMessage] = useState("");
    const [contact, setContact] = useState("");
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            await addDoc(collection(db, "messages"), {
                fromId: currentUser.uid,
                fromName: currentUser.displayName || "Kullanıcı",
                toId: listing.sellerId,
                listingId: listing.id,
                listingTitle: listing.title,
                content: message,
                contactInfo: contact,
                createdAt: serverTimestamp(),
                read: false
            });
            alert("Mesajınız iletildi!");
            onClose();
        } catch (error) {
            console.error(error);
            alert("Gönderilemedi.");
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Satıcıya Not Bırak</h3>
                    <button onClick={onClose}><X size={20} className="text-stone-400" /></button>
                </div>
                <p className="text-sm text-stone-500 mb-4">
                    <strong>{listing.title}</strong> ilanı için mesaj gönderiyorsunuz.
                </p>

                <textarea
                    className="w-full border p-3 rounded-lg text-sm bg-stone-50 outline-none focus:border-emerald-500 mb-3"
                    rows={4}
                    placeholder="Mesajınız..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                />

                <input
                    type="text"
                    className="w-full border p-3 rounded-lg text-sm bg-stone-50 outline-none focus:border-emerald-500 mb-4"
                    placeholder="Size ulaşabileceği iletişim bilgisi (Tel/Insta)*"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    required
                />

                <button
                    onClick={handleSend}
                    disabled={sending || !message.trim() || !contact.trim()}
                    className="w-full bg-emerald-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {sending ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Gönder</>}
                </button>
            </motion.div>
        </div>
    );
};


// --- MAIN PAGE ---

export default function Marketplace() {
    const { userProfile, currentUser } = useAuth();
    const [items, setItems] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("Tümü");
    const [selectedItem, setSelectedItem] = useState<Listing | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    // Form inputs
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [phone, setPhone] = useState('');

    const categories = ["Tümü", "Kitap", "Elektronik", "Ev Eşyası", "Giyim", "Diğer"];

    // Fetch Listings with Cache Strategy
    useEffect(() => {
        const fetchItems = async () => {
            const CACHE_KEY = 'marketplace_data';
            const CACHE_TIME_KEY = 'marketplace_timestamp';
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

            // 1. Try to load from cache first
            const cachedData = localStorage.getItem(CACHE_KEY);
            const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
            const now = Date.now();

            if (cachedData && cachedTime && (now - parseInt(cachedTime) < CACHE_DURATION)) {
                try {
                    setItems(JSON.parse(cachedData));
                    setLoading(false);
                    console.log("Loaded marketplace from cache");
                    return; // Exit early
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }

            // 2. Fetch from Firestore if cache invalid/expired
            try {
                // Firestore requires a Composite Index for queries with where() and orderBy() on different fields.
                // If the fetch fails, check the browser console for a link to create the index.
                const q = query(
                    collection(db, "listings"),
                    where("status", "==", "active"),
                    orderBy("createdAt", "desc"),
                    limit(50)
                );

                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    console.warn("Marketplace: No active listings found in Firestore.");
                }

                const data = snapshot.docs.map(doc => {
                    const docData = doc.data();
                    // Handle timestamp: It might be a Firestore Timestamp object or already a number/string
                    let seconds = Date.now() / 1000;
                    if (docData.createdAt?.seconds) {
                        seconds = docData.createdAt.seconds;
                    } else if (docData.createdAt && typeof docData.createdAt.toDate === 'function') {
                        seconds = docData.createdAt.toDate().getTime() / 1000;
                    }

                    return {
                        id: doc.id,
                        ...docData,
                        createdAt: { seconds }
                    } as Listing;
                });

                setItems(data);

                // Save to Cache
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(CACHE_TIME_KEY, now.toString());

            } catch (error: any) {
                console.error("Marketplace Fetch Error:", error);
                if (error?.code === 'failed-precondition') {
                    console.error("CRITICAL: Missing Firestore Index. Please open the link in the error message above to create it.");
                    alert("Veritabanı indeksi eksik! Geliştirici konsoluna (F12) bakarak linke tıklayınız.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    // Derived State for Filtering
    const filteredItems = React.useMemo(() => items.filter(item => {
        if (activeCategory === "Tümü") return true;
        // Check if category matches or tags include category
        return item.category === activeCategory || item.tags?.includes(activeCategory);
    }), [items, activeCategory]);

    // Stable handler for product selection
    const handleSelectItem = React.useCallback((item: Listing) => {
        setSelectedItem(item);
    }, []);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !userProfile) {
            alert("İlan vermek için giriş yapmalısınız.");
            return;
        }

        setIsSubmitting(true);
        try {
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);

            let imageURL = "";
            if (selectedFile) {
                const result = await uploadFile(selectedFile, 'marketplace');
                imageURL = result.url;
            }

            // WhatsApp formatting - Normalize to 905XXXXXXXXX
            const pureNumbers = phone.replace(/\D/g, '');
            // If it starts with 0, remove it and add 90. If it starts with 5, add 90.
            let waString = '';
            if (pureNumbers.startsWith('0')) waString = '90' + pureNumbers.substring(1);
            else if (pureNumbers.startsWith('5')) waString = '90' + pureNumbers;
            else waString = pureNumbers;

            const formattedWa = waString.length >= 10 ? `https://wa.me/${waString}` : undefined;

            const newListing: Omit<Listing, 'id'> = { // id added by addDoc
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                price: Number(formData.get('price')),
                location: formData.get('location') as string || "Kampüs İçi",
                currency: '₺',
                category: formData.get('category') as string,
                condition: formData.get('condition') as any,
                images: imageURL ? [imageURL] : [],
                sellerId: currentUser.uid,
                sellerName: userProfile.username || 'Anonim',
                sellerPhotoUrl: userProfile.photoUrl || null,
                contact: {
                    whatsapp: formattedWa,
                    phone: phone // Use the state-stored phone
                },
                tags: [formData.get('category') as string],
                createdAt: serverTimestamp(),
                status: 'active',
                views: 0,
                likes: 0
            };

            await addDoc(collection(db, "listings"), newListing);

            // Clear cache to force refetch on reload
            localStorage.removeItem('marketplace_data');
            localStorage.removeItem('marketplace_timestamp');

            alert("İlan yayınlandı!");
            window.location.reload();
        } catch (error) {
            console.error("Create error:", error);
            alert("İlan oluşturulurken bir hata oluştu: " + error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 pb-20 relative">

            {/* Header */}
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-stone-200/50 transition-all supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto md:px-4 py-0 md:py-4">

                    {/* Desktop Header */}
                    <div className="hidden md:flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold font-serif text-stone-800">Kampüs Pazarı</h1>
                    </div>

                    {/* Mobile Header (Centered Title) */}
                    <div className="md:hidden h-14 flex items-center justify-center relative border-b border-stone-100/50">
                        <h1 className="text-lg font-bold font-serif text-stone-900 tracking-tight">Kampüs Pazarı</h1>
                    </div>

                    {/* Categories */}
                    <div className="flex items-center gap-2 md:mt-0 bg-stone-50/50 md:bg-transparent">
                        <div className="flex gap-2 overflow-x-auto py-3 md:py-2 px-4 md:px-0 scrollbar-hide flex-1 mask-linear-fade touch-manipulation">
                            {categories.map(cat => (
                                <CategoryPill key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
                            ))}
                            <div className="w-4 shrink-0 md:hidden" />
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="max-w-7xl mx-auto px-3 py-4">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" /></div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredItems.map(item => (
                            <ProductCard key={item.id} item={item} onSelect={handleSelectItem} />
                        ))}
                        {filteredItems.length === 0 && (
                            <div className="text-center py-20 text-stone-400 col-span-full w-full">İlan bulunamadı.</div>
                        )}
                    </div>
                )
                }
            </div >

            {/* Default FAB */}
            {/* Default FAB - Lifted for Bottom Nav */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    if (currentUser) setIsAddModalOpen(true);
                    else alert("Giriş yapmanız gerekiyor.");
                }}
                className="fixed bottom-24 right-5 z-40 bg-stone-900 text-white rounded-full p-4 shadow-xl shadow-stone-900/40 flex items-center gap-2 font-bold pr-6 border border-stone-800"
            >
                <Plus size={24} /> <span className="text-sm">İlan Ver</span>
            </motion.button>

            {/* Detail Sheet */}
            <AnimatePresence>
                {
                    selectedItem && (
                        <ProductSheet
                            item={selectedItem}
                            onClose={() => setSelectedItem(null)}
                            onContact={() => {
                                if (!currentUser) return alert("Giriş yapmalısınız!");
                                setIsNoteModalOpen(true);
                            }}
                        />
                    )
                }
            </AnimatePresence >

            {/* Message Modal */}
            {
                selectedItem && (
                    <SendNoteModal
                        isOpen={isNoteModalOpen}
                        onClose={() => setIsNoteModalOpen(false)}
                        listing={selectedItem}
                        currentUser={currentUser}
                    />
                )
            }

            {/* Create Modal */}
            {
                createPortal(
                    <AnimatePresence>
                        {isAddModalOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-lg rounded-2xl max-h-[90vh] flex flex-col overflow-hidden">
                                    <div className="p-4 border-b flex justify-between items-center bg-stone-50">
                                        <h3 className="font-bold text-lg">Yeni İlan</h3>
                                        <button onClick={() => setIsAddModalOpen(false)}><X /></button>
                                    </div>
                                    <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4">
                                        <input name="title" placeholder="Başlık" className="w-full border p-3 rounded-lg" required />

                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3.5 text-stone-400" size={18} />
                                            <input name="location" placeholder="Konum (Opsiyonel, Örn: Kuzey Kampüs)" className="w-full border p-3 pl-10 rounded-lg" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <input name="price" type="number" placeholder="Fiyat (TL)" className="w-full border p-3 rounded-lg" required />
                                            <select name="category" className="w-full border p-3 rounded-lg">
                                                {categories.filter(c => c !== 'Tümü').map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <select name="condition" className="w-full border p-3 rounded-lg">
                                                <option value="new">Yeni</option>
                                                <option value="like-new">Yeni Gibi</option>
                                                <option value="good">İyi</option>
                                                <option value="fair">İdare Eder</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 text-stone-400" size={18} />
                                                <input
                                                    value={phone}
                                                    onChange={e => setPhone(formatPhoneNumber(e.target.value))}
                                                    placeholder="Telefon: 0 5XX XXX XX XX"
                                                    className="w-full border p-3 pl-10 rounded-lg outline-none focus:border-emerald-500"
                                                    maxLength={15}
                                                />
                                            </div>
                                            <p className="text-[10px] text-stone-400 pl-1 font-medium">Bu numara hem ilanda görünecek hem de WhatsApp linki oluşturacaktır.</p>
                                        </div>

                                        <textarea name="description" rows={3} placeholder="Açıklama" className="w-full border p-3 rounded-lg" required />

                                        {/* Simplified File Upload */}
                                        <div className="border-2 border-dashed p-4 rounded-lg text-center cursor-pointer hover:bg-stone-50" onClick={() => document.getElementById('file-upload')?.click()}>
                                            {selectedFile ? selectedFile.name : "Fotoğraf Yükle"}
                                            <input id="file-upload" type="file" hidden accept="image/*" onChange={e => e.target.files && setSelectedFile(e.target.files[0])} />
                                        </div>

                                        <button disabled={isSubmitting} className="w-full bg-emerald-900 text-white font-bold py-3 rounded-xl flex justify-center">
                                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Yayınla"}
                                        </button>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body
                )
            }

        </div >
    );
}
