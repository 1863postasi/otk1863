import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { WORD_LIST } from '../data/wordList';

// Tarihe göre kelime seç (Deterministic ve Asal Sayı Karıştırmalı)
const getDailyWord = (): string => {
  const epoch = new Date("2024-01-01").getTime();
  const today = new Date().getTime();
  const daysSince = Math.floor((today - epoch) / (1000 * 60 * 60 * 24));
  // 997 Asal sayı shuffle
  return WORD_LIST[(daysSince * 997) % WORD_LIST.length];
};

interface CheckRequest {
  guess: string;
  attemptIndex: number;
  history: string[];
}

export const checkDailyWord = functions.https.onCall(async (data: CheckRequest, context: functions.https.CallableContext) => {
  console.log("GAME FUNCTION STARTED");

  try {
    // 1. Auth Check
    if (!context.auth) {
      console.warn("Unauthenticated access attempt");
      throw new functions.https.HttpsError('unauthenticated', 'Giriş yapmalısınız.');
    }

    const { guess, attemptIndex } = data;
    const userId = context.auth.uid;

    // Validate Input
    if (!guess || guess.length !== 5) {
      console.warn("Invalid input length:", guess);
      throw new functions.https.HttpsError('invalid-argument', 'Kelime 5 harfli olmalı.');
    }

    const rawTargetWord = getDailyWord();
    if (!rawTargetWord) {
      console.error("CRITICAL: getDailyWord returned null/undefined. List size:", WORD_LIST.length);
      throw new functions.https.HttpsError('internal', 'Oyun hatası: Hedef kelime sorunu.');
    }

    // PREMIUM MODE: Turkish locale support restored
    const TARGET_WORD = rawTargetWord.toLocaleUpperCase('tr-TR');
    const normalizedGuess = guess.toLocaleUpperCase('tr-TR');
    const today = new Date().toISOString().split('T')[0];

    // 1.5 Dictionary Check
    const isValidWord = WORD_LIST.some(w => w.toLocaleUpperCase('tr-TR') === normalizedGuess);
    if (!isValidWord) {
      throw new functions.https.HttpsError('invalid-argument', 'Böyle bir kelime sözlüğümüzde yok.');
    }

    // 2. Cooldown & Attempt Check (Firestore)
    const gameRef = admin.firestore()
      .collection('users').doc(userId)
      .collection('game_history').doc(today);

    const gameDoc = await gameRef.get();

    if (gameDoc.exists) {
      const gameData = gameDoc.data();
      if (gameData?.status === 'won' || gameData?.status === 'lost') {
        throw new functions.https.HttpsError('failed-precondition', 'Bugünkü oyunu zaten tamamladınız.');
      }
      if (gameData?.guesses && gameData.guesses.length >= 6) {
        throw new functions.https.HttpsError('resource-exhausted', 'Tahmin hakkınız doldu.');
      }
    }

    // 3. Logic: Check Word
    const result: ('correct' | 'present' | 'absent')[] = Array(5).fill('absent');
    const targetChars = Array.from(TARGET_WORD);
    const guessChars = Array.from(normalizedGuess);

    // First pass: Correct (Green)
    guessChars.forEach((char, i) => {
      if (char === targetChars[i]) {
        result[i] = 'correct';
        targetChars[i] = null as any;
      }
    });

    // Second pass: Present (Yellow)
    guessChars.forEach((char, i) => {
      if (result[i] !== 'correct') {
        const targetIndex = targetChars.indexOf(char);
        if (targetIndex !== -1) {
          result[i] = 'present';
          targetChars[targetIndex] = null as any;
        }
      }
    });

    // 4. Determine Status
    const isWin = result.every(r => r === 'correct');
    const isLoss = !isWin && attemptIndex >= 5;

    let status: 'win' | 'loss' | 'continue' = 'continue';
    if (isWin) status = 'win';
    else if (isLoss) status = 'loss';

    // 5. Calculate Score
    let score = 0;
    if (isWin) {
      const baseScore = 100;
      const penalty = attemptIndex * 15;
      score = Math.max(10, baseScore - penalty);
    } else if (isLoss) {
      score = 10; // Comfort score
    }

    // 6. Save to Firestore
    await gameRef.set({
      guesses: admin.firestore.FieldValue.arrayUnion(normalizedGuess),
      status: status,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      ...(status === 'win' || status === 'loss' ? { score } : {})
    }, { merge: true });

    // Update User Profile Stats
    if (isWin) {
      await admin.firestore().collection('users').doc(userId).set({
        boundleTotalPoints: admin.firestore.FieldValue.increment(score),
        boundleStreak: admin.firestore.FieldValue.increment(1),
        lastBoundleDate: today
      }, { merge: true });
    } else if (isLoss) {
      await admin.firestore().collection('users').doc(userId).set({
        boundleTotalPoints: admin.firestore.FieldValue.increment(score),
        boundleStreak: 0,
        lastBoundleDate: today
      }, { merge: true });
    }

    return {
      result,
      status,
      score
    };

  } catch (error) {
    console.error("FATAL ERROR CAUGHT:", error);
    // @ts-ignore
    throw new functions.https.HttpsError('internal', 'Sunucu Hatası', error.message || 'Unknown');
  }
});