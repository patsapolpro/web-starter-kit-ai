/**
 * Test Utilities and Helper Functions
 *
 * This module provides common utilities for API testing including:
 * - Database setup/teardown
 * - Test data creation helpers
 * - Response assertion helpers
 */

import { sql, getPoolInstance, closeConnections } from '@/lib/db';
import { Pool } from 'pg';

// Types
interface Project {
  id: number;
  name: string;
  createdAt: string;
  lastModifiedAt: string;
}

interface Requirement {
  id: number;
  projectId: number;
  description: string;
  effort: number;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt: string;
}

interface UserPreferences {
  id: number;
  effortColumnVisible: boolean;
  showTotalWhenEffortHidden: boolean;
  language: 'en' | 'th';
  lastUpdatedAt: string;
}

type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'CONNECTION_ERROR'
  | 'INTERNAL_ERROR';

// Database Setup Functions
export async function setupTestDatabase(): Promise<void> {
  try {
    const pool = getPoolInstance();
    await pool.query('SELECT 1');
  } catch (error) {
    // Error logged
    throw error;
  }
}

export async function teardownTestDatabase(): Promise<void> {
  await closeConnections();
}

export async function truncateTables(): Promise<void> {
  try {
    // Truncate in the correct order to avoid foreign key conflicts
    // Child tables first, then parent tables
    await sql`TRUNCATE TABLE requirements, projects, preferences CASCADE`;
  } catch (error) {
    // Error logged
    throw error;
  }
}

export async function seedDefaultPreferences(): Promise<void> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM preferences
    `;

    if (result.rows[0].count === '0') {
      await sql`
        INSERT INTO preferences (effort_column_visible, show_total_when_effort_hidden, language)
        VALUES (true, true, 'en')
      `;
    }
  } catch (error) {
    // Error logged
    throw error;
  }
}

// Test Data Creation Helpers
export async function createTestProject(name: string = 'Test Project'): Promise<Project> {
  const result = await sql<Project>`
    INSERT INTO projects (name, created_at, last_modified_at)
    VALUES (${name}, NOW(), NOW())
    RETURNING id, name,
      to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "createdAt",
      to_char(last_modified_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "lastModifiedAt"
  `;

  return result.rows[0];
}

export async function createTestRequirement(
  projectId: number,
  data: Partial<{ description: string; effort: number; isActive: boolean }>
): Promise<Requirement> {
  const description = data.description || 'Test requirement';
  const effort = data.effort || 5;
  const isActive = data.isActive !== undefined ? data.isActive : true;

  const result = await sql<Requirement>`
    INSERT INTO requirements (project_id, description, effort, is_active, created_at, last_modified_at)
    VALUES (${projectId}, ${description}, ${effort}, ${isActive}, NOW(), NOW())
    RETURNING id, project_id as "projectId", description, effort, is_active as "isActive",
      to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "createdAt",
      to_char(last_modified_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "lastModifiedAt"
  `;

  return result.rows[0];
}

// Assertion Helpers
export function assertSuccessResponse<T>(
  response: any,
  expectedData?: Partial<T>
): void {
  expect(response.body).toHaveProperty('success', true);
  expect(response.body).toHaveProperty('data');

  if (expectedData) {
    expect(response.body.data).toMatchObject(expectedData);
  }
}

export function assertErrorResponse(
  response: any,
  expectedCode: ErrorCode,
  expectedMessage?: string
): void {
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('error');
  expect(response.body.error.code).toBe(expectedCode);

  if (expectedMessage) {
    expect(response.body.error.message).toContain(expectedMessage);
  }
}

// Direct database query helper
export async function queryDatabase(text: string, params?: any[]): Promise<any> {
  const pool = getPoolInstance();
  return pool.query(text, params);
}

// Export types for use in tests
export type {
  Project,
  Requirement,
  UserPreferences,
  ErrorCode
};
