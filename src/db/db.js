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
import { Platform } from 'react-native';

// Implemented modules
export { getBetrayerTurnAfter } from './diceSets.js';
export { getDiceSetStats, getRollDistribution, getRollHistory, insertRoll } from './rollHistory.js';
export { addPoints, deductPoints, DEFAULT_POINTS, getActiveSetId, getPoints, setActiveSetId, setPoints } from './userState.js';

const DB_NAME = 'diceRoller.db';

let db = null;
let dbPromise = null;
let openDatabaseAsyncFn = SQLite.openDatabaseAsync;

function removeSqlLineComments(sqlText) {
  return sqlText
    .split('\n')
    .filter(function (line) {
      return !line.trim().startsWith('--');
    })
    .join('\n');
}

function splitSqlStatements(sqlText) {
  const sqlWithoutComments = removeSqlLineComments(sqlText);

  const lines = sqlWithoutComments.split('\n');
  const statements = [];
  let current = '';
  let inTrigger = false;

  for (let rawLine of lines) {
    const line = rawLine + '\n';
    const trimmedUpper = rawLine.trim().toUpperCase();

    // Detect start of a trigger definition
    if (!inTrigger && trimmedUpper.startsWith('CREATE TRIGGER')) {
      inTrigger = true;
    }

    current += line;

    if (inTrigger) {
      // Detect end of trigger block (END or END;)
      if (/^END\s*;?$/i.test(rawLine.trim())) {
        statements.push(current.trim());
        current = '';
        inTrigger = false;
      }
      continue;
    }

    // When not in a trigger, split on semicolons at statement boundaries
    if (rawLine.includes(';')) {
      // A line may contain multiple statements; split them safely
      const parts = current.split(';');
      for (let i = 0; i < parts.length - 1; i++) {
        const stmt = parts[i].trim();
        if (stmt.length > 0) statements.push(stmt);
      }
      current = parts[parts.length - 1];
    }
  }

  if (current.trim().length > 0) {
    statements.push(current.trim());
  }

  return statements.filter(function (s) {
    return s.length > 0;
  });
}

async function ensureSchemaInitialized(database) {
  const schemaExists = await database.getFirstAsync(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='user_state'"
  );

  if (schemaExists) {
    return;
  }

  const schemaSql = await loadInitSql();
  const statements = splitSqlStatements(schemaSql);

  for (const statement of statements) {
    try {
      await database.execAsync(`${statement};`);
    } catch (error) {
      const isTriggerStatement = statement.toUpperCase().startsWith('CREATE TRIGGER');
      if (isTriggerStatement) {
        console.warn('Skipping trigger initialization statement:', error?.message ?? String(error));
        continue;
      }

      const message = error?.message ?? String(error);
      throw new Error(`Schema initialization failed: ${message}`);
    }
  }
}

async function loadInitSql() {
  const initDbSqlAssetPath = './init-db.sql';
  const initDbSqlAsset = require(initDbSqlAssetPath);
  const asset = Asset.fromModule(initDbSqlAsset);
  const shouldDownloadAsset = Platform.OS !== 'web';
  if (shouldDownloadAsset && !asset.downloaded) {
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
  let database;
  try {
    database = await openDatabaseAsyncFn(DB_NAME);
  } catch (error) {
    const message = error?.message ?? String(error);
    const shouldFallbackToMemory = Platform.OS === 'web' && message.includes('NoModificationAllowedError');
    if (!shouldFallbackToMemory) {
      throw error;
    }

    console.warn('Persistent web SQLite unavailable. Falling back to in-memory DB.');
    database = await openDatabaseAsyncFn(':memory:');
  }

  await database.execAsync('PRAGMA foreign_keys = ON;');

  const isUsingProductionDatabaseOpener = openDatabaseAsyncFn === SQLite.openDatabaseAsync;
  if (isUsingProductionDatabaseOpener) {
    await ensureSchemaInitialized(database);
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

  // Disable foreign key enforcement so we can drop tables in any order
  try {
    await database.execAsync('PRAGMA foreign_keys = OFF;');
  } catch (err) {
    console.warn('Failed to disable foreign_keys pragma:', err?.message ?? String(err));
  }

  try {
    await database.execAsync(`
      DROP TRIGGER IF EXISTS after_roll_insert;
      DROP TRIGGER IF EXISTS initialize_betrayer_turn_after;

      DROP TABLE IF EXISTS roll_history;
      DROP TABLE IF EXISTS achievements;
      DROP TABLE IF EXISTS skins;
      DROP TABLE IF EXISTS dice_sets;
      DROP TABLE IF EXISTS user_state;

      -- Reset sqlite_sequence so AUTOINCREMENT values start over
      DELETE FROM sqlite_sequence WHERE name IN ('skins','dice_sets','roll_history','achievements');
    `);
  } catch (err) {
    console.warn('Error while dropping tables during resetDatabase:', err?.message ?? String(err));
  } finally {
    // Re-enable foreign key enforcement on this connection
    try {
      await database.execAsync('PRAGMA foreign_keys = ON;');
    } catch (err) {
      console.warn('Failed to re-enable foreign_keys pragma:', err?.message ?? String(err));
    }
  }

  // Clear cached connection so getDB() will recreate and initialize schema
  db = null;
  dbPromise = null;

  // Re-open and initialize immediately so the DB is reseeded right away
  await getDB();
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
