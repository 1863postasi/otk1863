import { GameDefinition } from './types';
import { Gamepad2, BrainCircuit, Puzzle, Sparkles, Grid3X3 } from 'lucide-react';
import Sudoku from '../../pages/Boundle/games/Sudoku';

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
        description: 'Her güne özel zihin jimnastiği. Klasik 9x9 eğlencesi.',
        icon: Grid3X3,
        color: 'bg-red-500',
        path: '/boundle/sudoku',
        component: Sudoku,
        comingSoon: false,
    }
];

export const getGameById = (id: string): GameDefinition | undefined => {
    return BOUNDLE_GAMES.find((g) => g.id === id);
};
