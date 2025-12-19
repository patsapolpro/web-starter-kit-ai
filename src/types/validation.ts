/**
 * Result of a validation operation
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;

  /** Error message if validation failed */
  error?: string;

  /** Validated value (for type conversion) */
  value?: any;
}
