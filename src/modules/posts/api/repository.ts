import { count, desc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { type NewPost, type Post, posts } from '@/db/schema/posts';

// Post repository operations
export class PostRepository {
  static async findAll(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  static async findById(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id));
    return result[0];
  }

  static async findByAuthor(authorId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, authorId))
      .orderBy(desc(posts.createdAt));
  }

  static async create(postData: NewPost): Promise<Post> {
    const result = await db.insert(posts).values(postData).returning();
    return result[0];
  }

  static async update(
    id: string,
    postData: Partial<NewPost>,
  ): Promise<Post | undefined> {
    const result = await db
      .update(posts)
      .set({ ...postData, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return result[0];
  }

  static async delete(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  static async getPostWithAuthor(id: string) {
    return await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        author: true,
      },
    });
  }

  static async getPostsWithAuthors() {
    return await db.query.posts.findMany({
      orderBy: desc(posts.createdAt),
      with: {
        author: true,
      },
    });
  }

  static async getPostCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(posts);
    return result[0].count;
  }
}
