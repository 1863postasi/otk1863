import { collection, query, where, getDocs, updateDoc, doc, DocumentReference } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Recalculates stats for a Course based on ALL relevant reviews.
 * Filters: 
 * 1. type == 'course' AND targetId == courseId
 * 2. type == 'course-instructor' AND courseCode == courseCode
 * 
 * Aggregates: rating, reviewCount, avgDifficulty
 */
export const recalculateCourseStats = async (courseId: string, courseCode: string) => {
    try {
        const reviewsRef = collection(db, 'reviews');

        // Query 1: Generic Course Reviews
        const q1 = query(
            reviewsRef,
            where('type', '==', 'course'),
            where('targetId', '==', courseId)
        );

        // Query 2: Course-Instructor Reviews (linked by courseCode)
        // Note: courseCode is stored as UPPERCASE usually.
        const q2 = query(
            reviewsRef,
            where('type', '==', 'course-instructor'),
            where('courseCode', '==', courseCode)
        );

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

        const allReviews = [...snap1.docs, ...snap2.docs].map(d => d.data());

        const count = allReviews.length;

        if (count === 0) {
            await updateDoc(doc(db, 'courses', courseId), {
                rating: 0,
                reviewCount: 0,
                avgDifficulty: 0
            });
            return { rating: 0, count: 0, difficulty: 0 };
        }

        const totalRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        const totalDifficulty = allReviews.reduce((sum, r) => sum + (r.difficulty || 0), 0);

        // Adjust for reviews that might not have difficulty (though they should if recent)
        // If difficulty is missing, we might treat it as 5 or ignore?
        // User said: "1 değerlendirme varsa doğrudan onun zorluğu ortalama olmalı"
        // Better to count only reviews that HAVE difficulty for the difficulty average?
        // Or assume 0? No, 0 is valid? 1-10 range.
        // Let's filter for difficulty only if it's defined.

        const reviewsWithDiff = allReviews.filter(r => r.difficulty !== undefined && r.difficulty !== null);
        const diffCount = reviewsWithDiff.length;
        const totalDifficultyFiltered = reviewsWithDiff.reduce((sum, r) => sum + (r.difficulty || 0), 0);

        const avgRating = totalRating / count;
        // If no reviews have difficulty, default to 0
        const avgDifficulty = diffCount > 0 ? totalDifficultyFiltered / diffCount : 0;

        await updateDoc(doc(db, 'courses', courseId), {
            rating: avgRating,
            reviewCount: count,
            avgDifficulty: avgDifficulty
        });

        return { rating: avgRating, count, difficulty: avgDifficulty };

    } catch (error) {
        console.error("Error recalculating course stats:", error);
        throw error;
    }
};

/**
 * Recalculates stats for an Instructor based on ALL relevant reviews.
 * Filters:
 * 1. type == 'instructor' AND targetId == instructorId
 * 2. type == 'course-instructor' AND targetId contains instructorId OR instructorId field exists?
 * 
 * Actually, 'course-instructor' reviews have `targetId` as `COURSE_INSTRUCTOR`.
 * But they SHOULD have `instructorId` metadata field if we saved it correctly.
 * `useReview` adds `instructorId` if we passed it in data? 
 * `CourseInstructorDetail` submits `instructorId: instructor.id` in `submitReview`.
 * So we can query by `instructorId`.
 */
export const recalculateInstructorStats = async (instructorId: string) => {
    try {
        const reviewsRef = collection(db, 'reviews');

        // Query: All reviews where instructorId matches
        // This relies on 'instructorId' field being present on 'course-instructor' reviews.
        // It also handles 'instructor' type reviews if they follow the same pattern or satisfy the query.
        // 'instructor' type reviews usually have targetId == instructorId.

        // Strategy: Query by targetId for direct reviews, AND instructorId for linked reviews.

        const q1 = query(
            reviewsRef,
            where('targetId', '==', instructorId),
            where('type', '==', 'instructor')
        );

        const q2 = query(
            reviewsRef,
            where('instructorId', '==', instructorId),
            where('type', '==', 'course-instructor')
        );

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

        // Deduplicate? A review shouldn't be in both sets unless data is weird.
        // Snap1: type='instructor'. Snap2: type='course-instructor'. Disjoint sets.
        const allReviews = [...snap1.docs, ...snap2.docs].map(d => d.data());

        const count = allReviews.length;

        if (count === 0) {
            await updateDoc(doc(db, 'instructors', instructorId), {
                rating: 0,
                reviewCount: 0
            });
            return { rating: 0, count: 0 };
        }

        const totalRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        const avgRating = totalRating / count;

        await updateDoc(doc(db, 'instructors', instructorId), {
            rating: avgRating,
            reviewCount: count
        });

        return { rating: avgRating, count };

    } catch (error) {
        console.error("Error recalculating instructor stats:", error);
        throw error;
    }
};

/**
 * Global Sync: Iterates over all courses and instructors to fix historical data errors.
 * CAUTION: Hits Firestore hard! Use sparingly.
 */
export const syncAllStats = async (onProgress?: (msg: string) => void) => {
    try {
        onProgress?.("Senkronizasyon başlatıldı...");

        // 1. Fetch All Course IDs and Codes
        const coursesSnap = await getDocs(collection(db, 'courses'));
        const courseTargets = coursesSnap.docs.map(d => ({ id: d.id, code: d.data().code }));

        onProgress?.(`${courseTargets.length} ders taranıyor...`);
        for (const target of courseTargets) {
            await recalculateCourseStats(target.id, target.code);
        }

        // 2. Fetch All Instructor IDs
        const instructorsSnap = await getDocs(collection(db, 'instructors'));
        const instructorIds = instructorsSnap.docs.map(d => d.id);

        onProgress?.(`${instructorIds.length} hoca taranıyor...`);
        for (const id of instructorIds) {
            await recalculateInstructorStats(id);
        }

        onProgress?.("Tüm istatistikler başarıyla güncellendi!");
        return true;
    } catch (error) {
        console.error("Global sync failed:", error);
        onProgress?.(`Hata: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`);
        throw error;
    }
};
