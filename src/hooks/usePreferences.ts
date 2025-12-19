'use client';

import { useState, useEffect } from 'react';
import type { UserPreferences } from '@/types/preferences';
import { getPreferences, updatePreferences as updatePreferencesStorage } from '@/lib/storage/preferences';

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => getPreferences());

  useEffect(() => {
    const loadedPreferences = getPreferences();
    setPreferences(loadedPreferences);
  }, []);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    updatePreferencesStorage(updates);
    const updatedPreferences = getPreferences();
    setPreferences(updatedPreferences);
  };

  return {
    preferences,
    updatePreferences,
  };
}
