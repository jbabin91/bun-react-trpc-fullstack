---
applyTo: '**/{schemas,validation}/**/*.{ts,tsx}'
---

# Validation Standards with Zod

## Validation Architecture

This project uses **Zod v4** for comprehensive validation across all layers:

- **API Input Validation**: tRPC procedure inputs
- **Form Validation**: React Hook Form integration
- **Database Schema Validation**: Generated from Drizzle schemas
- **Type Safety**: TypeScript types inferred from Zod schemas

## Schema Organization

### Module-Based Schema Structure

Organize validation schemas within feature modules:

```
src/modules/[feature]/
├── schemas/
│   └── index.ts           # Feature-specific validation schemas
├── api/
│   └── router.ts          # Uses schemas for tRPC validation
└── components/
    └── forms.tsx          # Uses schemas for form validation
```

### Database Schema Integration

Leverage Drizzle-generated schemas:

```typescript
// src/db/schema/users.ts
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Automatically generates Zod schemas from database table
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

## Schema Patterns

### Custom Validation Schemas

Create feature-specific schemas in `modules/[feature]/schemas/`:

```typescript
// src/modules/users/schemas/index.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

export const updateUserSchema = createUserSchema.partial();

export const userIdSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

// Type inference
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
```

### Schema Composition

Build complex schemas from simpler ones:

```typescript
// Base schemas
const basePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
});

// Composed schemas
export const createPostSchema = basePostSchema.extend({
  authorId: z.string().min(1, 'Author is required'),
});

export const updatePostSchema = z.object({
  id: z.string(),
  data: basePostSchema.partial(),
});

// Query schemas
export const getPostsQuerySchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  authorId: z.string().optional(),
});
```

### Schema Reuse Patterns

Reuse database schemas with modifications:

```typescript
// Reuse database schema with omissions
export const createUserApiSchema = insertUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Extend database schema with additional validation
export const createUserFormSchema = insertUserSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    confirmPassword: z.string().min(8, 'Password confirmation required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
```

## tRPC Integration

### Input Validation

Always validate tRPC procedure inputs:

```typescript
// src/modules/users/api/router.ts
import { publicProcedure, router } from '@/server/trpc';
import { createUserSchema, userIdSchema } from '../schemas';

export const usersRouter = router({
  create: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input }) => {
      // input is fully typed and validated
      return await UserRepository.create(input);
    }),

  getById: publicProcedure.input(userIdSchema).query(async ({ input }) => {
    return await UserRepository.findById(input.id);
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: createUserSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      return await UserRepository.update(input.id, input.data);
    }),
});
```

### Custom Error Messages

Provide user-friendly error messages:

```typescript
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Post title is required')
    .max(200, 'Title must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\-,.!?]+$/, 'Title contains invalid characters'),

  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(5000, 'Content must be less than 5000 characters'),

  authorId: z
    .string()
    .min(1, 'Author selection is required')
    .regex(/^user_/, 'Invalid author ID format'),
});
```

## Form Validation

// Note: React Hook Form's zodResolver requires Zod v3; define form schemas using Zod v3 for correct integration

### React Hook Form Integration

Use Zod schemas with React Hook Form:

```typescript
// src/modules/users/components/create-user-form.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createUserSchema, type CreateUserInput } from '../schemas';

export function CreateUserForm() {
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const onSubmit = async (data: CreateUserInput) => {
    // data is fully typed and validated
    await createUser.mutateAsync(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage /> {/* Shows Zod validation errors */}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

### Dynamic Validation

Implement conditional validation:

```typescript
export const createPostSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    isDraft: z.boolean().default(false),
    publishDate: z.date().optional(),
  })
  .refine(
    (data) => {
      // If not draft, publish date is required
      if (!data.isDraft && !data.publishDate) {
        return false;
      }
      return true;
    },
    {
      message: 'Publish date is required for published posts',
      path: ['publishDate'],
    },
  );
```

## Advanced Validation Patterns

### Custom Validators

Create reusable custom validators:

```typescript
// Custom email domain validator
const emailWithDomainSchema = z
  .string()
  .email('Invalid email format')
  .refine((email) => {
    const allowedDomains = ['company.com', 'partner.org'];
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  }, 'Email must be from an approved domain');

// Custom ID format validator
const userIdSchema = z
  .string()
  .regex(/^user_[a-zA-Z0-9]{12}$/, 'Invalid user ID format');
```

### Transform and Sanitize

Clean data during validation:

```typescript
export const createUserSchema = z.object({
  name: z
    .string()
    .trim() // Remove whitespace
    .min(1, 'Name is required')
    .transform(
      (name) => name.replace(/\s+/g, ' '), // Normalize spaces
    ),

  email: z
    .string()
    .email('Invalid email')
    .toLowerCase() // Normalize to lowercase
    .trim(),

  tags: z.array(z.string()).transform(
    (tags) => [...new Set(tags.map((tag) => tag.trim().toLowerCase()))], // Dedupe and normalize
  ),
});
```

### Union and Discriminated Unions

Handle multiple data types:

```typescript
// Simple union
const idSchema = z.union([z.string().min(1), z.number().positive()]);

// Discriminated union for different post types
const postSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('article'),
    title: z.string(),
    content: z.string(),
    readTime: z.number(),
  }),
  z.object({
    type: z.literal('video'),
    title: z.string(),
    videoUrl: z.string().url(),
    duration: z.number(),
  }),
]);
```

## Error Handling

### Validation Error Processing

Handle validation errors gracefully:

```typescript
import { ZodError } from 'zod';

function processValidationError(error: ZodError) {
  const fieldErrors: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const field = issue.path.join('.');
    fieldErrors[field] = issue.message;
  });

  return fieldErrors;
}

// In API error handler
catch (error) {
  if (error instanceof ZodError) {
    return {
      success: false,
      errors: processValidationError(error),
    };
  }
  throw error;
}
```

### Custom Error Messages

Provide context-specific error messages:

```typescript
export const updateUserSchema = z.object({
  id: z.string().min(1, 'User ID is required for updates'),
  data: z
    .object({
      name: z
        .string()
        .min(1, 'Name cannot be empty')
        .max(100, 'Name is too long (maximum 100 characters)'),
      email: z
        .string()
        .email('Please enter a valid email address')
        .max(255, 'Email address is too long'),
    })
    .partial()
    .refine(
      (data) => {
        return Object.keys(data).length > 0;
      },
      {
        message: 'At least one field must be provided for update',
      },
    ),
});
```

## Testing Validation

### Schema Testing

Test validation schemas thoroughly:

```typescript
import { describe, expect, test } from 'bun:test';
import { createUserSchema } from '../schemas';

describe('User Validation', () => {
  test('should validate correct user data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe('John Doe');
      expect(result.data.email).toBe('john@example.com');
    }
  });

  test('should reject invalid email', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'invalid-email',
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Invalid email');
    }
  });

  test('should sanitize input data', () => {
    const messyData = {
      name: '  John   Doe  ',
      email: '  JOHN@EXAMPLE.COM  ',
    };

    const result = createUserSchema.safeParse(messyData);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe('John Doe');
      expect(result.data.email).toBe('john@example.com');
    }
  });
});
```

### API Validation Testing

Test tRPC input validation:

```typescript
describe('Users API Validation', () => {
  test('should reject invalid input', async () => {
    const caller = usersRouter.createCaller({});

    await expect(
      caller.create({
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid: bad email format
      }),
    ).rejects.toThrow();
  });

  test('should accept valid input', async () => {
    const caller = usersRouter.createCaller({});

    const result = await caller.create({
      name: 'Valid Name',
      email: 'valid@example.com',
    });

    expect(result.id).toBeDefined();
  });
});
```

## Performance Considerations

### Schema Compilation

For frequently used schemas, consider pre-compilation:

```typescript
// Pre-compile schemas for better performance
const compiledUserSchema = createUserSchema._def;

// Use in high-frequency validation
export function validateUserFast(data: unknown) {
  return createUserSchema.safeParse(data);
}
```

### Lazy Validation

Use lazy validation for optional or conditional fields:

```typescript
const heavyValidationSchema = z.lazy(() =>
  z.object({
    data: z.array(expensiveNestedSchema),
    metadata: z.record(z.unknown()),
  }),
);
```

## Best Practices

### Schema Documentation

Document complex validation rules:

```typescript
/**
 * User creation schema with business rules:
 * - Name: 1-100 characters, trimmed
 * - Email: Valid format, lowercase, unique
 * - Password: 8+ characters with complexity requirements
 */
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
  // ... rest of schema
});
```

### Error Message Consistency

Use consistent error message patterns:

```typescript
const ERROR_MESSAGES = {
  REQUIRED: (field: string) => `${field} is required`,
  TOO_SHORT: (field: string, min: number) =>
    `${field} must be at least ${min} characters`,
  TOO_LONG: (field: string, max: number) =>
    `${field} must be less than ${max} characters`,
  INVALID_FORMAT: (field: string) => `${field} format is invalid`,
} as const;

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED('Name'))
    .max(100, ERROR_MESSAGES.TOO_LONG('Name', 100)),
  email: z.string().email(ERROR_MESSAGES.INVALID_FORMAT('Email')),
});
```

### Schema Versioning

Plan for schema evolution:

```typescript
// Version schemas for API compatibility
export const createUserSchemaV1 = z.object({
  name: z.string(),
  email: z.string().email(),
});

export const createUserSchemaV2 = createUserSchemaV1.extend({
  phoneNumber: z.string().optional(),
});

// Current version
export const createUserSchema = createUserSchemaV2;
```
