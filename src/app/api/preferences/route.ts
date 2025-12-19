/**
 * Preferences API Routes
 *
 * GET /api/preferences - Get user preferences
 * PUT /api/preferences - Update user preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPreferences,
  updatePreferences,
} from '@/lib/repositories/preferenceRepository';
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorStatusCodes,
} from '@/lib/api/types';
import type { UpdatePreferencesRequest } from '@/lib/api/types';

/**
 * GET /api/preferences
 * Get user preferences
 */
export async function GET() {
  try {
    const preferences = await getPreferences();
    return NextResponse.json(createSuccessResponse(preferences));
  } catch (error) {
    // Error logged
    return NextResponse.json(
      createErrorResponse(
        'DATABASE_ERROR',
        'Unable to load preferences. Please try again.'
      ),
      { status: ErrorStatusCodes.DATABASE_ERROR }
    );
  }
}

/**
 * PUT /api/preferences
 * Update user preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const body: UpdatePreferencesRequest = await request.json();
    const { effortColumnVisible, showTotalWhenEffortHidden, language } = body;

    // Validation
    if (
      effortColumnVisible !== undefined &&
      typeof effortColumnVisible !== 'boolean'
    ) {
      return NextResponse.json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'effortColumnVisible must be a boolean'
        ),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    if (
      showTotalWhenEffortHidden !== undefined &&
      typeof showTotalWhenEffortHidden !== 'boolean'
    ) {
      return NextResponse.json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'showTotalWhenEffortHidden must be a boolean'
        ),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    if (language !== undefined) {
      if (language !== 'en' && language !== 'th') {
        return NextResponse.json(
          createErrorResponse(
            'VALIDATION_ERROR',
            'Language must be "en" or "th"'
          ),
          { status: ErrorStatusCodes.VALIDATION_ERROR }
        );
      }
    }

    // Update preferences
    const updatedPreferences = await updatePreferences({
      effortColumnVisible,
      showTotalWhenEffortHidden,
      language,
    });

    return NextResponse.json(createSuccessResponse(updatedPreferences));
  } catch (error: any) {
    // Error logged

    // Check if it's a validation error from the repository
    if (error.message?.includes('Invalid language')) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', error.message),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    return NextResponse.json(
      createErrorResponse(
        'DATABASE_ERROR',
        'Unable to save preferences. Please try again.'
      ),
      { status: ErrorStatusCodes.DATABASE_ERROR }
    );
  }
}
