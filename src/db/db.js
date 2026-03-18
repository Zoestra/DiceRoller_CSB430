/**
 * Database Module - Core Initialization
 *
 * Handles database connection and schema initialization.
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
 * NOTE: This file was written with AI assistance (Qwen Code).
 * ---
 */

import { Asset } from 'expo-asset';
import * as SQLite from 'expo-sqlite';

// Implemented modules
export { getDiceSetStats, getRollDistribution, getRollHistory, insertRoll } from './rollHistory.js';
export { addPoints, deductPoints, getPoints, setPoints } from './userState.js';

// Placeholder exports - to be implemented by respective team members
// diceSets.js - Issues #17, #18
// skins.js - Issues #24-27, #39 (dallasWed)
// achievements.js - Issues #28-31, #39 (dallasWed)


const DB_NAME = 'diceRoller.db';

let db = null;

/**
 * Initialize the database connection
 * @returns {Promise<SQLite.SQLiteDatabase>}
 */
export async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await initSchema();
  }
  return db;
}

/**
 * Load and execute the schema from init-db.sql
 */
async function initSchema() {
  const database = await getDB();
  const schemaUri = Asset.fromModule(require('./init-db.sql')).uri;
  const schema = await fetch(schemaUri).then(r => r.text());
  await database.execAsync(schema);
  console.log('Database schema initialized from init-db.sql');
}

/**
 * Reset the database (for testing/development)
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
  await getDB();
}
