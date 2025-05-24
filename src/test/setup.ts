/* eslint-disable @typescript-eslint/require-await */
import { afterAll, beforeAll } from 'bun:test';

// Global test setup - runs once before all test files
beforeAll(async () => {
  console.log('🚀 Starting test suite...');
  // Any global setup can go here
  // Database connection is automatically handled by our db module
});

// Global test teardown - runs once after all test files
afterAll(async () => {
  console.log('🧹 Global cleanup after all tests...');
});

// Note: Database connections are automatically cleaned up when the test process exits
// For most testing scenarios, explicit cleanup is not necessary and can interfere with test execution

// Test utilities that can be used across all test files
export const testUtils = {
  // Helper to create unique test email
  createTestEmail: () => `test-${Date.now()}@example.com`,

  // Helper to create test data
  createTestPost: (authorId: string) => ({
    authorId,
    content: `Test post content created at ${new Date().toISOString()}`,
    title: `Test Post ${Date.now()}`,
  }),

  // Helper to create a test post ID
  createTestPostId: () => `post_test_${Date.now()}`,

  createTestUser: () => ({
    email: `test-${Date.now()}@example.com`,
    name: `Test User ${Date.now()}`,
  }),

  // Helper to create a test user ID
  createTestUserId: () => `user_test_${Date.now()}`,
};
