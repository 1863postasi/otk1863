import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const onReviewCreated = functions.firestore
    .document('reviews/{reviewId}')
    .onCreate(async (snap, context) => {
        const review = snap.data();
        if (!review) return;

        const { targetId, type, rating, difficulty } = review;

        if (!targetId || !type || !rating) {
            console.error('Invalid review data:', review);
            return;
        }

        try {
            await db.runTransaction(async (transaction) => {
                // Determine collection based on type
                const collectionName = type === 'course' ? 'courses' : 'instructors';
                const targetRef = db.collection(collectionName).doc(targetId);

                const targetDoc = await transaction.get(targetRef);
                if (!targetDoc.exists) {
                    throw new Error(`Target document not found: ${collectionName}/${targetId}`);
                }

                const targetData = targetDoc.data() || {};
                const currentReviewCount = targetData.reviewCount || 0;
                const currentRating = targetData.rating || 0;

                // Calculate new averages
                const newReviewCount = currentReviewCount + 1;
                const newRating = ((currentRating * currentReviewCount) + rating) / newReviewCount;

                const updateData: any = {
                    reviewCount: newReviewCount,
                    rating: newRating
                };

                // If it's a course, also update difficulty
                if (type === 'course' && difficulty !== undefined) {
                    const currentDifficulty = targetData.avgDifficulty || 0;
                    const newDifficulty = ((currentDifficulty * currentReviewCount) + difficulty) / newReviewCount;
                    updateData.avgDifficulty = newDifficulty;
                }

                transaction.update(targetRef, updateData);
            });

            console.log(`Successfully updated stats for ${type} ${targetId}`);
        } catch (error) {
            console.error('Error updating review stats:', error);
        }
    });
