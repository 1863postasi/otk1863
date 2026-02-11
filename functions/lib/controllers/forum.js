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
exports.onReviewCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.onReviewCreated = functions.firestore
    .document('reviews/{reviewId}')
    .onCreate(async (snap, context) => {
    const review = snap.data();
    if (!review)
        return;
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
            const updateData = {
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
    }
    catch (error) {
        console.error('Error updating review stats:', error);
    }
});
//# sourceMappingURL=forum.js.map