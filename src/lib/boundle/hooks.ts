import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, runTransaction } from 'firebase/firestore';
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
    /**
     * Skor Gönderimi (Oyun bittiğinde çağrılır)
     * ATOMIC TRANSACTION ILE GÜVENLİ HALE GETİRİLDİ
     */
    const submitScore = async (gameId: string, score: number) => {
        if (!currentUser) return;

        // Basit client-side check (UI için)
        if (!canPlay(gameId)) {
            toast.error("Bugünlük bu oyunu zaten tamamladın!");
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const statsRef = doc(db, 'users', currentUser.uid, 'boundle', 'stats');

        try {
            await runTransaction(db, async (transaction) => {
                // 1. Oku (Server State)
                const sfDoc = await transaction.get(statsRef);
                let currentStats = sfDoc.exists() ? (sfDoc.data() as UserBoundleStats) : INITIAL_STATS;

                // 2. Kontrol Et (Server-Side Check)
                if (currentStats.games[gameId]?.lastPlayedDate === today) {
                    throw new Error("ALREADY_PLAYED");
                }

                // --- STREAK MANTIĞI (Düzeltildi) ---
                const lastDateStr = currentStats.games[gameId]?.lastPlayedDate;
                let newStreak = 1;

                if (lastDateStr) {
                    const lastDate = new Date(lastDateStr);
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    if (lastDateStr === yesterdayStr) {
                        // Eğer dün oynadıysa streak artar
                        newStreak = (currentStats.games[gameId]?.streak || 0) + 1;
                    } else {
                        // Dün oynamadıysa (daha eski veya hiç), streak 1'e döner
                        newStreak = 1;
                    }
                }

                // 3. Yeni Veriyi Hazırla
                const newGameScore = (currentStats.games[gameId]?.totalGameScore || 0) + score;

                const newGameStats = {
                    playedToday: true,
                    lastPlayedDate: today,
                    lastScore: score,
                    totalGameScore: newGameScore,
                    streak: newStreak
                };

                // local 'games' objesini güncelle (hesaplama için)
                const updatedGames = { ...currentStats.games, [gameId]: newGameStats };

                // --- TOTAL SCORE (Self-Healing) ---
                const recalculatedTotalScore = Object.values(updatedGames).reduce((acc, g: any) => acc + (g.totalGameScore || 0), 0);

                const updates: any = {
                    totalScore: recalculatedTotalScore,
                    lastPlayedDate: today,
                    [`games.${gameId}`]: newGameStats
                };

                // 4. Yaz (Atomic Write)
                if (!sfDoc.exists()) {
                    transaction.set(statsRef, { ...INITIAL_STATS, ...updates });
                } else {
                    transaction.update(statsRef, updates);
                }

                // Ana user dökümanını da güncelle
                const userRef = doc(db, 'users', currentUser.uid!);
                transaction.update(userRef, {
                    boundleScore: recalculatedTotalScore,
                    lastActiveAt: new Date()
                });
            });

            // 5. Başarılı (UI Update)
            // Transaction başarılı olursa buraya düşer.
            // Local state'i güncelle (Optimistic değil, confirmed update)
            setStats(prev => {
                const prevStreak = prev.games[gameId]?.streak || 0;
                return {
                    ...prev,
                    totalScore: (prev.totalScore || 0) + score,
                    lastPlayedDate: today,
                    games: {
                        ...prev.games,
                        [gameId]: {
                            ...prev.games[gameId],
                            playedToday: true,
                            lastPlayedDate: today,
                            lastScore: score,
                            totalGameScore: (prev.games[gameId]?.totalGameScore || 0) + score,
                            streak: prevStreak + 1
                        }
                    }
                };
            });

            toast.success(`Tebrikler! +${score} puan kazandın.`);

        } catch (error: any) {
            console.error("Skor transaction hatası:", error);
            if (error.message === "ALREADY_PLAYED") {
                toast.error("Bu puan zaten alınmış! (Başka bir cihazda oynamış olabilirsin)");
                // State'i tazelemek iyi olabilir, belki sayfa yenilenmeli
            } else {
                toast.error("Skor kaydedilirken bir hata oluştu.");
            }
        }
    };

    return {
        stats,
        loading,
        canPlay,
        submitScore
    };
};
