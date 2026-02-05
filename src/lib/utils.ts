import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', weekday: 'long' };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Türkçe karakterleri İngilizce eşdeğerlerine çevirir
 */
export function turkishToEnglish(text: string): string {
  const charMap: Record<string, string> = {
    'İ': 'I', 'ı': 'i', 'Ş': 'S', 'ş': 's',
    'Ğ': 'G', 'ğ': 'g', 'Ü': 'U', 'ü': 'u',
    'Ö': 'O', 'ö': 'o', 'Ç': 'C', 'ç': 'c'
  };

  return text.split('').map(char => charMap[char] || char).join('');
}

/**
 * Ders kodu oluşturur: PHİL + 101 => PHIL101
 * Türkçe karaktersiz, büyük harf, boşluksuz
 */
export function normalizeCourseCode(deptCode: string, courseNumber: string): string {
  const normalizedDept = turkishToEnglish(deptCode.trim().toUpperCase());
  const normalizedNumber = courseNumber.trim();
  return `${normalizedDept}${normalizedNumber}`;
}

/**
 * İsim normalizasyonu: Duplicate kontrolü için
 * Türkçe karaktersiz, küçük harf, tek boşluk
 */
export function normalizeName(name: string): string {
  const normalized = turkishToEnglish(name.trim().toLowerCase());
  // Çoklu boşlukları teke indir
  return normalized.replace(/\s+/g, ' ');
}

/**
 * İsmi Title Case'e çevirir (Görünen ad için)
 */
export function toTitleCase(name: string): string {
  return name
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
