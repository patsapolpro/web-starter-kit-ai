'use client';

import { useState, useEffect } from 'react';
import type { Project } from '@/types/project';
import {
  getProject,
  createProject as createProjectStorage,
  updateProjectName as updateProjectNameStorage,
} from '@/lib/storage/project';

export interface UseProjectReturn {
  project: Project | null;
  isLoading: boolean;
  updateProjectName: (name: string) => void;
  createProject: (name: string) => void;
}

export function useProject(): UseProjectReturn {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load project from localStorage on mount
    const loadedProject = getProject();
    if (loadedProject) {
      setProject(loadedProject);
    }
    // Don't auto-create project - let setup page handle first-time creation
    setIsLoading(false);
  }, []);

  const updateProjectName = (name: string) => {
    updateProjectNameStorage(name);
    const updatedProject = getProject();
    if (updatedProject) {
      setProject(updatedProject);
    }
  };

  const createProject = (name: string) => {
    const newProject = createProjectStorage(name);
    setProject(newProject);
  };

  return {
    project,
    isLoading,
    updateProjectName,
    createProject,
  };
}
