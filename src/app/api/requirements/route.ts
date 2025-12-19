/**
 * Requirements API Routes
 *
 * GET    /api/requirements - Get all requirements for current project
 * POST   /api/requirements - Create new requirement
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProject } from '@/lib/repositories/projectRepository';
import {
  getRequirements,
  createRequirement,
} from '@/lib/repositories/requirementRepository';
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorStatusCodes,
} from '@/lib/api/types';
import type { CreateRequirementRequest } from '@/lib/api/types';

/**
 * GET /api/requirements
 * Get all requirements for the current project
 */
export async function GET() {
  try {
    // Get current project
    const project = await getProject();

    if (!project) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'No project found'),
        { status: ErrorStatusCodes.NOT_FOUND }
      );
    }

    // Get requirements
    const requirements = await getRequirements(project.id);

    return NextResponse.json(createSuccessResponse(requirements));
  } catch (error) {
    // Error logged
    return NextResponse.json(
      createErrorResponse(
        'DATABASE_ERROR',
        'Unable to load requirements. Please try again.'
      ),
      { status: ErrorStatusCodes.DATABASE_ERROR }
    );
  }
}

/**
 * POST /api/requirements
 * Create a new requirement
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateRequirementRequest = await request.json();
    const { description, effort } = body;

    // Basic type validation only
    if (description === undefined || description === null) {
      return NextResponse.json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Requirement description is required'
        ),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    if (effort === undefined || effort === null) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Effort value is required'),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    if (typeof effort !== 'number' || isNaN(effort)) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Effort must be a number'),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    // Get current project
    const project = await getProject();

    if (!project) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'No project found'),
        { status: ErrorStatusCodes.NOT_FOUND }
      );
    }

    // Create requirement (validation happens in repository layer)
    const requirement = await createRequirement(
      project.id,
      description,
      effort
    );

    return NextResponse.json(createSuccessResponse(requirement), {
      status: 201,
    });
  } catch (error: any) {
    // Error logged

    // Check if it's a validation error from the repository
    if (
      error.message?.includes('exceed') ||
      error.message?.includes('required') ||
      error.message?.includes('between') ||
      error.message?.includes('must')
    ) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', error.message),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    return NextResponse.json(
      createErrorResponse(
        'DATABASE_ERROR',
        'Unable to add requirement. Please try again.'
      ),
      { status: ErrorStatusCodes.DATABASE_ERROR }
    );
  }
}
