import type { UserPreferences } from '@/types/preferences';
import { STORAGE_KEYS, DEFAULTS } from '@/lib/constants';
import { getItem, setItem } from './localStorage';

/**
 * Get user preferences from localStorage
 */
export function getPreferences(): UserPreferences {
  const data = getItem(STORAGE_KEYS.PREFERENCES);
  if (!data) {
    return {
      effortColumnVisible: DEFAULTS.EFFORT_COLUMN_VISIBLE,
      showTotalWhenEffortHidden: DEFAULTS.SHOW_TOTAL_WHEN_HIDDEN,
    };
  }

  try {
    return JSON.parse(data) as UserPreferences;
  } catch (error) {
    console.error('Failed to parse preferences:', error);
    return {
      effortColumnVisible: DEFAULTS.EFFORT_COLUMN_VISIBLE,
      showTotalWhenEffortHidden: DEFAULTS.SHOW_TOTAL_WHEN_HIDDEN,
    };
  }
}

/**
 * Update user preferences
 */
export function updatePreferences(updates: Partial<UserPreferences>): void {
  const preferences = getPreferences();
  const newPreferences = { ...preferences, ...updates };

  setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(newPreferences));
}
