import * as seedrandom from 'seedrandom';
import { EXPENSE_ITEMS, INCOME_ITEMS, HEADLINES_POOL } from './data';
import { BudgetGameDaily, GameItem } from './types';

export type { BudgetGameDaily, GameItem };

// --- CONSTANTS ---
const BASE_BALANCE = 185488378; // 2024 Artan Bütçe (Sabit)

// --- ENGINE ---

/**
 * Verilen tarih için deterministik (herkes için aynı) bir oyun durumu oluşturur.
 */
export const getDailyBudgetGame = (dateString: string): BudgetGameDaily => {
    const rng = seedrandom(dateString); // Seeded RNG

    // 1. Günün Manşetini Seç
    const headlineIndex = Math.floor(rng() * HEADLINES_POOL.length);
    const newsHeadline = HEADLINES_POOL[headlineIndex];

    // 2. Rastgele Item Seçimi
    // Hem gelirlerden hem giderlerden seçim yapalım.

    // a. Gelir Seçimi (1-2 tane)
    const incomeCount = Math.floor(rng() * 2) + 1; // 1 to 2
    const shuffledIncomes = [...INCOME_ITEMS].sort(() => 0.5 - rng());
    const selectedIncomes = shuffledIncomes.slice(0, incomeCount).map(item => ({
        ...item,
        price: -Math.abs(item.price) // Gelirleri negatif fiyat yap (logic gereği)
    }));

    // b. Gider Seçimi (7-10 tane)
    const expenseCount = Math.floor(rng() * 4) + 7; // 7 to 10
    const shuffledExpenses = [...EXPENSE_ITEMS].sort(() => 0.5 - rng());

    // Garantilemek adına: En az 1 'student' (ucuz) olsun.
    const selectedExpenses: GameItem[] = [];
    const studentItems = shuffledExpenses.filter(i => i.category === 'student');

    if (studentItems.length > 0) {
        selectedExpenses.push(studentItems[0]);
    }

    // Geri kalanları rastgele doldur
    for (const item of shuffledExpenses) {
        if (selectedExpenses.length >= expenseCount) break;
        if (!selectedExpenses.find(x => x.id === item.id)) {
            selectedExpenses.push(item);
        }
    }

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
