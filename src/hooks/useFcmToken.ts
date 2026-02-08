import { useEffect, useState } from 'react';
import { getToken, Unsubscribe } from 'firebase/messaging';
import { messaging, db, auth } from '../lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export const useFcmToken = () => {
    const [token, setToken] = useState<string | null>(null);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
        Notification.permission
    );

    useEffect(() => {
        const retrieveToken = async () => {
            try {
                if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                    const permission = await Notification.requestPermission();
                    setNotificationPermission(permission);

                    if (permission === 'granted') {
                        const currentToken = await getToken(messaging, {
                            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
                        });

                        if (currentToken) {
                            setToken(currentToken);
                            // Save token to user profile if authenticated
                            const user = auth.currentUser;
                            if (user) {
                                await saveTokenToDatabase(user.uid, currentToken);
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
    }, []);

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
