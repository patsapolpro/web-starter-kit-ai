/**
 * Safe localStorage wrapper with error handling
 */

/**
 * Safely get item from localStorage
 */
export function getItem(key: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading from localStorage (key: ${key}):`, error);
    return null;
  }
}

/**
 * Safely set item in localStorage
 */
export function setItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Safely remove item from localStorage
 */
export function removeItem(key: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Clear all application data from localStorage
 */
export function clearAllData(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('req-tracker:') && key !== 'req-tracker:schema-version') {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}
