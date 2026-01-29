import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Checks if a username is already taken in the Firestore 'users' collection.
 * Search is case-insensitive (compares against 'username_lower' field).
 */
export const isUsernameUnique = async (username: string): Promise<boolean> => {
  if (!username) return false;
  
  const q = query(
    collection(db, "users"),
    where("username_lower", "==", username.toLowerCase())
  );

  const snapshot = await getDocs(q);
  return snapshot.empty; // Returns true if no documents found (unique), false otherwise
};

/**
 * Retrieves user email by username for login purposes.
 */
export const getEmailByUsername = async (username: string): Promise<string | null> => {
  const q = query(
    collection(db, "users"),
    where("username", "==", username) // Precise match for login usually, or use username_lower
  );
  
  // Fallback to lower case check if direct match fails to be user-friendly
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    return snapshot.docs[0].data().email;
  }

  const qLower = query(
    collection(db, "users"),
    where("username_lower", "==", username.toLowerCase())
  );
  const snapshotLower = await getDocs(qLower);

  if (!snapshotLower.empty) {
    return snapshotLower.docs[0].data().email;
  }

  return null;
};