import { GameDefinition } from './types';
import { Gamepad2, BrainCircuit, Puzzle, Sparkles, Grid3X3, Wallet } from 'lucide-react';
import Sudoku from '../../pages/Boundle/games/Sudoku';
import BudgetSimulator from '../../pages/Boundle/games/BudgetSimulator';

// Şimdilik boş oyun bileşenleri (Placeholder)
const PlaceholderGame = () => null;

/**
 * BOUNDLE OYUN KAYIT DEFTERİ
 * Yeni oyunlar buraya eklenir.
 */
export const BOUNDLE_GAMES: GameDefinition[] = [

    {
        id: 'sudoku',
        name: 'Sudoku',
        description: 'Klasik 9x9 eğlence işte...',
        icon: Grid3X3,
        color: 'bg-red-500',
        path: '/boundle/sudoku',
        component: Sudoku,
        comingSoon: false,
    },
    {
        id: 'budget',
        name: 'Bütçe Simülatörü',
        description: 'Boğaziçi\'nin artan bütçesini sen yönet! 📉',
        icon: Wallet,
        color: 'bg-emerald-500',
        path: '/boundle/butce',
        component: BudgetSimulator,
        comingSoon: false, // Artık aktif
    }
];

export const getGameById = (id: string): GameDefinition | undefined => {
    return BOUNDLE_GAMES.find((g) => g.id === id);
};
