import type { Requirement } from '@/types/requirement';

/**
 * Calculate total active effort from requirements
 */
export function calculateTotalActiveEffort(requirements: Requirement[]): number {
  const total = requirements
    .filter(req => req.isActive === true)
    .reduce((sum, req) => sum + req.effort, 0);

  return Math.round(total * 100) / 100; // Round to 2 decimal places
}
