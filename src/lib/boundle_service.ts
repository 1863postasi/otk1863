import { collection, query, orderBy, limit, onSnapshot, doc, getDoc, getDocs } from "firebase/firestore";
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

import { cache, CACHE_KEYS, CACHE_TTL } from './cache';

/**
 * Fetches the top 20 users leaderboard with caching.
 * Caches for MEDIUM duration (5 mins).
 */
export const getLeaderboard = async (): Promise<LeaderboardUser[]> => {
  // 1. Try Cache
  const cached = cache.get('boundle_leaderboard');
  if (cached) return cached;

  // 2. Fetch
  try {
    const q = query(
      collection(db, "users"),
      orderBy("boundleTotalPoints", "desc"),
      limit(50) // Fetch top 50 (UI filters 10/20/50)
    );

    // Using getDocs instead of onSnapshot for one-time fetch
    const { getDocs } = await import("firebase/firestore"); // Dynamic import or just change top imports
    const snapshot = await getDocs(q);

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

    // 3. Cache & Return
    cache.set('boundle_leaderboard', users, CACHE_TTL.MEDIUM);
    return users;
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return [];
  }
};

/**
 * @deprecated Use getLeaderboard() for cached optimized fetching.
 */
export const subscribeToLeaderboard = (callback: (data: LeaderboardUser[]) => void) => {
  // ... existing implementation if needed or just redirect to getLeaderboard one-off
  // For now, let's keep it but ideally we switch to getLeaderboard in UI.
  // I'll leave the original function body below commented out or just return empty unsubs if I replace it entirely?
  // User wants cache, so I should encourage getLeaderboard. 
  // I'll actually just REPLACE the subscription export with the new one above, 
  // but the UI expects a subscribe function.
  // I will refactor the UI to use getLeaderboard.
  return () => { }; // No-op unsubscribe
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

