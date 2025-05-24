/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */
import '@/styles/globals.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/query-client';
import { trpc, trpcClient, TRPCProvider } from '@/lib/trpc';
import { routeTree } from '@/routeTree.gen';

// Create a new router instance
const router = createRouter({
  Wrap: function WrapComponent({ children }) {
    return (
      <ThemeProvider enableSystem attribute="class" defaultTheme="system">
        <QueryClientProvider client={queryClient}>
          <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
            {children}
            <Toaster />
          </TRPCProvider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  },
  context: {
    queryClient,
    trpc,
  },
  defaultPreload: 'intent',
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  routeTree,
  scrollRestoration: true,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: typeof router;
  }
}

const elem = document.getElementById('root')!;
const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
