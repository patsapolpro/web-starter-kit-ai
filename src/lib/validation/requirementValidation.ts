import type { ValidationResult } from '@/types/validation';
import { VALIDATION_CONSTRAINTS, ERROR_MESSAGES } from '@/lib/constants';

/**
 * Validate requirement description
 */
export function validateDescription(description: string): ValidationResult {
  const trimmed = description.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.DESCRIPTION_REQUIRED,
    };
  }

  if (trimmed.length > VALIDATION_CONSTRAINTS.REQUIREMENT_DESCRIPTION_MAX_LENGTH) {
    return {
      valid: false,
      error: ERROR_MESSAGES.DESCRIPTION_TOO_LONG,
    };
  }

  return { valid: true, value: trimmed };
}

/**
 * Validate effort value
 */
export function validateEffort(effort: any): ValidationResult {
  if (effort === null || effort === undefined || effort === '') {
    return {
      valid: false,
      error: ERROR_MESSAGES.EFFORT_REQUIRED,
    };
  }

  const numericEffort = Number(effort);

  if (isNaN(numericEffort)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.EFFORT_MUST_BE_NUMBER,
    };
  }

  if (numericEffort <= 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.EFFORT_MUST_BE_POSITIVE,
    };
  }

  if (numericEffort > VALIDATION_CONSTRAINTS.EFFORT_MAX_VALUE) {
    return {
      valid: false,
      error: ERROR_MESSAGES.EFFORT_TOO_LARGE,
    };
  }

  if (!isFinite(numericEffort)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.EFFORT_MUST_BE_NUMBER,
    };
  }

  return { valid: true, value: numericEffort };
}
