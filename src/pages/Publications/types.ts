
import { Timestamp } from 'firebase/firestore';

export type PublicationType = 'Dergi' | 'Fanzin' | 'Bülten' | 'Süreli (ÖTK)' | 'Süreli Yayın';

export interface Issue {
    id: string;
    title: string;
    date: string;
    cover: string; // R2 URL
    pdfUrl: string; // R2 URL
    issueNumber?: number;
}

export interface Publication {
    id: string;
    title: string;
    description: string;
    coverImage: string; // R2 URL
    type: PublicationType;
    frequency?: string; // 'Aylık', 'Mevsimlik' vs.
    instagram?: string; // '@bounenso'
    author?: string;    // 'Bağımsız Öğrenciler'
    issues?: Issue[];
    createdAt?: Timestamp;
    order?: number;     // Sıralama için
}

export interface DiaryRegion {
    id: string;
    title: string;
    subtitle: string;
    x: number; // Grid X: -2 to 2
    y: number; // Grid Y: 0 to 2
    content: string; // HTML allowed or Markdown
    theme: 'light' | 'dim' | 'dark' | 'abyss';
    locked?: boolean; // Gelecekte açılacaklar için
    authorId?: string; // Sadece bu kişi düzenleyebilir
    updatedAt?: Timestamp;
}
