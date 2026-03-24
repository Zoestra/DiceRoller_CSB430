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

import { Asset } from 'expo-asset';
import * as SQLite from 'expo-sqlite';

// Implemented modules
export { getDiceSetStats, getRollDistribution, getRollHistory, insertRoll } from './rollHistory.js';
export { addPoints, deductPoints, DEFAULT_POINTS, getActiveSetId, getPoints, setActiveSetId, setPoints } from './userState.js';

const DB_NAME = 'diceRoller.db';

let db = null;
let dbPromise = null;
let openDatabaseAsyncFn = SQLite.openDatabaseAsync;

async function loadInitSql() {
  const initDbSqlAssetPath = './init-db.sql';
  const initDbSqlAsset = require(initDbSqlAssetPath);
  const asset = Asset.fromModule(initDbSqlAsset);
  if (!asset.downloaded) {
    await asset.downloadAsync();
  }

  const assetUri = asset.localUri ?? asset.uri;
  if (!assetUri) {
    throw new Error('Unable to resolve init-db.sql asset URI.');
  }

  const response = await fetch(assetUri);
  if (!response.ok) {
    throw new Error(`Failed to load init-db.sql asset: HTTP ${response.status}`);
  }

  return response.text();
}

async function openAndInitializeDatabase() {
  const database = await openDatabaseAsyncFn(DB_NAME);
  await database.execAsync('PRAGMA foreign_keys = ON;');

  const isUsingProductionDatabaseOpener = openDatabaseAsyncFn === SQLite.openDatabaseAsync;
  if (isUsingProductionDatabaseOpener) {
    const schemaSql = await loadInitSql();
    await database.execAsync(schemaSql);
  }

  return database;
}

/**
 * Get cached database connection
 *
 * On first call, opens the database file.
 * On subsequent calls, returns cached connection.
 *
 * @returns {Promise<SQLite.SQLiteDatabase>}
 */
export async function getDB() {
  if (db !== null) {
    return db;
  }

  if (dbPromise === null) {
    dbPromise = openAndInitializeDatabase();
  }

  try {
    db = await dbPromise;
    return db;
  } catch (error) {
    dbPromise = null;
    throw error;
  }
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
  dbPromise = null;
}

export function __resetDbForTests() {
  db = null;
  dbPromise = null;
}

export function __setOpenDatabaseForTests(openDatabaseAsync) {
  openDatabaseAsyncFn = openDatabaseAsync;
  db = null;
  dbPromise = null;
}

export function __restoreOpenDatabaseForTests() {
  openDatabaseAsyncFn = SQLite.openDatabaseAsync;
  db = null;
  dbPromise = null;
}
