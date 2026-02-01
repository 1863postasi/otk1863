import React from 'react';
import { MOCK_ARCHIVE } from '../../lib/data';
import { FileText, Image, File, Download } from 'lucide-react';

const ArchiveList: React.FC = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="text-boun-red" />;
      case 'img': return <Image className="text-boun-blue" />;
      default: return <File className="text-stone-500" />;
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-stone-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-serif font-bold text-stone-500 uppercase tracking-wider">Tür</th>
              <th className="px-6 py-3 text-left text-xs font-serif font-bold text-stone-500 uppercase tracking-wider">Dosya Adı</th>
              <th className="px-6 py-3 text-left text-xs font-serif font-bold text-stone-500 uppercase tracking-wider">Tarih</th>
              <th className="px-6 py-3 text-left text-xs font-serif font-bold text-stone-500 uppercase tracking-wider">Haklar</th>
              <th className="px-6 py-3 text-right text-xs font-serif font-bold text-stone-500 uppercase tracking-wider">İşlem</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200 font-sans text-sm">
            {MOCK_ARCHIVE.map((item) => (
              <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  {getIcon(item.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-stone-900 font-medium">{item.title}</div>
                  <div className="text-stone-400 text-xs">{item.size}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-stone-600">
                  {item.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-stone-100 text-stone-600 border border-stone-300">
                    {item.rights}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-boun-blue hover:text-boun-red flex items-center justify-end gap-1 ml-auto">
                    <Download size={16} />
                    <span className="hidden sm:inline">İndir</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArchiveList;
