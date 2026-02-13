import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { UserBoundleStats } from './types';
import toast from 'react-hot-toast'; // Using global toast if available, or fallback

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
    const getTodayStr = () => new Date().toLocaleDateString('tr-TR').split('.').reverse().join('-');

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

        // Basit tarih karşılaştırması: Bugün oynamış mı?
        const today = new Date().toISOString().split('T')[0];
        if (gameStats.lastPlayedDate === today) {
            return false;
        }

        return true;
    };

    /**
     * Skor Gönderimi (Oyun bittiğinde çağrılır)
     */
    const submitScore = async (gameId: string, score: number) => {
        if (!currentUser) return;

        // Basit client-side check
        if (!canPlay(gameId)) {
            toast.error("Bugünlük bu oyunu zaten tamamladın!");
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const statsRef = doc(db, 'users', currentUser.uid, 'boundle', 'stats');

        try {
            // Transaction yerine optimistic update + direct write (basit yapı için)
            // Daha güvenli olması için Cloud Function önerilir ama şimdilik client-side yeterli.

            const currentDoc = await getDoc(statsRef);
            let currentStats = currentDoc.exists() ? (currentDoc.data() as UserBoundleStats) : INITIAL_STATS;

            // Double check
            if (currentStats.games[gameId]?.lastPlayedDate === today) {
                toast.error("Zaten kaydedilmiş!");
                return;
            }

            // Streak Mantığı (Dün oynamış mı?)
            // Not: Basit bir streak mantığı. Tarih farkına bakılmalı.
            // Şimdilik sadece +1 artırıyoruz her oynayışta.
            const currentStreak = currentStats.games[gameId]?.streak || 0;
            // TODO: Gerçek streak kontrolü (yesterday check) eklenebilir.

            // Yeni istatistikleri hazırla
            const newGameStats = {
                playedToday: true, // Legacy support
                lastPlayedDate: today,
                lastScore: score,
                totalGameScore: (currentStats.games[gameId]?.totalGameScore || 0) + score,
                streak: currentStreak + 1
            };

            const newTotalScore = (currentStats.totalScore || 0) + score;

            const updates: any = {
                totalScore: newTotalScore,
                lastPlayedDate: today, // Global son aktivite
                [`games.${gameId}`]: newGameStats
            };

            // Firestore'a yaz
            if (!currentDoc.exists()) {
                await setDoc(statsRef, { ...INITIAL_STATS, ...updates });
            } else {
                await updateDoc(statsRef, updates);
            }

            // Liderlik tablosu için 'users/{uid}' belgesini de güncelle (Opsiyonel ama performanslı sorgu için iyi)
            // Şimdilik sadece boundle/stats tutuyoruz.

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
