import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onAnnouncementCreated = functions.firestore
    .document('announcements/{docId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();

        // Check if notification is requested
        if (!data.sendNotification) {
            console.log('Notification not requested for this announcement.');
            return null;
        }

        const title = data.title || "Yeni Duyuru";
        const body = data.summary || "1863 Postası'nda yeni bir duyuru var!";
        const link = data.link || "/";

        const payload: admin.messaging.MulticastMessage = {
            notification: {
                title: title,
                body: body,
            },
            data: {
                url: link,
                type: 'announcement',
                id: context.params.docId
            },
            // Android specific
            android: {
                notification: {
                    icon: 'stock_ticker_update',
                    color: '#7f9cf5',
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK' // Standard for many frameworks, but web handles differently
                }
            },
            // Web specific
            webpush: {
                notification: {
                    icon: '/pwa-icon.png',
                    badge: '/pwa-icon.png',
                    actions: [
                        { action: 'open', title: 'Görüntüle' }
                    ]
                },
                fcmOptions: {
                    link: "/" // Opens app root, or we can use specific link if SW handles it
                }
            },
            tokens: [] // Will be filled
        };

        try {
            // Fetch all users with tokens
            const usersSnapshot = await admin.firestore().collection('users')
                .where('fcmTokens', '!=', null)
                .get();

            let tokens: string[] = [];

            usersSnapshot.docs.forEach(doc => {
                const userData = doc.data();
                if (userData.fcmTokens && Array.isArray(userData.fcmTokens)) {
                    tokens = tokens.concat(userData.fcmTokens);
                }
            });

            // Remove duplicates
            tokens = [...new Set(tokens)];

            if (tokens.length === 0) {
                console.log('No devices to send notification to.');
                return null;
            }

            console.log(`Sending notification to ${tokens.length} devices.`);

            // Send Multicast
            // FCM multicast has a limit of 500 tokens per call.
            // We should batch if expecting many users.
            const BATCH_SIZE = 500;
            const batches = [];

            for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
                const batchTokens = tokens.slice(i, i + BATCH_SIZE);
                const batchPayload = { ...payload, tokens: batchTokens };
                batches.push(admin.messaging().sendEachForMulticast(batchPayload));
            }

            const results = await Promise.all(batches);

            // Log results
            let successCount = 0;
            let failureCount = 0;
            results.forEach(result => {
                successCount += result.successCount;
                failureCount += result.failureCount;
            });

            console.log(`Successfully sent ${successCount} messages; ${failureCount} failed.`);

            return { successCount, failureCount };
        } catch (error) {
            console.error('Error sending notifications:', error);
            return null;
        }
    });
