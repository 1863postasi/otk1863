import { GameItem } from './budgetTypes';

/**
 * ==========================================================================================
 *  BOĞAZİÇİ BÜTÇE SİMÜLATÖRÜ - VERİ HAVUZU
 * ==========================================================================================
 * 
 * Yeni veri eklemek için aşağıdaki şablonları kopyalayıp ilgili listenin altına yapıştırın.
 * 
 * ÖNEMLİ NOT: 
 * Oyun motoru hangi kategoriden kaç tane seçeceğine 'category' kısmına bakarak karar verir.
 * ID'ler sadece benzersiz (unique) olmalıdır.
 * 
 * Kategoriler:
 * - 'infrastructure' : Büyük Projeler (2 Tane seçilir)
 * - 'student'        : Öğrenci Destek (3 Tane seçilir)
 * - 'fun'            : Eğlence / Küçük (5 Tane seçilir)
 * - 'policy'         : Gelir / Tasarruf (3 Tane seçilir)
 */

// ==========================================================================================
// 1. MANŞETLER (HEADLINES)
// ==========================================================================================
export const HEADLINES_POOL: string[] = [
    "ÖTK Arşiv Komitesi Uyardı: Bütçe Nerede?",
    "Kampüste Bahar Havası: Harcamalar Arttı!",
    "Öğrenciler Soruyor: Bu Para Nereye Gidiyor?",
    "Kayyumluktan Açıklama: 'Tasarruf Tedbirleri Yolda'",
    "Kilyos Kampüsü'ne Yatırım Beklentisi",
    "Kedilere Mama Lazım. Sponsorluk Görüşmeleri Başladı",
    "Güney Meydan Düzenlemesi Gündemde",
    "Yeni Bir Fakülte Daha Kuruldu.(Kimsenin Haberi Yok)",
    "Bütçe Açığına Çözüm: Çimlerde Oturma Vergisi Geliyor.",
    "Güvenlik Kameraları Sayısı Öğrenci Sayısını Geçti!",
    "Atanmış Yönetimden Dev Hizmet: Güney Kapı'ya 10 Yeni Turnike İhalesi.",
    "New Hall Yine Sular Altında! Güçlendirme Şart.",
    "Kandilli Rasathanesi Uyardı: 'Sınav Stresi Deprem Etkisi Yaratıyor.'",
    "Sürpriz Bağış: BUVAKIF Muslukları Açtı.",
    "Kantindeki Tost Fiyatları Borsa Gibi Dalgalanıyor.",
];

// ==========================================================================================
// 2. GELİR VE TASARRUFLAR (INCOME / POLICIES)
// Fiyatlar POZİTİF yazılır, oyun motoru bunları gelir olarak işler.
// ==========================================================================================
export const INCOME_ITEMS: GameItem[] = [
    { id: '301', name: 'Makam Araçlarını İptal Et', price: 10370470, emoji: '🚍', category: 'policy', maxQuantity: 32 },
    { id: '302', name: 'Tanıtım Bütçesini Azalt', price: 2387900, emoji: '🤝', category: 'policy', maxQuantity: 1 },
    { id: '303', name: 'Propaganda Belgeseli Ödeneğini İptal Et', price: 1500000, emoji: '📽️', category: 'policy', maxQuantity: 1 },
    { id: '304', name: 'Ampulleri Değiştir :D', price: 500000, emoji: '💡', category: 'policy', maxQuantity: 10 },
    { id: '305', name: 'Damadının Bacanağını İşten Çıkar', price: 500000, emoji: '✂️', category: 'policy', maxQuantity: 2 },
    { id: '306', name: 'Rektörlük "Temsil ve Ağırlama" Giderlerini Kıs', price: 8500000, emoji: 'lobster', category: 'policy', maxQuantity: 1 },
    { id: '307', name: 'Turnikeleri Hurdacıya Sat', price: 3500, emoji: '🔗', category: 'policy', maxQuantity: 2 },
    { id: '308', name: 'Troll Hesaplara Giden Maaşları Kes', price: 1250000, emoji: '🤖', category: 'policy', maxQuantity: 5 },
    {
        id: '309', name: 'TOMA'lardan Otopark Ücreti Al', price: 750000, emoji: '🚓', category: 'policy', maxQuantity: 3 },
    { id: '310', name: 'Manzarayı Düğün Salonu Olarak Kirala', price: 15000000, emoji: '💍', category: 'policy', maxQuantity: 1 },
    { id: '311', name: 'Adrese Teslim Kadroları İptal Et', price: 4200000, emoji: '📝', category: 'policy', maxQuantity: 10 },
    {
        id: '312', name: 'Kilyos'a Rüzgar Gülleri Koyup Elektrik Sat', price: 2100000, emoji: '🌬️', category: 'policy', maxQuantity: 3 },
    { id: '313', name: 'Okul Girişine X-Ray Cihazı İhalesini İptal Et', price: 6800000, emoji: '🩻', category: 'policy', maxQuantity: 1 },
    { id: '314', name: 'Mezunlardan "Duygu Sömürüsü" ile Bağış Topla', price: 3500000, emoji: '🎓', category: 'policy', maxQuantity: 4 },
    { id: '315', name: 'Yemekhane Kartlarındaki Artık Kuruşlara Çök', price: 250000, emoji: '🪙', category: 'policy', maxQuantity: 5 },
    { id: '316', name: 'Usulsüz Tadilatları Durdur', price: 5400000, emoji: '🔨', category: 'policy', maxQuantity: 1 },
    { id: '317', name: 'ÖGB Sayısını Yarıya İndir', price: 12000000, emoji: '👮', category: 'policy', maxQuantity: 1 },
    { id: '319', name: 'ÖBİKAS Girişlerini Paralı Yap', price: 900000, emoji: '💻', category: 'policy', maxQuantity: 1 },
];

// ==========================================================================================
// 3. HARCAMALAR (EXPENSES)
// Fiyatlar POZİTİF yazılır.
// ==========================================================================================
export const EXPENSE_ITEMS: GameItem[] = [
    // --- BÜYÜK PROJELER (Infrastructure) ---
    { id: '101', name: '600 Kişilik Yurt Yap', price: 150000000, emoji: '🏢', category: 'infrastructure', maxQuantity: 1 },
    { id: '102', name: 'Kuzey Kampüs Restorasyonu', price: 45000000, emoji: '🏛️', category: 'infrastructure', maxQuantity: 1 },
    { id: '103', name: 'Genel Restorasyonlar', price: 5000000, emoji: '🚇', category: 'infrastructure', maxQuantity: 10 },
    { id: '104', name: 'Kilyosa Shuttle Filosu', price: 20000000, emoji: '🚌', category: 'infrastructure', maxQuantity: 3 },
    { id: '105', name: 'Kütüphane Ek Binası', price: 80000000, emoji: '📚', category: 'infrastructure', maxQuantity: 1 },
    { id: '106', name: 'Tüm Binalara Deprem Güçlendirmesi', price: 65000000, emoji: '🏗️', category: 'infrastructure', maxQuantity: 1 },
    { id: '107', name: 'Kampüs Hayvanları Rehabilitasyon Merkezi', price: 22500000, emoji: '🐈', category: 'infrastructure', maxQuantity: 2 },
    { id: '108', name: 'Kilyos Rüzgar ve Güneş Enerji Santrali', price: 22000000, emoji: '☀️', category: 'infrastructure', maxQuantity: 2 },
    { id: '109', name: 'Hisarüstü\'nde Öğrenci Konukevi Satın Al', price: 100000000, emoji: '🏠', category: 'infrastructure', maxQuantity: 1 },
    { id: '110', name: 'Tam Erişilebilir Kampüs (Rampa/Asansör)', price: 12000000, emoji: '♿', category: 'infrastructure', maxQuantity: 8 },
    { id: '111', name: 'Modern Yemekhane Kompleksi', price: 28000000, emoji: '🍽️', category: 'infrastructure', maxQuantity: 2 },
    { id: '112', name: 'Mezunlar ve Öğrenciler Ortak Ar-Ge Merkezi', price: 18500000, emoji: '🔬', category: 'infrastructure', maxQuantity: 1 },
    { id: '113', name: 'Bağımsız Kültür ve Sanat Merkezi', price: 75000000, emoji: '🎭', category: 'infrastructure', maxQuantity: 1 },
    { id: '114', name: 'Süper Hızlı Kampüs Fiber Ağı', price: 12500000, emoji: '🌐', category: 'infrastructure', maxQuantity: 7 },

    // --- ÖĞRENCİ DESTEK (Student) ---
    { id: '201', name: '1 Yıllık Yemekhane Sponsorluğu', price: 30000, emoji: '🥗', category: 'student', maxQuantity: 2000 },
    { id: '202', name: '1 Öğrenciye Kira Desteği', price: 120000, emoji: '🏠', category: 'student', maxQuantity: 1000 },
    { id: '203', name: 'Bahar Şenliği Bütçesi', price: 8000000, emoji: '🎉', category: 'student', maxQuantity: 2 },
    { id: '204', name: 'Ücretsiz Kahve Dağıtımı', price: 50000, emoji: '☕', category: 'student', maxQuantity: 300 },
    { id: '205', name: 'Kampüs Kedileri İçin Mama', price: 15000, emoji: '🐈', category: 'student', maxQuantity: 50 },
    { id: '206', name: 'Kulüp Ödeneği', price: 50000, emoji: '🎭', category: 'student', maxQuantity: 60 },
    { id: '207', name: 'BÜREM\'e Ekstra Danışman', price: 1200000, emoji: '🧠', category: 'student', maxQuantity: 3 },
    { id: '208', name: '7/24 Açık Çalışma Salonu (Çay-Çorba İkramlı)', price: 450000, emoji: '📖', category: 'student', maxQuantity: 10 },
    { id: '209', name: 'Eduroam Güçlendirici (Her Köşeye Wi-Fi)', price: 850000, emoji: '📶', category: 'student', maxQuantity: 5 },
    { id: '210', name: 'Yaz Okulu Bursu', price: 2500000, emoji: '☀️', category: 'student', maxQuantity: 5 },
    { id: '211', name: 'Bağımsız Öğrenci Oluşumlarına Ekipman Desteği', price: 150000, emoji: '📸', category: 'student', maxQuantity: 15 },
    { id: '212', name: 'Güney Kampüs Bakımı', price: 180000, emoji: '🌱', category: 'student', maxQuantity: 2 },
    { id: '213', name: 'Ekstra Ring Seferi (Kilyos-Kuzey Arası)', price: 350000, emoji: '🚍', category: 'student', maxQuantity: 10 },
    { id: '214', name: 'Öğrencilere Hukuki Destek Fonu', price: 600000, emoji: '⚖️', category: 'student', maxQuantity: 2 },
    { id: '215', name: 'Tuvaletlere 3 Katlı Peçete & Sıvı Sabun', price: 90000, emoji: '🧻', category: 'student', maxQuantity: 9999 },
    { id: '216', name: '"Alternatif" Mezuniyet Töreni Organizasyonu', price: 750000, emoji: '🎓', category: 'student', maxQuantity: 1 },
    { id: '217', name: 'Kampüs İçi Bisiklet Yolları Ağı', price: 300000, emoji: '🚲', category: 'student', maxQuantity: 7 },
    { id: '218', name: 'Kulüp Odaları? İçin Ses Yalıtımı ve Boya-Badana', price: 12000, emoji: '🎸', category: 'student', maxQuantity: 60 },

    // --- ABSÜRT / EĞLENCE (Fun) ---
    { id: '401', name: 'Boğaz Manzaralı Bank Satın Al', price: 25000, emoji: '🪑', category: 'fun', maxQuantity: 9999 },
    { id: '402', name: 'Martılara Simit Fonu', price: 10000, emoji: '🕊️', category: 'fun', maxQuantity: 9999 },
    { id: '403', name: 'Manzaraya Vergi Öde', price: 500000, emoji: '🌉', category: 'fun', maxQuantity: 9999 },
    { id: '404', name: 'Merdivenleri Gökkuşağına Boya', price: 20000, emoji: '🎨', category: 'fun', maxQuantity: 9999 },
    { id: '405', name: 'Kampüs Kedisine Gurme Mama', price: 250, emoji: '🥫', category: 'fun', maxQuantity: 9999 },
    { id: '406', name: 'Ders Notu Fotokopisi Çektir', price: 5, emoji: '📄', category: 'fun', maxQuantity: 9999 },
    { id: '407', name: 'Metro Abonmanı Al', price: 500, emoji: '🚇', category: 'fun', maxQuantity: 9999 },
    { id: '408', name: 'Kilyos Otobüsünee Bin', price: 45, emoji: '🚌', category: 'fun', maxQuantity: 9999 },
    { id: '409', name: 'Çimlerde Yuvarlanma Vergisi', price: 378, emoji: '🌱', category: 'fun', maxQuantity: 9999 },
    { id: '410', name: 'Otopark (Saatlik)', price: 500, emoji: '🅿️', category: 'fun', maxQuantity: 9999 },
    { id: '411', name: 'KK Tost & Çay', price: 180, emoji: '🥪', category: 'fun', maxQuantity: 9999 },
    { id: '412', name: 'Hisarüstü Esnafına Destek Çık', price: 1000, emoji: '🏘️', category: 'fun', maxQuantity: 9999 },
    { id: '413', name: 'Kayyuma Düdük Çal', price: 75, emoji: '📢', category: 'fun', maxQuantity: 9999 },
    { id: '414', name: 'Güney Yokuşu Çıkarken Oksijen Tüpü', price: 1500, emoji: '😮‍💨', category: 'fun', maxQuantity: 9999 },
    { id: '415', name: 'Sivile Dik Dik Bakıp "Kolay Gelsin" De', price: 1, emoji: '👮', category: 'fun', maxQuantity: 9999 },
    { id: '416', name: 'Kütüphanede Yer Tutmak İçin Çanta Bırak ve Çaldır', price: 1200, emoji: '🎒', category: 'fun', maxQuantity: 9999 },
    { id: '417', name: 'Hocam Quiz Var Mıydı Diye Sor', price: 10, emoji: '🤓', category: 'fun', maxQuantity: 9999 },
    { id: '418', name: 'Soruşturman İçin Noter Masrafları', price: 1500, emoji: '💳', category: 'fun', maxQuantity: 9999 },
    { id: '419', name: 'Manzara\'da Karanfilli "Efkar" Sigarası', price: 120, emoji: '🚬', category: 'fun', maxQuantity: 9999 },
    { id: '420', name: 'Online Derste Kamerayı Açık Unut', price: 5000, emoji: '📹', category: 'fun', maxQuantity: 9999 },
    { id: '421', name: 'Kulüp Kapısına "Zincir" Al', price: 400, emoji: '⛓️', category: 'fun', maxQuantity: 9999 },
    { id: '422', name: 'Bebek\'te Pahalı Kafelerde "Boğaziçiliyim" Diye Hava At', price: 1300, emoji: '😎', category: 'fun', maxQuantity: 9999 },
    { id: '423', name: 'Aşiyan Mezarlığı\'nda Şair Mezarlarından Şiir Çal', price: 0, emoji: '🪦', category: 'fun', maxQuantity: 9999 },
    { id: '424', name: 'Öğrenci İşlerini Kontörlü Telefonla Ara (Açmıyorlar)', price: 5, emoji: '☎️', category: 'fun', maxQuantity: 9999 },
    { id: '426', name: 'GSK\'ya Yeni Kettle Al', price: 2500, emoji: '🫖', category: 'fun', maxQuantity: 9999 },
    { id: '427', name: 'Haziran Boyunca Tüm Binalara Gökkuşağı Yansıt', price: 600000, emoji: '🌈', category: 'fun', maxQuantity: 9999 },
    { id: '428', name: '1.854.883 Paket Kısa Parliament', price: 185488300, emoji: '🚬', category: 'fun', maxQuantity: 1 },
    { id: '429', name: 'Parayı Zimmetine Geçir', price: 185488378, emoji: '✈️', category: 'fun', maxQuantity: 1 },
];

// ==========================================================================================
// 4. ÖZEL ÖĞELER (SPECIAL ITEMS)
// ==========================================================================================
export const SPECIAL_ITEM: GameItem = {
    id: 'special-1',
    name: 'Cebin Delikmiş; 1 Lira Düşür',
    price: 1, // 1 TL Harcama (Bütçeden düşer)
    emoji: '🕳️',
    category: 'fun',
    // maxQuantity YOK -> Sınırsız
};
