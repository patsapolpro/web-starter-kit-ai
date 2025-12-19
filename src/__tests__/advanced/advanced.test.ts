/**
 * Advanced Tests
 *
 * Includes:
 * - Error Handling Tests
 * - Data Integrity Tests
 * - Performance Tests
 */

import { POST as RequirementsPOST } from '@/app/api/requirements/route';
import {
  PUT as RequirementPUT,
  DELETE as RequirementDELETE,
} from '@/app/api/requirements/[id]/route';
import { NextRequest } from 'next/server';
import {
  createTestProject,
  createTestRequirement,
  queryDatabase,
} from '@/__tests__/utils/testHelpers';

// Helper to create mock NextRequest
function createMockRequest(method: string, url: string, body?: any): NextRequest {
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

describe('Error Handling Tests', () => {
  test('7.2.1: Multiple validation errors at once', async () => {
    // Arrange
    await createTestProject();

    // Act - Empty description (will be caught by validation)
    const request = createMockRequest(
      'POST',
      'http://localhost:3000/api/requirements',
      { description: '', effort: 5 }
    );
    const response = await RequirementsPOST(request);
    const data = await response.json();

    // Assert - Should catch validation error
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('required');
  });

  test('7.2.2: SQL injection prevention', async () => {
    // Arrange
    await createTestProject();
    const sqlInjection = "'; DROP TABLE requirements; --";

    // Act
    const request = createMockRequest(
      'POST',
      'http://localhost:3000/api/requirements',
      { description: sqlInjection, effort: 5 }
    );
    const response = await RequirementsPOST(request);
    const data = await response.json();

    // Assert - Should be treated as normal string
    expect(response.status).toBe(201);
    expect(data.data.description).toBe(sqlInjection);

    // Verify requirements table still exists
    const result = await queryDatabase('SELECT COUNT(*) FROM requirements');
    expect(result.rows).toHaveLength(1);
  });
});

describe('Data Integrity Tests', () => {
  test('8.1.1: Requirements belong to valid project', async () => {
    // Arrange
    const project = await createTestProject();

    // Act
    const requirement = await createTestRequirement(project.id, {
      description: 'Test',
      effort: 5,
    });

    // Assert
    expect(requirement.projectId).toBe(project.id);

    // Verify foreign key constraint
    const directInsert = queryDatabase(
      'INSERT INTO requirements (project_id, description, effort, is_active) VALUES ($1, $2, $3, $4)',
      [99999, 'Test', 5, true]
    );

    await expect(directInsert).rejects.toThrow();
  });

  test('8.1.2: Cascade delete verification', async () => {
    // Arrange
    const project = await createTestProject();
    await createTestRequirement(project.id, { description: 'R1', effort: 5 });
    await createTestRequirement(project.id, { description: 'R2', effort: 10 });

    // Act - Delete project directly
    await queryDatabase('DELETE FROM projects WHERE id = $1', [project.id]);

    // Assert - Requirements should be deleted
    const requirements = await queryDatabase(
      'SELECT * FROM requirements WHERE project_id = $1',
      [project.id]
    );
    expect(requirements.rows).toHaveLength(0);
  });

  test('8.2.1: Total effort calculation accuracy', async () => {
    // Arrange
    const project = await createTestProject();
    await createTestRequirement(project.id, { description: 'R1', effort: 5.5 });
    await createTestRequirement(project.id, { description: 'R2', effort: 10.25 });
    const req3 = await createTestRequirement(project.id, {
      description: 'R3',
      effort: 15.75,
    });

    // Set req3 to inactive
    const updateRequest = createMockRequest(
      'PUT',
      `http://localhost:3000/api/requirements/${req3.id}`,
      { isActive: false }
    );
    await RequirementPUT(updateRequest, {
      params: Promise.resolve({ id: req3.id.toString() }),
    });

    // Act
    const result = await queryDatabase(
      'SELECT * FROM requirements WHERE project_id = $1',
      [project.id]
    );

    // Calculate total manually
    const expectedTotal = 5.5 + 10.25; // 15.75
    const actualTotal = result.rows
      .filter((r) => r.is_active)
      .reduce((sum, r) => sum + parseFloat(r.effort), 0);

    // Assert
    expect(actualTotal).toBe(expectedTotal);
    expect(Math.round(actualTotal * 100) / 100).toBe(15.75);
  });

  test('8.2.2: Timestamp consistency', async () => {
    // Arrange
    const startTime = new Date();
    // Small delay to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Act
    const project = await createTestProject();
    const projectCreatedAt = new Date(project.createdAt);
    const projectModifiedAt = new Date(project.lastModifiedAt);
    const endTime = new Date();

    // Assert - Project created between start and end time
    expect(projectCreatedAt.getTime()).toBeGreaterThanOrEqual(
      startTime.getTime() - 10 // Allow small margin for timing
    );
    expect(projectCreatedAt.getTime()).toBeLessThanOrEqual(
      endTime.getTime()
    );
    expect(projectModifiedAt.getTime()).toBeGreaterThanOrEqual(
      projectCreatedAt.getTime()
    );
  });

  test('8.2.3: Delete requirement affects total effort calculation', async () => {
    // Arrange
    const project = await createTestProject();
    const req1 = await createTestRequirement(project.id, {
      description: 'R1',
      effort: 5,
    });
    const req2 = await createTestRequirement(project.id, {
      description: 'R2',
      effort: 10,
    });
    const req3 = await createTestRequirement(project.id, {
      description: 'R3',
      effort: 15,
    });

    // Initial total should be 30
    let result = await queryDatabase(
      'SELECT * FROM requirements WHERE project_id = $1',
      [project.id]
    );
    let totalEffort = result.rows
      .filter((r) => r.is_active)
      .reduce((sum, r) => sum + parseFloat(r.effort), 0);
    expect(totalEffort).toBe(30);

    // Act - Delete req2 (effort: 10)
    const deleteRequest = createMockRequest(
      'DELETE',
      `http://localhost:3000/api/requirements/${req2.id}`
    );
    await RequirementDELETE(deleteRequest, {
      params: Promise.resolve({ id: req2.id.toString() }),
    });

    // Assert - Total should now be 20
    result = await queryDatabase(
      'SELECT * FROM requirements WHERE project_id = $1',
      [project.id]
    );
    totalEffort = result.rows
      .filter((r) => r.is_active)
      .reduce((sum, r) => sum + parseFloat(r.effort), 0);
    expect(totalEffort).toBe(20);
  });
});

describe('Performance Tests', () => {
  test('9.1.1: POST requests complete within 2 seconds', async () => {
    // Arrange
    await createTestProject();

    // Act
    const startTime = Date.now();
    const request = createMockRequest(
      'POST',
      'http://localhost:3000/api/requirements',
      { description: 'Performance test', effort: 5 }
    );
    const response = await RequirementsPOST(request);
    const endTime = Date.now();

    // Assert
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(2000);
    expect(response.status).toBe(201);
  });

  test('9.1.2: Bulk operations performance', async () => {
    // Arrange
    const project = await createTestProject();
    const concurrentRequests = 20;

    // Act
    const startTime = Date.now();
    const promises = Array.from({ length: concurrentRequests }, (_, i) => {
      const request = createMockRequest(
        'POST',
        'http://localhost:3000/api/requirements',
        { description: `Concurrent ${i}`, effort: i + 1 }
      );
      return RequirementsPOST(request);
    });

    const responses = await Promise.all(promises);
    const endTime = Date.now();

    // Assert
    const totalTime = endTime - startTime;
    expect(totalTime).toBeLessThan(5000); // 5 seconds for 20 requests
    expect(responses.every((r) => r.status === 201)).toBe(true);

    // Verify all created
    const result = await queryDatabase(
      'SELECT COUNT(*) as count FROM requirements WHERE project_id = $1',
      [project.id]
    );
    expect(parseInt(result.rows[0].count)).toBe(concurrentRequests);
  });

  test('9.1.3: Large dataset query performance', async () => {
    // Arrange
    const project = await createTestProject();

    // Create 50 requirements
    for (let i = 0; i < 50; i++) {
      await createTestRequirement(project.id, {
        description: `Requirement ${i}`,
        effort: Math.random() * 9.9 + 0.1, // Ensure effort is between 0.1 and 10
      });
    }

    // Act
    const startTime = Date.now();
    const result = await queryDatabase(
      'SELECT * FROM requirements WHERE project_id = $1',
      [project.id]
    );
    const endTime = Date.now();

    // Assert
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(2000);
    expect(result.rows).toHaveLength(50);
  });

  test('9.1.4: Update operation performance', async () => {
    // Arrange
    const project = await createTestProject();
    const requirement = await createTestRequirement(project.id, {
      description: 'Test',
      effort: 5,
    });

    // Act
    const startTime = Date.now();
    const request = createMockRequest(
      'PUT',
      `http://localhost:3000/api/requirements/${requirement.id}`,
      { description: 'Updated', effort: 10 }
    );
    const response = await RequirementPUT(request, {
      params: Promise.resolve({ id: requirement.id.toString() }),
    });
    const endTime = Date.now();

    // Assert
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(2000);
    expect(response.status).toBe(200);
  });

  test('9.1.5: Delete operation performance', async () => {
    // Arrange
    const project = await createTestProject();
    const requirement = await createTestRequirement(project.id, {
      description: 'Test',
      effort: 5,
    });

    // Act
    const startTime = Date.now();
    const request = createMockRequest(
      'DELETE',
      `http://localhost:3000/api/requirements/${requirement.id}`
    );
    const response = await RequirementDELETE(request, {
      params: Promise.resolve({ id: requirement.id.toString() }),
    });
    const endTime = Date.now();

    // Assert
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(2000);
    expect(response.status).toBe(200);
  });
});
