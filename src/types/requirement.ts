/**
 * Requirement entity representing a single project requirement
 */
export interface Requirement {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Requirement description (1-500 characters) */
  description: string;

  /** Effort value (0.1-1000, decimals allowed) */
  effort: number;

  /** Whether requirement is included in total effort calculation */
  isActive: boolean;

  /** ISO 8601 timestamp of requirement creation */
  createdAt: string;

  /** ISO 8601 timestamp of last modification */
  lastModifiedAt: string;
}
