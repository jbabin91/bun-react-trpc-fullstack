# Database Setup with Drizzle ORM

This project uses Drizzle ORM with PostgreSQL for database operations, integrated with tRPC for full-stack type safety.

> **Migration Complete!** This project has been successfully migrated from SQLite to PostgreSQL with enhanced ID generation using nanoid and comprehensive Bun-based testing.

## 🏗️ Architecture

- **Database**: PostgreSQL (via postgres-js)
- **ORM**: Drizzle ORM
- **Schema Management**: Drizzle Kit
- **API Layer**: tRPC with Zod validation
- **Frontend**: React with TanStack Query
- **ID Generation**: Custom nanoid with entity prefixes
- **Testing**: Bun test framework with co-located tests

## 📦 Installed Packages

- `drizzle-orm` - The main ORM package
- `drizzle-kit` - Development tool for migrations and schema management
- `drizzle-zod` - Integration with Zod for schema validation
- `postgres` - PostgreSQL client compatible with Bun
- `nanoid` - Secure, URL-friendly unique ID generator

## 📁 File Structure

```sh
src/db/
├── index.ts              # Database connection and Drizzle instance (PostgreSQL)
├── seed.ts               # Seed script for initial data with nanoid IDs
├── integration.test.ts   # Database integration tests
└── schema/
    ├── index.ts          # Schema exports
    ├── users.ts          # Users table schema and relations (PostgreSQL)
    └── posts.ts          # Posts table schema and relations (PostgreSQL)

src/lib/
└── nanoid.ts             # Custom nanoid configuration with entity prefixes

src/server/routers/
├── index.ts              # Router exports
├── users.ts              # Users router with repository and tRPC procedures
├── users.test.ts         # Users router tests (Bun test)
├── posts.ts              # Posts router with repository and tRPC procedures
└── posts.test.ts         # Posts router tests (Bun test)
```

## 🗄️ Database Schema

The database includes two main tables with PostgreSQL-optimized types:

### Users Table

- `id` (Text, Primary Key, nanoid with 'user\_' prefix)
- `name` (Text, Required)
- `email` (Text, Required, Unique)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Posts Table

- `id` (Text, Primary Key, nanoid with 'post\_' prefix)
- `title` (Text, Required)
- `content` (Text, Required)
- `authorId` (Text, Foreign Key to Users, nanoid)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### 🆔 ID Generation

The project uses custom nanoid-based IDs with entity prefixes:

- **User IDs**: `user_RkG8BWFdwMGr` (16 characters after prefix)
- **Post IDs**: `post_92neQgAfe45C` (16 characters after prefix)
- **Custom Alphabet**: `123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz` (no ambiguous characters)

Benefits:

- **URL-safe**: No special characters that need encoding
- **Collision-resistant**: Cryptographically secure randomness
- **Sortable**: Roughly time-ordered when generated sequentially
- **Type-safe**: Easy to distinguish entity types by prefix

### 🧪 Testing

The project uses Bun's built-in test framework with tests co-located with their corresponding router files:

### Test Structure

- **Integration Tests**: `src/db/integration.test.ts` - Database connection and schema validation
- **Router Tests**: `src/server/routers/*.test.ts` - Co-located with router files
- **Repository Testing**: Direct testing of database operations through repository classes

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test src/server/routers/users.test.ts
bun test src/server/routers/posts.test.ts
bun test src/db/integration.test.ts

# Test with coverage
bun test --coverage
```

### Test Features

- **Database Connection Management**: Proper cleanup to prevent hanging processes
- **Type Safety**: Full TypeScript support in tests
- **Realistic Data**: Tests use actual database operations with nanoid IDs
- **Console Output**: Helpful logging for debugging test results

### 🔗 Relationships

- **Users → Posts**: One-to-Many (Users can have multiple posts)
- **Posts → Users**: Many-to-One (Each post belongs to one user)
- **Cascade Delete**: When a user is deleted, all their posts are automatically deleted

## 🏗️ Modular Router Architecture

The project uses a modular approach where each domain (users, posts) has its own router file containing:

### Router Structure

- **Repository Class**: Database operations for the domain
- **tRPC Procedures**: API endpoints (queries and mutations)
- **Type Safety**: Full end-to-end type safety with Zod validation

### Benefits

- **Separation of Concerns**: Each domain is self-contained
- **Easy to Maintain**: Related code is grouped together
- **Scalable**: Easy to add new domains or modify existing ones
- **Type Safe**: Full TypeScript support from database to frontend

### Example: Users Router (`src/server/routers/users.ts`)

```typescript
// Repository class with database operations
class UserRepository {
  static async create(userData: NewUser): Promise<User> { ... }
  static async delete(id: string): Promise<void> { ... } // String ID with nanoid
  // ... other operations
}

// tRPC router with procedures
export const usersRouter = router({
  create: publicProcedure.input(schema).mutation(async ({ input }) => {
    return await UserRepository.create(input);
  }),
  // ... other procedures using string IDs
});
```

## 🚀 Available Scripts

Add these to your workflow:

```bash
# Generate migrations
bun run db:generate

# Apply migrations to database
bun run db:migrate

# Push schema to database (development)
bun run db:push

# Open Drizzle Studio (Database GUI)
bun run db:studio

# Seed database with sample data
bun run db:seed

# Run all tests
bun test

# Run specific test files
bun test src/server/routers/users.test.ts
bun test src/server/routers/posts.test.ts
bun test src/db/integration.test.ts
```

## 📖 Usage Examples

### Basic Database Operations

```typescript
import { db } from './src/db';
import { users, posts } from './src/db/schema';
import { eq } from 'drizzle-orm';

// Create a new user (with nanoid)
const newUser = await db
  .insert(users)
  .values({
    name: 'John Doe',
    email: 'john@example.com',
  })
  .returning();
// Returns: { id: 'user_RkG8BWFdwMGr', name: 'John Doe', email: 'john@example.com', ... }

// Get all users
const allUsers = await db.select().from(users);

// Get user by ID (string nanoid)
const user = await db
  .select()
  .from(users)
  .where(eq(users.id, 'user_RkG8BWFdwMGr'));

// Get user with their posts
const userWithPosts = await db.query.users.findFirst({
  where: eq(users.id, 'user_RkG8BWFdwMGr'),
  with: {
    posts: true,
  },
});
```

### Using Repository Classes

```typescript
import { UserRepository, PostRepository } from './src/server/routers/users';
import { PostRepository } from './src/server/routers/posts';

// User operations (string IDs)
const users = await UserRepository.findAll();
const user = await UserRepository.findById('user_RkG8BWFdwMGr');
const newUser = await UserRepository.create({
  name: 'Jane Doe',
  email: 'jane@example.com',
});

// Post operations (string IDs)
const posts = await PostRepository.findAll();
const userPosts = await PostRepository.findByAuthor('user_RkG8BWFdwMGr');
const postsWithAuthors = await PostRepository.getPostsWithAuthors();
```

### Custom nanoid Usage

```typescript
import { createUserId, createPostId } from './src/lib/nanoid';

// Generate new IDs
const userId = createUserId(); // 'user_RkG8BWFdwMGr'
const postId = createPostId(); // 'post_92neQgAfe45C'

// IDs are URL-safe and type-distinguishable
console.log(`User: ${userId}, Post: ${postId}`);
```

### Form Validation with Zod

```typescript
import { insertUserSchema, insertPostSchema } from './src/db/schema';

// Validate user input
const userInput = { name: 'John', email: 'john@example.com' };
const validatedUser = insertUserSchema.parse(userInput);

// Use in React Hook Form
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const userForm = useForm({
  resolver: zodResolver(insertUserSchema),
});
```

## 🎛️ Drizzle Studio

Drizzle Studio provides a web-based GUI for your database. Access it at:
<https://local.drizzle.studio>

Features:

- Browse and edit data
- View table relationships
- Execute custom queries
- Real-time data updates

## 🔄 Next Steps

1. **Connect to your React app**: Use the repository classes in your components
2. **Add authentication**: Extend the user schema with auth fields
3. **Add more tables**: Define additional entities as needed
4. **Set up migrations**: Use `bun run db:generate` when changing schema
5. **Environment variables**: Configure `DATABASE_URL` for different environments
6. **Production deployment**: Set up PostgreSQL instance and connection pooling

## 🛠️ Development Workflow

1. Make schema changes in `src/db/schema/*.ts`
2. Generate migration: `bun run db:generate`
3. Apply migration: `bun run db:migrate`
4. Run tests: `bun test`
5. Seed database: `bun run db:seed`
6. View in studio: `bun run db:studio`

## 🌍 Environment Setup

Make sure you have a `.env` file with your PostgreSQL connection:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

The database is now ready for use in your React application with PostgreSQL, nanoid-based IDs, and comprehensive testing!
