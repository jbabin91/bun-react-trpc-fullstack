import { describe, expect, test } from 'bun:test';

import { db } from './index';

describe('Database Integration', () => {
  test('should have database connection', async () => {
    // Simple query to test database connectivity
    const result = await db.execute('SELECT 1 as test');
    expect(result).toBeDefined();
    console.log('✅ Database connection verified');
  });

  test('should be using PostgreSQL', async () => {
    // Verify we're connected to PostgreSQL
    const result = await db.execute('SELECT version()');
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);

    const version = result[0] as { version: string };
    expect(version.version).toContain('PostgreSQL');
    console.log('✅ PostgreSQL version:', version.version.split(' ')[0]);
  });

  test('should have correct tables', async () => {
    // Check if our tables exist
    const result = await db.execute(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    expect(result).toBeDefined();
    const tableNames = result.map((row: any) => row.table_name);

    expect(tableNames).toContain('users');
    expect(tableNames).toContain('posts');
    console.log('✅ Found tables:', tableNames);
  });
});
