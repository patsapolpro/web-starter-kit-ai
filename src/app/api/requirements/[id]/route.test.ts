/**
 * Requirements API Tests - [id] Route
 *
 * Tests for:
 * - GET /api/requirements/[id]
 * - PUT /api/requirements/[id]
 * - DELETE /api/requirements/[id]
 */

import { GET, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';
import {
  createTestProject,
  createTestRequirement,
  assertSuccessResponse,
  assertErrorResponse,
  queryDatabase,
  Requirement,
} from '@/__tests__/utils/testHelpers';

// Helper to create a mock NextRequest with params
function createMockRequest(
  method: string,
  id: string,
  body?: any
): { request: NextRequest; params: { params: Promise<{ id: string }> } } {
  const url = `http://localhost:3000/api/requirements/${id}`;
  const init: RequestInit = {
    method,
    ...(body && {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  };
  return {
    request: new NextRequest(url, init),
    params: { params: Promise.resolve({ id }) },
  };
}

describe('Requirements API Tests - [id] Route', () => {
  describe('GET /api/requirements/[id]', () => {
    test('4.3.1: GET /api/requirements/:id - should return requirement by ID', async () => {
      // Arrange
      const project = await createTestProject();
      const requirement = await createTestRequirement(project.id, {
        description: 'Target requirement',
        effort: 5,
      });

      // Act
      const { request, params } = createMockRequest('GET', requirement.id.toString());
      const response = await GET(request, params);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      assertSuccessResponse<Requirement>(
        { body: data },
        {
          id: requirement.id,
          description: 'Target requirement',
          effort: 5,
        }
      );
    });

    test('4.3.2: GET /api/requirements/:id - should return 404 for non-existent ID', async () => {
      // Act
      const { request, params } = createMockRequest('GET', '99999');
      const response = await GET(request, params);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      assertErrorResponse({ body: data }, 'NOT_FOUND', 'Requirement not found');
    });
  });

  describe('PUT /api/requirements/[id]', () => {
    test('4.4.1: PUT /api/requirements/:id - should update description', async () => {
      // Arrange
      const project = await createTestProject();
      const requirement = await createTestRequirement(project.id, {
        description: 'Old description',
        effort: 5,
      });

      // Act
      const { request, params } = createMockRequest(
        'PUT',
        requirement.id.toString(),
        { description: 'New description' }
      );
      const response = await PUT(request, params);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      assertSuccessResponse<Requirement>(
        { body: data },
        {
          id: requirement.id,
          description: 'New description',
          effort: 5,
        }
      );
      expect(data.data.lastModifiedAt).not.toBe(requirement.lastModifiedAt);
    });

    test('4.4.2: PUT /api/requirements/:id - should update effort', async () => {
      // Arrange
      const project = await createTestProject();
      const requirement = await createTestRequirement(project.id, {
        description: 'Test requirement',
        effort: 5,
      });

      // Act
      const { request, params } = createMockRequest(
        'PUT',
        requirement.id.toString(),
        { effort: 10 }
      );
      const response = await PUT(request, params);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      assertSuccessResponse<Requirement>(
        { body: data },
        {
          id: requirement.id,
          description: 'Test requirement',
          effort: 10,
        }
      );
    });

    test('4.4.3: PUT /api/requirements/:id - should update multiple fields', async () => {
      // Arrange
      const project = await createTestProject();
      const requirement = await createTestRequirement(project.id, {
        description: 'Old description',
        effort: 5,
      });

      // Act
      const { request, params } = createMockRequest(
        'PUT',
        requirement.id.toString(),
        {
          description: 'New description',
          effort: 15,
        }
      );
      const response = await PUT(request, params);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      assertSuccessResponse<Requirement>(
        { body: data },
        {
          id: requirement.id,
          description: 'New description',
          effort: 15,
        }
      );
    });

    test('4.4.4: PUT /api/requirements/:id - should toggle isActive status', async () => {
      // Arrange
      const project = await createTestProject();
      const requirement = await createTestRequirement(project.id, {
        description: 'Test requirement',
        effort: 5,
      });
      expect(requirement.isActive).toBe(true);

      // Act - Set to inactive
      const { request: request1, params: params1 } = createMockRequest(
        'PUT',
        requirement.id.toString(),
        { isActive: false }
      );
      const response1 = await PUT(request1, params1);
      const data1 = await response1.json();

      // Assert inactive
      expect(response1.status).toBe(200);
      expect(data1.data.isActive).toBe(false);

      // Act - Set back to active
      const { request: request2, params: params2 } = createMockRequest(
        'PUT',
        requirement.id.toString(),
        { isActive: true }
      );
      const response2 = await PUT(request2, params2);
      const data2 = await response2.json();

      // Assert active
      expect(response2.status).toBe(200);
      expect(data2.data.isActive).toBe(true);
    });

    test('4.4.5: PUT /api/requirements/:id - should preserve immutable fields', async () => {
      // Arrange
      const project = await createTestProject();
      const requirement = await createTestRequirement(project.id, {
        description: 'Original',
        effort: 5,
      });
      const originalId = requirement.id;
      const originalProjectId = requirement.projectId;
      const originalCreatedAt = requirement.createdAt;

      // Act
      const { request, params } = createMockRequest(
        'PUT',
        requirement.id.toString(),
        { description: 'Updated' }
      );
      const response = await PUT(request, params);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.data.id).toBe(originalId);
      expect(data.data.projectId).toBe(originalProjectId);
      expect(data.data.createdAt).toBe(originalCreatedAt);
      expect(data.data.lastModifiedAt).not.toBe(originalCreatedAt);
    });

    test('4.4.6: PUT /api/requirements/:id - should return 404 for non-existent requirement', async () => {
      // Act
      const { request, params } = createMockRequest('PUT', '99999', {
        description: 'New description',
      });
      const response = await PUT(request, params);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      assertErrorResponse({ body: data }, 'NOT_FOUND', 'Requirement not found');
    });

    test('4.4.7: PUT /api/requirements/:id - should reject invalid updates', async () => {
      // Arrange
      const project = await createTestProject();
      const requirement = await createTestRequirement(project.id, {
        description: 'Test',
        effort: 5,
      });

      // Act & Assert - Empty description
      const { request: request1, params: params1 } = createMockRequest(
        'PUT',
        requirement.id.toString(),
        { description: '' }
      );
      const response1 = await PUT(request1, params1);
      const data1 = await response1.json();
      expect(response1.status).toBe(400);
      assertErrorResponse({ body: data1 }, 'VALIDATION_ERROR');

      // Act & Assert - Invalid effort
      const { request: request2, params: params2 } = createMockRequest(
        'PUT',
        requirement.id.toString(),
        { effort: -5 }
      );
      const response2 = await PUT(request2, params2);
      const data2 = await response2.json();
      expect(response2.status).toBe(400);
      assertErrorResponse({ body: data2 }, 'VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/requirements/[id]', () => {
    test('4.5.1: DELETE /api/requirements/:id - should delete requirement', async () => {
      // Arrange
      const project = await createTestProject();
      const requirement = await createTestRequirement(project.id, {
        description: 'To be deleted',
        effort: 5,
      });

      // Act
      const { request, params } = createMockRequest(
        'DELETE',
        requirement.id.toString()
      );
      const response = await DELETE(request, params);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      assertSuccessResponse({ body: data });

      // Verify deletion
      const { request: getRequest, params: getParams } = createMockRequest(
        'GET',
        requirement.id.toString()
      );
      const getResponse = await GET(getRequest, getParams);
      expect(getResponse.status).toBe(404);
    });

    test('4.5.2: DELETE /api/requirements/:id - should permanently remove from database', async () => {
      // Arrange
      const project = await createTestProject();
      const requirement = await createTestRequirement(project.id, {
        description: 'Test',
        effort: 5,
      });

      // Act
      const { request, params } = createMockRequest(
        'DELETE',
        requirement.id.toString()
      );
      await DELETE(request, params);

      // Assert - Direct database query
      const result = await queryDatabase(
        'SELECT * FROM requirements WHERE id = $1',
        [requirement.id]
      );
      expect(result.rows).toHaveLength(0);
    });

    test('4.5.3: DELETE /api/requirements/:id - should return 404 for non-existent requirement', async () => {
      // Act
      const { request, params } = createMockRequest('DELETE', '99999');
      const response = await DELETE(request, params);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      assertErrorResponse({ body: data }, 'NOT_FOUND', 'Requirement not found');
    });
  });
});
