/**
 * Database CRUD Tests
 *
 * Tests for core database operations using a temporary SQLite database
 * initialized from the production schema for each test.
 *
 * ---
 * NOTE: This file was written with AI assistance (Qwen Code, GitHub Copilot).
 * ---
 */

import {
  __restoreOpenDatabaseForTests,
  __setOpenDatabaseForTests,
  getDB,
} from '../db.js';
import { getBetrayerTurnAfter } from '../diceSets.js';
import {
  getDiceSetStats,
  getRollDistribution,
  getRollHistory,
  insertRoll,
} from '../rollHistory.js';
import {
  DEFAULT_POINTS,
  addPoints,
  deductPoints,
  getActiveSetId,
  getPoints,
  setPoints,
} from '../userState.js';
import {
  createFreshTestDatabase,
  getOpenDatabaseAsyncForTests,
  teardownTestDatabase,
} from './testDatabase.js';

beforeEach(async function () {
  await createFreshTestDatabase();
  __setOpenDatabaseForTests(getOpenDatabaseAsyncForTests());
});

afterEach(async function () {
  await teardownTestDatabase();
});

afterAll(function () {
  __restoreOpenDatabaseForTests();
});

describe('User State Operations', function () {

  test('getPoints returns a number', async function () {
    const result = await getPoints();
    expect(typeof result).toBe('number');
  });

  test('getPoints returns seeded default points', async function () {
    const result = await getPoints();
    expect(result).toBe(DEFAULT_POINTS);
  });

  test('deductPoints returns boolean', async function () {
    const result = await deductPoints(50);
    expect(typeof result).toBe('boolean');
  });

  test('deductPoints returns false when balance insufficient', async function () {
    // Try to deduct more than possible
    const result = await deductPoints(10000);
    expect(result).toBe(false);
  });

  test('getActiveSetId returns null or number', async function () {
    const result = await getActiveSetId();
    expect(result === null || typeof result === 'number').toBe(true);
  });

  test('setPoints updates points correctly', async function () {
    await setPoints(200);
    const result = await getPoints();
    expect(result).toBe(200);
  });

  test('addPoints increases points', async function () {
    const before = await getPoints();
    await addPoints(50);
    const after = await getPoints();
    expect(after).toBe(before + 50);
  });
});

describe('Roll History Operations', function () {
  test('getRollHistory returns an array', async function () {
    const result = await getRollHistory({ setId: 100 });
    expect(Array.isArray(result)).toBe(true);
  });

  test('getRollHistory returns empty array when no data', async function () {
    const result = await getRollHistory({ setId: 9999 });
    expect(result).toEqual([]);
  });

  test('insertRoll adds a roll to history', async function () {
    const setId = 1;
    await insertRoll(setId, 20, 15);
    const result = await getRollHistory({ setId });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].result).toBe(15);
  });

  test('getRollHistory items have expected shape', async function () {
    const setId = 2;
    await insertRoll(setId, 20, 15);
    const result = await getRollHistory({ setId });
    const item = result.find(function (r) {
      return r.set_id === setId;
    });
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('set_id');
    expect(item).toHaveProperty('die_type');
    expect(item).toHaveProperty('result');
  });

  test('getDiceSetStats returns an object with aggregates', async function () {
    const setId = 3;
    await insertRoll(setId, 20, 10);
    await insertRoll(setId, 20, 15);
    await insertRoll(setId, 20, 20);
    const result = await getDiceSetStats(setId);
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('total_rolls');
    expect(result.total_rolls).toBe(3);
  });

  test('getRollDistribution returns array of result groups', async function () {
    const setId = 4;
    await insertRoll(setId, 20, 1);
    await insertRoll(setId, 20, 1);
    await insertRoll(setId, 20, 20);
    const result = await getRollDistribution(setId);
    expect(Array.isArray(result)).toBe(true);
    // Check that we have the expected results (1 and 20)
    const results = result.map(function (r) {
      return r.result;
    }).sort(function (a, b) {
      return a - b;
    });
    expect(results).toEqual([1, 20]);
  });

  test('getRollDistribution handles empty results', async function () {
    const result = await getRollDistribution(9999);
    expect(result).toEqual([]);
  });

  test('insertRoll updates dice_sets roll_count', async function () {
    const setId = 1;
    const database = await getDB();
    const before = await database.getFirstAsync(
      'SELECT roll_count FROM dice_sets WHERE id = ?',
      [setId]
    );

    await insertRoll(setId, 20, 12);

    const after = await database.getFirstAsync(
      'SELECT roll_count FROM dice_sets WHERE id = ?',
      [setId]
    );

    expect(after.roll_count).toBe((before?.roll_count ?? 0) + 1);
  });

  test('first purchase assigns and preserves hidden Betrayer turn point', async function () {
    const database = await getDB();

    await database.runAsync('UPDATE dice_sets SET owned = 1 WHERE id = 5');
    const firstThreshold = await getBetrayerTurnAfter(5);

    expect(firstThreshold).toBeGreaterThan(20);
    expect(firstThreshold).toBeLessThan(100);

    await database.runAsync('UPDATE dice_sets SET owned = 1 WHERE id = 5');
    const secondThreshold = await getBetrayerTurnAfter(5);

    expect(secondThreshold).toBe(firstThreshold);
  });
});
