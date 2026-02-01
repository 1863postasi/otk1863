/**
 * Simple Client-Side Cache for Firestore Data
 * Reduces unnecessary reads for frequently accessed data
 * 
 * Usage:
 * import { cache } from '@/lib/cache';
 * const data = cache.get('clubs') || await fetchAndCache('clubs');
 */

interface CacheEntry {
    data: any;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

const STORAGE_KEY = 'otk1863_cache_v1';

class SimpleCache {
    private cache: Map<string, CacheEntry> = new Map();

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Convert object to Map
                Object.keys(parsed).forEach(key => {
                    this.cache.set(key, parsed[key]);
                });
            }
        } catch (e) {
            console.error("Cache load failed", e);
        }
    }

    private saveToStorage() {
        try {
            const obj = Object.fromEntries(this.cache);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
        } catch (e) {
            console.warn("Cache save failed (quota?)", e);
        }
    }

    /**
     * Get cached data if it exists and hasn't expired
     */
    get(key: string): any | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            this.saveToStorage(); // Update storage
            return null;
        }

        return entry.data;
    }

    /**
     * Set cache with TTL (default: 5 minutes)
     */
    set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
        this.saveToStorage();
    }

    /**
     * Clear specific key or entire cache
     */
    clear(key?: string): void {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
        this.saveToStorage();
    }

    /**
     * Check if key exists and is valid
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }
}

export const cache = new SimpleCache();

/**
 * Common cache keys for the application
 */
export const CACHE_KEYS = {
    CLUBS: 'clubs',
    ANNOUNCEMENTS: 'announcements',
    OTK_COMMISSIONS: 'otk_commissions',
    OTK_REPRESENTATIVES: 'otk_representatives',
    ORIGINS: 'origins',
} as const;

/**
 * Cache TTL configurations (in milliseconds)
 */
export const CACHE_TTL = {
    SHORT: 2 * 60 * 1000,      // 2 minutes - for frequently changing data
    MEDIUM: 5 * 60 * 1000,     // 5 minutes - default
    LONG: 10 * 60 * 1000,      // 10 minutes - for announcements
    LONG_15: 15 * 60 * 1000,   // 15 minutes - legacy
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours - for static OTK data
    EPIC: 365 * 24 * 60 * 60 * 1000, // 1 Year - for Archive
} as const;
