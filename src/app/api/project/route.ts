/**
 * Project API Routes
 *
 * GET    /api/project - Get current project
 * POST   /api/project - Create new project
 * PUT    /api/project - Update project name
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getProject,
  createProject,
  updateProject,
} from '@/lib/repositories/projectRepository';
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorStatusCodes,
} from '@/lib/api/types';
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/lib/api/types';

/**
 * GET /api/project
 * Get the current project (single-user model)
 */
export async function GET() {
  try {
    const project = await getProject();

    if (!project) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'No project found'),
        { status: ErrorStatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(createSuccessResponse(project));
  } catch (error) {
    // Error logged
    return NextResponse.json(
      createErrorResponse(
        'DATABASE_ERROR',
        'Unable to fetch project. Please try again.'
      ),
      { status: ErrorStatusCodes.DATABASE_ERROR }
    );
  }
}

/**
 * POST /api/project
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectRequest = await request.json();
    const { name } = body;

    // Basic type validation only
    if (name === undefined || name === null) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Project name is required'),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    if (typeof name !== 'string') {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Project name must be a string'),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    // Create project (validation happens in repository layer)
    const project = await createProject(name);

    return NextResponse.json(createSuccessResponse(project), { status: 201 });
  } catch (error: any) {
    // Error logged

    // Check if it's a validation error from the repository
    if (error.message?.includes('exceed') || error.message?.includes('empty') || error.message?.includes('required')) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', error.message),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    return NextResponse.json(
      createErrorResponse(
        'DATABASE_ERROR',
        'Unable to create project. Please try again.'
      ),
      { status: ErrorStatusCodes.DATABASE_ERROR }
    );
  }
}

/**
 * PUT /api/project
 * Update project name
 */
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateProjectRequest = await request.json();
    const { name } = body;

    // Basic type validation only
    if (name === undefined || name === null) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Project name is required'),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    if (typeof name !== 'string') {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Project name must be a string'),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    // Get current project
    const currentProject = await getProject();
    if (!currentProject) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Project not found'),
        { status: ErrorStatusCodes.NOT_FOUND }
      );
    }

    // Update project (validation happens in repository layer)
    const updatedProject = await updateProject(currentProject.id, name);

    if (!updatedProject) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Project not found'),
        { status: ErrorStatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(createSuccessResponse(updatedProject));
  } catch (error: any) {
    // Error logged

    // Check if it's a validation error from the repository
    if (error.message?.includes('exceed') || error.message?.includes('empty') || error.message?.includes('required')) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', error.message),
        { status: ErrorStatusCodes.VALIDATION_ERROR }
      );
    }

    return NextResponse.json(
      createErrorResponse(
        'DATABASE_ERROR',
        'Unable to update project. Please try again.'
      ),
      { status: ErrorStatusCodes.DATABASE_ERROR }
    );
  }
}
