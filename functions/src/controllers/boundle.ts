// Tetikleme denemesi 1
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { WORD_LIST } from '../data/wordList';

// Ensure admin is initialized if not already (safeguard)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const START_DATE = new Date('2024-01-01').getTime();

// Game Logic Constants
// PRIME_STEP should be coprime with WORD_LIST.length for full cycle traversal.
// Using a large prime ensures the pattern is not obvious to humans.
const PRIME_STEP = 997; 
const OFFSET = 31;

// Helper to get today's pseudo-random non-repeating word index
const getDailyWordIndex = () => {
  const now = Date.now();
  const diff = now - START_DATE;
  const dayIndex = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (WORD_LIST.length === 0) return 0;

  // Prime Modulo Cycle Formula:
  // (OFFSET + (dayIndex * PRIME_STEP)) % Length
  return (OFFSET + (dayIndex * PRIME_STEP)) % WORD_LIST.length;
};

export const checkDailyWord = onCall({ region: 'europe-west1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Oynamak için giriş yapmalısınız.');
  }

  const { guess, attemptIndex, history } = request.data;
  const uid = request.auth.uid;
  const todayIndex = getDailyWordIndex();
  
  // 1. Validation
  if (!guess || typeof guess !== 'string' || guess.length !== 5) {
    throw new HttpsError('invalid-argument', 'Geçersiz kelime uzunluğu.');
  }

  // Normalize inputs to Turkish Uppercase immediately
  const upperGuess = guess.toLocaleUpperCase('tr-TR');
  
  // Check existence in word list
  if (WORD_LIST.length > 0) {
     const exists = WORD_LIST.some(w => w.toLocaleUpperCase('tr-TR') === upperGuess);
     if (!exists) {
        throw new HttpsError('invalid-argument', 'Kelime listesinde yok.');
     }
  }

  // 2. Logic
  // Select word using the calculated Prime Modulo index directly
  let rawTarget = WORD_LIST.length > 0 ? WORD_LIST[todayIndex] : "KALEM";
  const targetWord = rawTarget.toLocaleUpperCase('tr-TR'); 

  const result: string[] = Array(5).fill('absent');
  const targetLetters = targetWord.split('');
  const guessLetters = upperGuess.split('');

  // First pass: Correct (Green)
  guessLetters.forEach((letter, i) => {
    if (letter === targetLetters[i]) {
      result[i] = 'correct';
      targetLetters[i] = '#'; // Mark as used
    }
  });

  // Second pass: Present (Yellow)
  guessLetters.forEach((letter, i) => {
    if (result[i] !== 'correct') {
      const targetIndex = targetLetters.indexOf(letter);
      if (targetIndex !== -1) {
        result[i] = 'present';
        targetLetters[targetIndex] = '#'; // Mark as used
      }
    }
  });

  const isWin = result.every(r => r === 'correct');
  let score = 0;
  let status = 'continue';

  // 3. Database Update (Transaction)
  if (isWin) {
    status = 'win';
    const userRef = db.collection('users').doc(uid);
    const todayStr = new Date().toISOString().split('T')[0];
    const gameRef = userRef.collection('game_history').doc(todayStr);

    await db.runTransaction(async (t) => {
      const userDoc = await t.get(userRef);
      const gameDoc = await t.get(gameRef);

      if (gameDoc.exists) {
        throw new HttpsError('already-exists', 'Bu günlük oyunu zaten oynadınız.');
      }

      // Calculate Score
      const attemptIdx = attemptIndex || 5; 
      score = Math.max(100, 600 - (attemptIdx * 100));

      const userData = userDoc.data() || {};
      const lastDate = userData.lastBoundleDate;
      
      let streak = userData.boundleStreak || 0;
      
      // Check streak (is last date yesterday?)
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastDate === yesterday) {
        streak += 1;
      } else if (lastDate !== todayStr) {
        streak = 1; // Reset if missed a day, unless it's same day replay (blocked above)
      }

      const newMaxStreak = Math.max(userData.boundleMaxStreak || 0, streak);

      t.update(userRef, {
        boundleTotalPoints: admin.firestore.FieldValue.increment(score),
        boundleStreak: streak,
        boundleMaxStreak: newMaxStreak,
        lastBoundleDate: todayStr
      });

      t.set(gameRef, {
        word: targetWord,
        guesses: history || [], 
        score: score,
        result: 'win',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    });
  }

  return { result, status, score };
});
