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
    targetId: string; // The main ID to filter by (e.g. instructorId)
    secondaryTargetId?: string; // Optional (e.g. courseId for course-instructor)
    enableRealtime?: boolean; // If we want realtime updates later
}

export const useReview = ({ type, targetId, secondaryTargetId }: UseReviewProps) => {
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
            // Base query filters
            const constraints = [
                where('type', '==', type),
                where('targetId', '==', targetId)
            ];

            // Add secondary target if exists (e.g. for specific course-instructor pair)
            if (secondaryTargetId) {
                constraints.push(where('secondaryTargetId', '==', secondaryTargetId));
                // Note: Ensure you have composite indexes if using multiple fields with sorting
            }

            // Order by timestamp desc
            // const q = query(collection(db, 'reviews'), ...constraints, orderBy('timestamp', 'desc'));
            // For now, let's just fetch and sort client side to avoid index issues immediately, 
            // or use simple query. Index creation might be needed.
            const q = query(collection(db, 'reviews'), ...constraints);

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];

            // Sort client-side for now to be safe against missing indexes
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
    }, [type, targetId, secondaryTargetId, userProfile]);

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
            const reviewData = {
                rating: data.rating,
                comment: data.comment,
                isAnonymous: data.isAnonymous,
                difficulty: data.difficulty,
                // User info snapshot
                userDisplayName: data.isAnonymous ? 'Anonim Öğrenci' : (userProfile.username || 'Öğrenci'),
                userPhotoUrl: data.isAnonymous ? null : userProfile.photoUrl,
                userId: userProfile.uid,
                // Target info
                type,
                targetId,
                secondaryTargetId,
                // Metadata
                courseCode: data.courseCode,
            };

            if (userReview) {
                // UPDATE
                await updateDoc(doc(db, 'reviews', userReview.id), {
                    ...reviewData,
                    editedAt: serverTimestamp()
                });
            } else {
                // CREATE
                await addDoc(collection(db, 'reviews'), {
                    ...reviewData,
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
