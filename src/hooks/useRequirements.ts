'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Requirement } from '@/types/requirement';
import {
  getRequirements,
  createRequirement as createRequirementStorage,
  updateRequirement as updateRequirementStorage,
  deleteRequirement as deleteRequirementStorage,
  toggleRequirementStatus as toggleRequirementStatusStorage,
} from '@/lib/storage/requirements';
import { calculateTotalActiveEffort } from '@/lib/utils/calculations';

export function useRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedRequirements = getRequirements();
    setRequirements(loadedRequirements);
    setIsLoading(false);
  }, []);

  const addRequirement = (description: string, effort: number) => {
    const newRequirement = createRequirementStorage(description, effort);
    setRequirements(prev => [...prev, newRequirement]);
  };

  const updateRequirement = (id: string, updates: Partial<Requirement>) => {
    updateRequirementStorage(id, updates);
    const updatedRequirements = getRequirements();
    setRequirements(updatedRequirements);
  };

  const deleteRequirement = (id: string) => {
    deleteRequirementStorage(id);
    setRequirements(prev => prev.filter(req => req.id !== id));
  };

  const toggleStatus = (id: string) => {
    toggleRequirementStatusStorage(id);
    const updatedRequirements = getRequirements();
    setRequirements(updatedRequirements);
  };

  const totalActiveEffort = useMemo(() => {
    return calculateTotalActiveEffort(requirements);
  }, [requirements]);

  return {
    requirements,
    isLoading,
    addRequirement,
    updateRequirement,
    deleteRequirement,
    toggleStatus,
    totalActiveEffort,
  };
}
