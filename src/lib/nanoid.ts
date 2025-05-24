import { customAlphabet } from 'nanoid';

// Custom alphabet without ambiguous characters (0, O, I, l, 1)
// Using URL-safe characters that are easy to read and type
const alphabet = '123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Create nanoid function with custom alphabet and length
export const nanoid = customAlphabet(alphabet, 12);

// Optional: Create specific ID generators for different entity types
export function createUserId() {
  return `user_${nanoid()}`;
}

export function createPostId() {
  return `post_${nanoid()}`;
}

// Generic ID generator (default)
export const createId = nanoid;
