import { type QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';

import { ModeToggle } from '@/components/mode-toggle';
import { type AppRouter } from '@/server/router';

type RouterContext = {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <header className="flex flex-row items-center justify-between border-b p-2">
        <nav className="flex gap-2">
          <Link className="[&.active]:font-bold" to="/">
            Home
          </Link>{' '}
          <Link className="[&.active]:font-bold" to="/about">
            About
          </Link>{' '}
          <Link className="[&.active]:font-bold" to="/database">
            Database
          </Link>
        </nav>
        <ModeToggle />
      </header>
      <Outlet />
      <ReactQueryDevtools />
      <TanStackRouterDevtools />
    </>
  );
}
