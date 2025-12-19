/**
 * Project Repository
 *
 * Data access layer for project operations with PostgreSQL database.
 * Provides CRUD operations for projects with proper error handling.
 */

import { sql } from '@/lib/db';
import type { Project } from '@/types/project';
import { VALIDATION_CONSTRAINTS, ERROR_MESSAGES } from '@/lib/constants';

/**
 * Get the current project (single-user model)
 *
 * @returns Project or null if no project exists
 */
export async function getProject(): Promise<Project | null> {
  try {
    const result = await sql<Project>`
      SELECT
        id,
        name,
        created_at as "createdAt",
        last_modified_at as "lastModifiedAt"
      FROM projects
      ORDER BY id DESC
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error fetching project:', error);
    throw new Error('Failed to fetch project');
  }
}

/**
 * Get project by ID
 *
 * @param id - Project ID
 * @returns Project or null if not found
 */
export async function getProjectById(id: number): Promise<Project | null> {
  try {
    const result = await sql<Project>`
      SELECT
        id,
        name,
        created_at as "createdAt",
        last_modified_at as "lastModifiedAt"
      FROM projects
      WHERE id = ${id}
    `;

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    throw new Error('Failed to fetch project');
  }
}

/**
 * Create a new project
 *
 * @param name - Project name
 * @returns Created project
 */
export async function createProject(name: string): Promise<Project> {
  try {
    // Trim and validate name
    const trimmedName = name.trim();
    const finalName = trimmedName.length > 0 ? trimmedName : 'Untitled Project';

    const result = await sql<Project>`
      INSERT INTO projects (name)
      VALUES (${finalName})
      RETURNING
        id,
        name,
        created_at as "createdAt",
        last_modified_at as "lastModifiedAt"
    `;

    return result.rows[0];
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('Failed to create project');
  }
}

/**
 * Update project name
 *
 * @param id - Project ID
 * @param name - New project name
 * @returns Updated project or null if not found
 */
export async function updateProject(
  id: number,
  name: string
): Promise<Project | null> {
  try {
    // Trim and validate name
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      throw new Error(ERROR_MESSAGES.PROJECT_NAME_REQUIRED);
    }

    if (trimmedName.length > VALIDATION_CONSTRAINTS.PROJECT_NAME_MAX_LENGTH) {
      throw new Error(ERROR_MESSAGES.PROJECT_NAME_TOO_LONG);
    }

    const result = await sql<Project>`
      UPDATE projects
      SET name = ${trimmedName}
      WHERE id = ${id}
      RETURNING
        id,
        name,
        created_at as "createdAt",
        last_modified_at as "lastModifiedAt"
    `;

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

/**
 * Delete project and all associated requirements
 *
 * @param id - Project ID
 * @returns true if deleted, false if not found
 */
export async function deleteProject(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM projects
      WHERE id = ${id}
    `;

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Failed to delete project');
  }
}

/**
 * Delete all projects (for clearing all data)
 */
export async function deleteAllProjects(): Promise<void> {
  try {
    await sql`DELETE FROM projects`;
  } catch (error) {
    console.error('Error deleting all projects:', error);
    throw new Error('Failed to delete all projects');
  }
}
