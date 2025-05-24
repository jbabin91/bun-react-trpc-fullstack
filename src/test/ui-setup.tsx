import { QueryClient } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRouter,
  type RouterHistory,
  RouterProvider,
} from '@tanstack/react-router';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup, render } from '@testing-library/react';
import userEventGlobal from '@testing-library/user-event';
import { afterEach, expect } from 'bun:test';
import { type ReactElement } from 'react';

import { Providers } from '@/providers';
import { routeTree } from '@/routeTree.gen';

// Re-export everything from testing-library/react
export * from '@testing-library/react';
// Export userEvent
export const userEvent = userEventGlobal;

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        retry: false,
      },
    },
  });
}

// Create a mock tRPC client for testing that matches the expected serverHelpers structure
const createMockTrpcClient = () => {
  // Create a more complete mock that matches the serverHelpers structure
  return {
    hello: {
      queryFilter: () => ({ queryKey: ['hello'] }),
      queryKey: () => ['hello'],
      queryOptions: () => ({
        queryFn: () =>
          Promise.resolve({ message: 'Hello Test', method: 'GET' as const }),
        queryKey: ['hello'],
      }),
    },
    posts: {
      getAll: {
        queryFilter: () => ({ queryKey: ['posts', 'getAll'] }),
        queryKey: () => ['posts', 'getAll'],
        queryOptions: () => ({
          queryFn: () => Promise.resolve([]),
          queryKey: ['posts', 'getAll'],
        }),
      },
    },
    updateHello: {
      mutationOptions: () => ({
        mutationFn: () =>
          Promise.resolve({ message: 'Updated', method: 'PUT' as const }),
      }),
    },
  } as any; // Type assertion for testing compatibility
};

// Default mock client instance
const mockTrpcClient = createMockTrpcClient();

// Using the actual route tree from the application
type TestRouter = ReturnType<typeof createRouter<typeof routeTree>>;

type CustomRenderOptions = {
  history?: RouterHistory;
  queryClient?: QueryClient;
  route?: string;
  trpcClient?: typeof mockTrpcClient; // Added trpcClient here
};

export function customRenderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {},
): {
  router: TestRouter;
  user: ReturnType<typeof userEventGlobal.setup>;
  trpcClient: typeof mockTrpcClient; // Expose the client used
  [key: string]: any;
} {
  const { route = '/', history, queryClient } = options;
  const testQueryClient = queryClient ?? createTestQueryClient();
  const testRouterHistory =
    history ?? createMemoryHistory({ initialEntries: [route] });

  // Allow tests to override the mock trpc client if needed
  const currentTrpcClient = options.trpcClient ?? mockTrpcClient;

  const testRouter = createRouter({
    context: {
      queryClient: testQueryClient,
      trpc: currentTrpcClient,
    },
    history: testRouterHistory,
    routeTree,
  });

  const utils = render(
    <Providers>
      <RouterProvider router={testRouter} />
    </Providers>,
  );

  return {
    router: testRouter,
    trpcClient: currentTrpcClient,
    user: userEventGlobal.setup(), // Expose the client used
    ...utils,
  };
}

type CustomRenderRouteOptions = {
  initialRoute?: string;
  queryClient?: QueryClient;
  trpcClient?: typeof mockTrpcClient; // Allow passing a custom mock client
};

export function renderRoute(
  routePath: string,
  options: CustomRenderRouteOptions = {},
) {
  const { initialRoute = routePath, queryClient, trpcClient } = options;

  return customRenderWithProviders(<div data-testid="dummy-route-wrapper" />, {
    queryClient,
    route: initialRoute,
    trpcClient, // Pass it down
  });
}
