import { describe, expect, test } from 'bun:test';

import { helloRouter } from './router';

describe('Hello Router', () => {
  test('should handle hello query with name', async () => {
    console.log('🚀 Starting hello test...');

    // Test the hello procedure
    const caller = helloRouter.createCaller({});

    const result = await caller.hello({
      method: 'GET',
      name: 'Test User',
    });

    expect(result).toBeDefined();
    expect(result.message).toBe('Hello, Test User!');
    expect(result.method).toBe('GET');
    console.log(`✅ Hello API: ${result.message}`);
  });

  test('should handle hello query without name', async () => {
    // Test the hello procedure without name
    const caller = helloRouter.createCaller({});

    const result = await caller.hello({
      method: 'GET',
    });

    expect(result).toBeDefined();
    expect(result.message).toBe('Hello, world!');
    expect(result.method).toBe('GET');
    console.log(`✅ Hello API: ${result.message}`);
  });

  test('should handle updateHello mutation with name', async () => {
    // Test the updateHello procedure
    const caller = helloRouter.createCaller({});

    const result = await caller.updateHello({
      name: 'Updated User',
    });

    expect(result).toBeDefined();
    expect(result.message).toBe('Hello, Updated User! (Updated)');
    expect(result.method).toBe('PUT');
    console.log(`✅ Hello API: ${result.message}`);
  });

  test('should handle updateHello mutation without name', async () => {
    // Test the updateHello procedure without name
    const caller = helloRouter.createCaller({});

    const result = await caller.updateHello({});

    expect(result).toBeDefined();
    expect(result.message).toBe('Hello, world! (Updated)');
    expect(result.method).toBe('PUT');
    console.log(`✅ Hello API: ${result.message}`);
  });
});
