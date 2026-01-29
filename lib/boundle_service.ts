import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
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
  });
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