-- NOTE: This file was written with AI assistance (Qwen Code).

-- ============================================
-- TABLE: dice_sets
-- Stores all dice sets with their attitudes
-- ============================================
CREATE TABLE IF NOT EXISTS dice_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  set_name TEXT NOT NULL,
  attitude TEXT NOT NULL DEFAULT 'Balanced',
  owned INTEGER NOT NULL DEFAULT 0,
  equipped INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: skins
-- Stores cosmetic skins for dice
-- ============================================
CREATE TABLE IF NOT EXISTS skins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skin_name TEXT NOT NULL,
  skin_description TEXT,
  skin_folder TEXT NOT NULL,
  owned INTEGER NOT NULL DEFAULT 0,
  equipped INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: roll_history
-- Tracks all dice rolls for stats/achievements
-- ============================================
CREATE TABLE IF NOT EXISTS roll_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  set_id INTEGER NOT NULL,
  die_type INTEGER NOT NULL,
  result INTEGER NOT NULL,
  rolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (set_id) REFERENCES dice_sets(id)
);

-- ============================================
-- TABLE: user_achievements
-- Tracks achievement progress and completions
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  achv_name TEXT NOT NULL,
  achv_description TEXT,
  achv_script TEXT NOT NULL,
  achv_image TEXT NOT NULL,
  reward_points INTEGER NOT NULL,
  claimed INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- TABLE: user_state
-- Single row for global user state
-- ============================================
CREATE TABLE IF NOT EXISTS user_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  points INTEGER NOT NULL DEFAULT 100,
  total_rolls INTEGER NOT NULL DEFAULT 0,
  dark_mode INTEGER NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- For query performance optimization
-- ============================================
CREATE INDEX IF NOT EXISTS idx_roll_history_set_id ON roll_history(set_id);
CREATE INDEX IF NOT EXISTS idx_roll_history_rolled_at ON roll_history(rolled_at);
CREATE INDEX IF NOT EXISTS idx_roll_history_result ON roll_history(result);

-- ============================================
-- SEED DATA
-- Default dice sets
-- ============================================
INSERT OR IGNORE INTO dice_sets (set_name, attitude, owned, equipped)
VALUES
  ('Classic', 'Balanced', 1, 1),
  ('Lucky', 'Lucky', 0, 0),
  ('Cursed', 'Cursed', 0, 0),
  ('Chaotic', 'Chaotic', 0, 0),
  ('Betrayer', 'Betrayer', 0, 0),
  ('Mid', 'Mid', 0, 0);

-- ============================================
-- SEED DATA
-- Default achievements
-- ============================================
INSERT OR IGNORE INTO achievements (achv_name, achv_description, achv_script, achv_image, reward_points)
VALUES
  ('First Roll', 'Roll the dice for the first time', 'first_roll', 'first_roll.png', 10),
  ('Natural 20', 'Roll a natural 20', 'nat_20', 'nat_20.png', 25),
  ('Nat 20 Master', 'Roll 50 natural 20s', 'nat_20_master', 'nat_20_master.png', 100),
  ('Centurion', 'Roll the dice 100 times', 'total_rolls_100', 'centurion.png', 50),
  ('Millennium', 'Roll the dice 1000 times', 'total_rolls_1000', 'millennium.png', 200),
  ('Low Roller', 'Roll a natural 1', 'low_roller', 'low_roller.png', 15),
  ('High Roller', 'Accumulate 1000 total points', 'high_roller', 'high_roller.png', 150);

-- ============================================
-- SEED DATA
-- Default skins
-- ============================================
INSERT OR IGNORE INTO skins (skin_name, skin_description, skin_folder, owned)
VALUES
  ('Classic', 'Default skin', 'classic', 1),
  ('Golden', 'Shiny gold appearance', 'golden', 0),
  ('Obsidian', 'Dark and mysterious', 'obsidian', 0),
  ('Crystal', 'Translucent gemstone look', 'crystal', 0);

-- ============================================
-- SEED DATA
-- Default user state
-- ============================================
INSERT OR IGNORE INTO user_state (id, points, total_rolls, dark_mode)
VALUES (1, 100, 0, 0);
