import { GameItem } from './types';

/**
 * ==========================================================================================
 *  BOĞAZİÇİ BÜTÇE SİMÜLATÖRÜ - VERİ HAVUZU
 * ==========================================================================================
 * 
 * Yeni veri eklemek için aşağıdaki şablonları kopyalayıp ilgili listenin altına yapıştırın.
 * 
 * --- HARCAMA EKLEME ŞABLONU ---
 * {
 *   id: 'benzersiz-id',      // Örn: 'exp-101'
 *   name: 'Örnek Harcama', 
 *   price: 500,              // POZİTİF Sayı (Harcama Tutarı)
 *   emoji: '💸',
 *   category: 'fun',         // 'infrastructure' | 'student' | 'fun'
 *   maxQuantity: 1           // (Opsiyonel) En fazla kaç tane alınabilir?
 * },
 * 
 * --- GELİR/TASARRUF EKLEME ŞABLONU ---
 * {
 *   id: 'benzersiz-id',      // Örn: 'inc-101'
 *   name: 'Örnek Gelir', 
 *   price: 1000,             // POZİTİF Sayı (Kazanç Tutarı)
 *   emoji: '💰',
 *   category: 'policy',      // Genelde 'policy' kullanılır
 *   maxQuantity: 1
 * },
 * 
 * --- MANŞET EKLEME ŞABLONU ---
 * "Yeni Manşet Metni Buraya",
 */

// ==========================================================================================
// 1. MANŞETLER (HEADLINES)
// ==========================================================================================
export const HEADLINES_POOL: string[] = [
    "Ekonomi Kulübü Uyardı: Bütçe Nereye?",
    "Kampüste Bahar Havası: Harcamalar Arttı!",
    "Öğrenciler Soruyor: Bu Para Nereye Gidiyor?",
    "Rektörlükten Açıklama: 'Tasarruf Tedbirleri Yolda'",
    "Kilyos Kampüsü'ne Yatırım Beklentisi",
    "Kediler Mama İstiyor: Bütçe Görüşmeleri Başladı",
    "Güney Meydan Düzenlemesi Gündemde",
    // Yeni manşetleri buraya ekleyin:
];

// ==========================================================================================
// 2. GELİR VE TASARRUFLAR (INCOME / POLICIES)
// Fiyatlar POZİTİF yazılır, oyun motoru bunları gelir olarak işler.
// ==========================================================================================
export const INCOME_ITEMS: GameItem[] = [
    { id: '301', name: 'Makam Araçlarını İptal Et', price: 10370470, emoji: '🚍', category: 'policy', maxQuantity: 1 },
    { id: '302', name: 'Tanıtım Bütçesini Azalt', price: 2387900, emoji: '🤝', category: 'policy', maxQuantity: 1 },
    { id: '303', name: 'PR Aboneliklerini İptal Et', price: 1500000, emoji: '📽️', category: 'policy', maxQuantity: 1 },
    { id: '304', name: 'Gereksiz Işıkları Kapat', price: 500000, emoji: '💡', category: 'policy', maxQuantity: 1 },
    { id: '305', name: 'Bürokratik Giderleri Kıs', price: 5000000, emoji: '✂️', category: 'policy', maxQuantity: 1 },
    // Yeni gelirleri buraya ekleyin:
];

// ==========================================================================================
// 3. HARCAMALAR (EXPENSES)
// Fiyatlar POZİTİF yazılır.
// ==========================================================================================
export const EXPENSE_ITEMS: GameItem[] = [
    // --- BÜYÜK PROJELER (Infrastructure) ---
    { id: '101', name: '1000 Kişilik Prefabrik Yurt', price: 120000000, emoji: '🏢', category: 'infrastructure', maxQuantity: 5 },
    { id: '102', name: 'Güney Kampüs Restorasyonu', price: 45000000, emoji: '🏛️', category: 'infrastructure', maxQuantity: 1 },
    { id: '103', name: 'Metro Yürüyen Merdiven Tamiri', price: 5000000, emoji: '🚇', category: 'infrastructure', maxQuantity: 10 },
    { id: '104', name: 'Kilyos Servis Filosu', price: 15000000, emoji: '🚌', category: 'infrastructure', maxQuantity: 3 },
    { id: '105', name: 'Kütüphane Ek Binası', price: 30000000, emoji: '📚', category: 'infrastructure', maxQuantity: 1 },

    // --- ÖĞRENCİ DESTEK (Student) ---
    { id: '201', name: '1 Yıllık Yemekhane Sponsorluğu', price: 29200, emoji: '🥗', category: 'student' },
    { id: '202', name: '1 Öğrenciye Kira Desteği', price: 120000, emoji: '🏠', category: 'student' },
    { id: '203', name: 'Bahar Şenliği Bütçesi', price: 8000000, emoji: '🎉', category: 'student', maxQuantity: 1 },
    { id: '204', name: 'Ücretsiz Kahve Dağıtımı', price: 50000, emoji: '☕', category: 'student' },
    { id: '205', name: 'Kampüs Kedileri İçin Mama', price: 15000, emoji: '🐈', category: 'student' },
    { id: '206', name: 'Kulüp Ödeneği', price: 50000, emoji: '🎭', category: 'student' },

    // --- ABSÜRT / EĞLENCE (Fun) ---
    { id: '401', name: 'Boğaz Manzaralı Bank', price: 25000, emoji: '🪑', category: 'fun' },
    { id: '402', name: 'Martılara Simit Fonu', price: 10000, emoji: '🕊️', category: 'fun' },
    { id: '403', name: 'Manzara Vergisini Öde', price: 500000, emoji: '🌉', category: 'fun', maxQuantity: 1 },
    { id: '404', name: 'Rektörlük Binasını Boya', price: 2000000, emoji: '🎨', category: 'fun', maxQuantity: 1 },
    { id: '405', name: 'Kampüs Kedisine Yaş Mama', price: 50, emoji: '🥫', category: 'fun' },
    { id: '406', name: 'Fotokopi Çektir', price: 1, emoji: '📄', category: 'fun' },
    { id: '407', name: 'Metroda Fazla Bas', price: 20, emoji: '🚇', category: 'fun' },
    { id: '408', name: 'Kilyos Servis Ücreti', price: 15, emoji: '🚌', category: 'fun' },
    { id: '409', name: 'Çimlerde Yuvarlanma Vergisi', price: 378, emoji: '🌱', category: 'fun', maxQuantity: 1 },
    { id: '410', name: 'Bebek Sahili Otoparkı', price: 500, emoji: '🅿️', category: 'fun' },
    { id: '411', name: 'Kuzey Piramit Tost', price: 120, emoji: '🥪', category: 'fun' },
    { id: '412', name: 'Hisarüstü Esnafına Destek', price: 1000, emoji: '🏘️', category: 'fun' },
    // Yeni harcamaları buraya ekleyin:
];
