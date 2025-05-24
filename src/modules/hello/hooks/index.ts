import { useMutation, useQuery } from '@tanstack/react-query';

import { useTRPC, useTRPCClient } from '@/lib/trpc';

import type { HelloInput, UpdateHelloInput } from '../schemas';

// Query hooks
export function useHello(input?: HelloInput) {
  const trpc = useTRPC();

  const queryInput = input ?? { method: 'GET' as const };

  return useQuery(trpc.hello.hello.queryOptions(queryInput));
}

// Mutation hooks
export function useUpdateHello() {
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();

  return useMutation({
    mutationFn: (input: UpdateHelloInput) => {
      return trpcClient.hello.updateHello.mutate(input);
    },
    ...trpc.hello.updateHello.mutationOptions(),
  });
}
