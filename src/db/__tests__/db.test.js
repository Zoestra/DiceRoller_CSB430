/**
 * Database Tests
 *
 * Tests for database initialization and query functions.
 *
 * ---
 * NOTE: This file was created with AI assistance (Qwen Code).
 * ---
 */

import * as SQLite from 'expo-sqlite';
import {
  addPoints,
  deductPoints,
  getDB,
  getDiceSetStats,
  getPoints,
  getRollDistribution,
  getRollHistory,
  insertRoll,
  resetDatabase,
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

  afterEach(() => {
    // Reset db reference between tests
    jest.resetModules();
  });

  test('getDB initializes database connection', async () => {
    const db = await getDB();

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('diceRoller.db');
    expect(mockDatabase.execAsync).toHaveBeenCalled();
    expect(db).toEqual(mockDatabase);
  });

  test('getDB returns existing connection if already initialized', async () => {
    await getDB();
    
    // Clear the mock call count after initialization
    SQLite.openDatabaseAsync.mockClear();
    
    const db2 = await getDB();

    // Should not call openDatabaseAsync again (connection is cached)
    expect(SQLite.openDatabaseAsync).not.toHaveBeenCalled();
    expect(db2).toEqual(mockDatabase);
  });

  test('resetDatabase drops all tables', async () => {
    await getDB();
    await resetDatabase();

    expect(mockDatabase.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('DROP TABLE IF EXISTS roll_history')
    );
    expect(mockDatabase.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('DROP TABLE IF EXISTS dice_sets')
    );
    expect(mockDatabase.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('DROP TABLE IF EXISTS user_state')
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
});

describe('Roll History Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SQLite.openDatabaseAsync.mockResolvedValue(mockDatabase);
  });

  test('insertRoll adds roll to history and increments total_rolls', async () => {
    await insertRoll(1, 20, 15);

    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      'INSERT INTO roll_history (set_id, die_type, result) VALUES (?, ?, ?)',
      [1, 20, 15]
    );
    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      'UPDATE user_state SET total_rolls = total_rolls + 1 WHERE id = 1'
    );
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
      nat_20s: 10,
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
