import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@/lib/trpc';

// Query hooks
export function useUsers() {
  const trpc = useTRPC();
  return useQuery(trpc.users.list.queryOptions());
}

export function useUser(id: string) {
  const trpc = useTRPC();
  return useQuery(trpc.users.getById.queryOptions({ id }, { enabled: !!id }));
}

export function useUserWithPosts(id: string) {
  const trpc = useTRPC();
  return useQuery(
    trpc.users.getUserWithPosts.queryOptions({ id }, { enabled: !!id }),
  );
}

// Mutation hooks
export function useCreateUser() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.users.create.mutationOptions({
      onSuccess: () => {
        // Invalidate and refetch users list
        queryClient.invalidateQueries({
          queryKey: trpc.users.list.queryKey(),
        });
      },
    }),
  );
}

export function useUpdateUser() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.users.update.mutationOptions({
      onSuccess: (data) => {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: trpc.users.list.queryKey(),
        });
        if (data?.id) {
          queryClient.invalidateQueries({
            queryKey: trpc.users.getById.queryKey({ id: data.id }),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.users.getUserWithPosts.queryKey({ id: data.id }),
          });
        }
      },
    }),
  );
}

export function useDeleteUser() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.users.delete.mutationOptions({
      onSuccess: () => {
        // Invalidate users list
        queryClient.invalidateQueries({
          queryKey: trpc.users.list.queryKey(),
        });
      },
    }),
  );
}

// Combined hooks for complex operations
export function useUsersData() {
  const usersQuery = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  return {
    createUser: createMutation.mutate,
    deleteUser: deleteMutation.mutate,
    error: usersQuery.error,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading: usersQuery.isLoading,
    isUpdating: updateMutation.isPending,
    updateUser: updateMutation.mutate,
    users: usersQuery.data ?? [],
  };
}
