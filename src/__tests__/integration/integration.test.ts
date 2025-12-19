/**
 * Integration Tests
 *
 * Tests for complete workflows and cross-component interactions
 */

import { POST as ProjectPOST, GET as ProjectGET, PUT as ProjectPUT } from '@/app/api/project/route';
import {
  GET as RequirementsGET,
  POST as RequirementsPOST,
} from '@/app/api/requirements/route';
import {
  PUT as RequirementPUT,
  DELETE as RequirementDELETE,
  GET as RequirementGET,
} from '@/app/api/requirements/[id]/route';
import { GET as PreferencesGET, PUT as PreferencesPUT } from '@/app/api/preferences/route';
import { NextRequest } from 'next/server';
import {
  createTestProject,
  createTestRequirement,
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

describe('Integration Tests', () => {
  test('6.1.1: Complete project creation workflow', async () => {
    // Step 1: Create project
    const projectRequest = createMockRequest(
      'POST',
      'http://localhost:3000/api/project',
      { name: 'Integration Test Project' }
    );
    const projectResponse = await ProjectPOST(projectRequest);
    const projectData = await projectResponse.json();

    expect(projectResponse.status).toBe(201);
    const project = projectData.data;

    // Step 2: Add multiple requirements
    const req1Request = createMockRequest(
      'POST',
      'http://localhost:3000/api/requirements',
      { description: 'Requirement 1', effort: 5 }
    );
    const req1Response = await RequirementsPOST(req1Request);
    expect(req1Response.status).toBe(201);

    const req2Request = createMockRequest(
      'POST',
      'http://localhost:3000/api/requirements',
      { description: 'Requirement 2', effort: 8 }
    );
    const req2Response = await RequirementsPOST(req2Request);
    expect(req2Response.status).toBe(201);

    // Step 3: Verify all requirements are retrieved
    const allReqsResponse = await RequirementsGET();
    const allReqsData = await allReqsResponse.json();

    expect(allReqsResponse.status).toBe(200);
    expect(allReqsData.data).toHaveLength(2);

    // Step 4: Calculate total effort
    const totalEffort = allReqsData.data
      .filter((r: any) => r.isActive)
      .reduce((sum: number, r: any) => sum + r.effort, 0);

    expect(totalEffort).toBe(13);
  });

  test('6.1.2: Status toggle workflow with total effort calculation', async () => {
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

    // Step 1: Verify initial total (all active) = 30
    let allReqs = await RequirementsGET();
    let allReqsData = await allReqs.json();
    let total = allReqsData.data
      .filter((r: any) => r.isActive)
      .reduce((sum: number, r: any) => sum + r.effort, 0);
    expect(total).toBe(30);

    // Step 2: Set req2 to inactive
    const updateRequest = createMockRequest(
      'PUT',
      `http://localhost:3000/api/requirements/${req2.id}`,
      { isActive: false }
    );
    await RequirementPUT(updateRequest, {
      params: Promise.resolve({ id: req2.id.toString() }),
    });

    // Step 3: Verify total = 20 (5 + 15)
    allReqs = await RequirementsGET();
    allReqsData = await allReqs.json();
    total = allReqsData.data
      .filter((r: any) => r.isActive)
      .reduce((sum: number, r: any) => sum + r.effort, 0);
    expect(total).toBe(20);

    // Step 4: Set req3 to inactive
    const updateRequest2 = createMockRequest(
      'PUT',
      `http://localhost:3000/api/requirements/${req3.id}`,
      { isActive: false }
    );
    await RequirementPUT(updateRequest2, {
      params: Promise.resolve({ id: req3.id.toString() }),
    });

    // Step 5: Verify total = 5 (only req1 active)
    allReqs = await RequirementsGET();
    allReqsData = await allReqs.json();
    total = allReqsData.data
      .filter((r: any) => r.isActive)
      .reduce((sum: number, r: any) => sum + r.effort, 0);
    expect(total).toBe(5);
  });

  test('6.1.3: Cross-session data persistence', async () => {
    // Session 1: Create project and requirements
    const project = await createTestProject('Session Test');
    await createTestRequirement(project.id, { description: 'Req 1', effort: 5 });

    // Session 2: Update preferences
    const prefsRequest = createMockRequest(
      'PUT',
      'http://localhost:3000/api/preferences',
      { language: 'th', effortColumnVisible: false }
    );
    const prefsResponse = await PreferencesPUT(prefsRequest);
    expect(prefsResponse.status).toBe(200);

    // Session 3: Verify all data is accessible
    const projectResponse = await ProjectGET();
    const projectData = await projectResponse.json();
    expect(projectData.data.name).toBe('Session Test');

    const reqsResponse = await RequirementsGET();
    const reqsData = await reqsResponse.json();
    expect(reqsData.data).toHaveLength(1);

    const prefsGetResponse = await PreferencesGET();
    const prefsData = await prefsGetResponse.json();
    expect(prefsData.data.language).toBe('th');
    expect(prefsData.data.effortColumnVisible).toBe(false);
  });

  test('6.1.4: Full CRUD lifecycle for requirement', async () => {
    // Arrange
    const project = await createTestProject();

    // CREATE
    const createRequest = createMockRequest(
      'POST',
      'http://localhost:3000/api/requirements',
      { description: 'Original requirement', effort: 5 }
    );
    const createResponse = await RequirementsPOST(createRequest);
    const createData = await createResponse.json();

    expect(createResponse.status).toBe(201);
    const requirementId = createData.data.id;

    // READ
    const readResponse = await RequirementGET(
      createMockRequest('GET', `http://localhost:3000/api/requirements/${requirementId}`),
      { params: Promise.resolve({ id: requirementId.toString() }) }
    );
    const readData = await readResponse.json();

    expect(readResponse.status).toBe(200);
    expect(readData.data.description).toBe('Original requirement');

    // UPDATE
    const updateRequest = createMockRequest(
      'PUT',
      `http://localhost:3000/api/requirements/${requirementId}`,
      { description: 'Updated requirement', effort: 10 }
    );
    const updateResponse = await RequirementPUT(updateRequest, {
      params: Promise.resolve({ id: requirementId.toString() }),
    });
    const updateData = await updateResponse.json();

    expect(updateResponse.status).toBe(200);
    expect(updateData.data.description).toBe('Updated requirement');
    expect(updateData.data.effort).toBe(10);

    // DELETE
    const deleteRequest = createMockRequest(
      'DELETE',
      `http://localhost:3000/api/requirements/${requirementId}`
    );
    await RequirementDELETE(deleteRequest, {
      params: Promise.resolve({ id: requirementId.toString() }),
    });

    // Verify deletion
    const verifyResponse = await RequirementGET(
      createMockRequest('GET', `http://localhost:3000/api/requirements/${requirementId}`),
      { params: Promise.resolve({ id: requirementId.toString() }) }
    );
    expect(verifyResponse.status).toBe(404);
  });

  test('6.1.5: Language preference persistence', async () => {
    // Step 1: Set language to Thai
    const thaiRequest = createMockRequest(
      'PUT',
      'http://localhost:3000/api/preferences',
      { language: 'th' }
    );
    const thaiResponse = await PreferencesPUT(thaiRequest);
    expect(thaiResponse.status).toBe(200);

    // Step 2: Retrieve preferences
    const prefsResponse = await PreferencesGET();
    const prefsData = await prefsResponse.json();
    expect(prefsData.data.language).toBe('th');

    // Step 3: Change to English
    const enRequest = createMockRequest(
      'PUT',
      'http://localhost:3000/api/preferences',
      { language: 'en' }
    );
    const enResponse = await PreferencesPUT(enRequest);
    expect(enResponse.status).toBe(200);

    // Step 4: Verify change persisted
    const updatedPrefsResponse = await PreferencesGET();
    const updatedPrefsData = await updatedPrefsResponse.json();
    expect(updatedPrefsData.data.language).toBe('en');
  });
});
