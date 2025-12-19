import type { UserPreferences } from '@/types/preferences';
import { STORAGE_KEYS, DEFAULTS } from '@/lib/constants';
import { getItem, setItem } from './localStorage';

/**
 * Get user preferences from localStorage
 */
export function getPreferences(): UserPreferences {
  const preferences = getItem<UserPreferences>(STORAGE_KEYS.PREFERENCES);

  if (!preferences) {
    return {
      effortColumnVisible: DEFAULTS.EFFORT_COLUMN_VISIBLE,
      showTotalWhenEffortHidden: DEFAULTS.SHOW_TOTAL_WHEN_HIDDEN,
    };
  }

  return preferences;
}

/**
 * Update user preferences
 */
export function updatePreferences(updates: Partial<UserPreferences>): void {
  const currentPreferences = getPreferences();
  const newPreferences = { ...currentPreferences, ...updates };
  setItem(STORAGE_KEYS.PREFERENCES, newPreferences);
}
