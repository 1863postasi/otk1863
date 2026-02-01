import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Link as LinkIcon, FileText, Loader2, CheckCircle, Info } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadFile } from '../../lib/storage';
import { cn } from '../../lib/utils';

interface ResourceUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RESOURCE_TYPES = [
    'Ders Notu',
    'Midterm Soruları',
    'Final Soruları',
    'Proje/Ödev',
    'Kitap/Kaynak',
    'Syllabus'
];

const SEMESTERS = ['Güz', 'Bahar', 'Yaz'];

const ResourceUploadModal: React.FC<ResourceUploadModalProps> = ({ isOpen, onClose }) => {
    const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Split States
    const [codeDept, setCodeDept] = useState('');
    const [codeNum, setCodeNum] = useState('');
    const [termYear, setTermYear] = useState(new Date().getFullYear().toString());
    const [termSem, setTermSem] = useState('Güz');

    // General Form State
    const [formData, setFormData] = useState({
        instructor: '',
        resourceType: 'Ders Notu',
        title: '',
        linkUrl: '',
        uploaderName: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCodeInput = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        // Prevent spaces
        setter(value.replace(/\s/g, '').toUpperCase());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!codeDept || !codeNum || !formData.title || !termYear || !formData.instructor) {
            alert("Lütfen zorunlu alanları (*) doldurunuz.");
            return;
        }
        if (uploadType === 'file' && !selectedFile) {
            alert("Lütfen bir dosya seçiniz.");
            return;
        }
        if (uploadType === 'link' && !formData.linkUrl) {
            alert("Lütfen linki giriniz.");
            return;
        }

        setLoading(true);
        try {
            // Concatenate Fields
            const fullCourseCode = `${codeDept}${codeNum}`; // CMPE150
            const fullTerm = `${termYear} ${termSem}`;      // 2023 Güz

            let finalUrl = formData.linkUrl;
            let mimeType = 'application/link';
            let fileSize = '-';

            // Determine Content Type & Upload if File
            if (uploadType === 'link') {
                if (finalUrl.includes('youtube.com') || finalUrl.includes('youtu.be')) {
                    mimeType = 'video/youtube';
                }
            } else if (selectedFile) {
                // R2 Upload - FIX: Standardized path (No 'PENDING' folder)
                const storagePath = `akademik-havuz/${fullCourseCode}`;
                const uploadResult = await uploadFile(selectedFile, storagePath);
                finalUrl = uploadResult.url;
                mimeType = selectedFile.type;
                fileSize = uploadResult.size;
            }

            // Save to Firestore with PENDING status
            await addDoc(collection(db, "academic_resources"), {
                courseCode: fullCourseCode,
                resourceType: formData.resourceType,
                title: formData.title,
                instructor: formData.instructor,
                term: fullTerm,
                url: finalUrl,
                mimeType: mimeType,
                size: fileSize,
                status: 'pending',
                uploaderName: formData.uploaderName || 'Anonim',
                createdAt: serverTimestamp()
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                // Reset form
                setFormData({
                    instructor: '', resourceType: 'Ders Notu',
                    title: '', linkUrl: '', uploaderName: ''
                });
                setCodeDept('');
                setCodeNum('');
                setSelectedFile(null);
            }, 3000);

        } catch (error) {
            console.error("Upload Error:", error);
            alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-stone-900/60 md:backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex justify-between items-center">
                        <div>
                            <h3 className="font-serif font-bold text-xl text-stone-900">Materyal Paylaş</h3>
                            <p className="text-xs text-stone-500 mt-0.5">Akademik havuza katkıda bulunun.</p>
                        </div>
                        <button onClick={onClose} className="text-stone-400 hover:text-stone-700"><X size={20} /></button>
                    </div>

                    {success ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="font-serif text-2xl font-bold text-stone-900 mb-2">Teşekkürler!</h4>
                            <p className="text-stone-600 text-sm max-w-xs">
                                Paylaşımınız alınmıştır. Editör onayından sonra akademik havuzda yayınlanacaktır.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">

                            {/* Upload Type Toggle */}
                            <div className="flex gap-2 bg-stone-100 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setUploadType('file')}
                                    className={cn("flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all", uploadType === 'file' ? "bg-white shadow text-stone-900" : "text-stone-500")}
                                >
                                    <FileText size={16} /> Dosya Yükle
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadType('link')}
                                    className={cn("flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all", uploadType === 'link' ? "bg-white shadow text-stone-900" : "text-stone-500")}
                                >
                                    <LinkIcon size={16} /> Link / Video
                                </button>
                            </div>

                            {/* Split Course Code */}
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Ders Kodu *</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text" placeholder="CMPE" maxLength={8}
                                        className="flex-1 px-3 py-2 border border-stone-300 rounded text-sm focus:ring-1 focus:ring-stone-500 outline-none uppercase font-mono"
                                        value={codeDept}
                                        onChange={(e) => handleCodeInput(setCodeDept, e.target.value)}
                                    />
                                    <span className="text-stone-400 font-bold">-</span>
                                    <input
                                        type="text" placeholder="150" maxLength={5}
                                        className="w-24 px-3 py-2 border border-stone-300 rounded text-sm focus:ring-1 focus:ring-stone-500 outline-none font-mono"
                                        value={codeNum}
                                        onChange={(e) => handleCodeInput(setCodeNum, e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Split Term */}
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Dönem *</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number" placeholder="2023" min="1950" max="2030"
                                        className="flex-1 px-3 py-2 border border-stone-300 rounded text-sm focus:ring-1 focus:ring-stone-500 outline-none"
                                        value={termYear}
                                        onChange={(e) => setTermYear(e.target.value)}
                                    />
                                    <select
                                        className="flex-1 px-3 py-2 border border-stone-300 rounded text-sm bg-white focus:ring-1 focus:ring-stone-500 outline-none"
                                        value={termSem}
                                        onChange={(e) => setTermSem(e.target.value)}
                                    >
                                        {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Dersi Veren Hoca *</label>
                                <input
                                    type="text" placeholder="Örn: Tuna Tuğcu"
                                    className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:ring-1 focus:ring-stone-500 outline-none"
                                    value={formData.instructor}
                                    onChange={(e) => handleInputChange('instructor', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Kaynak Türü *</label>
                                    <select
                                        className="w-full px-3 py-2 border border-stone-300 rounded text-sm bg-white focus:ring-1 focus:ring-stone-500 outline-none"
                                        value={formData.resourceType}
                                        onChange={(e) => handleInputChange('resourceType', e.target.value)}
                                    >
                                        {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Başlık *</label>
                                    <input
                                        type="text" placeholder="Örn: 1. Midterm Çözümleri"
                                        className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:ring-1 focus:ring-stone-500 outline-none"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-100 text-blue-800 text-[10px]">
                                <Info size={14} className="shrink-0" />
                                <span>Listede dosya adı değil, buraya girdiğiniz <b>Başlık</b> görünecektir.</span>
                            </div>

                            {/* File or Link Input */}
                            <div className="pt-1">
                                {uploadType === 'file' ? (
                                    <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 hover:border-stone-400 transition-colors cursor-pointer relative group">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                                        />
                                        {selectedFile ? (
                                            <div className="text-stone-800 font-bold text-sm flex items-center gap-2">
                                                <CheckCircle size={18} className="text-boun-green" /> {selectedFile.name}
                                            </div>
                                        ) : (
                                            <>
                                                <UploadCloud size={28} className="mb-2 group-hover:text-stone-600" />
                                                <span className="text-xs font-bold">Dosya Seç (PDF, Resim, Zip)</span>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Bağlantı URL *</label>
                                        <input
                                            type="text" placeholder="https://youtube.com/... veya Drive Linki"
                                            className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:ring-1 focus:ring-stone-500 outline-none"
                                            value={formData.linkUrl}
                                            onChange={(e) => handleInputChange('linkUrl', e.target.value)}
                                        />
                                        <p className="text-[10px] text-stone-400 mt-1">YouTube linkleri otomatik olarak oynatıcıya dönüşür.</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Yükleyen Adı (Opsiyonel)</label>
                                <input
                                    type="text" placeholder="Adınız veya Rumuzunuz"
                                    className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:ring-1 focus:ring-stone-500 outline-none"
                                    value={formData.uploaderName}
                                    onChange={(e) => handleInputChange('uploaderName', e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-stone-900 text-white font-bold rounded shadow-lg hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                                {loading ? 'Gönderiliyor...' : 'Gönder'}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default ResourceUploadModal;