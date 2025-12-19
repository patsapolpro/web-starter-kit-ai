# Unit Test Cases Document
## Requirement & Effort Tracker - PostgreSQL Migration

**Document Version:** 1.0
**Date:** 2025-12-19
**Status:** Active
**Test Focus:** API-Level Testing for Database Operations and Business Logic

---

## Table of Contents

1. [Test Overview](#1-test-overview)
2. [Test Environment Setup](#2-test-environment-setup)
3. [Project API Tests](#3-project-api-tests)
4. [Requirements API Tests](#4-requirements-api-tests)
5. [Preferences API Tests](#5-preferences-api-tests)
6. [Integration Tests](#6-integration-tests)
7. [Error Handling Tests](#7-error-handling-tests)
8. [Data Integrity Tests](#8-data-integrity-tests)
9. [Performance Tests](#9-performance-tests)
10. [Test Data Sets](#10-test-data-sets)

---

## 1. Test Overview

### 1.1 Testing Scope

This document defines comprehensive unit test cases for the Requirement & Effort Tracker application, focusing specifically on API-level testing for database operations and business logic. All tests are based on the PostgreSQL migration requirements and technical specifications.

### 1.2 Test Categories

| Category | Purpose | Test Count |
|----------|---------|------------|
| **Project API Tests** | CRUD operations for project management | 12 |
| **Requirements API Tests** | CRUD operations for requirements | 25 |
| **Preferences API Tests** | Settings and language management | 10 |
| **Integration Tests** | Multi-entity operations | 8 |
| **Error Handling Tests** | Database and validation errors | 15 |
| **Data Integrity Tests** | Transactional consistency | 10 |
| **Performance Tests** | Response time validation | 5 |
| **Total** | | **85** |

### 1.3 Testing Framework

**Recommended Stack:**
- **Framework:** Jest (v29+)
- **API Testing:** Supertest (v6+)
- **Database:** PostgreSQL test database
- **Mocking:** Jest mock functions
- **Assertions:** Jest expect assertions

**Test File Organization:**
```
src/
├── app/
│   ├── api/
│   │   ├── project/
│   │   │   ├── route.ts
│   │   │   └── route.test.ts          # Project API tests
│   │   ├── requirements/
│   │   │   ├── route.ts
│   │   │   ├── route.test.ts          # Requirements list tests
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── route.test.ts      # Single requirement tests
│   │   └── preferences/
│   │       ├── route.ts
│   │       └── route.test.ts          # Preferences tests
├── lib/
│   ├── repositories/
│   │   ├── projectRepository.test.ts
│   │   ├── requirementRepository.test.ts
│   │   └── preferenceRepository.test.ts
│   └── validation/
│       ├── projectValidation.test.ts
│       └── requirementValidation.test.ts
```

### 1.4 Test Data Interfaces

Based on TypeScript interfaces from `src/types/`:

```typescript
// Project interface
interface Project {
  id: number;
  name: string;
  createdAt: string;
  lastModifiedAt: string;
}

// Requirement interface
interface Requirement {
  id: number;
  projectId: number;
  description: string;
  effort: number;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt: string;
}

// UserPreferences interface
interface UserPreferences {
  id: number;
  effortColumnVisible: boolean;
  showTotalWhenEffortHidden: boolean;
  language: 'en' | 'th';
  lastUpdatedAt: string;
}

// API Response types
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
}

type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'CONNECTION_ERROR'
  | 'INTERNAL_ERROR';
```

---

## 2. Test Environment Setup

### 2.1 Database Setup

**Before All Tests:**
```typescript
beforeAll(async () => {
  // Create test database connection
  await db.connect();

  // Run migrations
  await db.migrate();

  // Initialize test database with clean state
  await db.truncate(['projects', 'requirements', 'preferences']);
});
```

**After All Tests:**
```typescript
afterAll(async () => {
  // Clean up test database
  await db.truncate(['projects', 'requirements', 'preferences']);

  // Close database connection
  await db.disconnect();
});
```

**Before Each Test:**
```typescript
beforeEach(async () => {
  // Reset database to clean state
  await db.truncate(['projects', 'requirements', 'preferences']);

  // Seed with default preferences if needed
  await seedDefaultPreferences();
});
```

### 2.2 Test Utilities

**Helper Functions:**
```typescript
// Create test project
async function createTestProject(name = 'Test Project'): Promise<Project> {
  const response = await request(app)
    .post('/api/project')
    .send({ name })
    .expect(201);

  return response.body.data;
}

// Create test requirement
async function createTestRequirement(
  projectId: number,
  data: Partial<CreateRequirementRequest>
): Promise<Requirement> {
  const response = await request(app)
    .post('/api/requirements')
    .send({
      description: 'Test requirement',
      effort: 5,
      ...data,
    })
    .expect(201);

  return response.body.data;
}

// Assert API response structure
function assertSuccessResponse<T>(
  response: any,
  expectedData?: Partial<T>
): void {
  expect(response.body).toHaveProperty('success', true);
  expect(response.body).toHaveProperty('data');

  if (expectedData) {
    expect(response.body.data).toMatchObject(expectedData);
  }
}

function assertErrorResponse(
  response: any,
  expectedCode: ErrorCode,
  expectedMessage?: string
): void {
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('error');
  expect(response.body.error.code).toBe(expectedCode);

  if (expectedMessage) {
    expect(response.body.error.message).toContain(expectedMessage);
  }
}
```

---

## 3. Project API Tests

### 3.1 GET /api/project - Get Project

#### Test Case 3.1.1: Get existing project
**Description:** Retrieve the current project from database
**Prerequisites:** Project exists in database

**Test Steps:**
```typescript
test('GET /api/project - should return existing project', async () => {
  // Arrange
  const project = await createTestProject('E-commerce Platform');

  // Act
  const response = await request(app)
    .get('/api/project')
    .expect(200);

  // Assert
  assertSuccessResponse<Project>(response, {
    id: project.id,
    name: 'E-commerce Platform',
  });
  expect(response.body.data).toHaveProperty('createdAt');
  expect(response.body.data).toHaveProperty('lastModifiedAt');
  expect(new Date(response.body.data.createdAt)).toBeInstanceOf(Date);
});
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "E-commerce Platform",
    "createdAt": "2025-12-19T10:00:00.000Z",
    "lastModifiedAt": "2025-12-19T10:00:00.000Z"
  }
}
```

---

#### Test Case 3.1.2: Get project when none exists
**Description:** Handle case when no project exists in database
**Prerequisites:** Empty database

**Test Steps:**
```typescript
test('GET /api/project - should return 404 when no project exists', async () => {
  // Act
  const response = await request(app)
    .get('/api/project')
    .expect(404);

  // Assert
  assertErrorResponse(response, 'NOT_FOUND', 'No project found');
});
```

**Expected Result:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "No project found"
  }
}
```

---

#### Test Case 3.1.3: Get project with database error
**Description:** Handle database connection failure
**Prerequisites:** Mock database error

**Test Steps:**
```typescript
test('GET /api/project - should handle database error', async () => {
  // Arrange
  jest.spyOn(db, 'query').mockRejectedValueOnce(new Error('Connection failed'));

  // Act
  const response = await request(app)
    .get('/api/project')
    .expect(503);

  // Assert
  assertErrorResponse(response, 'CONNECTION_ERROR', 'Unable to connect to database');
});
```

---

### 3.2 POST /api/project - Create Project

#### Test Case 3.2.1: Create project with valid name
**Description:** Successfully create a new project
**Prerequisites:** Empty database

**Test Steps:**
```typescript
test('POST /api/project - should create project with valid name', async () => {
  // Arrange
  const projectName = 'E-commerce Platform';

  // Act
  const response = await request(app)
    .post('/api/project')
    .send({ name: projectName })
    .expect(201);

  // Assert
  assertSuccessResponse<Project>(response, {
    name: projectName,
  });
  expect(response.body.data.id).toBeGreaterThan(0);
  expect(response.body.data.createdAt).toBeTruthy();
  expect(response.body.data.lastModifiedAt).toBeTruthy();

  // Verify in database
  const project = await db.query('SELECT * FROM projects WHERE id = $1', [response.body.data.id]);
  expect(project.rows[0].name).toBe(projectName);
});
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "E-commerce Platform",
    "createdAt": "2025-12-19T10:00:00.000Z",
    "lastModifiedAt": "2025-12-19T10:00:00.000Z"
  }
}
```

---

#### Test Case 3.2.2: Create project with empty name (defaults to "Untitled Project")
**Description:** Create project with empty name defaults to "Untitled Project"
**Prerequisites:** Empty database

**Test Steps:**
```typescript
test('POST /api/project - should default to "Untitled Project" for empty name', async () => {
  // Act
  const response = await request(app)
    .post('/api/project')
    .send({ name: '' })
    .expect(201);

  // Assert
  assertSuccessResponse<Project>(response, {
    name: 'Untitled Project',
  });
});
```

---

#### Test Case 3.2.3: Create project with whitespace-only name
**Description:** Whitespace-only names should be treated as empty
**Prerequisites:** Empty database

**Test Steps:**
```typescript
test('POST /api/project - should treat whitespace-only name as empty', async () => {
  // Act
  const response = await request(app)
    .post('/api/project')
    .send({ name: '   \t\n  ' })
    .expect(201);

  // Assert
  assertSuccessResponse<Project>(response, {
    name: 'Untitled Project',
  });
});
```

---

#### Test Case 3.2.4: Create project with name exceeding 100 characters
**Description:** Reject project names longer than 100 characters
**Prerequisites:** Empty database

**Test Steps:**
```typescript
test('POST /api/project - should reject name exceeding 100 characters', async () => {
  // Arrange
  const longName = 'A'.repeat(101);

  // Act
  const response = await request(app)
    .post('/api/project')
    .send({ name: longName })
    .expect(400);

  // Assert
  assertErrorResponse(response, 'VALIDATION_ERROR', 'must not exceed 100 characters');
});
```

---

#### Test Case 3.2.5: Create project trims whitespace
**Description:** Project name should be trimmed before saving
**Prerequisites:** Empty database

**Test Steps:**
```typescript
test('POST /api/project - should trim whitespace from name', async () => {
  // Act
  const response = await request(app)
    .post('/api/project')
    .send({ name: '  Mobile App  ' })
    .expect(201);

  // Assert
  assertSuccessResponse<Project>(response, {
    name: 'Mobile App',
  });
});
```

---

#### Test Case 3.2.6: Create project with special characters
**Description:** Allow special characters in project name
**Prerequisites:** Empty database

**Test Steps:**
```typescript
test('POST /api/project - should allow special characters in name', async () => {
  // Arrange
  const specialName = 'Project: V2.0 - (Beta) & Testing!';

  // Act
  const response = await request(app)
    .post('/api/project')
    .send({ name: specialName })
    .expect(201);

  // Assert
  assertSuccessResponse<Project>(response, {
    name: specialName,
  });
});
```

---

### 3.3 PUT /api/project - Update Project Name

#### Test Case 3.3.1: Update project name successfully
**Description:** Update existing project name
**Prerequisites:** Project exists in database

**Test Steps:**
```typescript
test('PUT /api/project - should update project name', async () => {
  // Arrange
  const project = await createTestProject('Old Name');
  const newName = 'New Project Name';

  // Act
  const response = await request(app)
    .put('/api/project')
    .send({ name: newName })
    .expect(200);

  // Assert
  assertSuccessResponse<Project>(response, {
    id: project.id,
    name: newName,
  });
  expect(response.body.data.lastModifiedAt).not.toBe(project.lastModifiedAt);

  // Verify createdAt is unchanged
  expect(response.body.data.createdAt).toBe(project.createdAt);
});
```

---

#### Test Case 3.3.2: Update project when none exists
**Description:** Handle case when trying to update non-existent project
**Prerequisites:** Empty database

**Test Steps:**
```typescript
test('PUT /api/project - should return 404 when project does not exist', async () => {
  // Act
  const response = await request(app)
    .put('/api/project')
    .send({ name: 'New Name' })
    .expect(404);

  // Assert
  assertErrorResponse(response, 'NOT_FOUND', 'Project not found');
});
```

---

#### Test Case 3.3.3: Update project with invalid name
**Description:** Reject invalid project name during update
**Prerequisites:** Project exists in database

**Test Steps:**
```typescript
test('PUT /api/project - should reject invalid name during update', async () => {
  // Arrange
  await createTestProject('Original Name');

  // Act
  const response = await request(app)
    .put('/api/project')
    .send({ name: 'A'.repeat(101) })
    .expect(400);

  // Assert
  assertErrorResponse(response, 'VALIDATION_ERROR', 'must not exceed 100 characters');
});
```

---

#### Test Case 3.3.4: Update project preserves createdAt timestamp
**Description:** Ensure createdAt is immutable during updates
**Prerequisites:** Project exists in database

**Test Steps:**
```typescript
test('PUT /api/project - should preserve createdAt timestamp', async () => {
  // Arrange
  const project = await createTestProject('Original Name');
  const originalCreatedAt = project.createdAt;

  // Wait a moment to ensure timestamp would change if modified
  await new Promise(resolve => setTimeout(resolve, 100));

  // Act
  const response = await request(app)
    .put('/api/project')
    .send({ name: 'Updated Name' })
    .expect(200);

  // Assert
  expect(response.body.data.createdAt).toBe(originalCreatedAt);
  expect(response.body.data.lastModifiedAt).not.toBe(originalCreatedAt);
});
```

---

## 4. Requirements API Tests

### 4.1 GET /api/requirements - Get All Requirements

#### Test Case 4.1.1: Get all requirements for a project
**Description:** Retrieve all requirements from database
**Prerequisites:** Project and requirements exist

**Test Steps:**
```typescript
test('GET /api/requirements - should return all requirements', async () => {
  // Arrange
  const project = await createTestProject();
  await createTestRequirement(project.id, { description: 'Feature 1', effort: 5 });
  await createTestRequirement(project.id, { description: 'Feature 2', effort: 8 });
  await createTestRequirement(project.id, { description: 'Feature 3', effort: 3 });

  // Act
  const response = await request(app)
    .get('/api/requirements')
    .expect(200);

  // Assert
  assertSuccessResponse<Requirement[]>(response);
  expect(response.body.data).toHaveLength(3);
  expect(response.body.data[0]).toHaveProperty('description', 'Feature 1');
  expect(response.body.data[1]).toHaveProperty('description', 'Feature 2');
  expect(response.body.data[2]).toHaveProperty('description', 'Feature 3');
});
```

---

#### Test Case 4.1.2: Get requirements returns empty array when none exist
**Description:** Handle empty requirements list
**Prerequisites:** Project exists but no requirements

**Test Steps:**
```typescript
test('GET /api/requirements - should return empty array when no requirements', async () => {
  // Arrange
  await createTestProject();

  // Act
  const response = await request(app)
    .get('/api/requirements')
    .expect(200);

  // Assert
  assertSuccessResponse<Requirement[]>(response);
  expect(response.body.data).toEqual([]);
});
```

---

#### Test Case 4.1.3: Get requirements in chronological order
**Description:** Requirements should be ordered by creation date
**Prerequisites:** Project and requirements exist

**Test Steps:**
```typescript
test('GET /api/requirements - should return requirements in chronological order', async () => {
  // Arrange
  const project = await createTestProject();
  const req1 = await createTestRequirement(project.id, { description: 'First', effort: 1 });
  await new Promise(resolve => setTimeout(resolve, 100)); // Ensure different timestamps
  const req2 = await createTestRequirement(project.id, { description: 'Second', effort: 2 });
  await new Promise(resolve => setTimeout(resolve, 100));
  const req3 = await createTestRequirement(project.id, { description: 'Third', effort: 3 });

  // Act
  const response = await request(app)
    .get('/api/requirements')
    .expect(200);

  // Assert
  expect(response.body.data[0].id).toBe(req1.id);
  expect(response.body.data[1].id).toBe(req2.id);
  expect(response.body.data[2].id).toBe(req3.id);
});
```

---

### 4.2 POST /api/requirements - Create Requirement

#### Test Case 4.2.1: Create requirement with valid data
**Description:** Successfully create a new requirement
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('POST /api/requirements - should create requirement with valid data', async () => {
  // Arrange
  const project = await createTestProject();
  const requirementData = {
    description: 'User authentication system',
    effort: 8,
  };

  // Act
  const response = await request(app)
    .post('/api/requirements')
    .send(requirementData)
    .expect(201);

  // Assert
  assertSuccessResponse<Requirement>(response, {
    description: 'User authentication system',
    effort: 8,
    isActive: true,
  });
  expect(response.body.data.id).toBeGreaterThan(0);
  expect(response.body.data.projectId).toBe(project.id);
  expect(response.body.data.createdAt).toBeTruthy();
  expect(response.body.data.lastModifiedAt).toBeTruthy();
});
```

---

#### Test Case 4.2.2: Create requirement defaults to active status
**Description:** New requirements should have isActive = true
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('POST /api/requirements - should default to active status', async () => {
  // Arrange
  await createTestProject();

  // Act
  const response = await request(app)
    .post('/api/requirements')
    .send({ description: 'Test', effort: 5 })
    .expect(201);

  // Assert
  expect(response.body.data.isActive).toBe(true);
});
```

---

#### Test Case 4.2.3: Create requirement with decimal effort value
**Description:** Support decimal effort values (0.5, 2.5, etc.)
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('POST /api/requirements - should accept decimal effort values', async () => {
  // Arrange
  await createTestProject();
  const testCases = [0.5, 2.5, 13.75, 99.99];

  // Act & Assert
  for (const effort of testCases) {
    const response = await request(app)
      .post('/api/requirements')
      .send({ description: `Test effort ${effort}`, effort })
      .expect(201);

    expect(response.body.data.effort).toBe(effort);
  }
});
```

---

#### Test Case 4.2.4: Create requirement with empty description
**Description:** Reject empty description
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('POST /api/requirements - should reject empty description', async () => {
  // Arrange
  await createTestProject();

  // Act
  const response = await request(app)
    .post('/api/requirements')
    .send({ description: '', effort: 5 })
    .expect(400);

  // Assert
  assertErrorResponse(response, 'VALIDATION_ERROR', 'description is required');
});
```

---

#### Test Case 4.2.5: Create requirement with whitespace-only description
**Description:** Reject whitespace-only descriptions
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('POST /api/requirements - should reject whitespace-only description', async () => {
  // Arrange
  await createTestProject();

  // Act
  const response = await request(app)
    .post('/api/requirements')
    .send({ description: '   \t\n  ', effort: 5 })
    .expect(400);

  // Assert
  assertErrorResponse(response, 'VALIDATION_ERROR', 'description is required');
});
```

---

#### Test Case 4.2.6: Create requirement with description exceeding 500 characters
**Description:** Reject descriptions longer than 500 characters
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('POST /api/requirements - should reject description exceeding 500 characters', async () => {
  // Arrange
  await createTestProject();
  const longDescription = 'A'.repeat(501);

  // Act
  const response = await request(app)
    .post('/api/requirements')
    .send({ description: longDescription, effort: 5 })
    .expect(400);

  // Assert
  assertErrorResponse(response, 'VALIDATION_ERROR', 'must not exceed 500 characters');
});
```

---

#### Test Case 4.2.7: Create requirement trims description whitespace
**Description:** Description should be trimmed before saving
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('POST /api/requirements - should trim description whitespace', async () => {
  // Arrange
  await createTestProject();

  // Act
  const response = await request(app)
    .post('/api/requirements')
    .send({ description: '  User authentication  ', effort: 5 })
    .expect(201);

  // Assert
  expect(response.body.data.description).toBe('User authentication');
});
```

---

#### Test Case 4.2.8: Create requirement with zero effort
**Description:** Reject effort value of 0
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('POST /api/requirements - should reject zero effort', async () => {
  // Arrange
  await createTestProject();

  // Act
  const response = await request(app)
    .post('/api/requirements')
    .send({ description: 'Test', effort: 0 })
    .expect(400);

  // Assert
  assertErrorResponse(response, 'VALIDATION_ERROR', 'must be greater than 0');
});
```

---

#### Test Case 4.2.9: Create requirement with negative effort
**Description:** Reject negative effort values
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('POST /api/requirements - should reject negative effort', async () => {
  // Arrange
  await createTestProject();

  // Act
  const response = await request(app)
    .post('/api/requirements')
    .send({ description: 'Test', effort: -5 })
    .expect(400);

  // Assert
  assertErrorResponse(response, 'VALIDATION_ERROR', 'must be greater than 0');
});
```

---

#### Test Case 4.2.10: Create requirement with effort exceeding 1000
**Description:** Reject effort values greater than 1000
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('POST /api/requirements - should reject effort exceeding 1000', async () => {
  // Arrange
  await createTestProject();

  // Act
  const response = await request(app)
    .post('/api/requirements')
    .send({ description: 'Test', effort: 1001 })
    .expect(400);

  // Assert
  assertErrorResponse(response, 'VALIDATION_ERROR', 'must not exceed 1000');
});
```

---

#### Test Case 4.2.11: Create requirement with non-numeric effort
**Description:** Reject non-numeric effort values
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('POST /api/requirements - should reject non-numeric effort', async () => {
  // Arrange
  await createTestProject();

  // Act
  const response = await request(app)
    .post('/api/requirements')
    .send({ description: 'Test', effort: 'abc' })
    .expect(400);

  // Assert
  assertErrorResponse(response, 'VALIDATION_ERROR', 'must be a number');
});
```

---

### 4.3 GET /api/requirements/[id] - Get Single Requirement

#### Test Case 4.3.1: Get requirement by ID
**Description:** Retrieve a single requirement by ID
**Prerequisites:** Requirement exists

**Test Steps:**
```typescript
test('GET /api/requirements/:id - should return requirement by ID', async () => {
  // Arrange
  const project = await createTestProject();
  const requirement = await createTestRequirement(project.id, {
    description: 'Target requirement',
    effort: 5,
  });

  // Act
  const response = await request(app)
    .get(`/api/requirements/${requirement.id}`)
    .expect(200);

  // Assert
  assertSuccessResponse<Requirement>(response, {
    id: requirement.id,
    description: 'Target requirement',
    effort: 5,
  });
});
```

---

#### Test Case 4.3.2: Get non-existent requirement
**Description:** Handle case when requirement ID does not exist
**Prerequisites:** Empty requirements table

**Test Steps:**
```typescript
test('GET /api/requirements/:id - should return 404 for non-existent ID', async () => {
  // Act
  const response = await request(app)
    .get('/api/requirements/99999')
    .expect(404);

  // Assert
  assertErrorResponse(response, 'NOT_FOUND', 'Requirement not found');
});
```

---

### 4.4 PUT /api/requirements/[id] - Update Requirement

#### Test Case 4.4.1: Update requirement description
**Description:** Update only the description field
**Prerequisites:** Requirement exists

**Test Steps:**
```typescript
test('PUT /api/requirements/:id - should update description', async () => {
  // Arrange
  const project = await createTestProject();
  const requirement = await createTestRequirement(project.id, {
    description: 'Old description',
    effort: 5,
  });

  // Act
  const response = await request(app)
    .put(`/api/requirements/${requirement.id}`)
    .send({ description: 'New description' })
    .expect(200);

  // Assert
  assertSuccessResponse<Requirement>(response, {
    id: requirement.id,
    description: 'New description',
    effort: 5, // Unchanged
  });
  expect(response.body.data.lastModifiedAt).not.toBe(requirement.lastModifiedAt);
});
```

---

#### Test Case 4.4.2: Update requirement effort
**Description:** Update only the effort field
**Prerequisites:** Requirement exists

**Test Steps:**
```typescript
test('PUT /api/requirements/:id - should update effort', async () => {
  // Arrange
  const project = await createTestProject();
  const requirement = await createTestRequirement(project.id, {
    description: 'Test requirement',
    effort: 5,
  });

  // Act
  const response = await request(app)
    .put(`/api/requirements/${requirement.id}`)
    .send({ effort: 10 })
    .expect(200);

  // Assert
  assertSuccessResponse<Requirement>(response, {
    id: requirement.id,
    description: 'Test requirement', // Unchanged
    effort: 10,
  });
});
```

---

#### Test Case 4.4.3: Update requirement with both fields
**Description:** Update both description and effort
**Prerequisites:** Requirement exists

**Test Steps:**
```typescript
test('PUT /api/requirements/:id - should update multiple fields', async () => {
  // Arrange
  const project = await createTestProject();
  const requirement = await createTestRequirement(project.id, {
    description: 'Old description',
    effort: 5,
  });

  // Act
  const response = await request(app)
    .put(`/api/requirements/${requirement.id}`)
    .send({
      description: 'New description',
      effort: 15,
    })
    .expect(200);

  // Assert
  assertSuccessResponse<Requirement>(response, {
    id: requirement.id,
    description: 'New description',
    effort: 15,
  });
});
```

---

#### Test Case 4.4.4: Update requirement status (toggle active/inactive)
**Description:** Toggle requirement isActive status
**Prerequisites:** Requirement exists with isActive = true

**Test Steps:**
```typescript
test('PUT /api/requirements/:id - should toggle isActive status', async () => {
  // Arrange
  const project = await createTestProject();
  const requirement = await createTestRequirement(project.id, {
    description: 'Test requirement',
    effort: 5,
  });
  expect(requirement.isActive).toBe(true);

  // Act - Set to inactive
  const response1 = await request(app)
    .put(`/api/requirements/${requirement.id}`)
    .send({ isActive: false })
    .expect(200);

  // Assert inactive
  expect(response1.body.data.isActive).toBe(false);

  // Act - Set back to active
  const response2 = await request(app)
    .put(`/api/requirements/${requirement.id}`)
    .send({ isActive: true })
    .expect(200);

  // Assert active
  expect(response2.body.data.isActive).toBe(true);
});
```

---

#### Test Case 4.4.5: Update preserves immutable fields
**Description:** Ensure ID, projectId, and createdAt are immutable
**Prerequisites:** Requirement exists

**Test Steps:**
```typescript
test('PUT /api/requirements/:id - should preserve immutable fields', async () => {
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
  const response = await request(app)
    .put(`/api/requirements/${requirement.id}`)
    .send({ description: 'Updated' })
    .expect(200);

  // Assert
  expect(response.body.data.id).toBe(originalId);
  expect(response.body.data.projectId).toBe(originalProjectId);
  expect(response.body.data.createdAt).toBe(originalCreatedAt);
  expect(response.body.data.lastModifiedAt).not.toBe(originalCreatedAt);
});
```

---

#### Test Case 4.4.6: Update non-existent requirement
**Description:** Handle update of non-existent requirement
**Prerequisites:** Empty requirements table

**Test Steps:**
```typescript
test('PUT /api/requirements/:id - should return 404 for non-existent requirement', async () => {
  // Act
  const response = await request(app)
    .put('/api/requirements/99999')
    .send({ description: 'New description' })
    .expect(404);

  // Assert
  assertErrorResponse(response, 'NOT_FOUND', 'Requirement not found');
});
```

---

#### Test Case 4.4.7: Update with invalid data
**Description:** Reject updates with invalid validation
**Prerequisites:** Requirement exists

**Test Steps:**
```typescript
test('PUT /api/requirements/:id - should reject invalid updates', async () => {
  // Arrange
  const project = await createTestProject();
  const requirement = await createTestRequirement(project.id, {
    description: 'Test',
    effort: 5,
  });

  // Act & Assert - Empty description
  const response1 = await request(app)
    .put(`/api/requirements/${requirement.id}`)
    .send({ description: '' })
    .expect(400);
  assertErrorResponse(response1, 'VALIDATION_ERROR');

  // Act & Assert - Invalid effort
  const response2 = await request(app)
    .put(`/api/requirements/${requirement.id}`)
    .send({ effort: -5 })
    .expect(400);
  assertErrorResponse(response2, 'VALIDATION_ERROR');
});
```

---

### 4.5 DELETE /api/requirements/[id] - Delete Requirement

#### Test Case 4.5.1: Delete requirement successfully
**Description:** Successfully delete a requirement
**Prerequisites:** Requirement exists

**Test Steps:**
```typescript
test('DELETE /api/requirements/:id - should delete requirement', async () => {
  // Arrange
  const project = await createTestProject();
  const requirement = await createTestRequirement(project.id, {
    description: 'To be deleted',
    effort: 5,
  });

  // Act
  const response = await request(app)
    .delete(`/api/requirements/${requirement.id}`)
    .expect(200);

  // Assert
  assertSuccessResponse(response);

  // Verify deletion
  const getResponse = await request(app)
    .get(`/api/requirements/${requirement.id}`)
    .expect(404);
});
```

---

#### Test Case 4.5.2: Delete requirement permanently removes from database
**Description:** Verify requirement is completely removed
**Prerequisites:** Requirement exists

**Test Steps:**
```typescript
test('DELETE /api/requirements/:id - should permanently remove from database', async () => {
  // Arrange
  const project = await createTestProject();
  const requirement = await createTestRequirement(project.id, {
    description: 'Test',
    effort: 5,
  });

  // Act
  await request(app)
    .delete(`/api/requirements/${requirement.id}`)
    .expect(200);

  // Assert - Direct database query
  const result = await db.query(
    'SELECT * FROM requirements WHERE id = $1',
    [requirement.id]
  );
  expect(result.rows).toHaveLength(0);
});
```

---

#### Test Case 4.5.3: Delete non-existent requirement
**Description:** Handle deletion of non-existent requirement
**Prerequisites:** Empty requirements table

**Test Steps:**
```typescript
test('DELETE /api/requirements/:id - should return 404 for non-existent requirement', async () => {
  // Act
  const response = await request(app)
    .delete('/api/requirements/99999')
    .expect(404);

  // Assert
  assertErrorResponse(response, 'NOT_FOUND', 'Requirement not found');
});
```

---

#### Test Case 4.5.4: Delete requirement affects total effort calculation
**Description:** Verify deleting active requirement updates total
**Prerequisites:** Multiple requirements exist

**Test Steps:**
```typescript
test('DELETE /api/requirements/:id - should affect total effort calculation', async () => {
  // Arrange
  const project = await createTestProject();
  const req1 = await createTestRequirement(project.id, { description: 'R1', effort: 5 });
  const req2 = await createTestRequirement(project.id, { description: 'R2', effort: 10 });
  const req3 = await createTestRequirement(project.id, { description: 'R3', effort: 15 });

  // Initial total should be 30
  let allReqs = await request(app).get('/api/requirements');
  let totalEffort = allReqs.body.data
    .filter(r => r.isActive)
    .reduce((sum, r) => sum + r.effort, 0);
  expect(totalEffort).toBe(30);

  // Act - Delete req2 (effort: 10)
  await request(app).delete(`/api/requirements/${req2.id}`).expect(200);

  // Assert - Total should now be 20
  allReqs = await request(app).get('/api/requirements');
  totalEffort = allReqs.body.data
    .filter(r => r.isActive)
    .reduce((sum, r) => sum + r.effort, 0);
  expect(totalEffort).toBe(20);
});
```

---

## 5. Preferences API Tests

### 5.1 GET /api/preferences - Get Preferences

#### Test Case 5.1.1: Get default preferences
**Description:** Retrieve default preferences on first access
**Prerequisites:** No custom preferences set

**Test Steps:**
```typescript
test('GET /api/preferences - should return default preferences', async () => {
  // Act
  const response = await request(app)
    .get('/api/preferences')
    .expect(200);

  // Assert
  assertSuccessResponse<UserPreferences>(response, {
    effortColumnVisible: true,
    showTotalWhenEffortHidden: true,
    language: 'en',
  });
  expect(response.body.data).toHaveProperty('id');
  expect(response.body.data).toHaveProperty('lastUpdatedAt');
});
```

---

#### Test Case 5.1.2: Get saved preferences
**Description:** Retrieve previously saved preferences
**Prerequisites:** Preferences have been updated

**Test Steps:**
```typescript
test('GET /api/preferences - should return saved preferences', async () => {
  // Arrange
  await request(app)
    .put('/api/preferences')
    .send({
      effortColumnVisible: false,
      language: 'th',
    })
    .expect(200);

  // Act
  const response = await request(app)
    .get('/api/preferences')
    .expect(200);

  // Assert
  assertSuccessResponse<UserPreferences>(response, {
    effortColumnVisible: false,
    language: 'th',
  });
});
```

---

### 5.2 PUT /api/preferences - Update Preferences

#### Test Case 5.2.1: Update effort column visibility
**Description:** Toggle effort column visibility
**Prerequisites:** Default preferences exist

**Test Steps:**
```typescript
test('PUT /api/preferences - should update effort column visibility', async () => {
  // Act
  const response = await request(app)
    .put('/api/preferences')
    .send({ effortColumnVisible: false })
    .expect(200);

  // Assert
  assertSuccessResponse<UserPreferences>(response, {
    effortColumnVisible: false,
  });

  // Verify persistence
  const getResponse = await request(app).get('/api/preferences');
  expect(getResponse.body.data.effortColumnVisible).toBe(false);
});
```

---

#### Test Case 5.2.2: Update language preference
**Description:** Change language between en and th
**Prerequisites:** Default preferences exist

**Test Steps:**
```typescript
test('PUT /api/preferences - should update language preference', async () => {
  // Act - Set to Thai
  const response1 = await request(app)
    .put('/api/preferences')
    .send({ language: 'th' })
    .expect(200);

  // Assert Thai
  expect(response1.body.data.language).toBe('th');

  // Act - Set back to English
  const response2 = await request(app)
    .put('/api/preferences')
    .send({ language: 'en' })
    .expect(200);

  // Assert English
  expect(response2.body.data.language).toBe('en');
});
```

---

#### Test Case 5.2.3: Update multiple preferences at once
**Description:** Update multiple preference fields in one request
**Prerequisites:** Default preferences exist

**Test Steps:**
```typescript
test('PUT /api/preferences - should update multiple preferences', async () => {
  // Act
  const response = await request(app)
    .put('/api/preferences')
    .send({
      effortColumnVisible: false,
      showTotalWhenEffortHidden: false,
      language: 'th',
    })
    .expect(200);

  // Assert
  assertSuccessResponse<UserPreferences>(response, {
    effortColumnVisible: false,
    showTotalWhenEffortHidden: false,
    language: 'th',
  });
});
```

---

#### Test Case 5.2.4: Update preferences with invalid language
**Description:** Reject invalid language codes
**Prerequisites:** Default preferences exist

**Test Steps:**
```typescript
test('PUT /api/preferences - should reject invalid language', async () => {
  // Act
  const response = await request(app)
    .put('/api/preferences')
    .send({ language: 'fr' }) // Invalid language
    .expect(400);

  // Assert
  assertErrorResponse(response, 'VALIDATION_ERROR', 'must be "en" or "th"');
});
```

---

#### Test Case 5.2.5: Update preferences preserves other fields
**Description:** Partial updates should not affect other fields
**Prerequisites:** Custom preferences exist

**Test Steps:**
```typescript
test('PUT /api/preferences - should preserve unmodified fields', async () => {
  // Arrange
  await request(app)
    .put('/api/preferences')
    .send({
      effortColumnVisible: false,
      showTotalWhenEffortHidden: true,
      language: 'th',
    });

  // Act - Update only language
  const response = await request(app)
    .put('/api/preferences')
    .send({ language: 'en' })
    .expect(200);

  // Assert - Other fields unchanged
  expect(response.body.data.effortColumnVisible).toBe(false);
  expect(response.body.data.showTotalWhenEffortHidden).toBe(true);
  expect(response.body.data.language).toBe('en');
});
```

---

#### Test Case 5.2.6: Update preferences updates lastUpdatedAt timestamp
**Description:** Verify timestamp is updated on each preference change
**Prerequisites:** Default preferences exist

**Test Steps:**
```typescript
test('PUT /api/preferences - should update lastUpdatedAt timestamp', async () => {
  // Arrange
  const initialResponse = await request(app).get('/api/preferences');
  const initialTimestamp = initialResponse.body.data.lastUpdatedAt;

  await new Promise(resolve => setTimeout(resolve, 100)); // Ensure timestamp difference

  // Act
  const response = await request(app)
    .put('/api/preferences')
    .send({ effortColumnVisible: false })
    .expect(200);

  // Assert
  expect(response.body.data.lastUpdatedAt).not.toBe(initialTimestamp);
  expect(new Date(response.body.data.lastUpdatedAt).getTime())
    .toBeGreaterThan(new Date(initialTimestamp).getTime());
});
```

---

#### Test Case 5.2.7: Update preferences with non-boolean values
**Description:** Reject non-boolean values for boolean fields
**Prerequisites:** Default preferences exist

**Test Steps:**
```typescript
test('PUT /api/preferences - should reject non-boolean values', async () => {
  // Act
  const response = await request(app)
    .put('/api/preferences')
    .send({ effortColumnVisible: 'yes' }) // Should be boolean
    .expect(400);

  // Assert
  assertErrorResponse(response, 'VALIDATION_ERROR', 'must be a boolean');
});
```

---

## 6. Integration Tests

### 6.1 Complete Workflow Tests

#### Test Case 6.1.1: Complete project creation workflow
**Description:** Test full workflow from project creation to requirements
**Prerequisites:** Empty database

**Test Steps:**
```typescript
test('Integration - Complete project creation workflow', async () => {
  // Step 1: Create project
  const projectResponse = await request(app)
    .post('/api/project')
    .send({ name: 'Integration Test Project' })
    .expect(201);

  const project = projectResponse.body.data;

  // Step 2: Add multiple requirements
  const req1Response = await request(app)
    .post('/api/requirements')
    .send({ description: 'Requirement 1', effort: 5 })
    .expect(201);

  const req2Response = await request(app)
    .post('/api/requirements')
    .send({ description: 'Requirement 2', effort: 8 })
    .expect(201);

  // Step 3: Verify all requirements are retrieved
  const allReqsResponse = await request(app)
    .get('/api/requirements')
    .expect(200);

  expect(allReqsResponse.body.data).toHaveLength(2);

  // Step 4: Calculate total effort
  const totalEffort = allReqsResponse.body.data
    .filter(r => r.isActive)
    .reduce((sum, r) => sum + r.effort, 0);

  expect(totalEffort).toBe(13);
});
```

---

#### Test Case 6.1.2: Status toggle workflow with total effort calculation
**Description:** Test requirement status changes affect total effort
**Prerequisites:** Project and requirements exist

**Test Steps:**
```typescript
test('Integration - Status toggle affects total effort', async () => {
  // Arrange
  const project = await createTestProject();
  const req1 = await createTestRequirement(project.id, { description: 'R1', effort: 5 });
  const req2 = await createTestRequirement(project.id, { description: 'R2', effort: 10 });
  const req3 = await createTestRequirement(project.id, { description: 'R3', effort: 15 });

  // Step 1: Verify initial total (all active) = 30
  let allReqs = await request(app).get('/api/requirements');
  let total = allReqs.body.data
    .filter(r => r.isActive)
    .reduce((sum, r) => sum + r.effort, 0);
  expect(total).toBe(30);

  // Step 2: Set req2 to inactive
  await request(app)
    .put(`/api/requirements/${req2.id}`)
    .send({ isActive: false })
    .expect(200);

  // Step 3: Verify total = 20 (5 + 15)
  allReqs = await request(app).get('/api/requirements');
  total = allReqs.body.data
    .filter(r => r.isActive)
    .reduce((sum, r) => sum + r.effort, 0);
  expect(total).toBe(20);

  // Step 4: Set req3 to inactive
  await request(app)
    .put(`/api/requirements/${req3.id}`)
    .send({ isActive: false })
    .expect(200);

  // Step 5: Verify total = 5 (only req1 active)
  allReqs = await request(app).get('/api/requirements');
  total = allReqs.body.data
    .filter(r => r.isActive)
    .reduce((sum, r) => sum + r.effort, 0);
  expect(total).toBe(5);
});
```

---

#### Test Case 6.1.3: Cross-browser persistence simulation
**Description:** Simulate multiple sessions accessing same data
**Prerequisites:** Project and data exist

**Test Steps:**
```typescript
test('Integration - Cross-session data persistence', async () => {
  // Session 1: Create project and requirements
  const project = await createTestProject('Session Test');
  await createTestRequirement(project.id, { description: 'Req 1', effort: 5 });

  // Session 2: Update preferences
  await request(app)
    .put('/api/preferences')
    .send({ language: 'th', effortColumnVisible: false })
    .expect(200);

  // Session 3: Verify all data is accessible
  const projectResponse = await request(app).get('/api/project');
  expect(projectResponse.body.data.name).toBe('Session Test');

  const reqsResponse = await request(app).get('/api/requirements');
  expect(reqsResponse.body.data).toHaveLength(1);

  const prefsResponse = await request(app).get('/api/preferences');
  expect(prefsResponse.body.data.language).toBe('th');
  expect(prefsResponse.body.data.effortColumnVisible).toBe(false);
});
```

---

#### Test Case 6.1.4: Full CRUD lifecycle for requirement
**Description:** Test complete lifecycle: create, read, update, delete
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('Integration - Full CRUD lifecycle for requirement', async () => {
  // Arrange
  const project = await createTestProject();

  // CREATE
  const createResponse = await request(app)
    .post('/api/requirements')
    .send({ description: 'Original requirement', effort: 5 })
    .expect(201);

  const requirementId = createResponse.body.data.id;

  // READ
  const readResponse = await request(app)
    .get(`/api/requirements/${requirementId}`)
    .expect(200);

  expect(readResponse.body.data.description).toBe('Original requirement');

  // UPDATE
  const updateResponse = await request(app)
    .put(`/api/requirements/${requirementId}`)
    .send({ description: 'Updated requirement', effort: 10 })
    .expect(200);

  expect(updateResponse.body.data.description).toBe('Updated requirement');
  expect(updateResponse.body.data.effort).toBe(10);

  // DELETE
  await request(app)
    .delete(`/api/requirements/${requirementId}`)
    .expect(200);

  // Verify deletion
  await request(app)
    .get(`/api/requirements/${requirementId}`)
    .expect(404);
});
```

---

#### Test Case 6.1.5: Language preference affects API responses
**Description:** Verify language preference is respected
**Prerequisites:** Default state

**Test Steps:**
```typescript
test('Integration - Language preference persistence', async () => {
  // Step 1: Set language to Thai
  await request(app)
    .put('/api/preferences')
    .send({ language: 'th' })
    .expect(200);

  // Step 2: Retrieve preferences
  const prefsResponse = await request(app)
    .get('/api/preferences')
    .expect(200);

  expect(prefsResponse.body.data.language).toBe('th');

  // Step 3: Change to English
  await request(app)
    .put('/api/preferences')
    .send({ language: 'en' })
    .expect(200);

  // Step 4: Verify change persisted
  const updatedPrefsResponse = await request(app)
    .get('/api/preferences')
    .expect(200);

  expect(updatedPrefsResponse.body.data.language).toBe('en');
});
```

---

## 7. Error Handling Tests

### 7.1 Database Connection Errors

#### Test Case 7.1.1: Handle database connection failure on GET
**Description:** Gracefully handle database unavailability
**Prerequisites:** Mock database connection error

**Test Steps:**
```typescript
test('Error - Handle database connection failure on GET', async () => {
  // Arrange
  jest.spyOn(db, 'query').mockRejectedValueOnce(
    new Error('ECONNREFUSED: Connection refused')
  );

  // Act
  const response = await request(app)
    .get('/api/project')
    .expect(503);

  // Assert
  assertErrorResponse(response, 'CONNECTION_ERROR', 'Unable to connect to database');
});
```

---

#### Test Case 7.1.2: Handle database timeout
**Description:** Handle slow database responses
**Prerequisites:** Mock timeout

**Test Steps:**
```typescript
test('Error - Handle database timeout', async () => {
  // Arrange
  jest.spyOn(db, 'query').mockImplementation(
    () => new Promise((resolve) => setTimeout(resolve, 10000)) // 10s timeout
  );

  // Act
  const response = await request(app)
    .get('/api/requirements')
    .expect(503);

  // Assert
  assertErrorResponse(response, 'DATABASE_ERROR', 'Request timeout');
});
```

---

### 7.2 Validation Error Handling

#### Test Case 7.2.1: Multiple validation errors at once
**Description:** Handle multiple validation failures
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('Error - Multiple validation errors', async () => {
  // Arrange
  await createTestProject();

  // Act - Empty description + invalid effort
  const response = await request(app)
    .post('/api/requirements')
    .send({ description: '', effort: -5 })
    .expect(400);

  // Assert
  assertErrorResponse(response, 'VALIDATION_ERROR');
  expect(response.body.error.details).toBeDefined();
  expect(response.body.error.details).toHaveLength(2);
});
```

---

#### Test Case 7.2.2: SQL injection prevention
**Description:** Ensure SQL injection attempts are prevented
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('Error - SQL injection prevention', async () => {
  // Arrange
  await createTestProject();
  const sqlInjection = "'; DROP TABLE requirements; --";

  // Act
  const response = await request(app)
    .post('/api/requirements')
    .send({ description: sqlInjection, effort: 5 })
    .expect(201);

  // Assert - Should be treated as normal string
  expect(response.body.data.description).toBe(sqlInjection);

  // Verify requirements table still exists
  const allReqs = await request(app).get('/api/requirements');
  expect(allReqs.status).toBe(200);
});
```

---

### 7.3 Transaction Rollback Tests

#### Test Case 7.3.1: Failed create rolls back transaction
**Description:** Ensure failed operations don't leave partial data
**Prerequisites:** Empty database

**Test Steps:**
```typescript
test('Error - Failed create rolls back transaction', async () => {
  // Arrange
  jest.spyOn(db, 'query')
    .mockResolvedValueOnce({ rows: [] }) // Begin transaction
    .mockRejectedValueOnce(new Error('Database error')); // INSERT fails

  // Act
  const response = await request(app)
    .post('/api/project')
    .send({ name: 'Test Project' })
    .expect(500);

  // Assert
  assertErrorResponse(response, 'DATABASE_ERROR');

  // Verify no project was created
  const allProjects = await db.query('SELECT * FROM projects');
  expect(allProjects.rows).toHaveLength(0);
});
```

---

#### Test Case 7.3.2: Failed update doesn't modify data
**Description:** Ensure failed updates leave original data intact
**Prerequisites:** Requirement exists

**Test Steps:**
```typescript
test('Error - Failed update preserves original data', async () => {
  // Arrange
  const project = await createTestProject();
  const requirement = await createTestRequirement(project.id, {
    description: 'Original',
    effort: 5,
  });

  // Mock database failure on update
  jest.spyOn(db, 'query').mockRejectedValueOnce(new Error('Update failed'));

  // Act
  const response = await request(app)
    .put(`/api/requirements/${requirement.id}`)
    .send({ description: 'Modified' })
    .expect(500);

  // Assert
  assertErrorResponse(response, 'DATABASE_ERROR');

  // Verify original data unchanged
  const getResponse = await request(app)
    .get(`/api/requirements/${requirement.id}`)
    .expect(200);

  expect(getResponse.body.data.description).toBe('Original');
  expect(getResponse.body.data.effort).toBe(5);
});
```

---

## 8. Data Integrity Tests

### 8.1 Referential Integrity

#### Test Case 8.1.1: Requirements belong to valid project
**Description:** Ensure requirements cannot exist without project
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('Integrity - Requirements must belong to valid project', async () => {
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
  const directInsert = db.query(
    'INSERT INTO requirements (project_id, description, effort, is_active) VALUES ($1, $2, $3, $4)',
    [99999, 'Test', 5, true]
  );

  await expect(directInsert).rejects.toThrow(/foreign key constraint/);
});
```

---

#### Test Case 8.1.2: Cascade delete verification
**Description:** Verify cascading deletes work correctly
**Prerequisites:** Project with requirements exists

**Test Steps:**
```typescript
test('Integrity - Cascade delete removes related requirements', async () => {
  // Arrange
  const project = await createTestProject();
  await createTestRequirement(project.id, { description: 'R1', effort: 5 });
  await createTestRequirement(project.id, { description: 'R2', effort: 10 });

  // Act - Delete project directly (simulate)
  await db.query('DELETE FROM projects WHERE id = $1', [project.id]);

  // Assert - Requirements should be deleted
  const requirements = await db.query(
    'SELECT * FROM requirements WHERE project_id = $1',
    [project.id]
  );
  expect(requirements.rows).toHaveLength(0);
});
```

---

### 8.2 Data Consistency

#### Test Case 8.2.1: Total effort calculation accuracy
**Description:** Verify total effort matches sum of active requirements
**Prerequisites:** Multiple requirements with mixed statuses

**Test Steps:**
```typescript
test('Integrity - Total effort calculation is accurate', async () => {
  // Arrange
  const project = await createTestProject();
  await createTestRequirement(project.id, { description: 'R1', effort: 5.5 });
  await createTestRequirement(project.id, { description: 'R2', effort: 10.25 });
  const req3 = await createTestRequirement(project.id, { description: 'R3', effort: 15.75 });

  // Set req3 to inactive
  await request(app)
    .put(`/api/requirements/${req3.id}`)
    .send({ isActive: false });

  // Act
  const response = await request(app).get('/api/requirements');

  // Calculate total manually
  const expectedTotal = 5.5 + 10.25; // 15.75
  const actualTotal = response.body.data
    .filter(r => r.isActive)
    .reduce((sum, r) => sum + r.effort, 0);

  // Assert
  expect(actualTotal).toBe(expectedTotal);
  expect(Math.round(actualTotal * 100) / 100).toBe(15.75);
});
```

---

#### Test Case 8.2.2: Timestamp consistency
**Description:** Verify timestamps are accurate and ordered correctly
**Prerequisites:** Empty database

**Test Steps:**
```typescript
test('Integrity - Timestamps are consistent', async () => {
  // Arrange
  const startTime = new Date();

  // Act
  const project = await createTestProject();
  const projectCreatedAt = new Date(project.createdAt);
  const projectModifiedAt = new Date(project.lastModifiedAt);

  // Assert
  expect(projectCreatedAt.getTime()).toBeGreaterThanOrEqual(startTime.getTime());
  expect(projectModifiedAt.getTime()).toBeGreaterThanOrEqual(projectCreatedAt.getTime());

  // Update project
  await new Promise(resolve => setTimeout(resolve, 100));
  const updateResponse = await request(app)
    .put('/api/project')
    .send({ name: 'Updated Name' });

  const updatedModifiedAt = new Date(updateResponse.body.data.lastModifiedAt);

  // Assert timestamps ordered correctly
  expect(updatedModifiedAt.getTime()).toBeGreaterThan(projectModifiedAt.getTime());
  expect(updateResponse.body.data.createdAt).toBe(project.createdAt); // Unchanged
});
```

---

## 9. Performance Tests

### 9.1 Response Time Tests

#### Test Case 9.1.1: GET requests complete within 2 seconds
**Description:** Verify API response times meet requirements
**Prerequisites:** Database populated with test data

**Test Steps:**
```typescript
test('Performance - GET requests complete within 2 seconds', async () => {
  // Arrange
  const project = await createTestProject();
  for (let i = 0; i < 50; i++) {
    await createTestRequirement(project.id, {
      description: `Requirement ${i}`,
      effort: Math.random() * 10,
    });
  }

  // Act
  const startTime = Date.now();
  const response = await request(app)
    .get('/api/requirements')
    .expect(200);
  const endTime = Date.now();

  // Assert
  const responseTime = endTime - startTime;
  expect(responseTime).toBeLessThan(2000); // Less than 2 seconds
  expect(response.body.data).toHaveLength(50);
});
```

---

#### Test Case 9.1.2: POST requests complete within 2 seconds
**Description:** Verify create operations are performant
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('Performance - POST requests complete within 2 seconds', async () => {
  // Arrange
  await createTestProject();

  // Act
  const startTime = Date.now();
  const response = await request(app)
    .post('/api/requirements')
    .send({ description: 'Performance test', effort: 5 })
    .expect(201);
  const endTime = Date.now();

  // Assert
  const responseTime = endTime - startTime;
  expect(responseTime).toBeLessThan(2000);
  expect(response.body.data).toHaveProperty('id');
});
```

---

#### Test Case 9.1.3: Bulk operations performance
**Description:** Test performance with multiple concurrent requests
**Prerequisites:** Project exists

**Test Steps:**
```typescript
test('Performance - Handle multiple concurrent requests', async () => {
  // Arrange
  const project = await createTestProject();
  const concurrentRequests = 20;

  // Act
  const startTime = Date.now();
  const promises = Array.from({ length: concurrentRequests }, (_, i) =>
    request(app)
      .post('/api/requirements')
      .send({ description: `Concurrent ${i}`, effort: i + 1 })
  );

  const responses = await Promise.all(promises);
  const endTime = Date.now();

  // Assert
  const totalTime = endTime - startTime;
  expect(totalTime).toBeLessThan(5000); // 5 seconds for 20 requests
  expect(responses.every(r => r.status === 201)).toBe(true);

  // Verify all created
  const allReqs = await request(app).get('/api/requirements');
  expect(allReqs.body.data).toHaveLength(concurrentRequests);
});
```

---

## 10. Test Data Sets

### 10.1 Valid Test Data

#### Project Names
```typescript
const VALID_PROJECT_NAMES = [
  'E-commerce Platform',
  'Mobile App Development',
  'API Integration Project',
  'Database Migration v2',
  'Project: Alpha (Beta Testing)',
  'A', // Minimum length
  'A'.repeat(100), // Maximum length
  'Проект', // Unicode characters
  '项目管理', // Chinese characters
  'โครงการ', // Thai characters
];
```

#### Requirement Descriptions
```typescript
const VALID_DESCRIPTIONS = [
  'User authentication system',
  'Push notification service',
  'Payment gateway integration',
  'Real-time chat feature',
  'A', // Minimum length
  'A'.repeat(500), // Maximum length
  'Feature with special chars: @#$%^&*()',
  'Multi-line description\nwith line breaks',
];
```

#### Effort Values
```typescript
const VALID_EFFORT_VALUES = [
  0.1,    // Minimum
  0.5,    // Small decimal
  1,      // Integer
  2.5,    // Common decimal
  5.75,   // Multiple decimals
  13.5,   // Fibonacci-like
  100,    // Large integer
  999.99, // Near maximum
  1000,   // Maximum
];
```

---

### 10.2 Invalid Test Data

#### Invalid Project Names
```typescript
const INVALID_PROJECT_NAMES = [
  { value: '', error: 'defaults to Untitled Project' },
  { value: '   ', error: 'whitespace only, defaults to Untitled Project' },
  { value: 'A'.repeat(101), error: 'exceeds 100 characters' },
];
```

#### Invalid Requirement Descriptions
```typescript
const INVALID_DESCRIPTIONS = [
  { value: '', error: 'empty description' },
  { value: '   \t\n  ', error: 'whitespace only' },
  { value: 'A'.repeat(501), error: 'exceeds 500 characters' },
];
```

#### Invalid Effort Values
```typescript
const INVALID_EFFORT_VALUES = [
  { value: 0, error: 'zero not allowed' },
  { value: -1, error: 'negative not allowed' },
  { value: -5.5, error: 'negative decimal' },
  { value: 1001, error: 'exceeds maximum' },
  { value: 'abc', error: 'non-numeric' },
  { value: null, error: 'null value' },
  { value: undefined, error: 'undefined value' },
  { value: NaN, error: 'NaN value' },
  { value: Infinity, error: 'Infinity value' },
];
```

---

## Test Coverage Summary

### Coverage Targets

| Category | Target | Priority |
|----------|--------|----------|
| **Statements** | 90%+ | High |
| **Branches** | 85%+ | High |
| **Functions** | 90%+ | High |
| **Lines** | 90%+ | High |

### Critical Paths

**Must be 100% covered:**
1. All validation logic
2. Database transactions
3. Error handling paths
4. API response formatting
5. Data integrity checks

---

## Running Tests

### Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- project.test.ts

# Run in watch mode
npm test -- --watch

# Run integration tests only
npm test -- --testPathPattern=integration

# Run with verbose output
npm test -- --verbose
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - run: npm ci
      - run: npm run db:migrate:test
      - run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Appendix

### A. Test Result Format

**Expected Test Output:**
```
PASS  src/app/api/project/route.test.ts
  ✓ GET /api/project - should return existing project (125ms)
  ✓ POST /api/project - should create project with valid name (98ms)
  ✓ PUT /api/project - should update project name (87ms)

PASS  src/app/api/requirements/route.test.ts
  ✓ GET /api/requirements - should return all requirements (156ms)
  ✓ POST /api/requirements - should create requirement with valid data (143ms)

Test Suites: 5 passed, 5 total
Tests:       85 passed, 85 total
Snapshots:   0 total
Time:        12.456s
Coverage:    92.5% (statements), 90.1% (branches)
```

---

**End of Test Cases Document**
