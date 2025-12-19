/**
 * API Types and Response Formats
 *
 * This module defines the standard API response formats, error codes,
 * and request/response types for all API endpoints.
 */

import type { Project } from '@/types/project';
import type { Requirement } from '@/types/requirement';
import type { UserPreferences } from '@/types/preferences';

/**
 * Standard API Success Response
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

/**
 * Standard API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Error codes used across the API
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'CONNECTION_ERROR'
  | 'INTERNAL_ERROR';

/**
 * HTTP status codes mapping to error codes
 */
export const ErrorStatusCodes: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  DATABASE_ERROR: 500,
  CONNECTION_ERROR: 503,
  INTERNAL_ERROR: 500,
};

// ============================================
// Project API Types
// ============================================

/**
 * Request body for creating a project
 */
export interface CreateProjectRequest {
  name: string;
}

/**
 * Request body for updating a project
 */
export interface UpdateProjectRequest {
  name: string;
}

/**
 * Response for project operations
 */
export type ProjectResponse = ApiResponse<Project>;

// ============================================
// Requirement API Types
// ============================================

/**
 * Request body for creating a requirement
 */
export interface CreateRequirementRequest {
  description: string;
  effort: number;
}

/**
 * Request body for updating a requirement
 */
export interface UpdateRequirementRequest {
  description?: string;
  effort?: number;
  isActive?: boolean;
}

/**
 * Response for single requirement operations
 */
export type RequirementResponse = ApiResponse<Requirement>;

/**
 * Response for multiple requirements
 */
export type RequirementsListResponse = ApiResponse<Requirement[]>;

// ============================================
// Preferences API Types
// ============================================

/**
 * Request body for updating preferences
 */
export interface UpdatePreferencesRequest {
  effortColumnVisible?: boolean;
  showTotalWhenEffortHidden?: boolean;
  language?: 'en' | 'th';
}

/**
 * Response for preferences operations
 */
export type PreferencesResponse = ApiResponse<UserPreferences>;

// ============================================
// Helper Functions
// ============================================

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: any
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(
  response: ApiResponse
): response is ApiErrorResponse {
  return response.success === false;
}
