# Bun Test Setup Guide

## Overview

This document explains the test setup configuration for Bun test framework in our React + PostgreSQL project.

## Test Configuration

### bunfig.toml Configuration

The project includes test-specific configuration in `bunfig.toml`:

```toml
[test]
coverage = true
```

This configuration:

- Sets a 10-second timeout for all tests
- Enables coverage reporting by default

### Test Setup Architecture

#### Global Test Setup with Preload

Bun supports global test setup through the `--preload` flag. Our setup file `src/test/setup.ts` includes:

1. **Global beforeAll**: Runs once before all test files start
2. **Global afterAll**: Runs once after all test files complete (handles database cleanup)
3. **Test Utilities**: Reusable helper functions for creating test data

#### Package.json Scripts

```json
{
  "scripts": {
    "test": "bun test --preload ./src/test/setup.ts",
    "test:db": "bun test src/db/integration.test.ts --preload ./src/test/setup.ts",
    "test:no-setup": "bun test"
  }
}
```

#### Global Setup Features

- **🚀 Startup Message**: Logs when test suite begins
- **🧹 Automatic Cleanup**: Closes database connections after all tests
- **📊 Coverage Reporting**: Enabled by default
- **⏱️ Timeout Management**: 10-second default timeout

#### Shared Test Utilities

We use a centralized test setup file at `src/test/setup.ts` that provides:

1. **Test Utilities**: Reusable helper functions for creating test data
2. **Consistent Test Data**: Standardized test data generation with proper naming

#### Test Utilities Available

```typescript
import { testUtils } from '@/test/setup';

// Available utilities:
testUtils.createTestEmail(); // Generates unique test email
testUtils.createTestUser(); // Creates test user object
testUtils.createTestUserId(); // Generates test user ID
testUtils.createTestPost(authorId); // Creates test post object
testUtils.createTestPostId(); // Generates test post ID
```

## Test Structure

### Co-located Tests

Tests are organized alongside their corresponding code:

```sh
src/
├── server/routers/
│   ├── users.ts
│   ├── users.test.ts      # Tests for users router
│   ├── posts.ts
│   └── posts.test.ts      # Tests for posts router
└── db/
    ├── index.ts
    └── integration.test.ts # Database integration tests
```

### Test File Pattern

All test files follow the Bun test framework patterns:

```typescript
import { describe, expect, test } from 'bun:test';
import { testUtils } from '@/test/setup';

describe('ComponentName', () => {
  test('should do something', async () => {
    // Use testUtils for consistent test data
    const testData = testUtils.createTestUser();

    // Test implementation
    expect(result).toBeDefined();
  });
});
```

## Database Testing Considerations

### Connection Management

- **Global Cleanup**: Database connections are automatically closed in the global `afterAll` hook
- **Preload Setup**: Connection management happens in the preloaded setup file
- **Shared Connection**: All tests share the same database connection instance
- **No Manual Cleanup**: Individual test files don't need to handle connection cleanup

### Test Data Strategy

- **Isolated Test Data**: Each test creates its own unique test data using timestamps
- **No Cleanup**: Tests don't clean up their data, relying on a test database
- **Nanoid Integration**: Test utilities work with our custom nanoid ID system

## Running Tests

### Basic Commands

```bash
# Run all tests with global setup
bun test

# Run all tests with global setup (explicit)
bun test --preload ./src/test/setup.ts

# Run tests without global setup
bun test:no-setup

# Run with specific timeout
bun test --timeout 15000

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test src/server/routers/users.test.ts

# Run tests matching pattern
bun test --test-name-pattern "should create"
```

### Package.json Scripts

The project includes these test scripts:

```json
{
  "scripts": {
    "test": "bun test --preload ./src/test/setup.ts",
    "test:db": "bun test src/db/integration.test.ts --preload ./src/test/setup.ts",
    "test:no-setup": "bun test"
  }
}
```

## Best Practices

### 1. Use Test Utilities

Always use the shared test utilities for consistent test data:

```typescript
// ✅ Good
const userData = testUtils.createTestUser();

// ❌ Avoid
const userData = { email: 'test@example.com', name: 'Test' };
```

### 2. Descriptive Test Names

Use descriptive test names that explain the expected behavior:

```typescript
// ✅ Good
test('should create a new user with valid data', async () => {

// ❌ Avoid
test('create user', async () => {
```

### 3. Unique Test Data

Ensure each test uses unique data to avoid conflicts:

```typescript
// ✅ Good - testUtils includes timestamps
const user = testUtils.createTestUser();

// ❌ Avoid - static data can cause conflicts
const user = { email: 'test@example.com', name: 'Test User' };
```

### 4. Async/Await Patterns

Use proper async/await patterns for database operations:

```typescript
test('should find user by email', async () => {
  const user = await UserRepository.findByEmail('test@example.com');
  expect(user).toBeDefined();
});
```

## Debugging Tests

### Verbose Output

Add console.log statements for debugging:

```typescript
test('should create user', async () => {
  const userData = testUtils.createTestUser();
  console.log('Creating user with data:', userData);

  const result = await UserRepository.create(userData);
  console.log('Created user:', result);
});
```

### Individual Test Execution

Run individual tests for faster debugging:

```bash
bun test src/server/routers/users.test.ts
```

## Coverage Reports

The test setup includes coverage reporting. After running tests, you'll see:

- Function coverage percentage
- Line coverage percentage
- Uncovered line numbers for each file

This helps identify areas that need additional test coverage.

## Troubleshooting

### Common Issues

1. **Connection Errors**: Ensure PostgreSQL is running and the DATABASE_URL is correct
2. **Timeout Issues**: Increase timeout with `--timeout` flag if tests are slow
3. **Import Errors**: Verify path aliases are correctly configured in tsconfig.json

### Environment Setup

Ensure your `.env` file contains the correct database configuration:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
```
