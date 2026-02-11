import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  // Safari/iOS fixes for date parsing
  const safeDate = new Date(dateString.replace(/-/g, '/')); // Replace dashes with slashes for Safari compatibility
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', weekday: 'long' };

  // Try parsing, if invalid use original string
  if (isNaN(safeDate.getTime())) {
    // Fallback: try original, or return string as is if valid date
    const originalDate = new Date(dateString);
    if (!isNaN(originalDate.getTime())) {
      return originalDate.toLocaleDateString('tr-TR', options);
    }
    return dateString;
  }
  return safeDate.toLocaleDateString('tr-TR', options);
}

export function formatTime(dateString: string): string {
  const safeDate = new Date(dateString.replace(/-/g, '/'));
  if (isNaN(safeDate.getTime())) {
    const originalDate = new Date(dateString);
    if (!isNaN(originalDate.getTime())) {
      return originalDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    return "";
  }
  return safeDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
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
