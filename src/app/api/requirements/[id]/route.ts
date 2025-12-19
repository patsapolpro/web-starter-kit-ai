/**
 * Individual Requirement API Routes
 *
 * GET    /api/requirements/[id] - Get requirement by ID
 * PUT    /api/requirements/[id] - Update requirement
 * DELETE /api/requirements/[id] - Delete requirement
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getRequirementById,
  updateRequirement,
  deleteRequirement,
  toggleRequirementStatus,
} from '@/lib/repositories/requirementRepository';
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorStatusCodes,
} from '@/lib/api/types';
import type { UpdateRequirementRequest } from '@/lib/api/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/requirements/[id]
 * Get a specific requirement by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const requirementId = parseInt(id, 10);

    if (isNaN(requirementId)) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid requirement ID'),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    const requirement = await getRequirementById(requirementId);

    if (!requirement) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Requirement not found'),
        { status: ErrorStatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(createSuccessResponse(requirement));
  } catch (error) {
    // Error logged
    return NextResponse.json(
      createErrorResponse(
        'DATABASE_ERROR',
        'Unable to load requirement. Please try again.'
      ),
      { status: ErrorStatusCodes.DATABASE_ERROR }
    );
  }
}

/**
 * PUT /api/requirements/[id]
 * Update a requirement
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const requirementId = parseInt(id, 10);

    if (isNaN(requirementId)) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid requirement ID'),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    const body: UpdateRequirementRequest = await request.json();
    const { description, effort, isActive } = body;

    // Basic type validation only
    if (description !== undefined && typeof description !== 'string') {
      return NextResponse.json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'Description must be a string'
        ),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    if (effort !== undefined && (typeof effort !== 'number' || isNaN(effort))) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Effort must be a number'),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return NextResponse.json(
        createErrorResponse(
          'VALIDATION_ERROR',
          'isActive must be a boolean'
        ),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    // Update requirement (validation happens in repository layer)
    const updatedRequirement = await updateRequirement(requirementId, {
      description,
      effort,
      isActive,
    });

    if (!updatedRequirement) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Requirement not found'),
        { status: ErrorStatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(createSuccessResponse(updatedRequirement));
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
        'Unable to save changes. Please try again.'
      ),
      { status: ErrorStatusCodes.DATABASE_ERROR }
    );
  }
}

/**
 * DELETE /api/requirements/[id]
 * Delete a requirement
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const requirementId = parseInt(id, 10);

    if (isNaN(requirementId)) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid requirement ID'),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    const deleted = await deleteRequirement(requirementId);

    if (!deleted) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Requirement not found'),
        { status: ErrorStatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(
      createSuccessResponse({ deleted: true, id: requirementId })
    );
  } catch (error) {
    // Error logged
    return NextResponse.json(
      createErrorResponse(
        'DATABASE_ERROR',
        'Unable to delete requirement. Please try again.'
      ),
      { status: ErrorStatusCodes.DATABASE_ERROR }
    );
  }
}
