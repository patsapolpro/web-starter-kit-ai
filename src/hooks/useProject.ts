'use client';

import { useState, useEffect } from 'react';
import type { Project } from '@/types/project';
import {
  fetchProject,
  createProject as createProjectAPI,
  updateProject as updateProjectAPI,
} from '@/lib/api/client';

export function useProject() {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load project on mount
  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchProject();

      if (response.success) {
        setProject(response.data);
      } else {
        // If no project found, that's okay (404)
        if (response.error.code === 'NOT_FOUND') {
          setProject(null);
        } else {
          setError(response.error.message);
        }
      }
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Unable to load project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectName = async (name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateProjectAPI({ name });

      if (response.success) {
        setProject(response.data);
      } else {
        setError(response.error.message);
        throw new Error(response.error.message);
      }
    } catch (err: any) {
      console.error('Error updating project name:', err);
      const errorMessage = err.message || 'Unable to update project name. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createNewProject = async (name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createProjectAPI({ name });

      if (response.success) {
        setProject(response.data);
      } else {
        setError(response.error.message);
        throw new Error(response.error.message);
      }
    } catch (err: any) {
      console.error('Error creating project:', err);
      const errorMessage = err.message || 'Unable to create project. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    project,
    isLoading,
    error,
    updateProjectName,
    createProject: createNewProject,
    refetch: loadProject,
  };
}
