/**
 * Jest Setup File
 *
 * Global setup and teardown for tests.
 *
 * ---
 * NOTE: This file was created with AI assistance (Qwen Code).
 * ---
 */

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

// Mock expo-asset
jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn((module) => ({
      uri: 'mock://asset-uri',
    })),
  },
}));

// Mock fetch for loading SQL schema
global.fetch = jest.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve(`
      CREATE TABLE IF NOT EXISTS dice_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        set_name TEXT NOT NULL,
        attitude TEXT NOT NULL DEFAULT 'Balanced',
        owned INTEGER NOT NULL DEFAULT 0,
        equipped INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS skins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        skin_name TEXT NOT NULL,
        skin_description TEXT,
        skin_folder TEXT NOT NULL,
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
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        achv_name TEXT NOT NULL,
        achv_description TEXT,
        achv_script TEXT NOT NULL,
        achv_image TEXT NOT NULL,
        reward_points INTEGER NOT NULL,
        claimed INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS user_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        points INTEGER NOT NULL DEFAULT 100,
        total_rolls INTEGER NOT NULL DEFAULT 0,
        dark_mode INTEGER NOT NULL DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      INSERT OR IGNORE INTO user_state (id, points, total_rolls, dark_mode)
      VALUES (1, 100, 0, 0);
      INSERT OR IGNORE INTO dice_sets (set_name, attitude, owned, equipped)
      VALUES
        ('Classic D20', 'Balanced', 1, 1),
        ('Lucky D20', 'Lucky', 0, 0),
        ('Cursed D20', 'Cursed', 0, 0),
        ('Chaotic D20', 'Chaotic', 0, 0),
        ('Betrayer D20', 'Betrayer', 0, 0),
        ('Mid D20', 'Mid', 0, 0);
    `),
  })
);
