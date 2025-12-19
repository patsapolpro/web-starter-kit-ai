'use client';

import { useState, useEffect } from 'react';
import type { UserPreferences } from '@/types/preferences';
import {
  getPreferences,
  updatePreferences as updatePreferencesStorage,
} from '@/lib/storage/preferences';

export interface UsePreferencesReturn {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}

export function usePreferences(): UsePreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences>(getPreferences());

  useEffect(() => {
    // Load preferences from localStorage on mount
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
