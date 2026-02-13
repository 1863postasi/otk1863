import React from 'react';

/**
 * Bir Boundle oyununun tanımı.
 * Yeni oyun eklerken bu arayüze sadık kalınmalıdır.
 */
export interface GameDefinition {
    id: string; // 'wordle', 'connections' vb.
    name: string; // 'Kelimece', 'Bağlantılar' vb.
    description: string; // Kısa açıklama
    icon: React.ElementType; // Lucide icon component
    color: string; // Tema rengi (Tailwind class veya hex)
    path: string; // '/boundle/kelimece'
    component: React.ComponentType; // Oyunun ana bileşeni
    comingSoon?: boolean; // Henüz aktif değilse true
}

/**
 * Kullanıcının Boundle istatistikleri (Firestore'da saklanır)
 * Path: users/{uid}/boundle/stats
 */
export interface UserBoundleStats {
    totalScore: number; // Toplam puan (tüm oyunlardan)
    lastPlayedDate: string; // Son oynanan tarih (YYYY-MM-DD)
    games: {
        [gameId: string]: {
            playedToday: boolean; // Bugün oynandı mı?
            lastScore: number; // Son oyundaki puan (günlük)
            totalGameScore: number; // Bu oyundaki toplam puanı
            streak: number; // Seriye bağlama (opsiyonel)
        };
    };
}

/**
 * Liderlik tablosu için kullanıcı özeti
 */
export interface LeaderboardEntry {
    userId: string;
    username: string;
    photoURL?: string;
    score: number;
    rank: number;
}
