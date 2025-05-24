import { z } from 'zod/v4';

// Base post validation schemas
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  authorId: z.string().min(1, 'Author is required'),
});

export const updatePostSchema = z.object({
  id: z.string(),
  data: createPostSchema.partial(),
});

export const getPostByIdSchema = z.object({
  id: z.string(),
});

export const getPostsByAuthorSchema = z.object({
  authorId: z.string(),
});

export const deletePostSchema = z.object({
  id: z.string(),
});

// Query parameter schemas
export const getPostsQuerySchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
  authorId: z.string().optional(),
});

// Type exports (these will be inferred from the database schema)
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type GetPostByIdInput = z.infer<typeof getPostByIdSchema>;
export type GetPostsByAuthorInput = z.infer<typeof getPostsByAuthorSchema>;
export type DeletePostInput = z.infer<typeof deletePostSchema>;
export type GetPostsQueryInput = z.infer<typeof getPostsQuerySchema>;
