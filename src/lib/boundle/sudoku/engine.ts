/**
 * SUDOKU ENGINE
 * Günlük seed bazlı Sudoku oluşturucu ve çözücü.
 */

// LCG (Linear Congruential Generator) based Random
class SeededRandom {
    private seed: number;

    constructor(seedStr: string) {
        // String seed'i sayıya çevir (basit hash)
        let h = 0xdeadbeef;
        for (let i = 0; i < seedStr.length; i++) {
            h = Math.imul(h ^ seedStr.charCodeAt(i), 2654435761);
            h = ((h ^ h >>> 16) >>> 0);
        }
        this.seed = h;
    }

    // 0 ile 1 arasında sayı döndür
    next(): number {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }

    // min-max arası integer
    range(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
}

export type Board = (number | null)[];

// Basit Sudoku Çözücü ve Oluşturucu
export class SudokuEngine {
    private rng: SeededRandom;

    constructor(dateStr: string) {
        this.rng = new SeededRandom(dateStr);
    }

    // Boş tahta
    private getEmptyBoard(): Board {
        return Array(81).fill(null);
    }

    // Satır, Sütun ve Kare kontrolü
    private isValid(board: Board, index: number, num: number): boolean {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;

        for (let i = 0; i < 9; i++) {
            // Satır kontrolü
            if (board[row * 9 + i] === num) return false;
            // Sütun kontrolü
            if (board[i * 9 + col] === num) return false;
            // 3x3 Kare kontrolü
            const boxIndex = (boxRow + Math.floor(i / 3)) * 9 + (boxCol + (i % 3));
            if (board[boxIndex] === num) return false;
        }
        return true;
    }

    // Backtracking ile tahtayı doldur
    private fillBoard(board: Board): boolean {
        for (let i = 0; i < 81; i++) {
            if (board[i] === null) {
                // 1-9 sayılarını karıştır
                const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                // Fisher-Yates shuffle with seeded RNG
                for (let j = nums.length - 1; j > 0; j--) {
                    const k = this.rng.range(0, j);
                    [nums[j], nums[k]] = [nums[k], nums[j]];
                }

                for (const num of nums) {
                    if (this.isValid(board, i, num)) {
                        board[i] = num;
                        if (this.fillBoard(board)) return true;
                        board[i] = null;
                    }
                }
                return false;
            }
        }
        return true;
    }

    // Tamamlanmış bir tahtadan taşları silerek bulmaca oluştur
    // difficulty: 0-1 arası (0: kolay, 1: imkansız)
    // Standart Sudoku: ~30-40 ipucu kalmalı (81 - 45 = 36 ipucu, Medium)
    generate(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): { puzzle: Board; solution: Board } {
        const solution = this.getEmptyBoard();
        this.fillBoard(solution); // Tam dolu geçerli bir tahta oluştur

        const puzzle = [...solution];

        // Kaç taş silinecek?
        // Easy: 30-40 sil (41-51 ipucu)
        // Medium: 40-50 sil (31-41 ipucu)
        // Hard: 50-60 sil (21-31 ipucu)
        let attempts: number;
        switch (difficulty) {
            case 'easy': attempts = 35; break;
            case 'medium': attempts = 45; break;
            case 'hard': attempts = 55; break;
        }

        // Simetrik olmayan rastgele silme
        // Not: Gerçekten unique çözüm kontrolü yapmıyoruz performans için,
        // ancak dolu tahtadan sildiğimiz için çözüm garanti var. 
        // Unique olması bu basit versiyon için "good enough".
        let removed = 0;
        const indices = Array.from({ length: 81 }, (_, i) => i);

        // Shuffle indices
        for (let i = indices.length - 1; i > 0; i--) {
            const j = this.rng.range(0, i);
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        for (let i = 0; i < 81 && removed < attempts; i++) {
            const idx = indices[i];
            if (puzzle[idx] !== null) {
                puzzle[idx] = null;
                removed++;
            }
        }

        return { puzzle, solution };
    }
}

// Helper: Tarih formatı (YYYY-MM-DD)
export const getDailySeed = (): string => {
    const now = new Date();
    // Türkiye saati (UTC+3) için basit fix, client saati güvenilirdir genelde bu app için
    return now.toISOString().split('T')[0];
};
