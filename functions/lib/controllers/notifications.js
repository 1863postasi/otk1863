"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAnnouncementCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.onAnnouncementCreated = functions.firestore
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
    const payload = {
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
            headers: {
                image: "https://pwa-icon.png" // Placeholder, actually icon is handled in notification object
            },
            notification: {
                icon: '/pwa-icon.png',
                badge: '/pwa-icon.png',
                // click_action is often ignored by generic web push but useful for some implementations
                // We handle click in SW.
            },
            fcmOptions: {
                link: link // This is used if the notification is received while app is in background/closed and system handles it directly (though onBackgroundMessage overrides this usually)
            }
        },
        tokens: [] // Will be filled
    };
    try {
        // Fetch all users with tokens
        const usersSnapshot = await admin.firestore().collection('users')
            .where('fcmTokens', '!=', null)
            .get();
        let tokens = [];
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
            const batchPayload = Object.assign(Object.assign({}, payload), { tokens: batchTokens });
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
    }
    catch (error) {
        console.error('Error sending notifications:', error);
        return null;
    }
});
//# sourceMappingURL=notifications.js.map