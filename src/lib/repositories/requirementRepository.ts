/**
 * Requirement Repository
 *
 * Data access layer for requirement operations with PostgreSQL database.
 * Provides CRUD operations for requirements with proper error handling.
 */

import { sql } from '@/lib/db';
import type { Requirement } from '@/types/requirement';
import { VALIDATION_CONSTRAINTS, ERROR_MESSAGES } from '@/lib/constants';

/**
 * Parse requirement data from database
 * Ensures numeric fields are properly typed
 */
function parseRequirement(row: any): Requirement {
  return {
    ...row,
    effort: typeof row.effort === 'string' ? parseFloat(row.effort) : row.effort,
  };
}

/**
 * Get all requirements for a project
 *
 * @param projectId - Project ID
 * @returns Array of requirements
 */
export async function getRequirements(
  projectId: number
): Promise<Requirement[]> {
  try {
    const result = await sql<Requirement>`
      SELECT
        id,
        project_id as "projectId",
        description,
        effort,
        is_active as "isActive",
        created_at as "createdAt",
        last_modified_at as "lastModifiedAt"
      FROM requirements
      WHERE project_id = ${projectId}
      ORDER BY created_at ASC
    `;

    return result.rows.map(parseRequirement);
  } catch (error) {
    console.error('Error fetching requirements:', error);
    throw new Error('Failed to fetch requirements');
  }
}

/**
 * Get a single requirement by ID
 *
 * @param id - Requirement ID
 * @returns Requirement or null if not found
 */
export async function getRequirementById(
  id: number
): Promise<Requirement | null> {
  try {
    const result = await sql<Requirement>`
      SELECT
        id,
        project_id as "projectId",
        description,
        effort,
        is_active as "isActive",
        created_at as "createdAt",
        last_modified_at as "lastModifiedAt"
      FROM requirements
      WHERE id = ${id}
    `;

    if (result.rows.length === 0) {
      return null;
    }

    return parseRequirement(result.rows[0]);
  } catch (error) {
    console.error('Error fetching requirement by ID:', error);
    throw new Error('Failed to fetch requirement');
  }
}

/**
 * Create a new requirement
 *
 * @param projectId - Project ID
 * @param description - Requirement description
 * @param effort - Effort value
 * @returns Created requirement
 */
export async function createRequirement(
  projectId: number,
  description: string,
  effort: number
): Promise<Requirement> {
  try {
    // Trim description
    const trimmedDescription = description.trim();

    // Validate
    if (trimmedDescription.length === 0) {
      throw new Error(ERROR_MESSAGES.DESCRIPTION_REQUIRED);
    }

    if (trimmedDescription.length > VALIDATION_CONSTRAINTS.REQUIREMENT_DESCRIPTION_MAX_LENGTH) {
      throw new Error(ERROR_MESSAGES.DESCRIPTION_TOO_LONG);
    }

    if (effort < VALIDATION_CONSTRAINTS.EFFORT_MIN_VALUE || effort > VALIDATION_CONSTRAINTS.EFFORT_MAX_VALUE) {
      throw new Error(`Effort must be between ${VALIDATION_CONSTRAINTS.EFFORT_MIN_VALUE} and ${VALIDATION_CONSTRAINTS.EFFORT_MAX_VALUE}`);
    }

    const result = await sql<Requirement>`
      INSERT INTO requirements (project_id, description, effort, is_active)
      VALUES (${projectId}, ${trimmedDescription}, ${effort}, true)
      RETURNING
        id,
        project_id as "projectId",
        description,
        effort,
        is_active as "isActive",
        created_at as "createdAt",
        last_modified_at as "lastModifiedAt"
    `;

    return parseRequirement(result.rows[0]);
  } catch (error) {
    console.error('Error creating requirement:', error);
    throw error;
  }
}

/**
 * Update a requirement
 *
 * @param id - Requirement ID
 * @param updates - Fields to update
 * @returns Updated requirement or null if not found
 */
export async function updateRequirement(
  id: number,
  updates: {
    description?: string;
    effort?: number;
    isActive?: boolean;
  }
): Promise<Requirement | null> {
  try {
    // Build update query dynamically
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.description !== undefined) {
      const trimmedDescription = updates.description.trim();
      if (trimmedDescription.length === 0) {
        throw new Error(ERROR_MESSAGES.DESCRIPTION_REQUIRED);
      }
      if (trimmedDescription.length > VALIDATION_CONSTRAINTS.REQUIREMENT_DESCRIPTION_MAX_LENGTH) {
        throw new Error(ERROR_MESSAGES.DESCRIPTION_TOO_LONG);
      }
      setClauses.push(`description = $${paramIndex++}`);
      values.push(trimmedDescription);
    }

    if (updates.effort !== undefined) {
      if (updates.effort < VALIDATION_CONSTRAINTS.EFFORT_MIN_VALUE || updates.effort > VALIDATION_CONSTRAINTS.EFFORT_MAX_VALUE) {
        throw new Error(`Effort must be between ${VALIDATION_CONSTRAINTS.EFFORT_MIN_VALUE} and ${VALIDATION_CONSTRAINTS.EFFORT_MAX_VALUE}`);
      }
      setClauses.push(`effort = $${paramIndex++}`);
      values.push(updates.effort);
    }

    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${paramIndex++}`);
      values.push(updates.isActive);
    }

    if (setClauses.length === 0) {
      // No updates provided, just fetch the current requirement
      return getRequirementById(id);
    }

    // Add requirement ID as the last parameter
    values.push(id);

    const query = `
      UPDATE requirements
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING
        id,
        project_id as "projectId",
        description,
        effort,
        is_active as "isActive",
        created_at as "createdAt",
        last_modified_at as "lastModifiedAt"
    `;

    const result = await sql.query<Requirement>(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return parseRequirement(result.rows[0]);
  } catch (error) {
    console.error('Error updating requirement:', error);
    throw error;
  }
}

/**
 * Toggle requirement status (active/inactive)
 *
 * @param id - Requirement ID
 * @returns Updated requirement or null if not found
 */
export async function toggleRequirementStatus(
  id: number
): Promise<Requirement | null> {
  try {
    const result = await sql<Requirement>`
      UPDATE requirements
      SET is_active = NOT is_active
      WHERE id = ${id}
      RETURNING
        id,
        project_id as "projectId",
        description,
        effort,
        is_active as "isActive",
        created_at as "createdAt",
        last_modified_at as "lastModifiedAt"
    `;

    if (result.rows.length === 0) {
      return null;
    }

    return parseRequirement(result.rows[0]);
  } catch (error) {
    console.error('Error toggling requirement status:', error);
    throw new Error('Failed to toggle requirement status');
  }
}

/**
 * Delete a requirement
 *
 * @param id - Requirement ID
 * @returns true if deleted, false if not found
 */
export async function deleteRequirement(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM requirements
      WHERE id = ${id}
    `;

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting requirement:', error);
    throw new Error('Failed to delete requirement');
  }
}

/**
 * Delete all requirements for a project
 *
 * @param projectId - Project ID
 */
export async function deleteAllRequirements(projectId: number): Promise<void> {
  try {
    await sql`
      DELETE FROM requirements
      WHERE project_id = ${projectId}
    `;
  } catch (error) {
    console.error('Error deleting all requirements:', error);
    throw new Error('Failed to delete all requirements');
  }
}

/**
 * Calculate total active effort for a project
 *
 * @param projectId - Project ID
 * @returns Total active effort
 */
export async function calculateTotalActiveEffort(
  projectId: number
): Promise<number> {
  try {
    const result = await sql<{ total: string | number }>`
      SELECT COALESCE(SUM(effort), 0) as total
      FROM requirements
      WHERE project_id = ${projectId} AND is_active = true
    `;

    const total = result.rows[0]?.total || 0;
    const numericTotal = typeof total === 'string' ? parseFloat(total) : total;
    return Math.round(numericTotal * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating total active effort:', error);
    throw new Error('Failed to calculate total active effort');
  }
}
