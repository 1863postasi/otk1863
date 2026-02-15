import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeDate(dateInput: string | Date | number | any): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'number') return new Date(dateInput);

  // Handle Firestore Timestamp (has seconds/nanoseconds)
  if (typeof dateInput === 'object' && 'seconds' in dateInput) {
    return new Date(dateInput.seconds * 1000);
  }

  if (typeof dateInput === 'string') {
    // Fix iOS/Safari issue with dashes in dates by replacing with slashes
    // Fix "YYYY-MM-DD HH:MM:SS" -> "YYYY/MM/DD HH:MM:SS" or "YYYY-MM-DDT..."
    // If it contains dashes and no T, and looks like a date
    let formatted = dateInput;
    if (formatted.includes('-') && !formatted.includes('T') && formatted.includes(':')) {
      // Likely YYYY-MM-DD HH:MM:SS format which Safari hates. Convert space to T?
      // Or just replace dashes with slashes.
      formatted = formatted.replace(/-/g, '/');
    } else if (formatted.includes('-') && !formatted.includes('T') && !formatted.includes('/')) {
      // Plain YYYY-MM-DD
      formatted = formatted.replace(/-/g, '/');
    }

    const d = new Date(formatted);
    if (!isNaN(d.getTime())) return d;
  }

  // Fallback
  return new Date();
}

export function formatDate(dateString: string | any): string {
  const date = safeDate(dateString);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', weekday: 'long' };

  if (isNaN(date.getTime())) return "Tarih Yok";
  return date.toLocaleDateString('tr-TR', options);
}

export function formatTime(dateString: string | any): string {
  const date = safeDate(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
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

/**
 * Türkiye saatiyle bugünün tarihini YYYY-MM-DD formatında döndürür.
 * Boundle oyunlarında herkesin aynı günü oynaması ve skorların doğru güne işlenmesi için kullanılır.
 * (Kullanıcının yerel saatinden bağımsızdır)
 */
export function getTurkeyDateString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
}
