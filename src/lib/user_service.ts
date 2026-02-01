import { doc, updateDoc, arrayUnion, arrayRemove, Timestamp, getDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { isUsernameUnique } from "./firestore_users";

/**
 * Toggles an event ID in the user's savedEventIds array.
 * @deprecated Use toggleUserBookmark instead for generic handling.
 */
export const toggleSavedEvent = async (uid: string, eventId: string, isCurrentlySaved: boolean) => {
  return toggleUserBookmark(uid, 'event', eventId, isCurrentlySaved);
};

/**
 * Generic Bookmark Toggle
 * Types: 
 * - 'event' -> savedEventIds
 * - 'story' -> savedRootIds (Maps to 'Roots/Kökenler')
 * - 'resource' -> savedLectureNoteIds (Maps to 'Academic Resources')
 */
export const toggleUserBookmark = async (uid: string, type: 'event' | 'story' | 'resource', itemId: string, isCurrentlySaved: boolean) => {
  const userRef = doc(db, "users", uid);
  
  let fieldName = '';
  switch (type) {
      case 'event': fieldName = 'savedEventIds'; break;
      case 'story': fieldName = 'savedRootIds'; break;
      case 'resource': fieldName = 'savedLectureNoteIds'; break;
      default: throw new Error("Invalid bookmark type");
  }

  await updateDoc(userRef, {
    [fieldName]: isCurrentlySaved ? arrayRemove(itemId) : arrayUnion(itemId)
  });
};

/**
 * Updates basic user profile info.
 * Handles validation for username uniqueness and time constraints for name changes.
 */
export const updateUserProfile = async (uid: string, data: {
  displayName?: string;
  department?: string;
  username?: string;
  photoUrl?: string;
}, currentProfile: any) => {
  const updates: any = {};
  const now = Timestamp.now();

  // 1. Photo URL
  if (data.photoUrl) {
    updates.photoUrl = data.photoUrl;
  }

  // 2. Department
  if (data.department) {
    updates.department = data.department;
  }

  // 3. Display Name (Check for 30-day limit)
  if (data.displayName && data.displayName !== currentProfile.displayName) {
    if (currentProfile.lastDisplayNameChange) {
      const lastChange = currentProfile.lastDisplayNameChange.toDate();
      const diffDays = (now.toDate().getTime() - lastChange.getTime()) / (1000 * 3600 * 24);
      if (diffDays < 30) {
        throw new Error("İsim değişikliği ayda sadece 1 kez yapılabilir.");
      }
    }
    updates.displayName = data.displayName;
    updates.lastDisplayNameChange = now;
  }

  // 4. Username (Check for uniqueness and 60-day limit)
  if (data.username && data.username !== currentProfile.username) {
    // Length check
    if (data.username.length < 3) throw new Error("Kullanıcı adı en az 3 karakter olmalıdır.");
    
    // Time limit check
    if (currentProfile.lastUsernameChange) {
      const lastChange = currentProfile.lastUsernameChange.toDate();
      const diffDays = (now.toDate().getTime() - lastChange.getTime()) / (1000 * 3600 * 24);
      if (diffDays < 60) {
        throw new Error("Kullanıcı adı 2 ayda bir değiştirilebilir.");
      }
    }

    // Uniqueness check
    const isUnique = await isUsernameUnique(data.username);
    if (!isUnique) throw new Error("Bu kullanıcı adı zaten alınmış.");

    updates.username = data.username;
    updates.username_lower = data.username.toLowerCase();
    updates.lastUsernameChange = now;
  }

  if (Object.keys(updates).length > 0) {
    await updateDoc(doc(db, "users", uid), updates);
  }
};

/**
 * Change Password Wrapper
 */
export const changePassword = async (newPassword: string) => {
  if (auth.currentUser) {
    await auth.currentUser.updatePassword(newPassword);
  } else {
    throw new Error("Oturum bulunamadı.");
  }
};