/**
 * Validation constraints
 */
export const VALIDATION_CONSTRAINTS = {
  PROJECT_NAME_MIN_LENGTH: 1,
  PROJECT_NAME_MAX_LENGTH: 100,
  REQUIREMENT_DESCRIPTION_MIN_LENGTH: 1,
  REQUIREMENT_DESCRIPTION_MAX_LENGTH: 500,
  EFFORT_MIN_VALUE: 0.1,
  EFFORT_MAX_VALUE: 1000,
} as const;

/**
 * localStorage keys
 */
export const STORAGE_KEYS = {
  SCHEMA_VERSION: 'req-tracker:schema-version',
  PROJECT: 'req-tracker:project',
  REQUIREMENTS: 'req-tracker:requirements',
  PREFERENCES: 'req-tracker:preferences',
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  PROJECT_NAME: 'Untitled Project',
  REQUIREMENT_STATUS: true,
  EFFORT_COLUMN_VISIBLE: true,
  SHOW_TOTAL_WHEN_HIDDEN: true,
  SCHEMA_VERSION: '1.0.0',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  DESCRIPTION_REQUIRED: 'Requirement description is required',
  DESCRIPTION_TOO_LONG: 'Description must not exceed 500 characters',
  EFFORT_REQUIRED: 'Effort value is required',
  EFFORT_MUST_BE_NUMBER: 'Effort must be a number',
  EFFORT_MUST_BE_POSITIVE: 'Effort must be greater than 0',
  EFFORT_TOO_LARGE: 'Effort must not exceed 1000',
  PROJECT_NAME_TOO_LONG: 'Project name must not exceed 100 characters',
} as const;
