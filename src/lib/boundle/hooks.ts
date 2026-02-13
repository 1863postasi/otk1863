import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserBoundleStats } from './types';

// Geçici Toast Polyfill (Paket yüklenirse bu kaldırılacak)
const toast = {
    success: (msg: string) => { console.log('SUCCESS:', msg); alert(msg); },
    error: (msg: string) => { console.error('ERROR:', msg); alert(msg); }
};

const INITIAL_STATS: UserBoundleStats = {
    totalScore: 0,
    lastPlayedDate: '',
    games: {}
};

export const useBoundle = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState<UserBoundleStats>(INITIAL_STATS);
    const [loading, setLoading] = useState(true);

    // Bugünün tarihi (YYYY-MM-DD formatında)
    const getTodayStr = () => new Date().toISOString().split('T')[0];

    // Kullanıcının istatistiklerini getir
    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                const statsRef = doc(db, 'users', currentUser.uid, 'boundle', 'stats');
                const docSnap = await getDoc(statsRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as UserBoundleStats;
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching boundle stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [currentUser]);

    /**
     * Bir oyun için oynama hakkı var mı?
     */
    const canPlay = (gameId: string): boolean => {
        if (!currentUser) return false;

        const gameStats = stats.games[gameId];
        if (!gameStats) return true; // Hiç oynamamış

        const today = getTodayStr();
        // Eğer son oynama tarihi bugünse ve playedToday true ise oynayamaz
        if (stats.lastPlayedDate === today && gameStats.playedToday) {
            return false;
        }

        return true;
    };

    /**
     * Skor Gönderimi (Oyun bittiğinde çağrılır)
     */
    const submitScore = async (gameId: string, score: number) => {
        if (!currentUser) return;

        const today = getTodayStr();
        const statsRef = doc(db, 'users', currentUser.uid, 'boundle', 'stats');

        try {
            const currentDoc = await getDoc(statsRef);
            let currentStats = currentDoc.exists() ? (currentDoc.data() as UserBoundleStats) : INITIAL_STATS;

            // Günlük kontrol
            if (currentStats.lastPlayedDate === today && currentStats.games[gameId]?.playedToday) {
                toast.error("Bugünlük oyun hakkın doldu!");
                return;
            }

            // Yeni istatistikleri hazırla
            const newGameStats = {
                playedToday: true,
                lastScore: score,
                totalGameScore: (currentStats.games[gameId]?.totalGameScore || 0) + score,
                streak: (currentStats.games[gameId]?.streak || 0) + 1
            };

            const newTotalScore = currentStats.totalScore + score;
            const updates: any = {
                totalScore: newTotalScore,
                lastPlayedDate: today,
                [`games.${gameId}`]: newGameStats
            };

            if (!currentDoc.exists()) {
                await setDoc(statsRef, {
                    ...INITIAL_STATS,
                    ...updates
                });
            } else {
                await updateDoc(statsRef, updates);
            }

            // State'i güncelle
            setStats(prev => ({
                ...prev,
                totalScore: newTotalScore,
                lastPlayedDate: today,
                games: {
                    ...prev.games,
                    [gameId]: newGameStats
                }
            }));

            toast.success(`Tebrikler! +${score} puan kazandın.`);

        } catch (error) {
            console.error("Skor kaydedilemedi:", error);
            toast.error("Skor kaydedilirken bir hata oluştu.");
        }
    };

    return {
        stats,
        loading,
        canPlay,
        submitScore
    };
};
