/**
 * Standardized Spring Animation Parameters
 * Based on Çarkçıbaşı Performance Analysis
 * 
 * Usage:
 * import { SPRINGS } from '@/lib/animations';
 * <motion.div transition={SPRINGS.snappy} />
 */

export const SPRINGS = {
    /** Fast, responsive animations for buttons and icons */
    quick: {
        type: "spring" as const,
        stiffness: 500,
        damping: 35
    },

    /** Kart Hover: Soft and Heavy */
    soft: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
    },

    /** Modal Open: Snappy and Responsive */
    snappy: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25
    },

    /** Win Effect: Bouncy and Cheerful */
    bouncy: {
        type: "spring" as const,
        stiffness: 400,
        damping: 10
    },

    /** Heavy, weighty animations for large layout shifts */
    heavy: {
        type: "spring" as const,
        stiffness: 200,
        damping: 25,
        mass: 1.2
    },

    /** Gentle animations for hover effects */
    gentle: {
        type: "spring" as const,
        stiffness: 400,
        damping: 30
    }
};

/**
 * Easing curves for non-spring animations
 */
export const EASINGS = {
    easeInOut: [0.4, 0, 0.2, 1],
    easeOut: [0, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
};
