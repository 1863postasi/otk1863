import { GameDefinition } from './types';
import { Gamepad2, BrainCircuit, Puzzle, Sparkles, Grid3X3, Wallet, Type, BoxSelect } from 'lucide-react';
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
        name: 'parayi bitir',
        description: 'Enflasyonla mücadele çok önemli ancak sayıları mevcut ekonomiye göre düzenlemeyeceğiz.',
        icon: Wallet,
        color: 'bg-emerald-500',
        path: '/boundle/butce',
        component: BudgetSimulator,
        comingSoon: false,
    },
    {
        id: 'wordle',
        name: 'Sözcük',
        description: 'Klasik 5 harfli kelime bulmaca. Her gün yeni bir kelime.',
        icon: Type,
        color: 'bg-amber-500',
        path: '/boundle/wordle',
        component: PlaceholderGame,
        comingSoon: true,
    },
    {
        id: 'enclose-qayyum',
        name: 'Enclose.qayyum',
        description: 'Boğaziçi kampüsünü ele geçirmeye çalışanlara inat alanını koru!',
        icon: BoxSelect,
        color: 'bg-purple-600',
        path: '/boundle/enclose',
        component: PlaceholderGame,
        comingSoon: true,
    }
];

export const getGameById = (id: string): GameDefinition | undefined => {
    return BOUNDLE_GAMES.find((g) => g.id === id);
};
