/**
 * Database Core - Connection and Bootstrap
 *
 * Owns SQLite connection lifecycle and schema initialization.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import { Asset } from 'expo-asset';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const DB_NAME = 'diceRoller.db';

let db = null;
let dbPromise = null;
let openDatabaseAsyncFn = SQLite.openDatabaseAsync;

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

async function ensureSchemaInitialized(database) {
  const schemaExists = await database.getFirstAsync(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='user_state'"
  );

  if (schemaExists) {
    return;
  }

  const schemaSql = await loadInitSql();
  try {
    await database.execAsync(schemaSql);
  } catch (error) {
    const message = error?.message ?? String(error);
    throw new Error(`Schema initialization failed: ${message}`);
  }
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
 * Get cached database connection.
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
 * Reset the database (for testing/development only).
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
