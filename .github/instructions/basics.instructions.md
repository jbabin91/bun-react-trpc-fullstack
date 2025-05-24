---
applyTo: '**'
---

# Basic Instructions

## Package Manager

Use `bun` as the package manager and runtime for all operations:

- Dependency management: `bun add`, `bun remove`
- Script execution: `bun run <script>`
- Development server: `bun --hot src/index.tsx`
- Testing: `bun test`

## Architecture & Stack

This is a **fullstack TypeScript application** using:

- **Runtime**: Bun (serves both API and frontend)
- **Frontend**: React 19 + TypeScript + TanStack Router
- **API**: tRPC for type-safe client-server communication
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS v4 + Radix UI components
- **Testing**: Bun's built-in test framework + React Testing Library

## Project Structure

Follow the established **modular architecture**:

```
src/
├── modules/           # Feature modules (users, posts, hello)
│   └── [feature]/
│       ├── api/       # tRPC routers & repository logic
│       ├── components/# React components
│       ├── hooks/     # React hooks
│       ├── schemas/   # Zod validation schemas
│       └── types/     # TypeScript types
├── components/ui/     # Shared UI components (shadcn/ui)
├── routes/           # TanStack Router route files
├── db/               # Database schema & migrations
├── server/           # tRPC server setup
├── lib/              # Shared utilities
└── test/             # Testing utilities & setup
```

## Development Patterns

### Import Aliases

Always use path aliases for imports:

```typescript
import { Button } from '@/components/ui/button';
import { UserRepository } from '@/modules/users/api/repository';
```

### tRPC Integration

- Define routes in `modules/[feature]/api/router.ts`
- Use repository pattern for database operations
- Include comprehensive input validation with Zod schemas
- Export routers and combine in `src/server/router.ts`

### Database Operations

- Use Drizzle ORM with PostgreSQL
- Schema files in `src/db/schema/`
- Run migrations: `bun db:migrate`
- Generate schema: `bun db:generate`
- Access studio: `bun db:studio`

### Testing Setup

- **Global setup**: Uses `bunfig.toml` preload configuration
- **Test utilities**: Centralized in `src/test/setup.ts`
- **UI testing**: Custom render helpers in `src/test/ui-setup.tsx`
- **Coverage**: Enabled by default, aim for >75% coverage
- Run tests: `bun test` (includes global setup)

### Code Quality

- **ESLint**: Comprehensive config with TypeScript, React, and accessibility rules
- **Prettier**: Auto-formatting with Tailwind plugin
- **Type Safety**: Strict TypeScript settings, no explicit any
- **Import Sorting**: Automatic import organization
- **Git Hooks**: Pre-commit linting and formatting via husky

## Configuration Files

### Key Configurations

- `bunfig.toml`: Bun runtime and test configuration
- `drizzle.config.ts`: Database configuration
- `tsconfig.json`: TypeScript with path aliases (`@/*`)
- `eslint.config.js`: Comprehensive linting rules
- `components.json`: shadcn/ui component configuration

### Environment Setup

Required environment variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
```

## Development Workflow

### Feature Development

1. Create feature module in `src/modules/[feature]/`
2. Define database schema (if needed)
3. Create tRPC router with Zod validation
4. Build React components with TypeScript
5. Add comprehensive tests
6. Update routes as needed

### Testing Strategy

- **Unit tests**: For utilities and pure functions
- **Integration tests**: For database operations and API routes
- **Component tests**: For React components with mocked tRPC
- **E2E patterns**: Use the established UI testing utilities

### Build & Deployment

- **Development**: `bun dev` (hot reload enabled)
- **Production build**: `bun build`
- **Type checking**: `bun typecheck`
- **Linting**: `bun lint` or `bun lint:fix`

## Best Practices

### Code Organization

- Keep components small and focused
- Use TypeScript interfaces for complex types
- Implement proper error handling with tRPC
- Follow React hooks best practices
- Use Zod schemas for all input validation
- **Prefer function declarations over arrow functions** for better readability and hoisting

### Performance

- Leverage TanStack Query for caching
- Use proper React patterns (memo, useCallback when needed)
- Implement loading states and error boundaries
- Optimize bundle size with tree-shaking

### Accessibility

- Use semantic HTML and ARIA attributes
- Ensure keyboard navigation works
- Maintain color contrast standards
- Test with screen readers when possible

## Recommended VS Code Extensions

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Auto Rename Tag
- GitLens
