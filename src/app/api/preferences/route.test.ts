/**
 * Preferences API Tests
 *
 * Tests for:
 * - GET /api/preferences
 * - PUT /api/preferences
 */

import { GET, PUT } from './route';
import { NextRequest } from 'next/server';
import {
  assertSuccessResponse,
  assertErrorResponse,
  UserPreferences,
} from '@/__tests__/utils/testHelpers';

// Helper to create a mock NextRequest
function createMockRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost:3000/api/preferences';
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

describe('Preferences API Tests', () => {
  describe('GET /api/preferences', () => {
    test('5.1.1: GET /api/preferences - should return default preferences', async () => {
      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      assertSuccessResponse<UserPreferences>(
        { body: data },
        {
          effortColumnVisible: true,
          showTotalWhenEffortHidden: true,
          language: 'en',
        }
      );
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('lastUpdatedAt');
    });

    test('5.1.2: GET /api/preferences - should return saved preferences', async () => {
      // Arrange - Update preferences first
      const putRequest = createMockRequest('PUT', {
        effortColumnVisible: false,
        language: 'th',
      });
      await PUT(putRequest);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      assertSuccessResponse<UserPreferences>(
        { body: data },
        {
          effortColumnVisible: false,
          language: 'th',
        }
      );
    });
  });

  describe('PUT /api/preferences', () => {
    test('5.2.1: PUT /api/preferences - should update effort column visibility', async () => {
      // Act
      const request = createMockRequest('PUT', { effortColumnVisible: false });
      const response = await PUT(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      assertSuccessResponse<UserPreferences>(
        { body: data },
        {
          effortColumnVisible: false,
        }
      );

      // Verify persistence
      const getResponse = await GET();
      const getData = await getResponse.json();
      expect(getData.data.effortColumnVisible).toBe(false);
    });

    test('5.2.2: PUT /api/preferences - should update language preference', async () => {
      // Act - Set to Thai
      const request1 = createMockRequest('PUT', { language: 'th' });
      const response1 = await PUT(request1);
      const data1 = await response1.json();

      // Assert Thai
      expect(response1.status).toBe(200);
      expect(data1.data.language).toBe('th');

      // Act - Set back to English
      const request2 = createMockRequest('PUT', { language: 'en' });
      const response2 = await PUT(request2);
      const data2 = await response2.json();

      // Assert English
      expect(response2.status).toBe(200);
      expect(data2.data.language).toBe('en');
    });

    test('5.2.3: PUT /api/preferences - should update multiple preferences', async () => {
      // Act
      const request = createMockRequest('PUT', {
        effortColumnVisible: false,
        showTotalWhenEffortHidden: false,
        language: 'th',
      });
      const response = await PUT(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      assertSuccessResponse<UserPreferences>(
        { body: data },
        {
          effortColumnVisible: false,
          showTotalWhenEffortHidden: false,
          language: 'th',
        }
      );
    });

    test('5.2.4: PUT /api/preferences - should reject invalid language', async () => {
      // Act
      const request = createMockRequest('PUT', { language: 'fr' });
      const response = await PUT(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      assertErrorResponse(
        { body: data },
        'VALIDATION_ERROR',
        'must be "en" or "th"'
      );
    });

    test('5.2.5: PUT /api/preferences - should preserve unmodified fields', async () => {
      // Arrange
      const setupRequest = createMockRequest('PUT', {
        effortColumnVisible: false,
        showTotalWhenEffortHidden: true,
        language: 'th',
      });
      await PUT(setupRequest);

      // Act - Update only language
      const request = createMockRequest('PUT', { language: 'en' });
      const response = await PUT(request);
      const data = await response.json();

      // Assert - Other fields unchanged
      expect(response.status).toBe(200);
      expect(data.data.effortColumnVisible).toBe(false);
      expect(data.data.showTotalWhenEffortHidden).toBe(true);
      expect(data.data.language).toBe('en');
    });

    test('5.2.6: PUT /api/preferences - should update lastUpdatedAt timestamp', async () => {
      // Arrange
      const initialResponse = await GET();
      const initialData = await initialResponse.json();
      const initialTimestamp = initialData.data.lastUpdatedAt;

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Act
      const request = createMockRequest('PUT', { effortColumnVisible: false });
      const response = await PUT(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.data.lastUpdatedAt).not.toBe(initialTimestamp);
      expect(new Date(data.data.lastUpdatedAt).getTime()).toBeGreaterThan(
        new Date(initialTimestamp).getTime()
      );
    });

    test('5.2.7: PUT /api/preferences - should reject non-boolean values', async () => {
      // Act
      const request = createMockRequest('PUT', {
        effortColumnVisible: 'yes' as any,
      });
      const response = await PUT(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      assertErrorResponse({ body: data }, 'VALIDATION_ERROR', 'must be a boolean');
    });
  });
});
