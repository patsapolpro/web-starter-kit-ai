'use client';

import { useState, useEffect } from 'react';
import type { UserPreferences } from '@/types/preferences';
import {
  fetchPreferences,
  updatePreferences as updatePreferencesAPI,
} from '@/lib/api/client';

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchPreferences();

      if (response.success) {
        setPreferences(response.data);
      } else {
        setError(response.error.message);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError('Unable to load preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<Omit<UserPreferences, 'id' | 'lastUpdatedAt'>>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updatePreferencesAPI(updates);

      if (response.success) {
        setPreferences(response.data);
      } else {
        setError(response.error.message);
        throw new Error(response.error.message);
      }
    } catch (err: any) {
      console.error('Error updating preferences:', err);
      const errorMessage = err.message || 'Unable to save preferences. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    refetch: loadPreferences,
  };
}
