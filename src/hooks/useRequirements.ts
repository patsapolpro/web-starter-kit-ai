'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Requirement } from '@/types/requirement';
import {
  getRequirements,
  createRequirement as createRequirementStorage,
  updateRequirement as updateRequirementStorage,
  deleteRequirement as deleteRequirementStorage,
  toggleRequirementStatus as toggleRequirementStatusStorage,
  calculateTotalActiveEffort,
} from '@/lib/storage/requirements';

export interface UseRequirementsReturn {
  requirements: Requirement[];
  isLoading: boolean;
  addRequirement: (description: string, effort: number) => void;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (id: string) => void;
  toggleStatus: (id: string) => void;
  totalActiveEffort: number;
  refreshRequirements: () => void;
}

export function useRequirements(): UseRequirementsReturn {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalActiveEffort, setTotalActiveEffort] = useState(0);

  const refreshRequirements = useCallback(() => {
    const loadedRequirements = getRequirements();
    setRequirements(loadedRequirements);
    setTotalActiveEffort(calculateTotalActiveEffort());
  }, []);

  useEffect(() => {
    // Load requirements from localStorage on mount
    refreshRequirements();
    setIsLoading(false);
  }, [refreshRequirements]);

  const addRequirement = (description: string, effort: number) => {
    createRequirementStorage(description, effort);
    refreshRequirements();
  };

  const updateRequirement = (id: string, updates: Partial<Requirement>) => {
    updateRequirementStorage(id, updates);
    refreshRequirements();
  };

  const deleteRequirement = (id: string) => {
    deleteRequirementStorage(id);
    refreshRequirements();
  };

  const toggleStatus = (id: string) => {
    toggleRequirementStatusStorage(id);
    refreshRequirements();
  };

  return {
    requirements,
    isLoading,
    addRequirement,
    updateRequirement,
    deleteRequirement,
    toggleStatus,
    totalActiveEffort,
    refreshRequirements,
  };
}
