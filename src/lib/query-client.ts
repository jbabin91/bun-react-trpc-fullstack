import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';
import superjson from 'superjson';

export const queryClientConfig = {
  defaultOptions: {
    dehydrate: { serializeData: superjson.serialize },
    hydrate: { deserializeData: superjson.deserialize },
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
} satisfies QueryClientConfig;

export const queryClient = new QueryClient();
