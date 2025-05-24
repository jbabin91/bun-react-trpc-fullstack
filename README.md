# React + Bun + tRPC + Drizzle Template

A modern full-stack template featuring React, Bun runtime, tRPC for type-safe APIs, and Drizzle ORM for database operations.

## 🚀 Quick Start

To install dependencies:

```bash
bun install
```

To start the development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

## 🗄️ Database

This project includes a complete database setup with Drizzle ORM and PostgreSQL:

```bash
# Generate migrations
bun run db:generate

# Apply migrations
bun run db:migrate

# Seed the database
bun run db:seed

# Open Drizzle Studio
bun run db:studio
```

For detailed database documentation, see [docs/DATABASE.md](docs/DATABASE.md).

## 🧪 Testing

The project includes comprehensive testing with Bun's built-in test runner:

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test src/server/routers/users.test.ts
```

For detailed testing documentation, see [docs/TESTING.md](docs/TESTING.md).

## 🛠️ Tech Stack

- **Runtime**: Bun
- **Frontend**: React 19 + TanStack Router
- **Backend**: tRPC for type-safe APIs
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Testing**: Bun test with coverage reporting
- **State Management**: TanStack Query

This project was created using `bun init` in bun v1.2.14. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
