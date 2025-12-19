import type { ValidationResult } from '@/types/validation';
import { VALIDATION_CONSTRAINTS, ERROR_MESSAGES } from '@/lib/constants';

/**
 * Validate project name
 */
export function validateProjectName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    // Empty names are allowed, will default to "Untitled Project"
    return { valid: true };
  }

  if (trimmed.length > VALIDATION_CONSTRAINTS.PROJECT_NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: ERROR_MESSAGES.PROJECT_NAME_TOO_LONG,
    };
  }

  return { valid: true, value: trimmed };
}
