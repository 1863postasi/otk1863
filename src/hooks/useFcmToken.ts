import { useEffect, useState } from 'react';
import { getToken, Unsubscribe } from 'firebase/messaging';
import { messaging, db, auth } from '../lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const useFcmToken = () => {
    const [token, setToken] = useState<string | null>(null);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
        Notification.permission
    );

    const { currentUser } = useAuth(); // Get current user from context

    useEffect(() => {
        const retrieveToken = async () => {
            try {
                if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                    const permission = await Notification.requestPermission();
                    setNotificationPermission(permission);

                    if (permission === 'granted') {
                        // Wait for Service Worker to be ready
                        const registration = await navigator.serviceWorker.ready;

                        const currentToken = await getToken(messaging, {
                            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                            serviceWorkerRegistration: registration, // Explicitly pass registration
                        });

                        if (currentToken) {
                            setToken(currentToken);
                            // Save token to user profile if authenticated
                            if (currentUser) {
                                await saveTokenToDatabase(currentUser.uid, currentToken);
                            }
                        } else {
                            console.log('No registration token available. Request permission to generate one.');
                        }
                    }
                }
            } catch (error) {
                console.error('An error occurred while retrieving token:', error);
            }
        };

        retrieveToken();
    }, [currentUser]); // Re-run when user logs in

    const saveTokenToDatabase = async (uid: string, token: string) => {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                fcmTokens: arrayUnion(token)
            });
        } catch (error) {
            console.error("Error saving FCM token:", error);
        }
    }

    return { token, notificationPermission };
};
