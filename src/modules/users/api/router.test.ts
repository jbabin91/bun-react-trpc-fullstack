import { describe, expect, test } from 'bun:test';

import { testUtils } from '@/test/setup';

import { usersRouter } from './router';

describe('Users Router', () => {
  test('should create user via router', async () => {
    const newUserData = testUtils.createTestUser();

    const caller = usersRouter.createCaller({});
    const result = await caller.create(newUserData);

    expect(result).toBeDefined();
    expect(result.name).toBe(newUserData.name);
    expect(result.email).toBe(newUserData.email);
    expect(result.id).toBeDefined();
    console.log(`✅ Created user via router: ${result.name}`);
  });

  test('should list users via router', async () => {
    const caller = usersRouter.createCaller({});
    const users = await caller.list();

    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
    console.log(`✅ Listed ${users.length} users via router`);
  });

  test('should get user by id via router', async () => {
    const caller = usersRouter.createCaller({});
    const users = await caller.list();

    if (users.length > 0) {
      const user = await caller.getById({ id: users[0].id });
      expect(user).toBeDefined();
      expect(user?.id).toBe(users[0].id);
      console.log(`✅ Found user by ID via router: ${user?.name}`);
    } else {
      console.log('⏭️ Skipping getById test - no users in database');
    }
  });

  test('should update user via router', async () => {
    const caller = usersRouter.createCaller({});
    const users = await caller.list();

    if (users.length > 0) {
      const userToUpdate = users[0];
      const updatedName = `Router Updated ${userToUpdate.name}`;

      const result = await caller.update({
        data: { name: updatedName },
        id: userToUpdate.id,
      });

      expect(result).toBeDefined();
      expect(result?.name).toBe(updatedName);
      console.log(`✅ Updated user via router: ${result?.name}`);
    } else {
      console.log('⏭️ Skipping update test - no users in database');
    }
  });
});
