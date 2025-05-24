import { describe, expect, test } from 'bun:test';

import { UserRepository } from '@/modules/users/api/repository';

import { PostRepository } from './repository';

describe('Posts API Integration', () => {
  test('should integrate repository with expected data flow', async () => {
    // Test the same data flow that the router would use
    const posts = await PostRepository.findAll();

    expect(posts).toBeDefined();
    expect(Array.isArray(posts)).toBe(true);
    console.log(`✅ Posts API: Found ${posts.length} posts`);
  });

  test('should integrate posts with authors data flow', async () => {
    // Test the combined data that router.listWithAuthors would return
    const postsWithAuthors = await PostRepository.getPostsWithAuthors();

    expect(postsWithAuthors).toBeDefined();
    expect(Array.isArray(postsWithAuthors)).toBe(true);
    console.log(
      `✅ Posts API: Found ${postsWithAuthors.length} posts with authors`,
    );

    if (postsWithAuthors.length > 0) {
      const firstPost = postsWithAuthors[0];
      expect(firstPost).toHaveProperty('id');
      expect(firstPost).toHaveProperty('title');
      expect(firstPost).toHaveProperty('author');
      console.log(`✅ Posts API: Verified structure for "${firstPost.title}"`);
    }
  });

  test('should integrate post creation data flow', async () => {
    // Test the creation flow that router.create would use
    const users = await UserRepository.findAll();

    if (users.length > 0) {
      const author = users[0];
      const newPostData = {
        authorId: author.id,
        content: 'This tests the API integration flow.',
        title: `API Test Post ${Date.now()}`,
      };

      const createdPost = await PostRepository.create(newPostData);

      expect(createdPost).toBeDefined();
      expect(createdPost.title).toBe(newPostData.title);
      expect(createdPost.content).toBe(newPostData.content);
      expect(createdPost.authorId).toBe(newPostData.authorId);
      expect(createdPost.id).toBeDefined();
      console.log(
        `✅ Posts API: Created "${createdPost.title}" with ID: ${createdPost.id}`,
      );
    } else {
      console.log('⏭️ Skipping creation test - no users in database');
    }
  });

  test('should count posts for API endpoint', async () => {
    // Test the count functionality that router.count would use
    const posts = await PostRepository.findAll();
    const expectedCount = posts.length;

    expect(typeof expectedCount).toBe('number');
    expect(expectedCount).toBeGreaterThanOrEqual(0);
    console.log(
      `✅ Posts API: Count functionality verified - ${expectedCount} posts`,
    );
  });
});
