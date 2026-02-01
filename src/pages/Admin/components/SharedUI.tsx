import React, { useRef } from 'react';
import { Loader2, Save, RefreshCw, CheckCircle, FolderPlus, UploadCloud, FileStack, Video } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const Header = ({ title, desc }: { title: string, desc: string }) => (
  <div className="mb-8 border-b border-stone-200 pb-4">
    <h2 className="font-serif text-3xl font-bold text-stone-900">{title}</h2>
    <p className="text-stone-500 mt-1 font-sans text-sm">{desc}</p>
  </div>
);

export const Input = ({ label, type = "text", placeholder, value, onChange }: any) => (
  <div className="w-full">
    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">{label}</label>
    <input 
      type={type} 
      placeholder={placeholder} 
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-none transition-all font-sans text-sm shadow-sm"
    />
  </div>
);

export const Select = ({ label, options, value, onChange }: any) => (
  <div className="w-full">
    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">{label}</label>
    <select 
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-none transition-all font-sans text-sm shadow-sm appearance-none cursor-pointer"
    >
      {options.map((opt: any) => (
        <option key={typeof opt === 'string' ? opt : opt.val} value={typeof opt === 'string' ? opt : opt.val}>
            {typeof opt === 'string' ? opt : opt.label}
        </option>
      ))}
    </select>
  </div>
);

export const TextArea = ({ label, placeholder, value, className, onChange }: any) => (
  <div className="w-full">
    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">{label}</label>
    <textarea 
      placeholder={placeholder} 
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      className={cn("w-full px-4 py-2.5 bg-white border border-stone-300 rounded text-stone-900 focus:ring-2 focus:ring-stone-800 focus:border-stone-800 outline-none transition-all font-sans text-sm shadow-sm min-h-[120px] resize-y", className)}
    />
  </div>
);

interface FileUploaderProps {
    label: string;
    onFileSelect?: (files: FileList | File) => void;
    selectedFileName?: string;
    isFolder?: boolean;
    allowMultiple?: boolean;
    accept?: string;
}

export const FileUploader = ({ label, onFileSelect, selectedFileName, isFolder = false, allowMultiple = false, accept }: FileUploaderProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="w-full">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">{label}</label>
            <div 
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-stone-50 hover:border-stone-400 transition-colors bg-white relative group"
            >
                <input 
                    ref={inputRef}
                    type="file" 
                    className="hidden"
                    accept={accept}
                    // @ts-ignore
                    webkitdirectory={isFolder ? "" : undefined}
                    directory={isFolder ? "" : undefined}
                    multiple={isFolder || allowMultiple}
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0 && onFileSelect) {
                            if (isFolder || allowMultiple) {
                                onFileSelect(e.target.files); 
                            } else {
                                onFileSelect(e.target.files[0]);
                            }
                        }
                    }}
                />
                <div className="p-3 bg-stone-100 rounded-full mb-3 text-stone-400 group-hover:text-stone-600 transition-colors">
                    {selectedFileName ? <CheckCircle size={24} className="text-boun-green"/> : (
                        accept?.includes('video') ? <Video size={24}/> : (isFolder ? <FolderPlus size={24} /> : (allowMultiple ? <FileStack size={24} /> : <UploadCloud size={24} />))
                    )}
                </div>
                <p className="text-stone-700 font-bold text-sm">{selectedFileName || (isFolder ? "Klasör Yükle" : (allowMultiple ? "Dosyaları Seç (Çoklu)" : "Dosya Yükle"))}</p>
                <p className="text-stone-400 text-xs mt-1">
                    {selectedFileName ? "Değiştirmek için tıklayın" : "veya buraya sürükleyin"}
                </p>
            </div>
        </div>
    );
};

export const ActionButtons = ({ loading, onSave, isEditing, onCancel }: { loading: boolean, onSave: () => void, isEditing?: boolean, onCancel?: () => void }) => (
  <div className="pt-6 mt-6 border-t border-stone-200 flex justify-end gap-3">
     {isEditing && (
       <button 
         onClick={onCancel}
         disabled={loading}
         className="px-6 py-3 rounded-md font-bold text-sm text-stone-600 hover:bg-stone-100 transition-all border border-stone-300"
       >
         İptal
       </button>
     )}
     <button 
       onClick={onSave}
       disabled={loading}
       className={cn(
         "text-white px-8 py-3 rounded-md font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed",
         isEditing ? "bg-boun-blue hover:bg-blue-800" : "bg-stone-900 hover:bg-stone-700"
       )}
     >
       {loading ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? <RefreshCw size={18} /> : <Save size={18} />)}
       {loading ? "İşleniyor..." : (isEditing ? "Güncelle" : "İçeriği Kaydet")}
     </button>
  </div>
);