/**
 * Test Database Harness
 *
 * Creates an isolated temporary SQLite database for each test,
 * initialized with the same schema as production.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot).
 * ---
 */

import Database from 'better-sqlite3';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const SCHEMA_PATH = path.join(process.cwd(), 'src', 'db', 'init-db.sql');

let activeDb = null;
let activeDbAdapter = null;
let tempDirectoryPath = null;

function getParams(params) {
  if (Array.isArray(params)) {
    return params;
  }
  if (params === undefined || params === null) {
    return [];
  }
  return [params];
}

function createAsyncAdapter(db) {
  return {
    async getFirstAsync(sql, params) {
      const statement = db.prepare(sql);
      const row = statement.get(...getParams(params));
      return row;
    },
    async getAllAsync(sql, params) {
      const statement = db.prepare(sql);
      const rows = statement.all(...getParams(params));
      return rows;
    },
    async runAsync(sql, params) {
      const statement = db.prepare(sql);
      const result = statement.run(...getParams(params));
      return result;
    },
    async execAsync(sql) {
      db.exec(sql);
    },
  };
}

export async function createFreshTestDatabase() {
  await teardownTestDatabase();

  const schema = await fs.readFile(SCHEMA_PATH, 'utf-8');
  tempDirectoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'diceroller-test-'));
  const testDbPath = path.join(tempDirectoryPath, 'test.sqlite');

  activeDb = new Database(testDbPath);
  activeDb.pragma('foreign_keys = ON');
  activeDb.exec(schema);
  activeDbAdapter = createAsyncAdapter(activeDb);
}

export function getOpenDatabaseAsyncForTests() {
  return async function openDatabaseAsync() {
    if (!activeDbAdapter) {
      throw new Error('Test database has not been initialized. Call createFreshTestDatabase() first.');
    }
    return activeDbAdapter;
  };
}

export async function teardownTestDatabase() {
  if (activeDb) {
    activeDb.close();
    activeDb = null;
    activeDbAdapter = null;
  }

  if (tempDirectoryPath) {
    await fs.rm(tempDirectoryPath, { recursive: true, force: true });
    tempDirectoryPath = null;
  }
}
