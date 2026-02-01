import { collection, query, orderBy, limit, onSnapshot, doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "./firebase";

export interface LeaderboardUser {
  uid: string;
  username: string;
  displayName: string;
  boundleTotalPoints: number;
  photoUrl?: string;
  department?: string;
}

/**
 * Subscribes to the top 20 users leaderboard.
 * @param callback Function to call with the updated leaderboard data.
 * @returns Unsubscribe function.
 */
export const subscribeToLeaderboard = (callback: (data: LeaderboardUser[]) => void) => {
  const q = query(
    collection(db, "users"),
    orderBy("boundleTotalPoints", "desc"),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        username: data.username || "anonim",
        displayName: data.displayName || data.username || "Anonim",
        boundleTotalPoints: data.boundleTotalPoints || 0,
        photoUrl: data.photoUrl,
        department: data.department
      };
    }) as LeaderboardUser[];
    callback(users);
  }, (error) => {
    console.error("Leaderboard subscription error:", error);
    // Hata durumunda boş liste dön ki UI sonsuz loading'de kalmasın
    callback([]);
  });
};

/**
 * Check if user has already played today's game.
 * @param userId User UID
 * @returns { played: boolean, status?: 'won' | 'lost' }
 */
export const checkIfPlayedToday = async (userId: string): Promise<{ played: boolean; status?: 'won' | 'lost' }> => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const gameRef = doc(db, 'users', userId, 'game_history', today);

  try {
    const gameDoc = await getDoc(gameRef);
    if (gameDoc.exists()) {
      const data = gameDoc.data();
      return {
        played: data.status === 'won' || data.status === 'lost',
        status: data.status
      };
    }
    return { played: false };
  } catch (error) {
    console.error('Error checking game status:', error);
    return { played: false };
  }
};

/**
 * Calculate score based on guess count (client-side preview).
 * Server will recalculate for security.
 * @param guessCount Number of guesses used (1-6)
 * @param isWon Whether the game was won
 * @returns Score (10-100)
 */
export const calculateScore = (guessCount: number, isWon: boolean): number => {
  if (!isWon) return 10; // Kaybetse de teselli puanı

  const baseScore = 100;
  const penalty = (guessCount - 1) * 15;
  return Math.max(10, baseScore - penalty);
};

/**
 * Calls the Cloud Function to validate the word.
 * @param guess The 5-letter word guess.
 * @param attemptIndex Current attempt index (0-5).
 * @param history Array of previous guesses.
 */
export const checkDailyWord = async (guess: string, attemptIndex: number, history: string[]) => {
  const checkFn = httpsCallable(functions, 'checkDailyWord');
  try {
    const result = await checkFn({ guess, attemptIndex, history });
    return result.data as { result: string[], status: 'win' | 'loss' | 'continue', score: number };
  } catch (error: any) {
    console.error("Game Engine Error:", error);
    throw new Error(error.message || "Oyun sunucusuna ulaşılamadı.");
  }
};