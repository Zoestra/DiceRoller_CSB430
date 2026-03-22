/**
 * Database CRUD Tests
 *
 * Tests for core database operations using a real in-memory SQLite database.
 * This avoids the complexity of mocking and tests actual SQL queries.
 *
 * ---
 * NOTE: This file was written with AI assistance (Qwen Code).
 * ---
 */

import Database from 'better-sqlite3';

// Import after mocking
import {
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

// Create in-memory database - using 'mock' prefix so Jest allows access in mock factory
const mockTestDb = new Database(':memory:');

// Create tables
mockTestDb.exec(`
  CREATE TABLE IF NOT EXISTS dice_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    set_name TEXT NOT NULL,
    attitude TEXT NOT NULL DEFAULT 'Balanced',
    owned INTEGER NOT NULL DEFAULT 0,
    equipped INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS roll_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    set_id INTEGER NOT NULL,
    die_type INTEGER NOT NULL,
    result INTEGER NOT NULL,
    rolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (set_id) REFERENCES dice_sets(id)
  );
  CREATE TABLE IF NOT EXISTS user_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    points INTEGER NOT NULL DEFAULT 100,
    total_rolls INTEGER NOT NULL DEFAULT 0,
    active_set_id INTEGER,
    dark_mode INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert initial user state
mockTestDb.exec(`INSERT INTO user_state (id, points, total_rolls, dark_mode) VALUES (1, 100, 0, 0)`);

// Mock expo-sqlite to use better-sqlite3 (using mockTestDb which Jest allows)
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    getFirstAsync: jest.fn(function(sql, params) {
      const stmt = mockTestDb.prepare(sql);
      const row = params ? stmt.get(...params) : stmt.get();
      return Promise.resolve(row);
    }),
    getAllAsync: jest.fn(function(sql, params) {
      const stmt = mockTestDb.prepare(sql);
      const rows = params ? stmt.all(...params) : stmt.all();
      return Promise.resolve(rows);
    }),
    runAsync: jest.fn(function(sql, params) {
      const stmt = mockTestDb.prepare(sql);
      if (params) {
        stmt.run(...params);
      } else {
        stmt.run();
      }
      return Promise.resolve({});
    }),
    execAsync: jest.fn(function(sql) {
      mockTestDb.exec(sql);
      return Promise.resolve();
    }),
  }),
}));

describe('User State Operations', () => {
  beforeEach(() => {
    // Reset user state before each test
    mockTestDb.exec(`UPDATE user_state SET points = 100, total_rolls = 0 WHERE id = 1`);
  });

  test('getPoints returns a number', async () => {
    const result = await getPoints();
    expect(typeof result).toBe('number');
  });

  test('getPoints defaults to 100 when no data exists', async () => {
    const result = await getPoints();
    expect(result).toBe(100);
  });

  test('deductPoints returns boolean true when balance sufficient', async () => {
    const result = await deductPoints(50);
    expect(typeof result).toBe('boolean');
    expect(result).toBe(true);
  });

  test('deductPoints returns false when balance insufficient', async () => {
    const result = await deductPoints(150);
    expect(result).toBe(false);
  });

  test('deductPoints does not call database when balance check fails', async () => {
    const initialPoints = await getPoints();
    await deductPoints(150);
    const finalPoints = await getPoints();
    expect(initialPoints).toBe(finalPoints);
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

  test('addPoints adds to current points', async () => {
    await addPoints(50);
    const result = await getPoints();
    expect(result).toBe(150);
  });
});

describe('Roll History Operations', () => {
  beforeEach(() => {
    // Clear roll history and reset user state
    mockTestDb.exec(`DELETE FROM roll_history`);
    mockTestDb.exec(`UPDATE user_state SET points = 100, total_rolls = 0 WHERE id = 1`);
    // Insert a test dice set
    mockTestDb.exec(`INSERT OR REPLACE INTO dice_sets (id, set_name, attitude, owned, equipped) VALUES (1, 'Test Set', 'Balanced', 1, 1)`);
  });

  test('getRollHistory returns an array', async () => {
    const result = await getRollHistory({ setId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  test('getRollHistory returns empty array when no data', async () => {
    const result = await getRollHistory({ setId: 999 });
    expect(result).toEqual([]);
  });

  test('insertRoll adds a roll to history', async () => {
    await insertRoll(1, 20, 15);
    const result = await getRollHistory({ setId: 1 });
    expect(result.length).toBe(1);
    expect(result[0].result).toBe(15);
  });

  test('getRollHistory items have expected shape', async () => {
    await insertRoll(1, 20, 15);
    const result = await getRollHistory({ setId: 1 });
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('set_id');
    expect(result[0]).toHaveProperty('die_type');
    expect(result[0]).toHaveProperty('result');
  });

  test('getDiceSetStats returns an object with aggregates', async () => {
    await insertRoll(1, 20, 10);
    await insertRoll(1, 20, 15);
    await insertRoll(1, 20, 20);
    const result = await getDiceSetStats(1);
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('total_rolls');
    expect(result.total_rolls).toBe(3);
  });

  test('getRollDistribution returns array of result groups', async () => {
    await insertRoll(1, 20, 1);
    await insertRoll(1, 20, 1);
    await insertRoll(1, 20, 20);
    const result = await getRollDistribution(1);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  test('getRollDistribution handles empty results', async () => {
    const result = await getRollDistribution(1);
    expect(result).toEqual([]);
  });
});

afterAll(() => {
  mockTestDb.close();
});
