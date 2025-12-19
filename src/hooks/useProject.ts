'use client';

import { useState, useEffect } from 'react';
import type { Project } from '@/types/project';
import { getProject, createProject as createProjectStorage, updateProjectName as updateProjectNameStorage } from '@/lib/storage/project';

export function useProject() {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedProject = getProject();
    setProject(loadedProject);
    setIsLoading(false);
  }, []);

  const updateProjectName = (name: string) => {
    updateProjectNameStorage(name);
    const updatedProject = getProject();
    if (updatedProject) {
      setProject(updatedProject);
    }
  };

  const createNewProject = (name: string) => {
    const newProject = createProjectStorage(name);
    setProject(newProject);
  };

  return {
    project,
    isLoading,
    updateProjectName,
    createProject: createNewProject,
  };
}
