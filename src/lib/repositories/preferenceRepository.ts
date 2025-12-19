/**
 * Preference Repository
 *
 * Data access layer for user preference operations with PostgreSQL database.
 * Provides operations for reading and updating user preferences (single-user model).
 */

import { sql } from '@/lib/db';
import type { UserPreferences } from '@/types/preferences';

/**
 * Get user preferences (single-user model)
 *
 * @returns User preferences
 */
export async function getPreferences(): Promise<UserPreferences> {
  try {
    const result = await sql<UserPreferences>`
      SELECT
        id,
        effort_column_visible as "effortColumnVisible",
        show_total_when_effort_hidden as "showTotalWhenEffortHidden",
        language,
        last_updated_at as "lastUpdatedAt"
      FROM preferences
      ORDER BY id DESC
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      // If no preferences exist, create default ones
      return createDefaultPreferences();
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error fetching preferences:', error);
    throw new Error('Failed to fetch preferences');
  }
}

/**
 * Create default preferences
 *
 * @returns Created default preferences
 */
async function createDefaultPreferences(): Promise<UserPreferences> {
  try {
    const result = await sql<UserPreferences>`
      INSERT INTO preferences (
        effort_column_visible,
        show_total_when_effort_hidden,
        language
      )
      VALUES (true, true, 'en')
      RETURNING
        id,
        effort_column_visible as "effortColumnVisible",
        show_total_when_effort_hidden as "showTotalWhenEffortHidden",
        language,
        last_updated_at as "lastUpdatedAt"
    `;

    return result.rows[0];
  } catch (error) {
    console.error('Error creating default preferences:', error);
    throw new Error('Failed to create default preferences');
  }
}

/**
 * Update user preferences
 *
 * @param updates - Fields to update
 * @returns Updated preferences
 */
export async function updatePreferences(updates: {
  effortColumnVisible?: boolean;
  showTotalWhenEffortHidden?: boolean;
  language?: 'en' | 'th';
}): Promise<UserPreferences> {
  try {
    // Build update query dynamically
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.effortColumnVisible !== undefined) {
      setClauses.push(`effort_column_visible = $${paramIndex++}`);
      values.push(updates.effortColumnVisible);
    }

    if (updates.showTotalWhenEffortHidden !== undefined) {
      setClauses.push(`show_total_when_effort_hidden = $${paramIndex++}`);
      values.push(updates.showTotalWhenEffortHidden);
    }

    if (updates.language !== undefined) {
      if (updates.language !== 'en' && updates.language !== 'th') {
        throw new Error('Invalid language. Must be "en" or "th"');
      }
      setClauses.push(`language = $${paramIndex++}`);
      values.push(updates.language);
    }

    if (setClauses.length === 0) {
      // No updates provided, just return current preferences
      return getPreferences();
    }

    const query = `
      UPDATE preferences
      SET ${setClauses.join(', ')}
      WHERE id = (SELECT id FROM preferences ORDER BY id DESC LIMIT 1)
      RETURNING
        id,
        effort_column_visible as "effortColumnVisible",
        show_total_when_effort_hidden as "showTotalWhenEffortHidden",
        language,
        last_updated_at as "lastUpdatedAt"
    `;

    const result = await sql.query<UserPreferences>(query, values);

    if (result.rows.length === 0) {
      // If no preferences exist, create with provided updates
      const defaultPrefs = {
        effortColumnVisible: true,
        showTotalWhenEffortHidden: true,
        language: 'en' as const,
        ...updates,
      };

      const createResult = await sql<UserPreferences>`
        INSERT INTO preferences (
          effort_column_visible,
          show_total_when_effort_hidden,
          language
        )
        VALUES (
          ${defaultPrefs.effortColumnVisible},
          ${defaultPrefs.showTotalWhenEffortHidden},
          ${defaultPrefs.language}
        )
        RETURNING
          id,
          effort_column_visible as "effortColumnVisible",
          show_total_when_effort_hidden as "showTotalWhenEffortHidden",
          language,
          last_updated_at as "lastUpdatedAt"
      `;

      return createResult.rows[0];
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
}

/**
 * Reset preferences to defaults
 */
export async function resetPreferences(): Promise<UserPreferences> {
  try {
    const result = await sql<UserPreferences>`
      UPDATE preferences
      SET
        effort_column_visible = true,
        show_total_when_effort_hidden = true,
        language = 'en'
      WHERE id = (SELECT id FROM preferences ORDER BY id DESC LIMIT 1)
      RETURNING
        id,
        effort_column_visible as "effortColumnVisible",
        show_total_when_effort_hidden as "showTotalWhenEffortHidden",
        language,
        last_updated_at as "lastUpdatedAt"
    `;

    if (result.rows.length === 0) {
      return createDefaultPreferences();
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error resetting preferences:', error);
    throw new Error('Failed to reset preferences');
  }
}
