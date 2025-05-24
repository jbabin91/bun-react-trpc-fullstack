---
applyTo: '**/*.test.{ts,tsx}'
---

# Testing Standards & Patterns

## Testing Framework Setup

This project uses **Bun's built-in test framework** with comprehensive global setup:

### Global Test Configuration

Tests run with global setup via `bunfig.toml`:

```toml
[test]
coverage = true
```

### Preload Setup

All tests use the preload pattern for global lifecycle management:

```bash
# Run tests with global setup
bun test

# Equivalent to:
bun test --preload ./src/test/setup.ts
```

## Test Structure

### File Organization

Tests are co-located with their source files:

```
src/
├── modules/[feature]/
│   ├── api/
│   │   ├── router.ts
│   │   ├── router.test.ts      # API tests
│   │   ├── repository.ts
│   │   └── repository.test.ts  # Database tests
├── routes/
│   ├── users.tsx
│   └── -about.test.tsx         # UI tests (prefix with -)
└── test/
    ├── setup.ts               # Global test setup
    └── ui-setup.tsx           # React testing utilities
```

### Test Categories

1. **Unit Tests**: Pure functions, utilities, schemas
2. **Integration Tests**: Database operations, API routes
3. **Component Tests**: React components with mocked tRPC
4. **Route Tests**: Full page rendering and navigation

## Testing Patterns

### API/Router Testing

Test tRPC routers directly using the caller pattern:

```typescript
import { describe, expect, test } from 'bun:test';
import { helloRouter } from './router';

describe('Hello Router', () => {
  test('should handle hello query', async () => {
    const caller = helloRouter.createCaller({});

    const result = await caller.hello({
      method: 'GET',
      name: 'Test User',
    });

    expect(result).toBeDefined();
    expect(result.message).toBe('Hello, Test User!');
    expect(result.method).toBe('GET');
  });
});
```

### Repository Testing

Test database operations with real database:

```typescript
import { describe, expect, test } from 'bun:test';
import { UserRepository } from './repository';
import { testUtils } from '@/test/setup';

describe('UserRepository', () => {
  test('should create user', async () => {
    const userData = testUtils.createTestUser();
    const user = await UserRepository.create(userData);

    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.name).toBe(userData.name);
  });

  test('should find user by id', async () => {
    const userData = testUtils.createTestUser();
    const createdUser = await UserRepository.create(userData);

    const foundUser = await UserRepository.findById(createdUser.id);
    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(userData.email);
  });
});
```

### Component Testing

Test React components with mocked tRPC:

```typescript
import { describe, expect, test } from 'bun:test';
import { customRenderWithProviders, screen, waitFor } from '@/test/ui-setup';
import { UsersList } from './users-list';

describe('UsersList Component', () => {
  test('renders users list', async () => {
    customRenderWithProviders(<UsersList showActions={true} />);

    await waitFor(() => {
      expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });
  });

  test('handles empty state', async () => {
    const mockTrpcClient = createMockTrpcClient({
      users: {
        list: { query: () => Promise.resolve([]) }
      }
    });

    customRenderWithProviders(<UsersList />, {
      trpcClient: mockTrpcClient
    });

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });
});
```

### Route Testing

Test full page routes:

```typescript
import { describe, expect, test } from 'bun:test';
import { customRenderWithProviders, screen, waitFor } from '@/test/ui-setup';

describe('About Page UI', () => {
  test('renders the about page correctly', async () => {
    customRenderWithProviders(<div>Test</div>, { route: '/about' });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'About Page' })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/this is the about page/i)
    ).toBeInTheDocument();
  });
});
```

## Test Utilities

### Global Test Setup

Available utilities from `@/test/setup`:

```typescript
import { testUtils } from '@/test/setup';

// Create unique test data
const user = testUtils.createTestUser();
const post = testUtils.createTestPost(userId);

// Generate unique IDs
const userId = testUtils.createTestUserId();
const email = testUtils.createTestEmail();
```

### UI Testing Utilities

Custom render functions from `@/test/ui-setup`:

```typescript
import {
  customRenderWithProviders,
  renderRoute,
  screen,
  userEvent
} from '@/test/ui-setup';

// Render component with providers
const { router, user } = customRenderWithProviders(<Component />, {
  route: '/users',
  queryClient: customQueryClient,
});

// Render specific route
renderRoute('/about', { initialRoute: '/about' });
```

### Mock tRPC Client

Create custom mocks for tRPC:

```typescript
import { createMockTrpcClient } from '@/test/ui-setup';

const mockClient = createMockTrpcClient({
  users: {
    list: { query: () => Promise.resolve(mockUsers) },
    create: { mutate: () => Promise.resolve(mockUser) },
  },
});

customRenderWithProviders(<Component />, {
  trpcClient: mockClient
});
```

## Database Testing

### Test Data Strategy

- **Unique data per test**: Uses timestamps to avoid conflicts
- **No cleanup required**: Tests use isolated test data
- **Real database**: Tests run against actual PostgreSQL

### Connection Management

- **Global setup**: Database connection managed in preload setup
- **Automatic cleanup**: Connection closed after all tests complete
- **Shared connection**: All tests use the same database instance

### Example Database Test

```typescript
describe('Database Integration', () => {
  test('should have database connection', async () => {
    const result = await db.execute('SELECT 1 as test');
    expect(result).toBeDefined();
  });

  test('should create and find user', async () => {
    const userData = testUtils.createTestUser();

    // Create user
    const [user] = await db.insert(users).values(userData).returning();
    expect(user.id).toBeDefined();

    // Find user
    const [foundUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id));
    expect(foundUser.email).toBe(userData.email);
  });
});
```

## Validation Testing

### Schema Testing

Test Zod schemas:

```typescript
import { createUserSchema } from '../schemas';

describe('User Schemas', () => {
  test('should validate correct user data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test('should reject invalid email', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'invalid-email',
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('Invalid email');
  });
});
```

## Testing Commands

### Available Scripts

```bash
# Run all tests with global setup
bun test

# Run specific test file
bun test src/modules/users/api/router.test.ts

# Run tests with coverage
bun test --coverage

# Run tests without global setup (debugging)
bun run test:no-setup

# Run database-specific tests
bun run test:db
```

### Coverage Reports

Tests include automatic coverage reporting:

- **Function coverage**: Tracks function execution
- **Line coverage**: Tracks line execution
- **Branch coverage**: Tracks conditional branches
- **Statement coverage**: Tracks statement execution

### Expected Coverage

Target coverage levels:

- **Overall**: >75%
- **Critical paths**: >90%
- **Utilities**: >95%

## Best Practices

### Test Naming

Use descriptive test names:

```typescript
// ✅ Good
test('should create user with valid data', async () => {

// ✅ Good
test('should return 404 when user not found', async () => {

// ❌ Avoid
test('create user', async () => {
test('user test', async () => {
```

### Test Data

Always use test utilities for consistent data:

```typescript
// ✅ Good
const userData = testUtils.createTestUser();

// ❌ Avoid
const userData = { name: 'Test', email: 'test@example.com' };
```

### Async Testing

Use proper async/await patterns:

```typescript
// ✅ Good
test('should create user', async () => {
  const result = await UserRepository.create(userData);
  expect(result).toBeDefined();
});

// ❌ Avoid
test('should create user', () => {
  UserRepository.create(userData).then((result) => {
    expect(result).toBeDefined();
  });
});
```

### Error Testing

Test error conditions:

```typescript
test('should throw error for duplicate email', async () => {
  const userData = testUtils.createTestUser();

  // Create first user
  await UserRepository.create(userData);

  // Attempt to create duplicate should throw
  await expect(UserRepository.create(userData)).rejects.toThrow();
});
```

## Debugging Tests

### Console Output

Add strategic logging for debugging:

```typescript
test('should process data correctly', async () => {
  const input = testUtils.createTestData();
  console.log('Test input:', input);

  const result = await processData(input);
  console.log('Test result:', result);

  expect(result).toBeDefined();
});
```

### Individual Test Execution

Run single tests for focused debugging:

```bash
# Run specific test
bun test --test-name-pattern "should create user"

# Run specific file
bun test src/modules/users/api/router.test.ts
```

### Test Isolation

Ensure tests don't depend on each other:

```typescript
// ✅ Good - Each test creates its own data
test('should find user by email', async () => {
  const userData = testUtils.createTestUser();
  const user = await UserRepository.create(userData);

  const found = await UserRepository.findByEmail(user.email);
  expect(found).toBeDefined();
});

// ❌ Avoid - Depending on data from other tests
test('should find existing user', async () => {
  const found = await UserRepository.findByEmail('test@example.com');
  expect(found).toBeDefined(); // May fail if other test didn't run
});
```
