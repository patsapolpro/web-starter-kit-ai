/**
 * Generic localStorage wrapper with error handling
 */

/**
 * Get item from localStorage
 */
export function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = window.localStorage.getItem(key);
    if (item === null) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
}

/**
 * Set item in localStorage
 */
export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
}

/**
 * Remove item from localStorage
 */
export function removeItem(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
}

/**
 * Clear all items from localStorage
 */
export function clearAll(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
