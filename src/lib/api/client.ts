/**
 * API Client
 *
 * Frontend utility for making API calls with proper error handling
 * and type safety. All functions return typed responses.
 */

import type {
  ApiResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateRequirementRequest,
  UpdateRequirementRequest,
  UpdatePreferencesRequest,
  ProjectResponse,
  RequirementResponse,
  RequirementsListResponse,
  PreferencesResponse,
} from './types';
import type { Project } from '@/types/project';
import type { Requirement } from '@/types/requirement';
import type { UserPreferences } from '@/types/preferences';

/**
 * Base API URL
 */
const API_BASE_URL = '/api';

/**
 * Generic API request function
 */
async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: {
        code: 'CONNECTION_ERROR',
        message: 'Unable to connect to the server. Please check your connection.',
      },
    };
  }
}

// ============================================
// Project API Client
// ============================================

/**
 * Get the current project
 */
export async function fetchProject(): Promise<ProjectResponse> {
  return apiRequest<Project>(`${API_BASE_URL}/project`, {
    method: 'GET',
  });
}

/**
 * Create a new project
 */
export async function createProject(
  data: CreateProjectRequest
): Promise<ProjectResponse> {
  return apiRequest<Project>(`${API_BASE_URL}/project`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update project name
 */
export async function updateProject(
  data: UpdateProjectRequest
): Promise<ProjectResponse> {
  return apiRequest<Project>(`${API_BASE_URL}/project`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============================================
// Requirements API Client
// ============================================

/**
 * Get all requirements
 */
export async function fetchRequirements(): Promise<RequirementsListResponse> {
  return apiRequest<Requirement[]>(`${API_BASE_URL}/requirements`, {
    method: 'GET',
  });
}

/**
 * Get a single requirement by ID
 */
export async function fetchRequirement(
  id: number
): Promise<RequirementResponse> {
  return apiRequest<Requirement>(`${API_BASE_URL}/requirements/${id}`, {
    method: 'GET',
  });
}

/**
 * Create a new requirement
 */
export async function createRequirement(
  data: CreateRequirementRequest
): Promise<RequirementResponse> {
  return apiRequest<Requirement>(`${API_BASE_URL}/requirements`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update a requirement
 */
export async function updateRequirement(
  id: number,
  data: UpdateRequirementRequest
): Promise<RequirementResponse> {
  return apiRequest<Requirement>(`${API_BASE_URL}/requirements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a requirement
 */
export async function deleteRequirement(
  id: number
): Promise<ApiResponse<{ deleted: boolean; id: number }>> {
  return apiRequest<{ deleted: boolean; id: number }>(
    `${API_BASE_URL}/requirements/${id}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * Toggle requirement status (convenience function)
 */
export async function toggleRequirementStatus(
  id: number,
  currentStatus: boolean
): Promise<RequirementResponse> {
  return updateRequirement(id, { isActive: !currentStatus });
}

// ============================================
// Preferences API Client
// ============================================

/**
 * Get user preferences
 */
export async function fetchPreferences(): Promise<PreferencesResponse> {
  return apiRequest<UserPreferences>(`${API_BASE_URL}/preferences`, {
    method: 'GET',
  });
}

/**
 * Update user preferences
 */
export async function updatePreferences(
  data: UpdatePreferencesRequest
): Promise<PreferencesResponse> {
  return apiRequest<UserPreferences>(`${API_BASE_URL}/preferences`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============================================
// Helper Functions
// ============================================

/**
 * Extract error message from API response
 */
export function getErrorMessage(response: ApiResponse): string {
  if (response.success) {
    return '';
  }

  return response.error.message || 'An unexpected error occurred';
}

/**
 * Check if API response is successful
 */
export function isSuccess<T>(
  response: ApiResponse<T>
): response is { success: true; data: T } {
  return response.success === true;
}

/**
 * Extract data from successful response or throw error
 */
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error.message);
  }
  return response.data;
}
