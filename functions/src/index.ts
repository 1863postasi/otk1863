import * as admin from 'firebase-admin';

import * as notificationsController from './controllers/notifications';

admin.initializeApp();

// Export the Boundle daily word check function


// Export Notification Trigger
export const onAnnouncementCreated = notificationsController.onAnnouncementCreated;

// Export Forum Trigger
import * as forumController from './controllers/forum';
export const onReviewCreated = forumController.onReviewCreated;
