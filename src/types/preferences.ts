/**
 * User preferences for display settings
 */
export interface UserPreferences {
  /** Unique preference identifier (database ID) */
  id: number;

  /** Whether the effort column is visible in requirements table */
  effortColumnVisible: boolean;

  /** Whether total effort summary is visible when effort column is hidden */
  showTotalWhenEffortHidden: boolean;

  /** User's preferred language */
  language: 'en' | 'th';

  /** ISO 8601 timestamp of last preference update */
  lastUpdatedAt: string;
}
