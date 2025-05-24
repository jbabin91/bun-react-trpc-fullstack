---
applyTo: '**/*.ts'
---

# API Development Standards

## tRPC Architecture

This project uses **tRPC** for type-safe client-server communication with the following patterns:

### Router Structure

Follow the modular architecture pattern:

```typescript
// src/modules/[feature]/api/router.ts
import { publicProcedure, router } from '@/server/trpc';
import { insertUserSchema } from '@/db/schema/users';

export const usersRouter = router({
  create: publicProcedure
    .input(
      insertUserSchema.omit({ createdAt: true, id: true, updatedAt: true }),
    )
    .mutation(async ({ input }) => {
      return await UserRepository.create(input);
    }),

  list: publicProcedure.query(async () => {
    return await UserRepository.findAll();
  }),
});
```

### Input Validation

- **Always use Zod schemas** for input validation
- **Reuse database schemas** when possible with `.omit()` for auto-generated fields
- **Create custom schemas** in `modules/[feature]/schemas/` for complex validation

```typescript
// Custom validation schemas
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
});

// Database schema reuse
.input(insertUserSchema.omit({ createdAt: true, id: true, updatedAt: true }))
```

### Repository Pattern

Use the repository pattern for database operations:

```typescript
// src/modules/[feature]/api/repository.ts
export class UserRepository {
  static async create(userData: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  static async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  }
}
```

## Procedure Types

### Queries vs Mutations

- **Queries**: For read operations (GET-like)
- **Mutations**: For write operations (POST/PUT/DELETE-like)

```typescript
export const usersRouter = router({
  // Query for read operations
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await UserRepository.findById(input.id);
    }),

  // Mutation for write operations
  create: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input }) => {
      return await UserRepository.create(input);
    }),
});
```

### Error Handling

Use tRPC's built-in error handling:

```typescript
import { TRPCError } from '@trpc/server';

// In repository methods
static async findById(id: string): Promise<User> {
  const user = await db.select().from(users).where(eq(users.id, id));

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User not found',
    });
  }

  return user;
}
```

## Client-Side Integration

### tRPC Client Setup

Use the established client pattern:

```typescript
// In React components
import { useTRPC } from '@/lib/trpc';

function UserComponent() {
  const trpc = useTRPC();

  // Queries
  const users = useQuery(trpc.users.list.queryOptions());

  // Mutations
  const createUser = useMutation(
    trpc.users.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.users.list.queryKey() });
      },
    }),
  );
}
```

### Custom Hooks Pattern

Create reusable hooks in `modules/[feature]/hooks/`:

```typescript
// src/modules/users/hooks/index.ts
export function useUsers() {
  const trpc = useTRPC();
  return useQuery(trpc.users.list.queryOptions());
}

export function useCreateUser() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.users.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.users.list.queryKey() });
      },
    }),
  );
}
```

## Router Composition

### Main Router

All feature routers are combined in `src/server/router.ts`:

```typescript
import { helloRouter } from '@/modules/hello/api/router';
import { postsRouter } from '@/modules/posts/api/router';
import { usersRouter } from '@/modules/users/api/router';
import { router } from './trpc';

export const appRouter = router({
  hello: helloRouter,
  posts: postsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
```

### Server Setup

tRPC server is configured in `src/index.tsx`:

```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/router';

const server = serve({
  routes: {
    '/api/trpc/*': (req) => {
      return fetchRequestHandler({
        createContext: () => ({}),
        endpoint: '/api/trpc',
        req,
        router: appRouter,
      });
    },
  },
});
```

## Database Integration

### Schema-First Development

1. **Define database schema** in `src/db/schema/[feature].ts`
2. **Generate Zod schemas** from database with `drizzle-zod`
3. **Use generated schemas** in tRPC procedures

```typescript
// Database schema automatically generates Zod schemas
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
```

### Relationship Handling

Use Drizzle's relationship features for complex queries:

```typescript
// Get user with posts
static async getUserWithPosts(id: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      posts: true,
    },
  });
}
```

## Testing APIs

### Router Testing

Test tRPC routers directly:

```typescript
import { helloRouter } from './router';

describe('Hello Router', () => {
  test('should handle hello query', async () => {
    const caller = helloRouter.createCaller({});
    const result = await caller.hello({ name: 'Test' });

    expect(result.message).toBe('Hello, Test!');
  });
});
```

### Repository Testing

Test repository methods with real database:

```typescript
import { UserRepository } from './repository';
import { testUtils } from '@/test/setup';

describe('UserRepository', () => {
  test('should create user', async () => {
    const userData = testUtils.createTestUser();
    const user = await UserRepository.create(userData);

    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
  });
});
```

## Performance Considerations

### Query Optimization

- Use specific `select()` clauses instead of selecting all columns
- Implement pagination for large datasets
- Use database indexes for frequently queried fields

### Caching Strategy

- Leverage TanStack Query's caching on the client
- Use `queryKey` patterns for proper cache invalidation
- Consider server-side caching for expensive operations

## Documentation Standards

- **Document complex procedures** with JSDoc comments
- **Include input/output examples** in comments
- **Document error cases** and expected responses
- **Keep router exports clean** and well-organized
