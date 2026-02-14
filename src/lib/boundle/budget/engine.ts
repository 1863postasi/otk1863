// import * as seedrandom from 'seedrandom'; // REMOVED: Causing runtime crash
import { EXPENSE_ITEMS, INCOME_ITEMS, HEADLINES_POOL } from './data';
import { BudgetGameDaily, GameItem } from './budgetTypes';

export type { BudgetGameDaily, GameItem };

// --- CONSTANTS ---
const BASE_BALANCE = 185488378; // 2024 Artan Bütçe (Sabit)

// --- ENGINE ---

/**
 * Verilen tarih için deterministik (herkes için aynı) bir oyun durumu oluşturur.
 */
/**
 * Basit Linear Congruential Generator (LCG) - Seeded RNG
 */
const createSeededRNG = (seed: string) => {
    // String seed'i sayıya çevir (djb2 hash benzeri)
    let h = 0xdeadbeef;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
    }

    // RNG fonksiyonu döndür (0 ile 1 arası)
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return ((h >>> 0) / 4294967296);
    }
}

export const getDailyBudgetGame = (dateString: string): BudgetGameDaily => {
    const rng = createSeededRNG(dateString); // Main RNG (Headlines)

    // 1. Günün Manşetini Seç
    const headlineIndex = Math.floor(rng() * HEADLINES_POOL.length);
    const newsHeadline = HEADLINES_POOL[headlineIndex];

    // 2. Rastgele Item Seçimi

    // a. Gelir Seçimi (Sabit 3 Tane)
    const incomeRng = createSeededRNG(dateString + 'inc');
    const shuffledIncomes = [...INCOME_ITEMS].sort(() => 0.5 - incomeRng());
    const selectedIncomes = shuffledIncomes.slice(0, 3).map(item => ({
        ...item,
        price: -Math.abs(item.price) // Gelirleri negatif fiyat yap (logic gereği)
    }));

    // b. Gider Seçimi (Kategorilere Göre)
    // 2 Büyük (Infrastructure), 3 Orta (Student), 5 Küçük (Fun)
    const expRng = createSeededRNG(dateString + 'exp');
    const infrastructureItems = EXPENSE_ITEMS.filter(i => i.category === 'infrastructure').sort(() => 0.5 - expRng());
    const studentItems = EXPENSE_ITEMS.filter(i => i.category === 'student').sort(() => 0.5 - expRng());
    const funItems = EXPENSE_ITEMS.filter(i => i.category === 'fun').sort(() => 0.5 - expRng());

    const selectedExpenses: GameItem[] = [
        ...infrastructureItems.slice(0, 2),
        ...studentItems.slice(0, 3),
        ...funItems.slice(0, 5)
    ];

    // Listeleri Birleştir ve Sırala
    // Önce Gelirler, Sonra Giderler (Ucuzdan pahalıya)
    selectedExpenses.sort((a, b) => a.price - b.price);

    // Gelirler zaten negatif, en başta dururlar
    const allItems = [...selectedIncomes, ...selectedExpenses];

    return {
        date: dateString,
        initialBalance: BASE_BALANCE,
        items: allItems,
        newsHeadline
    };
};

/**
 * Bugünün tarihini YYYY-MM-DD olarak döndürür
 */
export const getTodayString = (): string => {
    return new Date().toLocaleDateString('tr-TR').split('.').reverse().join('-');
};
