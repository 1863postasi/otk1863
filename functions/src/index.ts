import * as admin from 'firebase-admin';
import * as boundleController from './controllers/boundle';
import * as notificationsController from './controllers/notifications';

admin.initializeApp();

// Export the Boundle daily word check function
export const checkDailyWord = boundleController.checkDailyWord;

// Export Notification Trigger
export const onAnnouncementCreated = notificationsController.onAnnouncementCreated;

// Export Forum Trigger
import * as forumController from './controllers/forum';
export const onReviewCreated = forumController.onReviewCreated;
