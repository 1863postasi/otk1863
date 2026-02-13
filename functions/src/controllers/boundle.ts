import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Triggers when a user's document is written.
 * Listens for changes in 'boundleScore' or 'displayName'/'photoUrl'.
 * Re-calculates the global leaderboard if necessary.
 */
export const onUserBoundleScoreUpdate = functions.firestore
    .document('users/{userId}')
    .onWrite(async (change, context) => {
        const newData = change.after.exists ? change.after.data() : null;
        const oldData = change.before.exists ? change.before.data() : null;

        // If document deleted, we might need to remove from leaderboard (handled by general logic below)
        // If document created or updated, check if boundleScore or profile info changed.

        const newScore = newData?.boundleScore || 0;
        const oldScore = oldData?.boundleScore || 0;

        const newName = newData?.displayName || newData?.username || 'İsimsiz Oyuncu';
        const oldName = oldData?.displayName || oldData?.username || 'İsimsiz Oyuncu';

        const newPhoto = newData?.photoUrl || '';
        const oldPhoto = oldData?.photoUrl || '';

        const newDept = newData?.department || '';
        const oldDept = oldData?.department || '';

        // Check if relevant fields changed
        const scoreChanged = newScore !== oldScore;
        const profileChanged = (newName !== oldName) || (newPhoto !== oldPhoto) || (newDept !== oldDept);

        // Optimization: If nothing relevant changed, exit.
        if (!scoreChanged && !profileChanged && newData) {
            return null;
        }

        // We use a single document for the global leaderboard to avoid client-side heavy queries.
        // Document: leaderboards/global
        const lbRef = db.collection('leaderboards').doc('global');

        return db.runTransaction(async (t) => {
            const lbDoc = await t.get(lbRef);
            let leaders: any[] = [];

            if (lbDoc.exists) {
                leaders = lbDoc.data()?.leaders || [];
            }

            const userId = context.params.userId;

            // 1. Remove the user from the current list (if exists) to avoid duplicates
            leaders = leaders.filter(l => l.uid !== userId);

            // 2. Add the user back if they have a score > 0 and the document wasn't deleted
            if (newData && newScore > 0) {
                leaders.push({
                    uid: userId,
                    displayName: newName,
                    photoUrl: newPhoto,
                    department: newDept,
                    score: newScore,
                    updatedAt: admin.firestore.Timestamp.now()
                });
            }

            // 3. Sort by Score DESC
            leaders.sort((a, b) => b.score - a.score);

            // 4. Keep only top 50 (or 100 to be safe)
            // Storing slightly more than displayed allows for buffering.
            if (leaders.length > 100) {
                leaders = leaders.slice(0, 100);
            }

            // 5. Write back
            t.set(lbRef, {
                leaders: leaders,
                updatedAt: admin.firestore.Timestamp.now()
            });
        });
    });
