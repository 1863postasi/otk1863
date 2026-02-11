import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, deleteDoc, updateDoc, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trash2, Edit2, X, Check, AlertTriangle, Unlink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Course, Instructor } from '../../pages/Forum/types';
import { useNavigate } from 'react-router-dom';

interface AdminDataControlsProps {
    type: 'course' | 'instructor' | 'course-instruction'; // course-instruction for unlink
    data: Course | Instructor | any; // 'any' for the mixed data in course-instruction
    secondaryId?: string; // For unlinking (e.g. instructorId)
    onSuccess?: () => void;
}

export default function AdminDataControls({ type, data, secondaryId, onSuccess }: AdminDataControlsProps) {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Edit States
    const [editName, setEditName] = useState(data.name || '');
    const [editCode, setEditCode] = useState((data as Course).code || '');
    const [editDept, setEditDept] = useState(data.department || '');

    // Only Admin can see this
    if (userProfile?.role !== 'admin') return null;

    const handleDelete = async () => {
        if (!data.id) return;
        setLoading(true);
        try {
            if (type === 'course') {
                await deleteDoc(doc(db, 'courses', data.id));
                alert('Ders silindi.');
                navigate('/forum');
            } else if (type === 'instructor') {
                await deleteDoc(doc(db, 'instructors', data.id));
                alert('Hoca silindi.');
                navigate('/forum');
            } else if (type === 'course-instruction') {
                if (!secondaryId) return;
                // Unlink: Remove instructorId from Course AND courseCode from Instructor
                const courseRef = doc(db, 'courses', data.id);
                const instructorRef = doc(db, 'instructors', secondaryId);

                // 1. Remove Instructor ID from Course
                await updateDoc(courseRef, {
                    instructorIds: arrayRemove(secondaryId)
                });

                // 2. Remove Course Code from Instructor (Need to fetch instructor first to find the code? 
                // Actually we have the course code in 'data' usually)
                await updateDoc(instructorRef, {
                    courseCodes: arrayRemove((data as Course).code)
                });

                alert('Eşleşme kaldırıldı.');
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error(error);
            alert('Silme işleminde hata oluştu.');
        } finally {
            setLoading(false);
            setIsDeleteConfirmOpen(false);
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const updates: any = {};
            if (editName !== data.name) updates.name = editName;
            if (editDept !== data.department) updates.department = editDept;

            if (type === 'course') {
                if (editCode !== (data as Course).code) updates.code = editCode;
                await updateDoc(doc(db, 'courses', data.id), updates);
            } else if (type === 'instructor') {
                await updateDoc(doc(db, 'instructors', data.id), updates);
            }

            alert('Güncellendi.');
            setIsEditModalOpen(false);
            if (onSuccess) onSuccess();
            // Ideally we should reload the page or update local state, 
            // but onSuccess callback can handle refetching if needed.
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Güncelleme hatası.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                {/* EDIT BUTTON (Not for unlinking) */}
                {type !== 'course-instruction' && (
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Düzenle (Admin)"
                    >
                        <Edit2 size={16} />
                    </button>
                )}

                {/* DELETE / UNLINK BUTTON */}
                <button
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title={type === 'course-instruction' ? "Eşleşmeyi Kaldır (Admin)" : "Sil (Admin)"}
                >
                    {type === 'course-instruction' ? <Unlink size={16} /> : <Trash2 size={16} />}
                </button>
            </div>

            {/* --- DELETE CONFIRMATION MODAL --- */}
            <AnimatePresence>
                {isDeleteConfirmOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden"
                        >
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900">
                                        {type === 'course-instruction' ? 'Eşleşmeyi Kaldır?' : 'Kayıt Silinecek'}
                                    </h3>
                                    <p className="text-sm text-stone-500 mt-2">
                                        {type === 'course-instruction'
                                            ? 'Bu hocayı bu dersten ayırmak istediğine emin misin?'
                                            : 'Bu işlem geri alınamaz. İlgili tüm veriler silinebilir.'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 w-full mt-2">
                                    <button
                                        onClick={() => setIsDeleteConfirmOpen(false)}
                                        className="flex-1 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'İşleniyor...' : (type === 'course-instruction' ? 'Ayır' : 'Sil')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- EDIT MODAL --- */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
                        >
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-xl font-bold text-stone-900 mb-6">Düzenle</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-stone-500 uppercase">İsim</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="w-full mt-1 p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-stone-900 outline-none"
                                    />
                                </div>

                                {type === 'course' && (
                                    <div>
                                        <label className="text-xs font-bold text-stone-500 uppercase">Ders Kodu</label>
                                        <input
                                            type="text"
                                            value={editCode}
                                            onChange={e => setEditCode(e.target.value)}
                                            className="w-full mt-1 p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-stone-900 outline-none"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-stone-500 uppercase">Departman</label>
                                    <input
                                        type="text"
                                        value={editDept}
                                        onChange={e => setEditDept(e.target.value)}
                                        className="w-full mt-1 p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-stone-900 outline-none"
                                    />
                                </div>

                                <button
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Güncelleniyor...' : 'Kaydet'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
