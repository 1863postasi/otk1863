import { GameDefinition } from './types';
import { Gamepad2, BrainCircuit, Puzzle, Sparkles } from 'lucide-react';

// Şimdilik boş oyun bileşenleri (Placeholder)
const PlaceholderGame = () => null;

/**
 * BOUNDLE OYUN KAYIT DEFTERİ
 * Yeni oyunlar buraya eklenir.
 */
export const BOUNDLE_GAMES: GameDefinition[] = [
    {
        id: 'kelimece',
        name: 'Kelimece',
        description: '1863 Postası efsanesi geri döndü! Günün kelimesini 6 denemede bul.',
        icon: Gamepad2,
        color: 'bg-emerald-500',
        path: '/boundle/kelimece',
        component: PlaceholderGame,
        comingSoon: true, // Henüz aktif değil
    },
    {
        id: 'baglantilar',
        name: 'Bağlantılar',
        description: 'Dört dörtlük zihin jimnastiği. Kelimeler arasındaki gizli grupları çöz.',
        icon: BrainCircuit,
        color: 'bg-indigo-500',
        path: '/boundle/baglantilar',
        component: PlaceholderGame,
        comingSoon: true,
    },
    {
        id: 'bulmaca',
        name: 'Kampüs Bulmaca',
        description: 'Boğaziçi kültürü ve tarihi üzerine günlük mini bulmaca.',
        icon: Puzzle,
        color: 'bg-amber-500',
        path: '/boundle/bulmaca',
        component: PlaceholderGame,
        comingSoon: true,
    }
];

export const getGameById = (id: string): GameDefinition | undefined => {
    return BOUNDLE_GAMES.find((g) => g.id === id);
};
