/**
 * Haptic Feedback Utility
 * Provides tactile feedback for mobile users
 * Gracefully degrades if not supported
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';

const patterns: Record<HapticPattern, number | number[]> = {
    light: 5,                          // Quick tap (button press)
    medium: 10,                        // Medium tap
    heavy: 20,                         // Heavy tap
    success: [100, 50, 100, 50, 200],  // Victory rhythm
    error: [10, 50, 10],               // Double buzz (error)
    warning: [50, 100, 50],            // Warning pattern
};

/**
 * Trigger haptic feedback if supported
 * @param type Type of haptic pattern
 */
export const triggerHaptic = (type: HapticPattern = 'light'): void => {
    if (!('vibrate' in navigator)) {
        return; // Not supported, silently fail
    }

    try {
        const pattern = patterns[type];
        navigator.vibrate(pattern);
    } catch (error) {
        // Vibration API failed, ignore
        console.debug('Haptic feedback not available');
    }
};

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = (): boolean => {
    return 'vibrate' in navigator;
};
