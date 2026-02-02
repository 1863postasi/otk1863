import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, FileText, Download, Search, Filter, ChevronDown, Folder, Building2, GraduationCap, File, FolderOpen, Home, ChevronRight, Loader2, Eye, ExternalLink, CornerLeftUp, BookOpen, Layers, Plus, Youtube, Link as LinkIcon, X, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import * as router from 'react-router-dom';
import ResourceUploadModal from '../ResourceUploadModal';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../context/AuthContext';

const { useSearchParams } = router;

// --- TYPES ---
interface OTKDocument {
    id: string;
    title: string;
    type: 'root' | 'folder' | 'file';
    parentPath: string;
    url?: string;
    mimeType?: string;
    size?: string;
    createdAt?: any;
    relatedCommissionId?: string;
}

interface AcademicResource {
    id: string;
    courseCode: string;
    courseName: string;
    department: string;
    resourceType: string;
    title: string;
    url: string;
    mimeType: string;
    size: string;
    createdAt: any;
    status?: string;
    instructor?: string;
    term?: string;
}

interface CourseGroup {
    code: string;
    name: string;
    department: string;
    resources: Record<string, AcademicResource[]>; // Key: Resource Type (Vize, Final...)
    totalCount: number;
}

interface ViewProps {
    onBack: () => void;
}

type TabMode = 'institutional' | 'academic';

const RESOURCE_TYPES_FILTER = [
    'Tümü',
    'Ders Notu',
    'Midterm Soruları',
    'Final Soruları',
    'Proje/Ödev',
    'Kitap/Kaynak',
    'Syllabus'
];

const InstitutionalView: React.FC<ViewProps> = ({ onBack }) => {
    const { userProfile, toggleBookmark } = useAuth();
    const [searchParams] = useSearchParams();
    const commissionFilter = searchParams.get('commission');

    const [activeTab, setActiveTab] = useState<TabMode>('institutional');
    const [isExiting, setIsExiting] = useState(false);

    // -- INSTITUTIONAL STATE --
    const [rootCategories, setRootCategories] = useState<OTKDocument[]>([]);
    const [documents, setDocuments] = useState<OTKDocument[]>([]);
    const [loadingInst, setLoadingInst] = useState(true);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [navPaths, setNavPaths] = useState<Record<string, string>>({});
    const [breadcrumbs, setBreadcrumbs] = useState<Record<string, { name: string, path: string }[]>>({});

    // -- ACADEMIC STATE --
    const [academicResources, setAcademicResources] = useState<AcademicResource[]>([]);
    const [loadingAcad, setLoadingAcad] = useState(true);

    // Filters
    const [academicSearch, setAcademicSearch] = useState("");
    const [selectedType, setSelectedType] = useState("Tümü");
    const [selectedTerm, setSelectedTerm] = useState("Tümü");
    const [showSavedOnly, setShowSavedOnly] = useState(false);

    const [expandedCourse, setExpandedCourse] = useState<string | null>(null); // Course Code
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [youtubeModalUrl, setYoutubeModalUrl] = useState<string | null>(null);

    // Check URL params for saved filter
    useEffect(() => {
        if (searchParams.get('saved') === 'true') {
            setActiveTab('academic');
            setShowSavedOnly(true);
        }
    }, [searchParams]);

    // Derived available terms for filter
    const availableTerms = useMemo(() => {
        const terms = new Set<string>();
        academicResources.forEach(r => {
            if (r.term) terms.add(r.term);
        });
        return ['Tümü', ...Array.from(terms).sort().reverse()];
    }, [academicResources]);

    // 1. Fetch Institutional Data
    useEffect(() => {
        // Roots
        const qRoots = query(collection(db, "otk_documents"), where("parentPath", "==", "main"));
        const unsubRoots = onSnapshot(qRoots, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as OTKDocument[];
            data.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            setRootCategories(data);
        });

        // All Documents (Client-side filtering for folder nav)
        let qDocs;
        if (commissionFilter) {
            qDocs = query(collection(db, "otk_documents"), where("relatedCommissionId", "==", commissionFilter), orderBy("createdAt", "desc"));
        } else {
            qDocs = query(collection(db, "otk_documents"), orderBy("createdAt", "desc"));
        }

        const unsubDocs = onSnapshot(qDocs, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as OTKDocument[];
            setDocuments(data);
            setLoadingInst(false);
        });

        return () => { unsubRoots(); unsubDocs(); };
    }, [commissionFilter]);

    // 2. Fetch Academic Data (ONLY APPROVED)
    useEffect(() => {
        // FIX: Removed orderBy("courseCode", "asc") to allow query without composite index.
        // Grouping logic handles the sorting.
        const q = query(
            collection(db, "academic_resources"),
            where("status", "==", "approved")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AcademicResource[];
            // Client-side sort if needed before grouping, but grouping handles structure
            setAcademicResources(data);
            setLoadingAcad(false);
        });
        return () => unsubscribe();
    }, []);

    // --- ACADEMIC LOGIC: GROUPING & FILTERING ---
    const groupedCourses = useMemo(() => {
        const groups: Record<string, CourseGroup> = {};
        const savedIds = userProfile?.savedLectureNoteIds || [];

        academicResources.forEach(res => {
            // 0. Saved Filter
            if (showSavedOnly && !savedIds.includes(res.id)) return;

            // 1. Text Search (Course Code or Name)
            if (academicSearch) {
                const search = academicSearch.toLowerCase();
                if (!res.courseCode.toLowerCase().includes(search) &&
                    !res.courseName?.toLowerCase().includes(search)) return;
            }

            // 2. Resource Type Filter
            if (selectedType !== 'Tümü' && res.resourceType !== selectedType) return;

            // 3. Term Filter
            if (selectedTerm !== 'Tümü' && res.term !== selectedTerm) return;

            if (!groups[res.courseCode]) {
                groups[res.courseCode] = {
                    code: res.courseCode,
                    name: res.courseName,
                    department: res.department,
                    resources: {},
                    totalCount: 0
                };
            }

            if (!groups[res.courseCode].resources[res.resourceType]) {
                groups[res.courseCode].resources[res.resourceType] = [];
            }

            groups[res.courseCode].resources[res.resourceType].push(res);
            groups[res.courseCode].totalCount++;
        });

        // Sort courses by code
        return Object.values(groups).sort((a, b) => a.code.localeCompare(b.code));
    }, [academicResources, selectedType, selectedTerm, academicSearch, showSavedOnly, userProfile?.savedLectureNoteIds]);


    // --- INSTITUTIONAL NAV LOGIC (From previous step) ---
    const getInstContents = (categoryId: string) => {
        const currentPath = navPaths[categoryId] || categoryId;
        const items = documents.filter(doc => doc.parentPath === currentPath);
        return items.sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return 0;
        });
    };

    const handleFolderClick = (category: OTKDocument, folder: OTKDocument) => {
        const catId = category.id;
        const newPath = folder.id;
        setNavPaths(prev => ({ ...prev, [catId]: newPath }));
        const currentCrumbs = breadcrumbs[catId] || [{ name: category.title, path: category.id }];
        setBreadcrumbs(prev => ({ ...prev, [catId]: [...currentCrumbs, { name: folder.title, path: newPath }] }));
    };

    const handleBreadcrumbClick = (catId: string, index: number) => {
        const crumbs = breadcrumbs[catId];
        if (!crumbs) return;
        const target = crumbs[index];
        setNavPaths(prev => ({ ...prev, [catId]: target.path }));
        setBreadcrumbs(prev => ({ ...prev, [catId]: crumbs.slice(0, index + 1) }));
    };

    const handleGoBack = (catId: string) => {
        const crumbs = breadcrumbs[catId];
        if (!crumbs || crumbs.length <= 1) return;
        handleBreadcrumbClick(catId, crumbs.length - 2);
    };

    const handleFileClick = (url: string, type: string = '') => {
        if (type.includes('youtube') || url.includes('youtube.com') || url.includes('youtu.be')) {
            setYoutubeModalUrl(url);
            return;
        }

        if (url.endsWith('.pdf') || url.includes('.pdf') || type.includes('pdf')) {
            window.open(url, '_blank');
        } else {
            // Check if it's a direct link (Drive etc.)
            if (url.startsWith('http') && !url.includes('r2.dev')) {
                window.open(url, '_blank');
            } else {
                // Office viewer fallback
                const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
                window.open(viewerUrl, '_blank');
            }
        }
    };

    // --- NAVIGATION ---
    const handleSafeBack = () => {
        setIsExiting(true);
        setTimeout(() => {
            onBack();
        }, 0);
    };

    // --- RENDER HELPERS ---

    const renderInstContentList = (rootCategory: OTKDocument) => {
        const catId = rootCategory.id;
        const items = getInstContents(catId);
        const crumbs = breadcrumbs[catId] || [{ name: rootCategory.title, path: rootCategory.id }];
        const isRoot = crumbs.length === 1;

        return (
            <div className="bg-stone-50 border-t border-stone-200">
                {crumbs.length > 1 && (
                    <div className="px-6 py-2 border-b border-stone-200 flex items-center gap-1 text-xs font-mono text-stone-500 overflow-x-auto">
                        {crumbs.map((crumb, idx) => (
                            <React.Fragment key={crumb.path}>
                                <button onClick={() => handleBreadcrumbClick(catId, idx)} className="hover:underline hover:text-stone-800 whitespace-nowrap">{crumb.name}</button>
                                {idx < crumbs.length - 1 && <ChevronRight size={12} />}
                            </React.Fragment>
                        ))}
                    </div>
                )}
                <div className="divide-y divide-stone-200/50">
                    {!isRoot && (
                        <div onClick={() => handleGoBack(catId)} className="px-6 py-3 flex items-center gap-3 hover:bg-stone-100 cursor-pointer transition-colors bg-stone-100/50 group">
                            <div className="p-2 rounded shrink-0 bg-stone-200 text-stone-600 group-hover:bg-stone-300 transition-colors"><CornerLeftUp size={18} /></div>
                            <div className="flex-1 min-w-0"><h4 className="text-sm font-bold text-stone-600">Üst Klasöre Dön</h4></div>
                        </div>
                    )}
                    {items.length === 0 ? (
                        <div className="p-8 text-center text-stone-400 text-sm italic flex flex-col items-center"><FolderOpen size={24} className="mb-2 opacity-50" /> Bu klasör boş.</div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} onClick={() => item.type === 'folder' ? handleFolderClick(rootCategory, item) : handleFileClick(item.url || "")} className="px-6 py-3 flex items-center gap-3 hover:bg-stone-100 cursor-pointer transition-colors group">
                                <div className={cn("p-2 rounded shrink-0", item.type === 'folder' ? "bg-amber-100 text-amber-600" : "bg-white border border-stone-200 text-stone-500")}>
                                    {item.type === 'folder' ? <Folder size={18} fill="currentColor" className="opacity-80" /> : <FileText size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-stone-800 truncate">{item.title}</h4>
                                    <div className="text-[10px] text-stone-400 flex items-center gap-2">{item.type === 'file' && <span>{item.size || 'DOC'}</span>}{item.relatedCommissionId && <span className="bg-stone-200 text-stone-600 px-1 rounded text-[9px] uppercase">Komisyon</span>}</div>
                                </div>
                                {item.type === 'folder' ? <ChevronRight size={16} className="text-stone-300 group-hover:text-stone-500" /> : <button className="text-xs font-bold text-boun-blue hover:underline flex items-center gap-1"><Eye size={12} /> <span className="hidden sm:inline">Görüntüle</span></button>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-full bg-[#f5f5f4] relative">

            {/* COMPACT HEADER */}
            <div className="bg-white border-b border-stone-200 sticky top-14 md:top-0 z-30 shadow-sm">
                <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handleSafeBack} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors font-serif font-bold text-xs uppercase tracking-widest">
                            <ArrowLeft size={16} /> Lobiye Dön
                        </button>
                    </div>
                </div>

                {/* Compact Tab Navigation */}
                <div className="px-4 flex gap-6 overflow-x-auto no-scrollbar border-t border-stone-100">
                    <button onClick={() => setActiveTab('institutional')} className={cn("py-3 text-xs md:text-sm font-serif font-bold transition-all relative whitespace-nowrap flex items-center gap-2", activeTab === 'institutional' ? "text-stone-900" : "text-stone-400 hover:text-stone-600")}>
                        <Building2 size={16} /> KURUMSAL BELGELER
                        {activeTab === 'institutional' && !isExiting && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />}
                    </button>
                    <button onClick={() => setActiveTab('academic')} className={cn("py-3 text-xs md:text-sm font-serif font-bold transition-all relative whitespace-nowrap flex items-center gap-2", activeTab === 'academic' ? "text-stone-900" : "text-stone-400 hover:text-stone-600")}>
                        <GraduationCap size={16} /> AKADEMİK HAVUZ
                        {activeTab === 'academic' && !isExiting && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />}
                    </button>
                </div>
            </div>

            {/* CONTENT - Hidden immediately on exit to prevent crash */}
            {!isExiting && (
                <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
                    <AnimatePresence mode="wait">

                        {/* MODE A: INSTITUTIONAL */}
                        {activeTab === 'institutional' && (
                            <motion.div
                                key="institutional"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {commissionFilter && (
                                    <div className="bg-stone-800 text-white p-4 rounded-lg flex items-center justify-between mb-6 shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/10 rounded-full"><Filter size={20} /></div>
                                            <div><h3 className="font-bold text-sm">Filtrelenmiş Görünüm</h3><p className="text-xs text-stone-400">Sadece seçili komisyona ait belgeler listeleniyor.</p></div>
                                        </div>
                                        <button onClick={() => window.location.href = '/arsiv'} className="text-xs font-bold underline text-boun-gold">Filtreyi Kaldır</button>
                                    </div>
                                )}

                                {/* List/Accordion */}
                                {commissionFilter ? (
                                    <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                                        <div className="p-4 bg-stone-50 border-b border-stone-200 font-bold text-stone-700 flex items-center gap-2"><FileText size={18} /> Bulunan Belgeler ({documents.length})</div>
                                        {documents.map(doc => (
                                            <div key={doc.id} onClick={() => handleFileClick(doc.url || "")} className="px-6 py-4 border-b border-stone-100 hover:bg-stone-50 cursor-pointer flex items-center gap-4">
                                                <div className="p-2 bg-stone-100 rounded text-stone-500"><FileText size={20} /></div>
                                                <div><h4 className="font-bold text-stone-800 text-sm">{doc.title}</h4><p className="text-xs text-stone-400">{doc.type === 'file' ? doc.size : 'Klasör'}</p></div>
                                                <ExternalLink size={16} className="ml-auto text-stone-300" />
                                            </div>
                                        ))}
                                        {documents.length === 0 && <div className="p-8 text-center text-stone-400">Bu komisyona ait belge bulunamadı.</div>}
                                    </div>
                                ) : (
                                    rootCategories.length > 0 ? (
                                        rootCategories.map((cat) => (
                                            <div key={cat.id} className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                                                <button onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)} className="w-full px-6 py-4 flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors">
                                                    <div className="flex items-center gap-3"><Folder className={cn("text-stone-400", expandedCategory === cat.id && "text-boun-gold fill-boun-gold")} size={20} /><span className="font-serif font-bold text-stone-800 text-lg">{cat.title}</span></div>
                                                    <ChevronDown size={20} className={cn("text-stone-400 transition-transform", expandedCategory === cat.id && "rotate-180")} />
                                                </button>
                                                <AnimatePresence>
                                                    {expandedCategory === cat.id && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                            {renderInstContentList(cat)}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))
                                    ) : (<div className="text-center py-12 text-stone-400 font-serif italic">Henüz bir kategori oluşturulmamış.</div>)
                                )}
                            </motion.div>
                        )}

                        {/* MODE B: ACADEMIC (Dynamic) */}
                        {activeTab === 'academic' && (
                            <motion.div
                                key="academic"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {/* Search & Filter Header */}
                                <div className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                                    {/* Search Input */}
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            placeholder="Ders kodu ara... (Örn: CMPE150)"
                                            value={academicSearch}
                                            onChange={(e) => setAcademicSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-all font-sans font-medium uppercase text-sm"
                                        />
                                        <Search className="absolute left-3 top-3 text-stone-400" size={16} />
                                    </div>

                                    {/* Filters Row */}
                                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar items-center">
                                        {/* Saved Toggle */}
                                        <button
                                            onClick={() => setShowSavedOnly(!showSavedOnly)}
                                            className={cn(
                                                "px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-1 h-10",
                                                showSavedOnly
                                                    ? "bg-boun-gold text-white border-boun-gold"
                                                    : "bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-400"
                                            )}
                                            title="Sadece Kaydedilenler"
                                        >
                                            <Bookmark size={14} fill={showSavedOnly ? "currentColor" : "none"} />
                                        </button>

                                        {/* Type Filter */}
                                        <div className="relative md:w-40 min-w-[140px]">
                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                                className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg outline-none appearance-none cursor-pointer font-bold text-stone-700 text-xs truncate h-10"
                                            >
                                                {RESOURCE_TYPES_FILTER.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <Filter className="absolute left-2.5 top-3 text-stone-400" size={14} />
                                            <ChevronDown className="absolute right-3 top-3 text-stone-400 pointer-events-none" size={14} />
                                        </div>

                                        {/* Term Filter */}
                                        <div className="relative md:w-32 min-w-[120px]">
                                            <select
                                                value={selectedTerm}
                                                onChange={(e) => setSelectedTerm(e.target.value)}
                                                className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg outline-none appearance-none cursor-pointer font-bold text-stone-700 text-xs truncate h-10"
                                            >
                                                {availableTerms.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <div className="absolute left-2.5 top-3 text-stone-400 font-serif text-[10px] font-bold">YIL</div>
                                            <ChevronDown className="absolute right-3 top-3 text-stone-400 pointer-events-none" size={14} />
                                        </div>

                                        {/* Upload Button */}
                                        <button
                                            onClick={() => setIsUploadModalOpen(true)}
                                            className="flex items-center justify-center gap-1 px-4 py-2.5 bg-boun-blue text-white rounded-lg text-xs font-bold shadow-sm hover:bg-blue-800 transition-colors whitespace-nowrap min-w-fit h-10"
                                        >
                                            <Plus size={16} /> <span className="hidden md:inline">Materyal Paylaş</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Loading State */}
                                {loadingAcad ? (
                                    <div className="text-center py-12 text-stone-400 flex flex-col items-center">
                                        <Loader2 className="animate-spin mb-2" size={32} />
                                        <span className="font-serif">Akademik havuz taranıyor...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {groupedCourses.length === 0 && (
                                            <div className="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
                                                <BookOpen className="mx-auto mb-2 opacity-50" size={32} />
                                                <p>Aradığınız kriterlere uygun kaynak bulunamadı.</p>
                                            </div>
                                        )}

                                        {groupedCourses.map((course) => {
                                            // If showSavedOnly is on, auto-expand courses that have items
                                            const isExpanded = showSavedOnly ? true : (expandedCourse === course.code);

                                            return (
                                                <div key={course.code} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                    {/* Course Header */}
                                                    <button
                                                        onClick={() => !showSavedOnly && setExpandedCourse(isExpanded ? null : course.code)}
                                                        className={cn(
                                                            "w-full flex items-center justify-between p-5 md:p-6 bg-white hover:bg-stone-50 transition-colors",
                                                            showSavedOnly && "cursor-default hover:bg-white"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4 text-left">
                                                            <div className="w-14 h-14 bg-stone-100 rounded-lg flex items-center justify-center text-stone-600 font-bold shrink-0 border border-stone-200 text-lg">
                                                                {course.code.substring(0, 2)}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-serif font-bold text-xl text-stone-900 leading-tight">
                                                                    {course.code}
                                                                </h3>
                                                                <p className="text-sm text-stone-500 font-medium">
                                                                    {course.totalCount} Kaynak Mevcut
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="hidden md:flex items-center gap-1 text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded">
                                                                <Layers size={12} /> {course.totalCount}
                                                            </span>
                                                            {!showSavedOnly && <ChevronDown size={20} className={cn("text-stone-400 transition-transform duration-300", isExpanded && "rotate-180 text-boun-gold")} />}
                                                        </div>
                                                    </button>

                                                    {/* Course Content Accordion */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: "auto" }}
                                                                exit={{ height: 0 }}
                                                                className="overflow-hidden bg-stone-50/50 border-t border-stone-100"
                                                            >
                                                                <div className="p-6 pt-2 space-y-6">
                                                                    {Object.entries(course.resources).map(([type, files]) => (
                                                                        <div key={type}>
                                                                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-stone-200 pb-1">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-boun-gold"></div>
                                                                                {type}
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                {(files as AcademicResource[]).map(file => {
                                                                                    const isYoutube = file.mimeType?.includes('youtube') || file.url.includes('youtube');
                                                                                    const isLink = !file.url.includes('r2.dev') && !isYoutube;
                                                                                    const isSaved = userProfile?.savedLectureNoteIds?.includes(file.id);

                                                                                    return (
                                                                                        <div
                                                                                            key={file.id}
                                                                                            onClick={() => handleFileClick(file.url, file.mimeType)}
                                                                                            className="bg-white border border-stone-200 p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:border-boun-blue hover:shadow-sm transition-all group"
                                                                                        >
                                                                                            <div className={cn(
                                                                                                "p-2 rounded text-stone-400 group-hover:text-white transition-colors shrink-0",
                                                                                                isYoutube ? "bg-red-50 group-hover:bg-red-600 text-red-500" :
                                                                                                    isLink ? "bg-blue-50 group-hover:bg-blue-600 text-blue-500" :
                                                                                                        "bg-stone-50 group-hover:bg-stone-700"
                                                                                            )}>
                                                                                                {isYoutube ? <Youtube size={18} /> : isLink ? <LinkIcon size={18} /> : <FileText size={18} />}
                                                                                            </div>
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <div className="text-sm font-bold text-stone-700 truncate group-hover:text-stone-900">{file.title}</div>
                                                                                                <div className="text-[10px] text-stone-400 flex flex-wrap gap-2 mt-0.5">
                                                                                                    {file.term && <span>{file.term}</span>}
                                                                                                    {file.instructor && <span className="text-stone-500 font-medium hidden sm:inline">• {file.instructor}</span>}
                                                                                                </div>
                                                                                            </div>

                                                                                            {/* Bookmark Button */}
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); toggleBookmark('resource', file.id); }}
                                                                                                className="text-stone-300 hover:text-boun-gold transition-colors p-1"
                                                                                                title="Kaydet"
                                                                                            >
                                                                                                <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} className={isSaved ? "text-boun-gold" : ""} />
                                                                                            </button>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            )}

            {/* Upload Modal */}
            <ResourceUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />

            {/* YouTube Modal Portal */}
            {youtubeModalUrl && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
                    <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                        <button
                            onClick={() => setYoutubeModalUrl(null)}
                            className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black rounded-full p-2 z-10"
                        >
                            <X size={20} />
                        </button>
                        <iframe
                            src={`https://www.youtube.com/embed/${youtubeModalUrl.split('v=')[1] || youtubeModalUrl.split('/').pop()}?autoplay=1`}
                            className="w-full h-full"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            title="Video"
                        />
                    </div>
                </div>,
                document.body
            )}

        </div>
    );
};

export default InstitutionalView;