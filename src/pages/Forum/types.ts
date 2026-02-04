export interface Instructor {
    id: string;
    name: string; // Real name
    department: string;
    courses: string[]; // List of Course IDs they have taught
    rating: number; // Average rating
    reviewCount: number;
}

export interface Course {
    id: string; // Internal ID
    code: string; // e.g., PHIL203
    name: string; // e.g., Philosophy of Mind
    department: string;
    // Offerings are dynamic, but we might want to cache the "latest" or "all" instructors
    instructors: string[]; // List of Instructor IDs
    rating: number;
    reviewCount: number;
}

// A specific instance of a course taught by an instructor in a term
export interface CourseOffering {
    id: string;
    courseId: string;
    instructorId: string;
    term: string; // e.g., "2023-Fall", "2024-Spring"
    year: number;
    semester: 'Fall' | 'Spring' | 'Summer';
}

export interface Review {
    id: string;
    type: 'course' | 'instructor' | 'club' | 'event';
    targetId: string; // ID of the course/instructor/club being reviewed
    secondaryTargetId?: string; // For course reviews, this could be the instructor ID
    userId: string;
    userDisplayName: string;
    userPhotoUrl?: string; // Store snapshot or link to profile
    userBadge?: string; // e.g. "Senior", "Verified"
    rating: number;
    comment: string;
    timestamp: any; // Firestore Timestamp
    likes: number;
    isAnonymous?: boolean;
}

export interface ForumThread {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    authorPhotoUrl?: string;
    category: 'genel' | 'soru-cevap' | 'ikinci-el' | 'kampus-gundemi';
    tags: string[];
    createdAt: any;
    likes: number;
    replyCount: number;
    isPinned?: boolean;

    // Marketplace Specific Fields (Optional on general thread, required for marketplace view logic)
    price?: number;
    currency?: string;
    condition?: 'new' | 'like-new' | 'good' | 'fair';
    images?: string[];
    isSold?: boolean;
    sellerContact?: string; // Whatsapp or phone
}

export interface MarketplaceListing extends ForumThread {
    category: 'ikinci-el';
    price: number;
    currency: string;
    condition: 'new' | 'like-new' | 'good' | 'fair';
    images: string[];
}

// NEW: Standalone Listing for 'listings' collection
export interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: '₺' | '$' | '€' | '£';
    category: string;
    condition: 'new' | 'like-new' | 'good' | 'fair';
    images: string[];

    // Seller
    sellerId: string;
    sellerName: string;
    sellerPhotoUrl?: string;
    contact: {
        whatsapp?: string; // Full link
        phone?: string;    // Display text
    };

    createdAt: any;
    status: 'active' | 'sold' | 'archived';
    tags: string[];
    views: number;
    likes: number;
}

export interface ForumComment {
    id: string;
    threadId: string;
    content: string;
    authorId: string;
    authorName: string;
    authorPhotoUrl?: string;
    createdAt: any;
    likes: number;
}

export interface Club {
    id: string;
    name: string;
    shortName: string;
    description: string;
    website?: string;
    logoUrl?: string;   // URL to image in R2
    bannerUrl?: string; // URL to image in R2
    type: string;       // e.g. "Kültür", "Spor", "Akademik"
    founded?: string;
    memberCount?: number;
    rating?: number;

    // Admin/Manager specific
    clubRoles?: Record<string, string>; // userId -> role
    contents?: any[]; // Archive contents
}
