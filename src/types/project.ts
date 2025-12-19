/**
 * Project entity representing a single project
 */
export interface Project {
  /** Unique project identifier (database ID) */
  id: number;

  /** Project name (1-100 characters) */
  name: string;

  /** ISO 8601 timestamp of project creation */
  createdAt: string;

  /** ISO 8601 timestamp of last modification */
  lastModifiedAt: string;
}
