import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Review, Instructor, Course } from '../pages/Forum/types';
import { useAuth } from '../context/AuthContext';

interface UseReviewProps {
    type: 'course' | 'instructor' | 'course-instructor';
    targetId: string; // The main ID to filter by
    secondaryTargetId?: string; // Optional (e.g. courseId for course-instructor)
    courseCode?: string; // New: To fetch course-instructor reviews for a course
    instructorId?: string; // New: To fetch course-instructor reviews for an instructor
    enableRealtime?: boolean;
}

export const useReview = ({ type, targetId, secondaryTargetId, courseCode, instructorId }: UseReviewProps) => {
    const { userProfile } = useAuth();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Fetch Reviews
    const fetchReviews = useCallback(async () => {
        if (!targetId) return;

        setLoading(true);
        try {
            const reviewsRef = collection(db, 'reviews');
            let data: Review[] = [];

            if (type === 'course' && courseCode) {
                // Course Detail Case: Fetch both 'course' and 'course-instructor' reviews
                const q1 = query(reviewsRef, where('type', '==', 'course'), where('targetId', '==', targetId));
                const q2 = query(reviewsRef, where('type', '==', 'course-instructor'), where('courseCode', '==', courseCode));
                const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

                const d1 = snap1.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
                const d2 = snap2.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];

                // Merge and deduplicate just in case (though should be disjoint)
                const map = new Map();
                [...d1, ...d2].forEach(r => map.set(r.id, r));
                data = Array.from(map.values());

            } else if (type === 'instructor' && instructorId) {
                // Instructor Detail Case: Fetch both 'instructor' and 'course-instructor' reviews
                const q1 = query(reviewsRef, where('type', '==', 'instructor'), where('targetId', '==', targetId));
                const q2 = query(reviewsRef, where('type', '==', 'course-instructor'), where('instructorId', '==', instructorId));
                const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

                const d1 = snap1.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
                const d2 = snap2.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];

                const map = new Map();
                [...d1, ...d2].forEach(r => map.set(r.id, r));
                data = Array.from(map.values());

            } else {
                // Standard Case (Single Query)
                const constraints = [
                    where('type', '==', type),
                    where('targetId', '==', targetId)
                ];
                if (secondaryTargetId) {
                    constraints.push(where('secondaryTargetId', '==', secondaryTargetId));
                }
                const q = query(reviewsRef, ...constraints);
                const snapshot = await getDocs(q);
                data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
            }

            // Sort client-side for consistency and to avoid complex composite indexes
            data.sort((a, b) => {
                const tA = a.timestamp?.seconds || 0;
                const tB = b.timestamp?.seconds || 0;
                return tB - tA;
            });

            setReviews(data);

            // Find user's review
            if (userProfile) {
                const myReview = data.find(r => r.userId === userProfile.uid);
                setUserReview(myReview || null);
            } else {
                setUserReview(null);
            }

        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    }, [type, targetId, secondaryTargetId, courseCode, instructorId, userProfile]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Submit Review (Create or Update)
    const submitReview = async (data: {
        rating: number;
        comment: string;
        isAnonymous: boolean;
        difficulty?: number;
        // Additional metadata
        courseCode?: string;
        contact?: string; // For marketplace, but maybe redundant here
    }) => {
        if (!userProfile) throw new Error("User not authenticated");

        setSubmitting(true);
        try {
            // Prepare base review data
            // Firestore does NOT accept 'undefined', so we must be careful.
            const baseData: any = {
                rating: data.rating,
                comment: data.comment,
                isAnonymous: data.isAnonymous,
                // User info
                userDisplayName: data.isAnonymous ? 'Anonim Öğrenci' : (userProfile.username || 'Öğrenci'),
                userPhotoUrl: data.isAnonymous ? null : (userProfile.photoUrl || null), // Ensure null if undefined
                userId: userProfile.uid,
                // Target info
                type,
                targetId,
                // Metadata
                updatedAt: serverTimestamp() // Track updates
            };

            // Conditionally add optional fields
            if (data.difficulty !== undefined && data.difficulty !== null) {
                baseData.difficulty = data.difficulty;
            }

            if (data.courseCode) {
                baseData.courseCode = data.courseCode;
            }

            if (secondaryTargetId) {
                baseData.secondaryTargetId = secondaryTargetId;
            }

            if (userReview) {
                // UPDATE
                await updateDoc(doc(db, 'reviews', userReview.id), {
                    ...baseData,
                    editedAt: serverTimestamp()
                });
            } else {
                // CREATE
                await addDoc(collection(db, 'reviews'), {
                    ...baseData,
                    likes: 0,
                    timestamp: serverTimestamp()
                });
            }

            // Refresh list
            await fetchReviews();
            return true;

        } catch (error) {
            console.error("Error submitting review:", error);
            throw error;
        } finally {
            setSubmitting(false);
        }
    };

    // Delete Review
    const deleteReview = async () => {
        if (!userReview) return;

        setDeleting(true);
        try {
            await deleteDoc(doc(db, 'reviews', userReview.id));
            await fetchReviews();
            return true;
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        } finally {
            setDeleting(false);
        }
    };

    return {
        reviews,
        userReview,
        loading,
        submitting,
        deleting,
        fetchReviews,
        submitReview,
        deleteReview
    };
};
