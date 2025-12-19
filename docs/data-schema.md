# Data Schema: Requirement & Effort Tracker MVP

## 1. Overview

This document defines the data schema for storing application data in the browser's `localStorage`. Since `localStorage` only supports string storage, all data structures must be serialized to JSON strings before storage and deserialized when retrieved.

### 1.1 Storage Strategy

**Key Naming Convention**: Use a namespace prefix to avoid conflicts with other applications
- Primary namespace: `req-tracker`
- Format: `req-tracker:{entity}`

**Storage Keys**:
- `req-tracker:project` - Project metadata
- `req-tracker:requirements` - Array of requirement records
- `req-tracker:preferences` - User display preferences
- `req-tracker:schema-version` - Schema version for future migrations

---

## 2. Schema Version Management

### 2.1 Schema Version Entity

**Storage Key**: `req-tracker:schema-version`

**Data Type**: String

**Current Version**: `"1.0.0"`

**Purpose**: Track schema version to enable future data migrations

**Example**:
```json
"1.0.0"
```

---

## 3. Project Entity

### 3.1 Data Structure

**Storage Key**: `req-tracker:project`

**TypeScript Interface**:
```typescript
interface Project {
  name: string;
  createdAt: string; // ISO 8601 timestamp
  lastModifiedAt: string; // ISO 8601 timestamp
}
```

### 3.2 Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `name` | string | Yes | Min: 1 char, Max: 100 chars, No whitespace-only | The project name |
| `createdAt` | string | Yes | ISO 8601 format | Timestamp when project was created |
| `lastModifiedAt` | string | Yes | ISO 8601 format | Timestamp of last modification to project name |

### 3.3 Validation Rules

- **name**:
  - Must not be empty or contain only whitespace
  - Maximum length: 100 characters
  - If user skips naming, defaults to "Untitled Project"
  - Trim whitespace before validation and storage

- **createdAt**:
  - Must be a valid ISO 8601 timestamp string
  - Generated using `new Date().toISOString()`
  - Immutable after creation

- **lastModifiedAt**:
  - Must be a valid ISO 8601 timestamp string
  - Updated whenever project name is changed
  - Initially same as `createdAt`

### 3.4 JSON Example

```json
{
  "name": "E-commerce Platform Redesign",
  "createdAt": "2025-12-19T10:30:00.000Z",
  "lastModifiedAt": "2025-12-19T15:45:30.000Z"
}
```

### 3.5 Default Value

When no project exists (first-time use):
```json
{
  "name": "Untitled Project",
  "createdAt": "2025-12-19T10:00:00.000Z",
  "lastModifiedAt": "2025-12-19T10:00:00.000Z"
}
```

---

## 4. Requirement Entity

### 4.1 Data Structure

**Storage Key**: `req-tracker:requirements`

**TypeScript Interface**:
```typescript
interface Requirement {
  id: string;
  description: string;
  effort: number;
  isActive: boolean;
  createdAt: string; // ISO 8601 timestamp
  lastModifiedAt: string; // ISO 8601 timestamp
}

type Requirements = Requirement[];
```

### 4.2 Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | string | Yes | Unique, UUID format recommended | Unique identifier for the requirement |
| `description` | string | Yes | Min: 1 char, Max: 500 chars | Text description of the requirement |
| `effort` | number | Yes | Min: 0.1, Max: 1000, Positive | Estimated effort value (can include decimals) |
| `isActive` | boolean | Yes | true or false | Whether requirement is included in total effort calculation |
| `createdAt` | string | Yes | ISO 8601 format | Timestamp when requirement was created |
| `lastModifiedAt` | string | Yes | ISO 8601 format | Timestamp of last edit |

### 4.3 Validation Rules

- **id**:
  - Must be unique across all requirements
  - Recommended format: UUID v4 (e.g., using `crypto.randomUUID()`)
  - Immutable after creation

- **description**:
  - Must not be empty or contain only whitespace
  - Maximum length: 500 characters
  - Special characters are allowed
  - Trim whitespace before validation and storage

- **effort**:
  - Must be a positive number greater than 0
  - Minimum value: 0.1
  - Maximum value: 1000
  - Must be a valid JavaScript number (not NaN or Infinity)
  - Decimal values are allowed (e.g., 0.5, 2.5, 13.75)
  - Store as number type in JSON (not string)

- **isActive**:
  - Must be boolean type (true or false)
  - Default value for new requirements: `true`
  - Controls inclusion in total effort calculation

- **createdAt**:
  - Must be a valid ISO 8601 timestamp string
  - Generated using `new Date().toISOString()`
  - Immutable after creation

- **lastModifiedAt**:
  - Must be a valid ISO 8601 timestamp string
  - Updated whenever requirement is edited
  - Initially same as `createdAt`

### 4.4 Array Structure

Requirements are stored as a JSON array. The array should be treated as an ordered list where:
- New requirements are appended to the end
- Display order follows array order (newest at bottom)
- Deletion removes the element from the array

### 4.5 JSON Example

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "description": "User authentication and login system",
    "effort": 8,
    "isActive": true,
    "createdAt": "2025-12-19T10:30:00.000Z",
    "lastModifiedAt": "2025-12-19T10:30:00.000Z"
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "description": "Shopping cart functionality",
    "effort": 13.5,
    "isActive": true,
    "createdAt": "2025-12-19T11:15:00.000Z",
    "lastModifiedAt": "2025-12-19T14:20:00.000Z"
  },
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "description": "Payment gateway integration",
    "effort": 20,
    "isActive": false,
    "createdAt": "2025-12-19T12:00:00.000Z",
    "lastModifiedAt": "2025-12-19T13:45:00.000Z"
  }
]
```

### 4.6 Empty State

When no requirements exist:
```json
[]
```

---

## 5. User Preferences Entity

### 5.1 Data Structure

**Storage Key**: `req-tracker:preferences`

**TypeScript Interface**:
```typescript
interface UserPreferences {
  effortColumnVisible: boolean;
  showTotalWhenEffortHidden: boolean;
}
```

### 5.2 Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `effortColumnVisible` | boolean | Yes | true or false | Whether the effort column is displayed in the requirements list |
| `showTotalWhenEffortHidden` | boolean | Yes | true or false | Whether total effort summary is visible when effort column is hidden |

### 5.3 Validation Rules

- **effortColumnVisible**:
  - Must be boolean type
  - Default value: `true`
  - Controls visibility of the effort column in requirements table

- **showTotalWhenEffortHidden**:
  - Must be boolean type
  - Default value: `true`
  - Only relevant when `effortColumnVisible` is `false`

### 5.4 JSON Example

```json
{
  "effortColumnVisible": false,
  "showTotalWhenEffortHidden": true
}
```

### 5.5 Default Values

When no preferences exist (first-time use):
```json
{
  "effortColumnVisible": true,
  "showTotalWhenEffortHidden": true
}
```

---

## 6. Data Operations

### 6.1 Create Operations

#### 6.1.1 Create Project
```typescript
function createProject(name: string): Project {
  const now = new Date().toISOString();
  const project: Project = {
    name: name.trim() || "Untitled Project",
    createdAt: now,
    lastModifiedAt: now
  };

  localStorage.setItem('req-tracker:project', JSON.stringify(project));
  return project;
}
```

#### 6.1.2 Create Requirement
```typescript
function createRequirement(description: string, effort: number): Requirement {
  const now = new Date().toISOString();
  const requirement: Requirement = {
    id: crypto.randomUUID(),
    description: description.trim(),
    effort: effort,
    isActive: true,
    createdAt: now,
    lastModifiedAt: now
  };

  const requirements = getRequirements();
  requirements.push(requirement);
  localStorage.setItem('req-tracker:requirements', JSON.stringify(requirements));

  return requirement;
}
```

### 6.2 Read Operations

#### 6.2.1 Get Project
```typescript
function getProject(): Project | null {
  const data = localStorage.getItem('req-tracker:project');
  if (!data) return null;

  try {
    return JSON.parse(data) as Project;
  } catch (error) {
    console.error('Failed to parse project data:', error);
    return null;
  }
}
```

#### 6.2.2 Get All Requirements
```typescript
function getRequirements(): Requirement[] {
  const data = localStorage.getItem('req-tracker:requirements');
  if (!data) return [];

  try {
    return JSON.parse(data) as Requirement[];
  } catch (error) {
    console.error('Failed to parse requirements data:', error);
    return [];
  }
}
```

#### 6.2.3 Get Requirement by ID
```typescript
function getRequirementById(id: string): Requirement | null {
  const requirements = getRequirements();
  return requirements.find(req => req.id === id) || null;
}
```

#### 6.2.4 Get Preferences
```typescript
function getPreferences(): UserPreferences {
  const data = localStorage.getItem('req-tracker:preferences');
  if (!data) {
    return {
      effortColumnVisible: true,
      showTotalWhenEffortHidden: true
    };
  }

  try {
    return JSON.parse(data) as UserPreferences;
  } catch (error) {
    console.error('Failed to parse preferences:', error);
    return {
      effortColumnVisible: true,
      showTotalWhenEffortHidden: true
    };
  }
}
```

### 6.3 Update Operations

#### 6.3.1 Update Project Name
```typescript
function updateProjectName(newName: string): void {
  const project = getProject();
  if (!project) return;

  project.name = newName.trim() || "Untitled Project";
  project.lastModifiedAt = new Date().toISOString();

  localStorage.setItem('req-tracker:project', JSON.stringify(project));
}
```

#### 6.3.2 Update Requirement
```typescript
function updateRequirement(id: string, updates: Partial<Requirement>): void {
  const requirements = getRequirements();
  const index = requirements.findIndex(req => req.id === id);

  if (index === -1) return;

  requirements[index] = {
    ...requirements[index],
    ...updates,
    id: requirements[index].id, // Prevent ID change
    createdAt: requirements[index].createdAt, // Prevent createdAt change
    lastModifiedAt: new Date().toISOString()
  };

  localStorage.setItem('req-tracker:requirements', JSON.stringify(requirements));
}
```

#### 6.3.3 Toggle Requirement Status
```typescript
function toggleRequirementStatus(id: string): void {
  const requirements = getRequirements();
  const index = requirements.findIndex(req => req.id === id);

  if (index === -1) return;

  requirements[index].isActive = !requirements[index].isActive;
  requirements[index].lastModifiedAt = new Date().toISOString();

  localStorage.setItem('req-tracker:requirements', JSON.stringify(requirements));
}
```

#### 6.3.4 Update Preferences
```typescript
function updatePreferences(updates: Partial<UserPreferences>): void {
  const preferences = getPreferences();
  const newPreferences = { ...preferences, ...updates };

  localStorage.setItem('req-tracker:preferences', JSON.stringify(newPreferences));
}
```

### 6.4 Delete Operations

#### 6.4.1 Delete Requirement
```typescript
function deleteRequirement(id: string): void {
  const requirements = getRequirements();
  const filtered = requirements.filter(req => req.id !== id);

  localStorage.setItem('req-tracker:requirements', JSON.stringify(filtered));
}
```

#### 6.4.2 Clear All Data
```typescript
function clearAllData(): void {
  localStorage.removeItem('req-tracker:project');
  localStorage.removeItem('req-tracker:requirements');
  localStorage.removeItem('req-tracker:preferences');
  // Note: Keep schema-version for migration purposes
}
```

---

## 7. Calculated Data

### 7.1 Total Active Effort

**Not stored in localStorage** - calculated dynamically from requirements array.

**Calculation Logic**:
```typescript
function calculateTotalActiveEffort(): number {
  const requirements = getRequirements();

  const total = requirements
    .filter(req => req.isActive)
    .reduce((sum, req) => sum + req.effort, 0);

  // Round to 2 decimal places to avoid floating point precision issues
  return Math.round(total * 100) / 100;
}
```

**Example**:
- Given requirements with efforts: [5, 10.5, 15, 8.25]
- Active requirements: [5 (active), 10.5 (inactive), 15 (active), 8.25 (active)]
- Total Active Effort: 5 + 15 + 8.25 = 28.25

---

## 8. Data Integrity and Error Handling

### 8.1 Data Validation Before Storage

All data should be validated before writing to localStorage:

```typescript
function validateProject(project: Project): boolean {
  if (!project.name || project.name.trim().length === 0) return false;
  if (project.name.length > 100) return false;
  if (!isValidISODate(project.createdAt)) return false;
  if (!isValidISODate(project.lastModifiedAt)) return false;
  return true;
}

function validateRequirement(req: Requirement): boolean {
  if (!req.id || req.id.trim().length === 0) return false;
  if (!req.description || req.description.trim().length === 0) return false;
  if (req.description.length > 500) return false;
  if (typeof req.effort !== 'number') return false;
  if (req.effort <= 0 || req.effort > 1000) return false;
  if (isNaN(req.effort) || !isFinite(req.effort)) return false;
  if (typeof req.isActive !== 'boolean') return false;
  if (!isValidISODate(req.createdAt)) return false;
  if (!isValidISODate(req.lastModifiedAt)) return false;
  return true;
}

function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date.toISOString() === dateString;
}
```

### 8.2 Handling Corrupted Data

When reading from localStorage, implement fallback strategies:

```typescript
function safeGetProject(): Project {
  const project = getProject();

  if (!project || !validateProject(project)) {
    // Return default project if data is corrupted
    return createProject("Untitled Project");
  }

  return project;
}

function safeGetRequirements(): Requirement[] {
  const requirements = getRequirements();

  // Filter out invalid requirements
  return requirements.filter(req => validateRequirement(req));
}
```

### 8.3 LocalStorage Quota Exceeded

```typescript
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded');
      // Optionally: Show user notification
      return false;
    }
    throw error;
  }
}
```

---

## 9. Data Migration Strategy

### 9.1 Version Check

```typescript
function checkSchemaVersion(): string {
  const version = localStorage.getItem('req-tracker:schema-version');
  return version || '1.0.0';
}

function setSchemaVersion(version: string): void {
  localStorage.setItem('req-tracker:schema-version', version);
}
```

### 9.2 Future Migration Example

```typescript
function migrateData(): void {
  const currentVersion = checkSchemaVersion();

  if (currentVersion === '1.0.0') {
    // Example: Migrate from 1.0.0 to 2.0.0
    // migrateTo2_0_0();
    // setSchemaVersion('2.0.0');
  }
}
```

---

## 10. Storage Size Considerations

### 10.1 Estimated Storage Size

**Per Requirement** (approximate):
- Average description: ~100 characters = ~100 bytes
- Metadata (id, effort, booleans, timestamps): ~200 bytes
- Total per requirement: ~300 bytes

**Storage Capacity**:
- Typical localStorage limit: 5-10 MB
- Estimated capacity: ~16,000-33,000 requirements (theoretical max)
- Practical limit: ~1,000-2,000 requirements for good performance

### 10.2 Data Compression (Future Enhancement)

For applications with large datasets, consider:
- Implementing data compression (e.g., using LZ-string library)
- Archiving old/completed requirements to separate storage keys
- Providing export/import functionality for data backup

---

## 11. Complete Schema Example

### 11.1 Full localStorage State

```json
{
  "req-tracker:schema-version": "1.0.0",

  "req-tracker:project": {
    "name": "Mobile App Development",
    "createdAt": "2025-12-19T10:00:00.000Z",
    "lastModifiedAt": "2025-12-19T10:00:00.000Z"
  },

  "req-tracker:requirements": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "description": "User authentication system",
      "effort": 8,
      "isActive": true,
      "createdAt": "2025-12-19T10:30:00.000Z",
      "lastModifiedAt": "2025-12-19T10:30:00.000Z"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "description": "Push notification service",
      "effort": 5.5,
      "isActive": true,
      "createdAt": "2025-12-19T11:15:00.000Z",
      "lastModifiedAt": "2025-12-19T11:15:00.000Z"
    },
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "description": "Analytics dashboard",
      "effort": 13,
      "isActive": false,
      "createdAt": "2025-12-19T12:00:00.000Z",
      "lastModifiedAt": "2025-12-19T13:45:00.000Z"
    }
  ],

  "req-tracker:preferences": {
    "effortColumnVisible": true,
    "showTotalWhenEffortHidden": true
  }
}
```

### 11.2 Empty/Initial State

```json
{
  "req-tracker:schema-version": "1.0.0",

  "req-tracker:project": {
    "name": "Untitled Project",
    "createdAt": "2025-12-19T10:00:00.000Z",
    "lastModifiedAt": "2025-12-19T10:00:00.000Z"
  },

  "req-tracker:requirements": [],

  "req-tracker:preferences": {
    "effortColumnVisible": true,
    "showTotalWhenEffortHidden": true
  }
}
```

---

## 12. Data Access Patterns

### 12.1 Common Operations and Performance

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Get all requirements | O(1) | Direct localStorage read + JSON parse |
| Get requirement by ID | O(n) | Linear search through array |
| Add requirement | O(n) | Read array, append, write back |
| Update requirement | O(n) | Read array, find and update, write back |
| Delete requirement | O(n) | Read array, filter, write back |
| Calculate total effort | O(n) | Iterate through all requirements |
| Toggle requirement status | O(n) | Read array, find and toggle, write back |

### 12.2 Optimization Strategies

1. **In-Memory Caching**: Keep requirements array in memory during session
2. **Debounced Writes**: Batch multiple updates before writing to localStorage
3. **Indexed Access**: Consider maintaining an ID-to-index map for O(1) lookups

```typescript
class RequirementStore {
  private requirements: Requirement[] = [];
  private idIndex: Map<string, number> = new Map();

  constructor() {
    this.load();
  }

  private load(): void {
    this.requirements = getRequirements();
    this.rebuildIndex();
  }

  private rebuildIndex(): void {
    this.idIndex.clear();
    this.requirements.forEach((req, index) => {
      this.idIndex.set(req.id, index);
    });
  }

  private save(): void {
    localStorage.setItem('req-tracker:requirements',
      JSON.stringify(this.requirements));
  }

  getById(id: string): Requirement | null {
    const index = this.idIndex.get(id);
    return index !== undefined ? this.requirements[index] : null;
  }

  // ... other optimized methods
}
```

---

## 13. Security Considerations

### 13.1 Data Sensitivity

- **No Personal Identifiable Information (PII)**: This application doesn't collect user credentials or personal data
- **Local-Only Storage**: Data never leaves the user's browser
- **No Server Transmission**: No API calls or data synchronization

### 13.2 XSS Prevention

When rendering requirement descriptions:
- Always escape HTML entities
- Use React's built-in XSS protection (dangerouslySetInnerHTML should NOT be used)
- Sanitize input on display (though special characters are allowed in descriptions)

### 13.3 Data Privacy

- Users should be informed that clearing browser data will delete all application data
- Consider providing export functionality for data backup
- No analytics or tracking of user data

---

## 14. Testing Data Schema

### 14.1 Sample Test Data

```typescript
const testData = {
  project: {
    name: "Test Project",
    createdAt: "2025-12-19T10:00:00.000Z",
    lastModifiedAt: "2025-12-19T10:00:00.000Z"
  },

  requirements: [
    {
      id: "test-1",
      description: "Test requirement with small effort",
      effort: 0.5,
      isActive: true,
      createdAt: "2025-12-19T10:00:00.000Z",
      lastModifiedAt: "2025-12-19T10:00:00.000Z"
    },
    {
      id: "test-2",
      description: "Test requirement with large effort",
      effort: 999.99,
      isActive: true,
      createdAt: "2025-12-19T10:00:00.000Z",
      lastModifiedAt: "2025-12-19T10:00:00.000Z"
    },
    {
      id: "test-3",
      description: "Inactive test requirement",
      effort: 10,
      isActive: false,
      createdAt: "2025-12-19T10:00:00.000Z",
      lastModifiedAt: "2025-12-19T10:00:00.000Z"
    }
  ],

  preferences: {
    effortColumnVisible: true,
    showTotalWhenEffortHidden: true
  }
};
```

### 14.2 Edge Cases to Test

1. **Empty project name** → Should default to "Untitled Project"
2. **Maximum length strings** → 100 chars for project, 500 for requirement
3. **Decimal effort values** → 0.5, 13.75, etc.
4. **Minimum effort** → 0.1
5. **Maximum effort** → 1000
6. **Empty requirements array** → []
7. **All requirements inactive** → Total effort = 0
8. **Corrupted JSON in localStorage** → Should fallback to defaults
9. **Missing localStorage keys** → Should initialize with defaults
10. **Special characters in descriptions** → Should be properly stored and retrieved

---

## 15. Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-19 | AI Assistant | Initial data schema documentation |

---

## Appendix: Quick Reference

### Storage Keys
- `req-tracker:schema-version` → Schema version string
- `req-tracker:project` → Project object
- `req-tracker:requirements` → Array of requirement objects
- `req-tracker:preferences` → User preferences object

### Key Constraints
- **Project Name**: 1-100 characters
- **Requirement Description**: 1-500 characters
- **Effort**: 0.1-1000 (decimals allowed)
- **Status**: Boolean (true = active, false = inactive)
- **Timestamps**: ISO 8601 format

### Default Values
- **Project Name**: "Untitled Project"
- **New Requirement Status**: true (active)
- **Effort Column Visible**: true
- **Show Total When Effort Hidden**: true
