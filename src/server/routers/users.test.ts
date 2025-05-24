import { describe, expect, test } from 'bun:test';

import { testUtils } from '@/test/setup';

import { UserRepository } from './users';

describe('UserRepository', () => {
  test('should find all users', async () => {
    const users = await UserRepository.findAll();

    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
    console.log(`✅ Found ${users.length} users`);
  });

  test('should find user by email if exists', async () => {
    const users = await UserRepository.findAll();

    if (users.length > 0) {
      const user = await UserRepository.findByEmail(users[0].email);
      expect(user).toBeDefined();
      expect(user?.email).toBe(users[0].email);
      console.log(`✅ Found user by email: ${user?.name}`);
    } else {
      console.log('⏭️ Skipping email test - no users in database');
    }
  });

  test('should create a new user', async () => {
    const newUserData = testUtils.createTestUser();

    const createdUser = await UserRepository.create(newUserData);

    expect(createdUser).toBeDefined();
    expect(createdUser.name).toBe(newUserData.name);
    expect(createdUser.email).toBe(newUserData.email);
    expect(createdUser.id).toBeDefined();
    console.log(
      `✅ Created user: ${createdUser.name} with ID: ${createdUser.id}`,
    );
  });

  test('should update a user', async () => {
    const users = await UserRepository.findAll();

    if (users.length > 0) {
      const userToUpdate = users[0];
      const updatedName = `Updated ${userToUpdate.name}`;

      const updatedUser = await UserRepository.update(userToUpdate.id, {
        name: updatedName,
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe(updatedName);
      console.log(`✅ Updated user: ${updatedUser?.name}`);
    } else {
      console.log('⏭️ Skipping update test - no users in database');
    }
  });
});
