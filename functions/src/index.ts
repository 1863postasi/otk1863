import * as admin from 'firebase-admin';
import * as boundleController from './controllers/boundle';

admin.initializeApp();

// Export the Boundle daily word check function
export const checkDailyWord = boundleController.checkDailyWord;
