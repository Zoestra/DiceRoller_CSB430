/**
 * Database Module - Connection Management
 *
 * Provides a cache for the database connection.
 * Database must be initialized via initializeDatabase() at app startup.
 * Also re-exports all query functions from their respective modules.
 *
 * Query modules:
 *   - userState.js: points, settings (implemented)
 *   - rollHistory.js: roll history and stats (implemented)
 *   - diceSets.js: dice set queries (TODO)
 *   - skins.js: skin queries (placeholder - dallasWed)
 *   - achievements.js: achievement queries (placeholder - dallasWed)
 *
 * ---
 * NOTE: This file was written with AI assistance (Qwen Code, GitHub Copilot).
 * ---
 */

import * as SQLite from 'expo-sqlite';

// Implemented modules
export { getDiceSetStats, getRollDistribution, getRollHistory, insertRoll } from './rollHistory.js';
export { addPoints, deductPoints, DEFAULT_POINTS, getActiveSetId, getPoints, setActiveSetId, setPoints } from './userState.js';

const DB_NAME = 'diceRoller.db';

let db = null;
let openDatabaseAsyncFn = SQLite.openDatabaseAsync;

/**
 * Get cached database connection
 *
 * Assumes the database was initialized via `npm run initialize` at setup time.
 * On first call, opens the database file.
 * On subsequent calls, returns cached connection.
 *
 * @returns {Promise<SQLite.SQLiteDatabase>}
 */
export async function getDB() {
  if (!db) {
    db = await openDatabaseAsyncFn(DB_NAME);
  }
  return db;
}

/**
 * Reset the database (for testing/development only)
 * Drops all tables and recreates from schema
 */
export async function resetDatabase() {
  const database = await getDB();
  await database.execAsync(`
    DROP TABLE IF EXISTS roll_history;
    DROP TABLE IF EXISTS achievements;
    DROP TABLE IF EXISTS skins;
    DROP TABLE IF EXISTS dice_sets;
    DROP TABLE IF EXISTS user_state;
  `);
  db = null;
}

export function __resetDbForTests() {
  db = null;
}

export function __setOpenDatabaseForTests(openDatabaseAsync) {
  openDatabaseAsyncFn = openDatabaseAsync;
  db = null;
}

export function __restoreOpenDatabaseForTests() {
  openDatabaseAsyncFn = SQLite.openDatabaseAsync;
  db = null;
}
