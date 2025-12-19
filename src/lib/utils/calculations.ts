import type { Requirement } from '@/types/requirement';

/**
 * Calculate total effort from active requirements
 */
export function calculateTotalEffort(requirements: Requirement[]): number {
  const total = requirements
    .filter((req) => req.isActive)
    .reduce((sum, req) => sum + req.effort, 0);

  // Round to 2 decimal places to avoid floating point precision issues
  return Math.round(total * 100) / 100;
}
