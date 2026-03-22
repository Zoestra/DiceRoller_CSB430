/**
 * Jest Mock Setup - runs BEFORE test files are loaded
 *
 * This file sets up mocks that must be in place before any imports happen.
 *
 * ---
 * NOTE: This file was written with AI assistance (Qwen Code).
 * ---
 */

import Database from 'better-sqlite3';

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

// Make the database globally available for tests
global.mockTestDb = mockTestDb;

// Mock expo-sqlite to use better-sqlite3
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
