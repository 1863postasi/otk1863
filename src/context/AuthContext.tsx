import React, { createContext, useContext, useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toggleUserBookmark } from '../lib/user_service';

// Define the shape of the user profile stored in Firestore
export interface UserProfile {
  uid: string;
  email: string;
  username: string; // @handle (unique)
  displayName?: string; // Visible Name (not unique)
  department: string;
  role: 'student' | 'admin' | 'moderator';
  photoUrl?: string; // R2 URL
  
  // Roles & Badges
  clubRoles?: Record<string, string>; // e.g., { "compec": "admin" }
  badges?: string[];
  
  // Bookmarks
  savedEventIds?: string[];
  savedRootIds?: string[];
  savedLectureNoteIds?: string[];

  // Boundle (Game Stats)
  boundleTotalPoints?: number; // All time total
  boundleWeeklyPoints?: number; // Weekly leaderboard
  boundleStreak?: number; // Current streak
  boundleMaxStreak?: number; // Max streak ever
  lastBoundleDate?: string; // YYYY-MM-DD to check continuity

  // Meta
  lastDisplayNameChange?: any; // Timestamp
  lastUsernameChange?: any; // Timestamp
  createdAt?: any;
}

interface AuthContextType {
  currentUser: firebase.User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  toggleBookmark: (type: 'event' | 'story' | 'resource', itemId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        console.warn("User authenticated but no Firestore profile found.");
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser.uid);
    }
  };

  const toggleBookmark = async (type: 'event' | 'story' | 'resource', itemId: string) => {
      if (!currentUser || !userProfile) return;
      
      let isSaved = false;
      if (type === 'event') isSaved = userProfile.savedEventIds?.includes(itemId) || false;
      else if (type === 'story') isSaved = userProfile.savedRootIds?.includes(itemId) || false;
      else if (type === 'resource') isSaved = userProfile.savedLectureNoteIds?.includes(itemId) || false;

      // Optimistic Update (Optional, but good for UI)
      // For now, we wait for DB + Refresh for consistency
      await toggleUserBookmark(currentUser.uid, type, itemId, isSaved);
      await refreshProfile();
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, logout, refreshProfile, toggleBookmark }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};