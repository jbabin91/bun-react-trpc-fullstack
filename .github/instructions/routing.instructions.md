---
applyTo: '**/routes/*.tsx'
---

# TanStack Router Standards

## Router Configuration

This project uses **TanStack Router** for type-safe client-side routing with the following setup:

### Root Route Structure

All routes inherit from the root route in `src/routes/__root.tsx`:

```tsx
import { createRootRouteWithContext } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { type AppRouter } from '@/server/router';

type RouterContext = {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
```

### Route File Pattern

All route files follow this structure in `src/routes/`:

```tsx
// src/routes/users.tsx
import { createFileRoute } from '@tanstack/router';

export const Route = createFileRoute('/users')({
  component: UsersPage,
});

function UsersPage() {
  return <div>{/* Page content */}</div>;
}
```

## Available Routes

The current application includes these routes:

- **`/`** - Home page (`src/routes/index.tsx`)
- **`/about`** - About page (`src/routes/about.tsx`)
- **`/database`** - Database demo (`src/routes/database.tsx`)
- **`/posts`** - Posts management (`src/routes/posts.tsx`)
- **`/users`** - Users management (`src/routes/users.tsx`)

## Router Context

### Type-Safe Context

The router provides type-safe access to:

```typescript
// Available in all route components
const { trpc, queryClient } = Route.useRouteContext();
```

### Context Usage

```tsx
function MyRouteComponent() {
  const { trpc } = Route.useRouteContext();

  // Use tRPC with full type safety
  const users = useQuery(trpc.users.list.queryOptions());

  return <div>{/* Component content */}</div>;
}
```

## Navigation Patterns

### Link Components

Use TanStack Router's `Link` component for navigation:

```tsx
import { Link } from '@tanstack/router';

function Navigation() {
  return (
    <nav>
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>
      <Link to="/users" className="[&.active]:font-bold">
        Users
      </Link>
    </nav>
  );
}
```

### Programmatic Navigation

Use the router's navigation methods:

```tsx
import { useRouter } from '@tanstack/router';

function MyComponent() {
  const router = useRouter();

  const handleClick = () => {
    router.navigate({ to: '/users' });
  };

  return <button onClick={handleClick}>Go to Users</button>;
}
```

## Route Data Loading

### beforeLoad Pattern

Use `beforeLoad` to prefetch data and leverage React Suspense:

```tsx
export const Route = createFileRoute('/users')({
  beforeLoad: async ({ context }) => {
    // Prefetch query and suspend until resolved
    await context.queryClient.prefetchQuery(
      context.trpc.users.list.queryOptions(),
    );
  },
  component: UsersPage,
});
```

In your component, enable Suspense on the query:

```tsx
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';

function UsersPage() {
  const { data: users } = useQuery(trpc.users.list.queryOptions(), {
    suspense: true,
  });

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

// Wrap rendering in a Suspense boundary in root layout if needed:
// <Suspense fallback={<div>Loading...</div>}> <Outlet /> </Suspense>
```

### Loader Pattern

For data that should be loaded before route rendering:

```tsx
export const Route = createFileRoute('/users')({
  loader: async ({ context }) => {
    // Pre-load critical data
    return await context.trpc.users.list.ensureData();
  },
  component: UsersPage,
});
```

Access loader data in the component using `useLoaderData`:

```tsx
function UsersPage() {
  const users = Route.useLoaderData();

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Loader and Error Handling Options

You can specify `loadingElement` and `errorElement` on routes for built-in loading and error boundaries:

```tsx
export const Route = createFileRoute({
  path: '/users',
  loader: async ({ context, params }) => {
    // Return any serializable data (e.g., array of users)
    return context.trpc.users.list.fetch();
  },
  loadingElement: <div>Loading users...</div>,
  errorElement: ({ error }) => <div>Error: {error.message}</div>,
});
```

Use `useLoaderData` to access the typed loader result:

```tsx
function UsersPage() {
  const users = Route.useLoaderData();
  // users is typed as the array returned from loader
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

### Combined Patterns

You can also combine `beforeLoad` (for Suspense) and `loader`:

```tsx
export const Route = createFileRoute('/posts')({
  beforeLoad: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.posts.list.queryOptions(),
    );
  },
  loader: () => context.trpc.posts.list.fetch(),
  loadingElement: <div>Loading posts...</div>,
  errorElement: ({ error }) => <div>Error loading posts: {error.message}</div>,
  component: PostsPage,
});
```

### loaderDeps Pattern

Use `loaderDeps` to re-run your loader when specified values change:

```tsx
export const Route = createFileRoute('/users/:id')({
  loader: async ({ context, params }) => {
    // Fetch user by ID from params
    return await context.trpc.users.get.fetch({ id: params.id });
  },
  loaderDeps: ({ params }) => [params.id],
  loadingElement: <div>Loading user...</div>,
  errorElement: ({ error }) => <div>Error: {error.message}</div>,
  component: UserDetailPage,
});
```

```tsx
// In your component:
function UserDetailPage() {
  const user = Route.useLoaderData();
  return <div>{user.name}</div>;
}
```

### Component-Level Loading

For data loaded within components:

```tsx
function UsersPage() {
  const trpc = useTRPC();

  // Load data in component
  const { data: users, isLoading } = useQuery(trpc.users.list.queryOptions());

  if (isLoading) return <div>Loading...</div>;

  return <div>{/* Render users */}</div>;
}
```

## Route Organization

### File Structure

```
src/routes/
├── __root.tsx          # Root layout and context
├── index.tsx          # Home page (/)
├── about.tsx          # About page (/about)
├── database.tsx       # Database demo (/database)
├── posts.tsx          # Posts page (/posts)
├── users.tsx          # Users page (/users)
└── -about.test.tsx    # Route tests (prefix with -)
```

### Route Generation

Routes are automatically generated into `src/routeTree.gen.ts`:

- **Never edit this file manually**
- **File is updated automatically** when route files change
- **Provides full type safety** for navigation

## Layout Patterns

### Root Layout

The root layout provides consistent structure:

```tsx
function RootComponent() {
  return (
    <>
      <header className="flex items-center justify-between border-b p-2">
        <nav className="flex gap-2">{/* Navigation links */}</nav>
        <ModeToggle />
      </header>
      <Outlet /> {/* Route content renders here */}
      <ReactQueryDevtools />
      <TanStackRouterDevtools />
    </>
  );
}
```

### Page Layout Pattern

Use consistent page layouts:

```tsx
function MyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Page Title</CardTitle>
          <CardDescription>Page description</CardDescription>
        </CardHeader>
        <CardContent>{/* Page content */}</CardContent>
      </Card>
    </div>
  );
}
```

## Error Handling

### Error Boundaries

Routes automatically handle errors with TanStack Router's error boundaries:

```tsx
export const Route = createFileRoute('/users')({
  errorComponent: ({ error }) => (
    <div className="p-4 text-red-600">Error loading users: {error.message}</div>
  ),
  component: UsersPage,
});
```

### Loading States

Handle loading states consistently:

```tsx
function MyComponent() {
  const { data, isLoading, error } = useQuery(trpc.users.list.queryOptions());

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

## Route Testing

### Test Setup

Test routes using the custom render utilities:

```tsx
import { customRenderWithProviders, screen } from '@/test/ui-setup';

describe('About Page', () => {
  test('renders correctly', async () => {
    customRenderWithProviders(<div>Test</div>, { route: '/about' });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'About Page' }),
      ).toBeInTheDocument();
    });
  });
});
```

### Route Navigation Testing

Test navigation between routes:

```typescript
test('navigates to users page', async () => {
  const { router } = customRenderWithProviders(<App />, { route: '/' });

  const usersLink = screen.getByRole('link', { name: 'Users' });
  await userEvent.click(usersLink);

  expect(router.state.location.pathname).toBe('/users');
});
```

## Performance Optimization

### Route Splitting

Routes are automatically code-split by TanStack Router for optimal performance.

### Preloading

Use route preloading for better UX:

```tsx
export const Route = createFileRoute('/users')({
  component: UsersPage,
  // Preload on intent (hover, focus)
  defaultPreload: 'intent',
});
```

### Data Prefetching

Prefetch data for likely navigation:

```tsx
function Navigation() {
  const router = useRouter();

  return (
    <Link
      to="/users"
      preload="intent" // Prefetch on hover/focus
      onMouseEnter={() => {
        // Prefetch tRPC data
        queryClient.prefetchQuery(trpc.users.list.queryOptions());
      }}
    >
      Users
    </Link>
  );
}
```

## Development Tools

### Router Devtools

TanStack Router Devtools are included in development:

```tsx
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

// Automatically included in root layout
<TanStackRouterDevtools />;
```

### Type Safety

Full TypeScript support for:

- Route paths
- Search parameters
- Route context
- Navigation methods

Use the generated types for type-safe routing throughout the application.
