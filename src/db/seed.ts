import { reset, seed } from 'drizzle-seed';

import { client, db } from './index';
import { posts } from './schema/posts';
import { users } from './schema/users';

async function seedDatabase() {
  console.log('🌱 Seeding database with drizzle-seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await reset(db, { posts, users });
  console.log('✅ Cleared existing data');

  // Seed with realistic data
  await seed(db, { users, posts }).refine((funcs) => ({
    users: {
      count: 25,
      columns: {
        name: funcs.fullName(),
        email: funcs.email(),
      },
      with: {
        posts: [
          { weight: 0.4, count: [2, 3, 4] },
          { weight: 0.4, count: [5, 6, 7] },
          { weight: 0.2, count: [8, 9, 10] },
        ],
      },
    },
    posts: {
      columns: {
        title: funcs.valuesFromArray({
          values: [
            'Getting Started with Drizzle ORM',
            'Building Modern Web Apps with Bun',
            'The Future of JavaScript Tooling',
            'TypeScript Best Practices',
            'Database Design Patterns',
            'Full-Stack Development with tRPC',
            'React Server Components Deep Dive',
            'Performance Optimization Techniques',
            'Modern CSS with Tailwind',
            'Testing Strategies for Web Apps',
          ],
        }),
        content: funcs.loremIpsum({ sentencesCount: 5 }),
      },
    },
  }));

  console.log('🎉 Database seeded successfully with realistic data!');
  console.log(
    '📊 Generated: 25 users and ~130-140 posts (varies by weighted distribution)',
  );
}

// Run the seed function if this file is executed directly
if (import.meta.main) {
  seedDatabase()
    .catch(console.error)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .finally(() => client.end());
}

export { seedDatabase as seed };
