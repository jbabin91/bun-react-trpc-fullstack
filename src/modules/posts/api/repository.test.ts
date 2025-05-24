import { describe, expect, test } from 'bun:test';

import { UserRepository } from '@/server/routers/users';
import { testUtils } from '@/test/setup';

import { PostRepository } from './repository';

describe('PostRepository', () => {
  test('should find all posts', async () => {
    const posts = await PostRepository.findAll();

    expect(posts).toBeDefined();
    expect(Array.isArray(posts)).toBe(true);
    console.log(`✅ Found ${posts.length} posts`);
  });

  test('should get posts with authors', async () => {
    const postsWithAuthors = await PostRepository.getPostsWithAuthors();

    expect(postsWithAuthors).toBeDefined();
    expect(Array.isArray(postsWithAuthors)).toBe(true);
    console.log(`✅ Found ${postsWithAuthors.length} posts with author data`);

    // Verify structure if we have posts
    if (postsWithAuthors.length > 0) {
      const firstPost = postsWithAuthors[0];
      expect(firstPost).toHaveProperty('id');
      expect(firstPost).toHaveProperty('title');
      expect(firstPost).toHaveProperty('author');
      console.log(
        `✅ Post structure verified: "${firstPost.title}" by ${firstPost.author?.name}`,
      );
    }
  });

  test('should create a new post', async () => {
    // First, get a user to be the author
    const users = await UserRepository.findAll();

    if (users.length > 0) {
      const author = users[0];
      const newPostData = testUtils.createTestPost(author.id);

      const createdPost = await PostRepository.create(newPostData);

      expect(createdPost).toBeDefined();
      expect(createdPost.title).toBe(newPostData.title);
      expect(createdPost.content).toBe(newPostData.content);
      expect(createdPost.authorId).toBe(newPostData.authorId);
      expect(createdPost.id).toBeDefined();
      console.log(
        `✅ Created post: "${createdPost.title}" with ID: ${createdPost.id}`,
      );
    } else {
      console.log('⏭️ Skipping post creation test - no users in database');
    }
  });

  test('should find posts by author', async () => {
    const users = await UserRepository.findAll();

    if (users.length > 0) {
      const author = users[0];
      const authorPosts = await PostRepository.findByAuthor(author.id);

      expect(authorPosts).toBeDefined();
      expect(Array.isArray(authorPosts)).toBe(true);
      console.log(`✅ Found ${authorPosts.length} posts by ${author.name}`);

      // Verify all posts belong to the author
      authorPosts.forEach((post) => {
        expect(post.authorId).toBe(author.id);
      });
    } else {
      console.log('⏭️ Skipping author posts test - no users in database');
    }
  });
});
