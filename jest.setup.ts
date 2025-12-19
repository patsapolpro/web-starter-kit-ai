// Jest setup file for test environment configuration
import '@jest/globals';
import * as dotenv from 'dotenv';
import { setupTestDatabase, teardownTestDatabase, truncateTables, seedDefaultPreferences } from './src/__tests__/utils/testHelpers';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global setup before all tests
beforeAll(async () => {
  await setupTestDatabase();
  await truncateTables();
});

// Global teardown after all tests
afterAll(async () => {
  await teardownTestDatabase();
});

// Reset database before each test
beforeEach(async () => {
  await truncateTables();
  await seedDefaultPreferences();
});

// Extend Jest timeout for database operations
jest.setTimeout(10000);
