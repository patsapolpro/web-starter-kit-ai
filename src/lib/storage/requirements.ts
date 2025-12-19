import type { Requirement } from '@/types/requirement';
import { STORAGE_KEYS } from '@/lib/constants';
import { getItem, setItem } from './localStorage';

/**
 * Get all requirements from localStorage
 */
export function getRequirements(): Requirement[] {
  return getItem<Requirement[]>(STORAGE_KEYS.REQUIREMENTS) || [];
}

/**
 * Save requirements to localStorage
 */
function saveRequirements(requirements: Requirement[]): void {
  setItem(STORAGE_KEYS.REQUIREMENTS, requirements);
}

/**
 * Get requirement by ID
 */
export function getRequirementById(id: string): Requirement | null {
  const requirements = getRequirements();
  return requirements.find(req => req.id === id) || null;
}

/**
 * Create a new requirement
 */
export function createRequirement(description: string, effort: number): Requirement {
  const requirements = getRequirements();

  const requirement: Requirement = {
    id: crypto.randomUUID(),
    description: description.trim(),
    effort: effort,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
  };

  requirements.push(requirement);
  saveRequirements(requirements);

  return requirement;
}

/**
 * Update an existing requirement
 */
export function updateRequirement(id: string, updates: Partial<Requirement>): void {
  const requirements = getRequirements();
  const index = requirements.findIndex(req => req.id === id);

  if (index === -1) return;

  const requirement = requirements[index];

  // Apply updates
  if (updates.description !== undefined) {
    requirement.description = updates.description.trim();
  }
  if (updates.effort !== undefined) {
    requirement.effort = updates.effort;
  }
  if (updates.isActive !== undefined) {
    requirement.isActive = updates.isActive;
  }

  // Update timestamp
  requirement.lastModifiedAt = new Date().toISOString();

  requirements[index] = requirement;
  saveRequirements(requirements);
}

/**
 * Toggle requirement active status
 */
export function toggleRequirementStatus(id: string): void {
  const requirements = getRequirements();
  const requirement = requirements.find(req => req.id === id);

  if (!requirement) return;

  requirement.isActive = !requirement.isActive;
  requirement.lastModifiedAt = new Date().toISOString();

  saveRequirements(requirements);
}

/**
 * Delete a requirement
 */
export function deleteRequirement(id: string): void {
  const requirements = getRequirements();
  const filtered = requirements.filter(req => req.id !== id);
  saveRequirements(filtered);
}

/**
 * Clear all requirements
 */
export function clearAllRequirements(): void {
  saveRequirements([]);
}
