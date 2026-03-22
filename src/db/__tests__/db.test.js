/**
 * Database CRUD Tests
 *
 * Tests for core database operations:
 * - User state (points, active set)
 * - Roll history (inserts, queries, aggregates)
 *
 * ---
 * NOTE: This file was written with AI assistance (Claude Code).
 * ---
 */

import * as SQLite from 'expo-sqlite';
import {
  getPoints,
  deductPoints,
  getActiveSetId,
  getRollHistory,
  getDiceSetStats,
  getRollDistribution,
} from '../db.js';

describe('User State Operations', () => {
  test('getPoints returns a number', async () => {
    const mockDb = {
      getFirstAsync: jest.fn().mockResolvedValue({ points: 150 }),
    };
    SQLite.openDatabaseAsync.mockResolvedValue(mockDb);

    const result = await getPoints();
    expect(typeof result).toBe('number');
  });

  test('getPoints defaults to 100 when no data exists', async () => {
    const mockDb = {
      getFirstAsync: jest.fn().mockResolvedValue(undefined),
    };
    SQLite.openDatabaseAsync.mockResolvedValue(mockDb);

    const result = await getPoints();
    expect(result).toBe(100);
  });

  test('deductPoints returns boolean true when balance sufficient', async () => {
    const mockDb = {
      getFirstAsync: jest.fn().mockResolvedValue({ points: 100 }),
      runAsync: jest.fn().mockResolvedValue(undefined),
    };
    SQLite.openDatabaseAsync.mockResolvedValue(mockDb);

    const result = await deductPoints(50);
    expect(typeof result).toBe('boolean');
    expect(result).toBe(true);
  });

  test('deductPoints returns false when balance insufficient', async () => {
    const mockDb = {
      getFirstAsync: jest.fn().mockResolvedValue({ points: 10 }),
      runAsync: jest.fn(),
    };
    SQLite.openDatabaseAsync.mockResolvedValue(mockDb);

    const result = await deductPoints(50);
    expect(result).toBe(false);
  });

  test('deductPoints does not call database when balance check fails', async () => {
    const mockDb = {
      getFirstAsync: jest.fn().mockResolvedValue({ points: 10 }),
      runAsync: jest.fn(),
    };
    SQLite.openDatabaseAsync.mockResolvedValue(mockDb);

    await deductPoints(50);
    expect(mockDb.runAsync).not.toHaveBeenCalled();
  });

  test('getActiveSetId returns null or number', async () => {
    const mockDb = {
      getFirstAsync: jest.fn().mockResolvedValue({ active_set_id: 3 }),
    };
    SQLite.openDatabaseAsync.mockResolvedValue(mockDb);

    const result = await getActiveSetId();
    expect(result === null || typeof result === 'number').toBe(true);
  });
});

describe('Roll History Operations', () => {
  test('getRollHistory returns an array', async () => {
    const mockDb = {
      getAllAsync: jest.fn().mockResolvedValue([
        { id: 1, set_id: 1, die_type: 20, result: 15 },
      ]),
    };
    SQLite.openDatabaseAsync.mockResolvedValue(mockDb);

    const result = await getRollHistory({ setId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  test('getRollHistory returns empty array when no data', async () => {
    const mockDb = {
      getAllAsync: jest.fn().mockResolvedValue([]),
    };
    SQLite.openDatabaseAsync.mockResolvedValue(mockDb);

    const result = await getRollHistory({ setId: 999 });
    expect(result).toEqual([]);
  });

  test('getRollHistory items have expected shape', async () => {
    const mockDb = {
      getAllAsync: jest.fn().mockResolvedValue([
        { id: 1, set_id: 1, die_type: 20, result: 15, rolled_at: '2024-01-01' },
      ]),
    };
    SQLite.openDatabaseAsync.mockResolvedValue(mockDb);

    const result = await getRollHistory({ setId: 1 });
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('set_id');
    expect(result[0]).toHaveProperty('die_type');
    expect(result[0]).toHaveProperty('result');
  });

  test('getDiceSetStats returns an object with aggregates', async () => {
    const mockDb = {
      getFirstAsync: jest.fn().mockResolvedValue({
        total_rolls: 50,
        average: 10.5,
        min_roll: 1,
        max_roll: 20,
      }),
    };
    SQLite.openDatabaseAsync.mockResolvedValue(mockDb);

    const result = await getDiceSetStats(1);
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('total_rolls');
    expect(result).toHaveProperty('average');
  });

  test('getRollDistribution returns array of result groups', async () => {
    const mockDb = {
      getAllAsync: jest.fn().mockResolvedValue([
        { result: 1, count: 2 },
        { result: 20, count: 5 },
      ]),
    };
    SQLite.openDatabaseAsync.mockResolvedValue(mockDb);

    const result = await getRollDistribution(1);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('result');
    expect(result[0]).toHaveProperty('count');
  });

  test('getRollDistribution handles empty results', async () => {
    const mockDb = {
      getAllAsync: jest.fn().mockResolvedValue([]),
    };
    SQLite.openDatabaseAsync.mockResolvedValue(mockDb);

    const result = await getRollDistribution(1);
    expect(result).toEqual([]);
  });
});
