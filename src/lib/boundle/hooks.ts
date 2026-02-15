import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import { UserBoundleStats } from './types';
import { getTurkeyDateString } from '../utils'; // Import helper
import toast from 'react-hot-toast';

const INITIAL_STATS: UserBoundleStats = {
    totalScore: 0,
    lastPlayedDate: '',
    games: {}
};

export const useBoundle = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState<UserBoundleStats>(INITIAL_STATS);
    const [loading, setLoading] = useState(true);

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

        // Tarih karşılaştırması: Bugün oynamış mı? (Turkey Time)
        const today = getTurkeyDateString();
        if (gameStats.lastPlayedDate === today) {
            return false;
        }

        return true;
    };

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

        const today = getTurkeyDateString(); // UTC yerine TRT
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
                    // Dünün tarihini bulmak için bugünden 1 gün çıkar (tarih string üzerinden gitmek daha güvenli)
                    // Ancak Date objesi UTC/Local karışıklığı yaratabilir.
                    // String karşılaştırması yapalım:

                    const yesterdayDate = new Date(); // Bu sistem saati, ama biz TRT istiyoruz.
                    // TRT today string'i parse edelim
                    const [y, m, d] = today.split('-').map(Number);
                    const tDate = new Date(y, m - 1, d); // Local construct
                    tDate.setDate(tDate.getDate() - 1); // Dün
                    const yesterdayStr = tDate.toLocaleDateString('en-CA'); // YYYY-MM-DD

                    // Not: Bu kısım hala client'ın timezone'undan etkilenebilir mi? 
                    // Eğer today "2024-02-15" ise ve biz bunu new Date(2024, 1, 15) yaparsak, bu local 00:00 olur.
                    // 1 gün çıkarırsak yine local 00:00 olur. Formatlayınca yine YYYY-MM-DD çıkar.
                    // Sorun yok.

                    if (lastDateStr === yesterdayStr) {
                        newStreak = (currentStats.games[gameId]?.streak || 0) + 1;
                    } else {
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
