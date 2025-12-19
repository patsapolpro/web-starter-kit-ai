import type { Project } from '@/types/project';
import { STORAGE_KEYS, DEFAULTS } from '@/lib/constants';
import { getItem, setItem } from './localStorage';

/**
 * Get project from localStorage
 */
export function getProject(): Project | null {
  const data = getItem(STORAGE_KEYS.PROJECT);
  if (!data) return null;

  try {
    return JSON.parse(data) as Project;
  } catch (error) {
    console.error('Failed to parse project data:', error);
    return null;
  }
}

/**
 * Create a new project and save to localStorage
 */
export function createProject(name: string): Project {
  const now = new Date().toISOString();
  const trimmedName = name.trim();

  const project: Project = {
    name: trimmedName || DEFAULTS.PROJECT_NAME,
    createdAt: now,
    lastModifiedAt: now,
  };

  setItem(STORAGE_KEYS.PROJECT, JSON.stringify(project));
  return project;
}

/**
 * Update project name
 */
export function updateProjectName(newName: string): void {
  const project = getProject();
  if (!project) return;

  const trimmedName = newName.trim();
  project.name = trimmedName || DEFAULTS.PROJECT_NAME;
  project.lastModifiedAt = new Date().toISOString();

  setItem(STORAGE_KEYS.PROJECT, JSON.stringify(project));
}
