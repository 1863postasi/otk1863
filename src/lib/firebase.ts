import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getMessaging } from "firebase/messaging";

// Cast import.meta to any to avoid TypeScript errors with Vite env variables
const env = (import.meta as any).env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase using Compat API to fix export errors
const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = getFirestore(app);
export const functions = getFunctions(app); // Default region is us-central1
let messaging: ReturnType<typeof getMessaging> | null = null;
try {
  messaging = getMessaging(app);
} catch (error) {
  console.warn("Firebase Messaging is not supported in this environment:", error);
}

export { messaging };

export default app;