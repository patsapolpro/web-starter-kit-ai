/**
 * User preferences for display settings
 */
export interface UserPreferences {
  /** Whether the effort column is visible in requirements table */
  effortColumnVisible: boolean;

  /** Whether total effort summary is visible when effort column is hidden */
  showTotalWhenEffortHidden: boolean;
}
