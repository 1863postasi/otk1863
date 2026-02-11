import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2 } from 'lucide-react';
import { TextArea } from '../../pages/Admin/components/SharedUI';
import { cn } from '../../lib/utils';
import { Review } from '../../pages/Forum/types';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    onDelete?: () => Promise<void>;
    initialData?: Partial<Review>;
    isEditing?: boolean;
    title: string;
    warningMessage?: React.ReactNode;
    includeDifficulty?: boolean;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onDelete,
    initialData,
    isEditing = false,
    title,
    warningMessage,
    includeDifficulty = false
}) => {
    const [rating, setRating] = useState(5);
    const [difficulty, setDifficulty] = useState(5);
    const [comment, setComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setRating(initialData.rating || 5);
                setDifficulty(initialData.difficulty || 5);
                setComment(initialData.comment || '');
                setIsAnonymous(initialData.isAnonymous || false);
            } else {
                // Reset defaults
                setRating(5);
                setDifficulty(5);
                setComment('');
                setIsAnonymous(false);
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await onSubmit({
                rating,
                difficulty: includeDifficulty ? difficulty : undefined,
                comment,
                isAnonymous
            });
            onClose();
        } catch (error) {
            console.error(error);
            alert("Bir hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;
        if (!confirm('Değerlendirmeni silmek istediğine emin misin?')) return;

        setDeleting(true);
        try {
            await onDelete();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Silme işlemi başarısız.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 sticky top-0 backdrop-blur-md z-10">
                            <h3 className="font-serif font-bold text-lg text-stone-800">
                                {isEditing ? 'Düzenle: ' : 'Değerlendir: '} {title}
                            </h3>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-200 transition-colors">
                                <X size={20} className="text-stone-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Info Alert */}
                            {warningMessage && (
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                    <div className="text-xs text-purple-800 leading-relaxed">
                                        {warningMessage}
                                    </div>
                                </div>
                            )}

                            {/* Rating */}
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 text-center">
                                    {includeDifficulty ? "Genel Memnuniyet" : "Puanın"}
                                </label>
                                <div className="flex justify-center gap-3">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onMouseEnter={() => setRating(star)}
                                            className="group p-2 transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                size={36}
                                                className={cn(
                                                    "transition-colors duration-200",
                                                    star <= rating ? "fill-amber-400 text-amber-400" : "fill-stone-100 text-stone-200"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <div className="text-center mt-2 text-xs font-bold text-amber-500">
                                    {rating === 1 ? "Çok Kötü" : rating === 5 ? "Mükemmel" : `${rating} Puan`}
                                </div>
                            </div>

                            {/* Difficulty Slider (Optional) */}
                            {includeDifficulty && (
                                <div>
                                    <div className="flex justify-between items-end mb-4">
                                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Ders Zorluğu</label>
                                        <span className={cn(
                                            "text-sm font-black px-2 py-0.5 rounded-md",
                                            difficulty > 7 ? "bg-red-50 text-red-600" : difficulty > 4 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                        )}>
                                            {difficulty}/10
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        step="0.5"
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
                                    />
                                    <div className="flex justify-between mt-2 text-[10px] font-bold text-stone-400 uppercase">
                                        <span>Çok Kolay</span>
                                        <span>Çok Zor</span>
                                    </div>
                                </div>
                            )}

                            {/* Comment */}
                            <TextArea
                                label="Deneyimin"
                                placeholder="Ders anlatımı, notlandırması ve genel yaklaşımı nasıldı? Dürüst ve yapıcı ol."
                                className="h-32 text-sm"
                                value={comment}
                                onChange={(v: string) => setComment(v)}
                            />

                            {/* Anonymous Toggle */}
                            <div
                                className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors select-none"
                                onClick={() => setIsAnonymous(!isAnonymous)}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                    isAnonymous ? "bg-stone-900 border-stone-900" : "bg-white border-stone-300"
                                )}>
                                    {isAnonymous && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <span className="text-sm font-medium text-stone-600">Bu yorumu <strong>anonim</strong> olarak paylaş</span>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-stone-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 size={16} className="animate-spin" />}
                                    {submitting ? 'İşleniyor...' : (isEditing ? 'Güncelle' : 'Yorumu Gönder')}
                                </button>

                                {isEditing && onDelete && (
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {deleting && <Loader2 size={16} className="animate-spin" />}
                                        {deleting ? 'Siliniyor...' : 'Değerlendirmeyi Sil'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReviewModal;
