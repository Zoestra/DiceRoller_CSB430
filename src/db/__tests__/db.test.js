/**
 * Database Tests
 *
 * Tests for database initialization and query functions.
 *
 * ---
 * NOTE: This file was created with AI assistance (Qwen Code).
 * ---
 */

// Mock expo-sqlite module BEFORE importing
jest.mock('expo-sqlite');

// Mock expo-asset module BEFORE importing
jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn().mockReturnValue({ uri: 'mock://schema.sql' }),
  },
}));

// Mock global fetch BEFORE importing db.js
global.fetch = jest.fn().mockResolvedValue({
  text: jest.fn().mockResolvedValue(`
    CREATE TABLE IF NOT EXISTS dice_sets (id INTEGER PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS skins (id INTEGER PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS roll_history (id INTEGER PRIMARY KEY, set_id INTEGER);
    CREATE TRIGGER IF NOT EXISTS after_roll_insert AFTER INSERT ON roll_history
    BEGIN UPDATE user_state SET total_rolls = total_rolls + 1 WHERE id = 1; END;
    CREATE TABLE IF NOT EXISTS achievements (id INTEGER PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS user_state (id INTEGER PRIMARY KEY, points INTEGER DEFAULT 100, total_rolls INTEGER DEFAULT 0, active_set_id INTEGER, dark_mode INTEGER DEFAULT 0);
  `),
});

import * as SQLite from 'expo-sqlite';
import {
  addPoints,
  deductPoints,
  getActiveSetId,
  getDB,
  getDiceSetStats,
  getPoints,
  getRollDistribution,
  getRollHistory,
  insertRoll,
  resetDatabase,
  setActiveSetId,
  setPoints,
} from '../db.js';

// Mock database instance
const mockDatabase = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
};

describe('Database Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SQLite.openDatabaseAsync.mockResolvedValue(mockDatabase);
  });

  test('getDB initializes database connection', async () => {
    const db = await getDB();

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('diceRoller.db');
    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      'PRAGMA foreign_keys = ON'
    );
    expect(mockDatabase.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS')
    );
    expect(db).toEqual(mockDatabase);
  });

  test('getDB returns cached connection on subsequent calls', async () => {
    // First call - initializes
    const db1 = await getDB();

    // Clear mock call count
    SQLite.openDatabaseAsync.mockClear();

    // Second call - should return cached connection
    const db2 = await getDB();

    // Should not call openDatabaseAsync again (uses cached db)
    expect(SQLite.openDatabaseAsync).not.toHaveBeenCalled();
    expect(db1).toBe(db2); // Same instance (singleton pattern)
  });

  test('resetDatabase drops all tables and reinitializes', async () => {
    await getDB();
    await resetDatabase();

    expect(mockDatabase.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('DROP TABLE IF EXISTS roll_history')
    );
    expect(mockDatabase.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('DROP TABLE IF EXISTS dice_sets')
    );
  });
});

describe('User State Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SQLite.openDatabaseAsync.mockResolvedValue(mockDatabase);
  });

  test('getPoints returns points from database', async () => {
    mockDatabase.getFirstAsync.mockResolvedValue({ points: 150 });

    const points = await getPoints();

    expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
      'SELECT points FROM user_state WHERE id = 1'
    );
    expect(points).toBe(150);
  });

  test('getPoints returns default value if no data', async () => {
    mockDatabase.getFirstAsync.mockResolvedValue(null);

    const points = await getPoints();

    expect(points).toBe(100);
  });

  test('setPoints updates points in database', async () => {
    await setPoints(250);

    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      'UPDATE user_state SET points = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [250]
    );
  });

  test('addPoints adds to current points', async () => {
    await addPoints(50);

    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      'UPDATE user_state SET points = points + ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [50]
    );
  });

  test('deductPoints succeeds when sufficient points', async () => {
    mockDatabase.getFirstAsync.mockResolvedValue({ points: 100 });

    const result = await deductPoints(50);

    expect(result).toBe(true);
    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      'UPDATE user_state SET points = points + ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [-50]
    );
  });

  test('deductPoints fails when insufficient points', async () => {
    mockDatabase.getFirstAsync.mockResolvedValue({ points: 30 });

    const result = await deductPoints(50);

    expect(result).toBe(false);
    expect(mockDatabase.runAsync).not.toHaveBeenCalled();
  });

  test('getActiveSetId returns active set ID from database', async () => {
    mockDatabase.getFirstAsync.mockResolvedValue({ active_set_id: 1 });

    const activeSetId = await getActiveSetId();

    expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
      'SELECT active_set_id FROM user_state WHERE id = 1'
    );
    expect(activeSetId).toBe(1);
  });

  test('getActiveSetId returns null if no active set', async () => {
    mockDatabase.getFirstAsync.mockResolvedValue({ active_set_id: null });

    const activeSetId = await getActiveSetId();

    expect(activeSetId).toBe(null);
  });

  test('setActiveSetId updates active set ID in database', async () => {
    await setActiveSetId(2);

    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      'UPDATE user_state SET active_set_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [2]
    );
  });
});

describe('Roll History Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SQLite.openDatabaseAsync.mockResolvedValue(mockDatabase);
  });

  test('insertRoll adds roll to history (trigger increments total_rolls)', async () => {
    await insertRoll(1, 20, 15);

    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      'INSERT INTO roll_history (set_id, die_type, result) VALUES (?, ?, ?)',
      [1, 20, 15]
    );
    // Trigger handles total_rolls increment automatically - no second call needed
    expect(mockDatabase.runAsync).toHaveBeenCalledTimes(1);
  });

  test('getRollHistory returns all rolls by default', async () => {
    const mockRolls = [
      { id: 1, set_id: 1, result: 20 },
      { id: 2, set_id: 1, result: 15 },
    ];
    mockDatabase.getAllAsync.mockResolvedValue(mockRolls);

    const rolls = await getRollHistory();

    expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM roll_history ORDER BY rolled_at DESC LIMIT ?',
      [100]
    );
    expect(rolls).toEqual(mockRolls);
  });

  test('getRollHistory filters by set_id when provided', async () => {
    const mockRolls = [{ id: 1, set_id: 2, result: 18 }];
    mockDatabase.getAllAsync.mockResolvedValue(mockRolls);

    await getRollHistory({ setId: 2, limit: 50 });

    expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM roll_history WHERE set_id = ? ORDER BY rolled_at DESC LIMIT ?',
      [2, 50]
    );
  });

  test('getDiceSetStats returns aggregated statistics', async () => {
    const mockStats = {
      total_rolls: 100,
      average: 10.5,
      min_roll: 1,
      max_roll: 20,
      max_rolls: 10,
      nat_1s: 5,
    };
    mockDatabase.getFirstAsync.mockResolvedValue(mockStats);

    const stats = await getDiceSetStats(1);

    expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      [1]
    );
    expect(stats).toEqual(mockStats);
  });

  test('getRollDistribution returns distribution data', async () => {
    const mockDistribution = [
      { result: 1, count: 5 },
      { result: 20, count: 10 },
    ];
    mockDatabase.getAllAsync.mockResolvedValue(mockDistribution);

    const distribution = await getRollDistribution(1);

    expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('GROUP BY result'),
      [1]
    );
    expect(distribution).toEqual(mockDistribution);
  });
});
