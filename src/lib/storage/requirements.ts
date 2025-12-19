import type { Requirement } from '@/types/requirement';
import { STORAGE_KEYS, DEFAULTS } from '@/lib/constants';
import { getItem, setItem } from './localStorage';

/**
 * Get all requirements from localStorage
 */
export function getRequirements(): Requirement[] {
  const data = getItem(STORAGE_KEYS.REQUIREMENTS);
  if (!data) return [];

  try {
    return JSON.parse(data) as Requirement[];
  } catch (error) {
    console.error('Failed to parse requirements data:', error);
    return [];
  }
}

/**
 * Get requirement by ID
 */
export function getRequirementById(id: string): Requirement | null {
  const requirements = getRequirements();
  return requirements.find((req) => req.id === id) || null;
}

/**
 * Create a new requirement and save to localStorage
 */
export function createRequirement(description: string, effort: number): Requirement {
  const now = new Date().toISOString();

  const requirement: Requirement = {
    id: crypto.randomUUID(),
    description: description.trim(),
    effort: effort,
    isActive: DEFAULTS.REQUIREMENT_STATUS,
    createdAt: now,
    lastModifiedAt: now,
  };

  const requirements = getRequirements();
  requirements.push(requirement);
  setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(requirements));

  return requirement;
}

/**
 * Update an existing requirement
 */
export function updateRequirement(id: string, updates: Partial<Requirement>): void {
  const requirements = getRequirements();
  const index = requirements.findIndex((req) => req.id === id);

  if (index === -1) return;

  requirements[index] = {
    ...requirements[index],
    ...updates,
    id: requirements[index].id, // Prevent ID change
    createdAt: requirements[index].createdAt, // Prevent createdAt change
    lastModifiedAt: new Date().toISOString(),
  };

  setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(requirements));
}

/**
 * Toggle requirement status (active/inactive)
 */
export function toggleRequirementStatus(id: string): void {
  const requirements = getRequirements();
  const index = requirements.findIndex((req) => req.id === id);

  if (index === -1) return;

  requirements[index].isActive = !requirements[index].isActive;
  requirements[index].lastModifiedAt = new Date().toISOString();

  setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(requirements));
}

/**
 * Delete a requirement
 */
export function deleteRequirement(id: string): void {
  const requirements = getRequirements();
  const filtered = requirements.filter((req) => req.id !== id);

  setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(filtered));
}

/**
 * Calculate total active effort
 */
export function calculateTotalActiveEffort(): number {
  const requirements = getRequirements();

  const total = requirements
    .filter((req) => req.isActive)
    .reduce((sum, req) => sum + req.effort, 0);

  // Round to 2 decimal places to avoid floating point precision issues
  return Math.round(total * 100) / 100;
}
