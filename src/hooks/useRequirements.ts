'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Requirement } from '@/types/requirement';
import {
  fetchRequirements,
  createRequirement as createRequirementAPI,
  updateRequirement as updateRequirementAPI,
  deleteRequirement as deleteRequirementAPI,
  toggleRequirementStatus as toggleRequirementStatusAPI,
} from '@/lib/api/client';
import { calculateTotalActiveEffort } from '@/lib/utils/calculations';

export function useRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load requirements on mount
  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchRequirements();

      if (response.success) {
        setRequirements(response.data);
      } else {
        setError(response.error.message);
      }
    } catch (err) {
      console.error('Error loading requirements:', err);
      setError('Unable to load requirements. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addRequirement = async (description: string, effort: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createRequirementAPI({ description, effort });

      if (response.success) {
        setRequirements(prev => [...prev, response.data]);
      } else {
        setError(response.error.message);
        throw new Error(response.error.message);
      }
    } catch (err: any) {
      console.error('Error adding requirement:', err);
      const errorMessage = err.message || 'Unable to add requirement. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequirement = async (id: number, updates: Partial<Omit<Requirement, 'id' | 'projectId' | 'createdAt' | 'lastModifiedAt'>>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateRequirementAPI(id, updates);

      if (response.success) {
        setRequirements(prev =>
          prev.map(req => (req.id === id ? response.data : req))
        );
      } else {
        setError(response.error.message);
        throw new Error(response.error.message);
      }
    } catch (err: any) {
      console.error('Error updating requirement:', err);
      const errorMessage = err.message || 'Unable to save changes. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRequirement = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deleteRequirementAPI(id);

      if (response.success) {
        setRequirements(prev => prev.filter(req => req.id !== id));
      } else {
        setError(response.error.message);
        throw new Error(response.error.message);
      }
    } catch (err: any) {
      console.error('Error deleting requirement:', err);
      const errorMessage = err.message || 'Unable to delete requirement. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: number) => {
    const requirement = requirements.find(req => req.id === id);
    if (!requirement) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await toggleRequirementStatusAPI(id, requirement.isActive);

      if (response.success) {
        setRequirements(prev =>
          prev.map(req => (req.id === id ? response.data : req))
        );
      } else {
        setError(response.error.message);
        throw new Error(response.error.message);
      }
    } catch (err: any) {
      console.error('Error toggling requirement status:', err);
      const errorMessage = err.message || 'Unable to toggle status. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const totalActiveEffort = useMemo(() => {
    return calculateTotalActiveEffort(requirements);
  }, [requirements]);

  return {
    requirements,
    isLoading,
    error,
    addRequirement,
    updateRequirement,
    deleteRequirement,
    toggleStatus,
    totalActiveEffort,
    refetch: loadRequirements,
  };
}
