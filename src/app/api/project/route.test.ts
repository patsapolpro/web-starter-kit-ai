/**
 * Project API Tests
 *
 * Tests for:
 * - GET /api/project
 * - POST /api/project
 * - PUT /api/project
 */

import { GET, POST, PUT } from './route';
import { NextRequest } from 'next/server';
import {
  createTestProject,
  assertSuccessResponse,
  assertErrorResponse,
  queryDatabase,
  Project,
} from '@/__tests__/utils/testHelpers';

// Helper to create a mock NextRequest
function createMockRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost:3000/api/project';
  const init: RequestInit = {
    method,
    ...(body && {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  };
  return new NextRequest(url, init);
}

describe('Project API Tests', () => {
  describe('GET /api/project', () => {
    test('3.1.1: GET /api/project - should return existing project', async () => {
      // Arrange
      const project = await createTestProject('E-commerce Platform');

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      assertSuccessResponse<Project>(
        { body: data },
        {
          id: project.id,
          name: 'E-commerce Platform',
        }
      );
      expect(data.data).toHaveProperty('createdAt');
      expect(data.data).toHaveProperty('lastModifiedAt');
      expect(new Date(data.data.createdAt)).toBeInstanceOf(Date);
    });

    test('3.1.2: GET /api/project - should return 404 when no project exists', async () => {
      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      assertErrorResponse({ body: data }, 'NOT_FOUND', 'No project found');
    });
  });

  describe('POST /api/project', () => {
    test('3.2.1: POST /api/project - should create project with valid name', async () => {
      // Arrange
      const projectName = 'E-commerce Platform';
      const request = createMockRequest('POST', { name: projectName });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      assertSuccessResponse<Project>({ body: data }, { name: projectName });
      expect(data.data.id).toBeGreaterThan(0);
      expect(data.data.createdAt).toBeTruthy();
      expect(data.data.lastModifiedAt).toBeTruthy();

      // Verify in database
      const dbResult = await queryDatabase(
        'SELECT * FROM projects WHERE id = $1',
        [data.data.id]
      );
      expect(dbResult.rows[0].name).toBe(projectName);
    });

    test('3.2.2: POST /api/project - should default to "Untitled Project" for empty name', async () => {
      // Arrange
      const request = createMockRequest('POST', { name: '' });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      assertSuccessResponse<Project>({ body: data }, { name: 'Untitled Project' });
    });

    test('3.2.3: POST /api/project - should treat whitespace-only name as empty', async () => {
      // Arrange
      const request = createMockRequest('POST', { name: '   \t\n  ' });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      assertSuccessResponse<Project>({ body: data }, { name: 'Untitled Project' });
    });

    test('3.2.4: POST /api/project - should reject name exceeding 100 characters', async () => {
      // Arrange
      const longName = 'A'.repeat(101);
      const request = createMockRequest('POST', { name: longName });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      assertErrorResponse(
        { body: data },
        'VALIDATION_ERROR',
        'must not exceed 100 characters'
      );
    });

    test('3.2.5: POST /api/project - should trim whitespace from name', async () => {
      // Arrange
      const request = createMockRequest('POST', { name: '  Mobile App  ' });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      assertSuccessResponse<Project>({ body: data }, { name: 'Mobile App' });
    });

    test('3.2.6: POST /api/project - should allow special characters in name', async () => {
      // Arrange
      const specialName = 'Project: V2.0 - (Beta) & Testing!';
      const request = createMockRequest('POST', { name: specialName });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      assertSuccessResponse<Project>({ body: data }, { name: specialName });
    });
  });

  describe('PUT /api/project', () => {
    test('3.3.1: PUT /api/project - should update project name', async () => {
      // Arrange
      const project = await createTestProject('Old Name');
      const newName = 'New Project Name';
      const request = createMockRequest('PUT', { name: newName });

      // Act
      const response = await PUT(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      assertSuccessResponse<Project>(
        { body: data },
        {
          id: project.id,
          name: newName,
        }
      );
      expect(data.data.lastModifiedAt).not.toBe(project.lastModifiedAt);
      // Verify createdAt is unchanged
      expect(data.data.createdAt).toBe(project.createdAt);
    });

    test('3.3.2: PUT /api/project - should return 404 when project does not exist', async () => {
      // Arrange
      const request = createMockRequest('PUT', { name: 'New Name' });

      // Act
      const response = await PUT(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      assertErrorResponse({ body: data }, 'NOT_FOUND', 'Project not found');
    });

    test('3.3.3: PUT /api/project - should reject invalid name during update', async () => {
      // Arrange
      await createTestProject('Original Name');
      const request = createMockRequest('PUT', { name: 'A'.repeat(101) });

      // Act
      const response = await PUT(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      assertErrorResponse(
        { body: data },
        'VALIDATION_ERROR',
        'must not exceed 100 characters'
      );
    });

    test('3.3.4: PUT /api/project - should preserve createdAt timestamp', async () => {
      // Arrange
      const project = await createTestProject('Original Name');
      const originalCreatedAt = project.createdAt;

      // Wait a moment to ensure timestamp would change if modified
      await new Promise((resolve) => setTimeout(resolve, 100));

      const request = createMockRequest('PUT', { name: 'Updated Name' });

      // Act
      const response = await PUT(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.data.createdAt).toBe(originalCreatedAt);
      expect(data.data.lastModifiedAt).not.toBe(originalCreatedAt);
    });
  });
});
