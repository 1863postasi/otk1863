import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export interface LeaderboardUser {
  uid: string;
  username: string;
  displayName: string;
  boundleTotalPoints: number;
  photoUrl?: string;
  department?: string;
}

/**
 * Fetches top 20 users based on total boundle points.
 */
export const getLeaderboard = async (): Promise<LeaderboardUser[]> => {
  try {
    const q = query(
      collection(db, "users"),
      orderBy("boundleTotalPoints", "desc"),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => {
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

    return users;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};
