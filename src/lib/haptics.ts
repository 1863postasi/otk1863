/**
 * Haptic Feedback Engine
 * Provides tactile feedback for mobile interactions using the Vibration API.
 */

type HapticType = 'light' | 'medium' | 'success' | 'error' | 'warning';

export const triggerHaptic = (type: HapticType) => {
    // Check if vibration is supported
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    switch (type) {
        case 'light':
            // Key press, toggle
            navigator.vibrate(5);
            break;
        case 'medium':
            // Important UI action
            navigator.vibrate(15);
            break;
        case 'success':
            // Victory! (Heartbeat pattern)
            navigator.vibrate([20, 30, 20]);
            break;
        case 'error':
            // Wrong input (Double shake)
            navigator.vibrate([10, 30, 10, 30]);
            break;
        case 'warning':
            // Alert
            navigator.vibrate([30, 50, 10]);
            break;
    }
};
