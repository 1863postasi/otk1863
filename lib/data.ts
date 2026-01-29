import { GoogleCalendarEvent, Announcement, ArchiveItem, Representative, Commission } from "../types";

// --- HERO IMAGES ---
export const HERO_IMAGES = [
  "https://cdn.1863postasi.org/bg/bg1.jpg",
  "https://cdn.1863postasi.org/bg/bg2.jpg",
  "https://cdn.1863postasi.org/bg/bg3.jpg",
  "https://cdn.1863postasi.org/bg/bg4.jpg",
  "https://cdn.1863postasi.org/bg/bg5.jpg"
];

// Helper to create date relative to today with specific hour
const getRelativeDate = (daysAdd: number, hour: number, minute: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAdd);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

// --- CALENDAR MOCK DATA (Google API Structure) ---
export const MOCK_EVENTS: GoogleCalendarEvent[] = [
  {
    id: "1",
    summary: "Sinema Kuşağı: Metropolis",
    clubShortName: "BÜ(S)K",
    category: "cultural",
    start: { dateTime: getRelativeDate(1, 14, 0) },
    end: { dateTime: getRelativeDate(1, 16, 30) },
    location: "Sinebu, Kuzey Kampüs",
    description: "Fritz Lang'ın başyapıtı Metropolis'in restore edilmiş versiyonu."
  },
  {
    id: "2",
    summary: "Algoritma Giriş 101",
    clubShortName: "Compec",
    category: "academic",
    start: { dateTime: getRelativeDate(1, 15, 0) },
    end: { dateTime: getRelativeDate(1, 17, 0) },
    location: "NH 101",
    description: "Python ile algoritmalara giriş eğitimi."
  },
  {
    id: "3",
    summary: "Doğa Yürüyüşü Planlama",
    clubShortName: "BUDAK",
    category: "sports",
    start: { dateTime: getRelativeDate(1, 10, 0) },
    end: { dateTime: getRelativeDate(1, 12, 0) },
    location: "Güney Kampüs Meydan",
    description: "Belgrad Ormanı yürüyüşü için toplanıyoruz."
  },
  {
    id: "4",
    summary: "Caz Konseri",
    clubShortName: "Müzik Kulübü",
    category: "cultural",
    start: { dateTime: getRelativeDate(2, 19, 0) },
    end: { dateTime: getRelativeDate(2, 21, 30) },
    location: "Albert Long Hall",
    description: "Bahar dönemi açılış konseri."
  },
  {
    id: "5",
    summary: "Kariyer Zirvesi",
    clubShortName: "BÜYAK",
    category: "academic",
    start: { dateTime: getRelativeDate(2, 13, 0) },
    end: { dateTime: getRelativeDate(2, 17, 0) },
    location: "Uçaksavar Kampüs",
    description: "Sektör liderleri ile tanışma fırsatı."
  }
];

// --- ANNOUNCEMENTS ---
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    title: "2024-2025 Akademik Takvim Güncellemesi",
    category: "Akademik",
    date: "2024-02-10",
    summary: "Senato kararı ile bahar dönemi final tarihleri bir hafta ileri alınmıştır. Güncel takvime OBİKAS üzerinden ulaşabilirsiniz.",
    isPinned: true
  },
  {
    id: "a2",
    title: "Yemekhane Burs Başvuruları",
    category: "Burs",
    date: "2024-02-08",
    summary: "Bahar dönemi yemek bursu başvuruları 15 Şubat'a kadar uzatılmıştır. Belgelerinizi eksiksiz teslim etmeniz rica olunur.",
    isPinned: true
  },
  {
    id: "a3",
    title: "59R Hattı Sefer Sıklığı",
    category: "Ulaşım",
    date: "2024-02-05",
    summary: "İETT ile yapılan görüşmeler sonucu sabah 08:00-10:00 saatleri arasında Hisarüstü-Rumelihisarüstü ring seferleri sıklaştırılmıştır.",
    isPinned: false
  },
  {
    id: "a4",
    title: "Kütüphane Çalışma Saatleri",
    category: "Akademik",
    date: "2024-02-03",
    summary: "Aptullah Kuran Kütüphanesi, vize döneminin yaklaşması sebebiyle önümüzdeki haftadan itibaren 7/24 hizmet verecektir.",
    isPinned: false
  },
  {
    id: "a5",
    title: "Vegan Menü Seçeneği",
    category: "Yemekhane",
    date: "2024-02-01",
    summary: "Kuzey ve Güney yemekhanelerinde alternatif vegan menü çıkışı, talepler doğrultusunda artırılmıştır.",
    isPinned: false
  }
];

// --- ARCHIVE ---
export const MOCK_ARCHIVE: ArchiveItem[] = [
  {
    id: "1",
    title: "1998 ÖTK Tüzüğü",
    type: "pdf",
    size: "2.4 MB",
    date: "1998-05-12",
    category: "ÖTK",
    rights: "Kamuya Açık"
  },
  {
    id: "2",
    title: "Direniş Fotoğrafları - Güney Meydan",
    type: "img",
    size: "15 MB",
    date: "2021-01-04",
    category: "Direniş",
    rights: "CC BY-NC"
  },
  {
    id: "3",
    title: "Math 101 - 2005 Final Soruları",
    type: "pdf",
    size: "1.1 MB",
    date: "2005-06-20",
    category: "Ders Notu",
    rights: "Öğrenci Paylaşımı"
  },
  {
    id: "4",
    title: "Hamlin Hall Restorasyon Raporu",
    type: "doc",
    size: "500 KB",
    date: "2010-09-15",
    category: "Üniversite Tarihi",
    rights: "Rektörlük Arşivi"
  }
];

// --- TIMELINE DATA ---
export const MOCK_TIMELINE = [
    {
        year: "1909",
        title: "Kökler ve Gelenek: İlk Birlik",
        desc: "Robert Kolej Öğrenci Birliği'nin kuruluşuyla başlayan asırlık temsil geleneği.",
        image: "https://cdn.1863postasi.org/bg/history-1909.jpg"
    },
    {
        year: "1971",
        title: "Yeni Bir Akademi",
        desc: "Yüksekokulun kamu üniversitesine dönüşümü.",
        image: "https://cdn.1863postasi.org/bg/history-1971.png"
    },
    {
        year: "1999",
        title: "Meşruiyet İmzası",
        desc: "ÖTK'nın Üniversite Senatosu kararıyla resmen kurulması ve kurumsallaşması.",
        image: "https://cdn.1863postasi.org/bg/history-1999.png"
    },
    {
        year: "2021",
        title: "Direniş Ocağında Yeniden Şekillenmek",
        desc: "Kayyum rektör atamalarına karşı başlayan direnişin ve akademik özgürlük mücadelesinin öncülüğü.",
        image: "https://cdn.1863postasi.org/bg/history-2021.png"
    },
    {
        year: "Günümüz",
        title: "Kampüsün Sesi, Öğrencinin İradesi",
        desc: "Kuruluştan bugüne, Boğaziçi kültürünü ve öğrenci haklarını savunan sarsılmaz irade.",
        image: "https://cdn.1863postasi.org/bg/history-today.png"
    }
];

// --- FACULTY & REP STRUCTURE (Source of Truth) ---
export const MOCK_FACULTIES = [
    {
        name: "Eğitim Fakültesi",
        slug: "egitim",
        departments: [
            { name: "Bilgisayar ve Öğretim Teknolojileri Eğitimi" },
            { name: "Eğitim Bilimleri" },
            { name: "Temel Eğitim" },
            { name: "Matematik ve Fen Bilimleri Eğitimi" },
            { name: "Yabancı Diller Eğitimi" },
        ]
    },
    {
        name: "Fen-Edebiyat Fakültesi",
        slug: "fef",
        departments: [
            { name: "Fizik" },
            { name: "Kimya" },
            { name: "Matematik" },
            { name: "Moleküler Biyoloji ve Genetik" },
            { name: "Sosyoloji" },
            { name: "Psikoloji" },
            { name: "Tarih" },
            { name: "Türk Dili ve Edebiyatı" },
            { name: "Batı Dilleri ve Edebiyatları" },
            { name: "Çeviribilimi" },
            { name: "Dilbilimi" },
            { name: "Felsefe" },
        ]
    },
    {
        name: "Hukuk Fakültesi",
        slug: "hukuk",
        departments: [
            { name: "Hukuk" }
        ]
    },
    {
        name: "İktisadi ve İdari Bilimler Fakültesi",
        slug: "iibf",
        departments: [
            { name: "İktisat" },
            { name: "İşletme" },
            { name: "Siyaset Bilimi ve Uluslararası İlişkiler" },
        ]
    },
    {
        name: "Yönetim Bilimleri Fakültesi",
        slug: "yb",
        departments: [
            { name: "Turizm İşletmeciliği" },
            { name: "Uluslararası Ticaret" },
            { name: "Yönetim Bilişim Sistemleri" },
        ]
    },
    {
        name: "Mühendislik Fakültesi",
        slug: "muh",
        departments: [
            { name: "Bilgisayar Mühendisliği" },
            { name: "Elektrik-Elektronik Mühendisliği" },
            { name: "Endüstri Mühendisliği" },
            { name: "İnşaat Mühendisliği" },
            { name: "Kimya Mühendisliği" },
            { name: "Makina Mühendisliği" },
        ]
    },
    {
        name: "Hazırlık",
        slug: "hazirlik",
        departments: [
            { name: "P1" },
            { name: "P2" },
            { name: "P3" },
            { name: "P4" },
        ]
    }
];

export const MOCK_COMMISSIONS: Commission[] = []; 
export const MOCK_COMMISSIONS_EXPANDED = []; // Removed legacy hardcoded commissions
export const MOCK_REPS: Representative[] = [];
export const MOCK_EXEC_BOARD = [];