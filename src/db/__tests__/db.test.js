/**
 * Database CRUD Tests
 *
 * Tests for core database operations using in-memory mocks.
 *
 * ---
 * NOTE: This file was written with AI assistance (Qwen Code).
 * ---
 */

import {
  __resetDbForTests,
  addPoints,
  deductPoints,
  getActiveSetId,
  getDiceSetStats,
  getPoints,
  getRollDistribution,
  getRollHistory,
  insertRoll,
  setPoints,
} from '../db.js';
import { __resetMockTables } from './mocks/expo-sqlite.js';

beforeEach(() => {
  __resetMockTables();
  __resetDbForTests();
});

describe('User State Operations', () => {
  test('getPoints returns a number', async () => {
    const result = await getPoints();
    expect(typeof result).toBe('number');
  });

  test('getPoints defaults to 100 when no data exists', async () => {
    const result = await getPoints();
    expect(result).toBe(100);
  });

  test('deductPoints returns boolean', async () => {
    const result = await deductPoints(50);
    expect(typeof result).toBe('boolean');
  });

  test('deductPoints returns false when balance insufficient', async () => {
    // Try to deduct more than possible
    const result = await deductPoints(10000);
    expect(result).toBe(false);
  });

  test('getActiveSetId returns null or number', async () => {
    const result = await getActiveSetId();
    expect(result === null || typeof result === 'number').toBe(true);
  });

  test('setPoints updates points correctly', async () => {
    await setPoints(200);
    const result = await getPoints();
    expect(result).toBe(200);
  });

  test('addPoints increases points', async () => {
    const before = await getPoints();
    await addPoints(50);
    const after = await getPoints();
    expect(after).toBe(before + 50);
  });
});

describe('Roll History Operations', () => {
  test('getRollHistory returns an array', async () => {
    const result = await getRollHistory({ setId: 100 });
    expect(Array.isArray(result)).toBe(true);
  });

  test('getRollHistory returns empty array when no data', async () => {
    const result = await getRollHistory({ setId: 9999 });
    expect(result).toEqual([]);
  });

  test('insertRoll adds a roll to history', async () => {
    const setId = 1001;
    await insertRoll(setId, 20, 15);
    const result = await getRollHistory({ setId });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].result).toBe(15);
  });

  test('getRollHistory items have expected shape', async () => {
    const setId = 1002;
    await insertRoll(setId, 20, 15);
    const result = await getRollHistory({ setId });
    const item = result.find(r => r.set_id === setId);
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('set_id');
    expect(item).toHaveProperty('die_type');
    expect(item).toHaveProperty('result');
  });

  test('getDiceSetStats returns an object with aggregates', async () => {
    const setId = 1003;
    await insertRoll(setId, 20, 10);
    await insertRoll(setId, 20, 15);
    await insertRoll(setId, 20, 20);
    const result = await getDiceSetStats(setId);
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('total_rolls');
    expect(result.total_rolls).toBe(3);
  });

  test('getRollDistribution returns array of result groups', async () => {
    const setId = 1004;
    await insertRoll(setId, 20, 1);
    await insertRoll(setId, 20, 1);
    await insertRoll(setId, 20, 20);
    const result = await getRollDistribution(setId);
    expect(Array.isArray(result)).toBe(true);
    // Check that we have the expected results (1 and 20)
    const results = result.map(r => r.result).sort((a, b) => a - b);
    expect(results).toEqual([1, 20]);
  });

  test('getRollDistribution handles empty results', async () => {
    const result = await getRollDistribution(9999);
    expect(result).toEqual([]);
  });
});
