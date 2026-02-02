import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

/**
 * Calculate score based on guess count (client-side preview).
 * Server will recalculate for security.
 * @param guessCount Number of guesses used (1-6)
 * @param isWon Whether the game was won
 * @returns Score (10-100)
 */
export const calculateScore = (guessCount: number, isWon: boolean): number => {
    if (!isWon) return 10; // Kaybetse de teselli puanı

    const baseScore = 100;
    const penalty = (guessCount - 1) * 15;
    return Math.max(10, baseScore - penalty);
};

/**
 * Calls the Cloud Function to validate the word.
 * @param guess The 5-letter word guess.
 * @param attemptIndex Current attempt index (0-5).
 * @param history Array of previous guesses.
 */
export const checkDailyWord = async (guess: string, attemptIndex: number, history: string[]) => {
    const checkFn = httpsCallable(functions, 'checkDailyWord');
    try {
        const result = await checkFn({ guess, attemptIndex, history });
        return result.data as { result: string[], status: 'win' | 'loss' | 'continue', score: number };
    } catch (error: any) {
        console.error("Game Engine Error:", error);
        throw new Error(error.message || "Oyun sunucusuna ulaşılamadı.");
    }
};
