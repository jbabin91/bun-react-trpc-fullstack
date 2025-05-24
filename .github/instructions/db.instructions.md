---
applyTo: '**/db/**'
---

# Database Management Instructions

## Drizzle ORM Schemas

- Define tables in `src/db/schema/*.ts` using the Drizzle DSL:

  ```ts
  import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

  export const users = pgTable('users', {
    id: serial().primaryKey(),
    name: varchar({ length: 100 }).notNull(),
    email: text().notNull().unique(),
  });
  ```

- Model relationships with the `relations()` helper:

  ```ts
  import { relations } from 'drizzle-orm';
  import { posts } from './posts';

  users.addRelations({
    posts: relations(users, posts, {
      one: { fields: [users.id], references: [posts.authorId] },
    }),
  });
  ```

## Migrations

- Generate and apply all pending migrations:
  ```bash
  bun db:migrate
  ```
- Create a new migration after schema changes:
  ```bash
  bun db:generate <migration_name>
  ```
- Roll back the last applied migration:
  ```bash
  bun db:rollback
  ```
- Inspect migration status and history:
  ```bash
  bun db:status
  ```
- Launch Drizzle Studio UI for visual inspection:
  ```bash
  bun db:studio
  ```

## Seeding Data

- Author seeding scripts in `src/db/seed.ts`:

  ```ts
  import { db } from './index';
  import { users } from './schema/users';

  async function seed() {
    // Use upsert or conditional inserts for idempotency
    await db
      .insert(users)
      .values([{ name: 'Alice', email: 'alice@example.com' }])
      .onConflictDoNothing();

    // Add more fixtures as needed
  }

  seed().catch(console.error);
  ```

- Execute the seed script:
  ```bash
  bun run src/db/seed.ts
  ```
- Best Practices:
  - Write idempotent seeds using `upsert` or `onConflictDoNothing()`
  - Separate development and test data (e.g., `seed.dev.ts`, `seed.test.ts`)
  - Store large fixture datasets under `src/db/fixtures/`
  - Use environment checks to avoid seeding production
