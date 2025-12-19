import type { Project } from '@/types/project';
import { STORAGE_KEYS, DEFAULTS } from '@/lib/constants';
import { getItem, setItem } from './localStorage';

/**
 * Get project from localStorage
 */
export function getProject(): Project | null {
  return getItem<Project>(STORAGE_KEYS.PROJECT);
}

/**
 * Create a new project
 */
export function createProject(name: string): Project {
  const trimmedName = name.trim();
  const projectName = trimmedName || DEFAULTS.PROJECT_NAME;

  const project: Project = {
    name: projectName,
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
  };

  setItem(STORAGE_KEYS.PROJECT, project);
  return project;
}

/**
 * Update project name
 */
export function updateProjectName(newName: string): void {
  const project = getProject();
  if (!project) return;

  const trimmedName = newName.trim();
  if (!trimmedName) return;

  project.name = trimmedName;
  project.lastModifiedAt = new Date().toISOString();

  setItem(STORAGE_KEYS.PROJECT, project);
}
