import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@/lib/trpc';

// Query hooks
export const usePosts = () => {
  const trpc = useTRPC();
  return useQuery(trpc.posts.list.queryOptions());
};

export const usePost = (id: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.posts.getById.queryOptions({ id }));
};

export const usePostsByAuthor = (authorId: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.posts.getByAuthor.queryOptions({ authorId }));
};

export const usePostsWithAuthors = () => {
  const trpc = useTRPC();
  return useQuery(trpc.posts.getPostsWithAuthors.queryOptions());
};

export const usePostCount = () => {
  const trpc = useTRPC();
  return useQuery(trpc.posts.getCount.queryOptions());
};

// Mutation hooks
export const useCreatePost = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.posts.create.mutationOptions({
      onSuccess: () => {
        // Invalidate and refetch posts list
        queryClient.invalidateQueries({
          queryKey: trpc.posts.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.posts.getPostsWithAuthors.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.posts.getCount.queryKey(),
        });
      },
    }),
  );
};

export const useUpdatePost = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.posts.update.mutationOptions({
      onSuccess: (_, variables) => {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: trpc.posts.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.posts.getPostsWithAuthors.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.posts.getById.queryKey({ id: variables.id }),
        });
      },
    }),
  );
};

export const useDeletePost = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.posts.delete.mutationOptions({
      onSuccess: () => {
        // Invalidate all posts queries
        queryClient.invalidateQueries({
          queryKey: trpc.posts.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.posts.getPostsWithAuthors.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.posts.getCount.queryKey(),
        });
      },
    }),
  );
};

// Combined hooks for complex operations
export const usePostsData = () => {
  const postsQuery = usePosts();
  const countQuery = usePostCount();

  return {
    count: countQuery.data?.count,
    error: postsQuery.error ?? countQuery.error,
    isLoading: postsQuery.isLoading ?? countQuery.isLoading,
    posts: postsQuery.data,
  };
};
