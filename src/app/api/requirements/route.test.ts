/**
 * Requirements API Tests - Main Route
 *
 * Tests for:
 * - GET /api/requirements
 * - POST /api/requirements
 */

import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import {
  createTestProject,
  createTestRequirement,
  assertSuccessResponse,
  assertErrorResponse,
  Requirement,
} from '@/__tests__/utils/testHelpers';

// Helper to create a mock NextRequest
function createMockRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost:3000/api/requirements';
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

describe('Requirements API Tests - Main Route', () => {
  describe('GET /api/requirements', () => {
    test('4.1.1: GET /api/requirements - should return all requirements', async () => {
      // Arrange
      const project = await createTestProject();
      await createTestRequirement(project.id, {
        description: 'Feature 1',
        effort: 5,
      });
      await createTestRequirement(project.id, {
        description: 'Feature 2',
        effort: 8,
      });
      await createTestRequirement(project.id, {
        description: 'Feature 3',
        effort: 3,
      });

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      assertSuccessResponse<Requirement[]>({ body: data });
      expect(data.data).toHaveLength(3);
      expect(data.data[0]).toHaveProperty('description', 'Feature 1');
      expect(data.data[1]).toHaveProperty('description', 'Feature 2');
      expect(data.data[2]).toHaveProperty('description', 'Feature 3');
    });

    test('4.1.2: GET /api/requirements - should return empty array when no requirements', async () => {
      // Arrange
      await createTestProject();

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      assertSuccessResponse<Requirement[]>({ body: data });
      expect(data.data).toEqual([]);
    });

    test('4.1.3: GET /api/requirements - should return requirements in chronological order', async () => {
      // Arrange
      const project = await createTestProject();
      const req1 = await createTestRequirement(project.id, {
        description: 'First',
        effort: 1,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      const req2 = await createTestRequirement(project.id, {
        description: 'Second',
        effort: 2,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      const req3 = await createTestRequirement(project.id, {
        description: 'Third',
        effort: 3,
      });

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.data[0].id).toBe(req1.id);
      expect(data.data[1].id).toBe(req2.id);
      expect(data.data[2].id).toBe(req3.id);
    });
  });

  describe('POST /api/requirements', () => {
    test('4.2.1: POST /api/requirements - should create requirement with valid data', async () => {
      // Arrange
      const project = await createTestProject();
      const requirementData = {
        description: 'User authentication system',
        effort: 8,
      };
      const request = createMockRequest('POST', requirementData);

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      assertSuccessResponse<Requirement>(
        { body: data },
        {
          description: 'User authentication system',
          effort: 8,
          isActive: true,
        }
      );
      expect(data.data.id).toBeGreaterThan(0);
      expect(data.data.projectId).toBe(project.id);
      expect(data.data.createdAt).toBeTruthy();
      expect(data.data.lastModifiedAt).toBeTruthy();
    });

    test('4.2.2: POST /api/requirements - should default to active status', async () => {
      // Arrange
      await createTestProject();
      const request = createMockRequest('POST', {
        description: 'Test',
        effort: 5,
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.data.isActive).toBe(true);
    });

    test('4.2.3: POST /api/requirements - should accept decimal effort values', async () => {
      // Arrange
      await createTestProject();
      const testCases = [0.5, 2.5, 13.75, 99.99];

      // Act & Assert
      for (const effort of testCases) {
        const request = createMockRequest('POST', {
          description: `Test effort ${effort}`,
          effort,
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.data.effort).toBe(effort);
      }
    });

    test('4.2.4: POST /api/requirements - should reject empty description', async () => {
      // Arrange
      await createTestProject();
      const request = createMockRequest('POST', { description: '', effort: 5 });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      assertErrorResponse(
        { body: data },
        'VALIDATION_ERROR',
        'description is required'
      );
    });

    test('4.2.5: POST /api/requirements - should reject whitespace-only description', async () => {
      // Arrange
      await createTestProject();
      const request = createMockRequest('POST', {
        description: '   \t\n  ',
        effort: 5,
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      assertErrorResponse(
        { body: data },
        'VALIDATION_ERROR',
        'description is required'
      );
    });

    test('4.2.6: POST /api/requirements - should reject description exceeding 500 characters', async () => {
      // Arrange
      await createTestProject();
      const longDescription = 'A'.repeat(501);
      const request = createMockRequest('POST', {
        description: longDescription,
        effort: 5,
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      assertErrorResponse(
        { body: data },
        'VALIDATION_ERROR',
        'must not exceed 500 characters'
      );
    });

    test('4.2.7: POST /api/requirements - should trim description whitespace', async () => {
      // Arrange
      await createTestProject();
      const request = createMockRequest('POST', {
        description: '  User authentication  ',
        effort: 5,
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.data.description).toBe('User authentication');
    });

    test('4.2.8: POST /api/requirements - should reject zero effort', async () => {
      // Arrange
      await createTestProject();
      const request = createMockRequest('POST', { description: 'Test', effort: 0 });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      assertErrorResponse(
        { body: data },
        'VALIDATION_ERROR',
        'between 0.1 and 1000'
      );
    });

    test('4.2.9: POST /api/requirements - should reject negative effort', async () => {
      // Arrange
      await createTestProject();
      const request = createMockRequest('POST', { description: 'Test', effort: -5 });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      assertErrorResponse(
        { body: data },
        'VALIDATION_ERROR',
        'between 0.1 and 1000'
      );
    });

    test('4.2.10: POST /api/requirements - should reject effort exceeding 1000', async () => {
      // Arrange
      await createTestProject();
      const request = createMockRequest('POST', {
        description: 'Test',
        effort: 1001,
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      assertErrorResponse(
        { body: data },
        'VALIDATION_ERROR',
        'between 0.1 and 1000'
      );
    });

    test('4.2.11: POST /api/requirements - should reject non-numeric effort', async () => {
      // Arrange
      await createTestProject();
      const request = createMockRequest('POST', {
        description: 'Test',
        effort: 'abc' as any,
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      assertErrorResponse({ body: data }, 'VALIDATION_ERROR', 'must be a number');
    });
  });
});
