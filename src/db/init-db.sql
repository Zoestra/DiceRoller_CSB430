-- NOTE: This file was written with AI assistance (Qwen Code).

-- ============================================
-- TABLE: skins
-- Stores cosmetic skins for dice
-- ============================================
CREATE TABLE IF NOT EXISTS skins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skin_name TEXT NOT NULL,
  skin_description TEXT,
  skin_folder TEXT NOT NULL,
  skin_fill_color CHAR(7) DEFAULT '#e0e0e0',
  skin_edge_color CHAR(7) DEFAULT '#000000',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: dice_sets
-- Stores all dice sets with their attitudes
-- ============================================
CREATE TABLE IF NOT EXISTS dice_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  set_name TEXT NOT NULL,
  set_skin INTEGER NOT NULL DEFAULT 1,
  attitude TEXT NOT NULL DEFAULT 'Balanced',
  betrayer_turn_after INTEGER,
  roll_count INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 10,
  owned INTEGER NOT NULL DEFAULT 0,
  equipped INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (set_skin) REFERENCES skins(id)
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
-- TRIGGER: after_roll_insert
-- Auto-increment total_rolls and per-set roll_count when a roll is inserted
-- ============================================
CREATE TRIGGER IF NOT EXISTS after_roll_insert
AFTER INSERT ON roll_history
BEGIN
  UPDATE user_state SET total_rolls = total_rolls + 1 WHERE id = 1;
  UPDATE dice_sets SET roll_count = roll_count + 1 WHERE id = NEW.set_id;
END;

-- ============================================
-- TRIGGER: initialize_betrayer_turn_after
-- On first purchase of a Betrayer set, lock hidden turn point (21-99)
-- ============================================
CREATE TRIGGER IF NOT EXISTS initialize_betrayer_turn_after
AFTER UPDATE OF owned ON dice_sets
WHEN NEW.attitude = 'Betrayer'
  AND NEW.owned = 1
  AND IFNULL(OLD.owned, 0) = 0
  AND NEW.betrayer_turn_after IS NULL
BEGIN
  UPDATE dice_sets
  SET betrayer_turn_after = (ABS(RANDOM()) % 79) + 21
  WHERE id = NEW.id;
END;

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
  points INTEGER NOT NULL DEFAULT 0,
  total_rolls INTEGER NOT NULL DEFAULT 0,
  active_set_id INTEGER,
  dark_mode INTEGER NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (active_set_id) REFERENCES dice_sets(id)
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
-- Default skins
-- ============================================
INSERT OR IGNORE INTO skins (skin_name, skin_description, skin_folder)
VALUES
  ('Classic', 'Default skin', 'dark-wood'),
  ('Golden', 'Shiny gold appearance', 'golden'),
  ('Obsidian', 'Dark and mysterious', 'rock'),
  ('Crystal', 'Translucent gemstone look', 'diamond');

-- ============================================
-- SEED DATA
-- Default dice sets
-- ============================================
INSERT OR IGNORE INTO dice_sets (set_name, attitude, betrayer_turn_after, roll_count, owned, equipped, set_skin, price)
VALUES
  ('Classic', 'Balanced', NULL, 0, 1, 1, 1, 0),
  ('Lucky', 'Lucky', NULL, 0, 0, 0, 2, 100),
  ('Cursed', 'Cursed', NULL, 0, 0, 0, 3, 10),
  ('Chaotic', 'Chaotic', NULL, 0, 0, 0, 1, 50),
  ('Betrayer', 'Betrayer', NULL, 0, 0, 0, 2, 100),
  ('Mid', 'Mid', NULL, 0, 0, 0, 3, 50);

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
-- Default user state
-- ============================================
INSERT OR IGNORE INTO user_state (id, points, total_rolls, active_set_id, dark_mode)
VALUES (1, 0, 0, 1, 0);

-- ===========================================
-- ACHIEVEMENT TRIGGERS
-- ===========================================

-- First Roll Achievement
CREATE TRIGGER IF NOT EXISTS trg_first_roll
AFTER INSERT ON roll_history
-- Check for first roll, only triggers for first roll
WHEN (SELECT claimed FROM achievements WHERE achv_script = 'first_roll') = 0
BEGIN
  UPDATE achievements SET claimed = 1 WHERE achv_script = 'first_roll';
  UPDATE user_state SET points = points + (
    SELECT reward_points FROM achievements WHERE achv_script = 'first_roll'
  ) WHERE id = 1;
END;

-- Natural 20 Achievement
CREATE TRIGGER IF NOT EXISTS trg_nat_20
AFTER INSERT ON roll_history
-- Check for the first natural 20, only triggers for first natural 20
WHEN NEW.result = 20
  AND NEW.die_type = 20
  AND (SELECT claimed FROM achievements WHERE achv_script = 'nat_20') = 0
BEGIN
  UPDATE achievements SET claimed = 1 WHERE achv_script = 'nat_20';
  UPDATE user_state SET points = points + (
    SELECT reward_points FROM achievements WHERE achv_script = 'nat_20'
  ) WHERE id = 1;
END;

-- Nat 20 Master (50 nat 20s)
CREATE TRIGGER IF NOT EXISTS trg_nat_20_master
AFTER INSERT ON roll_history
WHEN NEW.result = 20
  AND NEW.die_type = 20
  AND (SELECT claimed FROM achievements WHERE achv_script = 'nat_20_master') = 0
  -- Check if the amount of 20s rolled is at least 50
  AND (SELECT COUNT(*) FROM roll_history WHERE result = 20 AND die_type = 20) >= 50
BEGIN
  UPDATE achievements SET claimed = 1 WHERE achv_script = 'nat_20_master';
  UPDATE user_state SET points = points + (
    SELECT reward_points FROM achievements WHERE achv_script = 'nat_20_master'
  ) WHERE id = 1;
END;

-- Centurion (100 rolls)
CREATE TRIGGER IF NOT EXISTS trg_total_rolls_100
AFTER INSERT ON roll_history
-- Triggers when there are at least 100 rolls recorded
WHEN (SELECT claimed FROM achievements WHERE achv_script = 'total_rolls_100') = 0
  AND (SELECT total_rolls FROM user_state WHERE id = 1) >= 100
BEGIN
  UPDATE achievements SET claimed = 1 WHERE achv_script = 'total_rolls_100';
  UPDATE user_state SET points = points + (
    SELECT reward_points FROM achievements WHERE achv_script = 'total_rolls_100'
  ) WHERE id = 1;
END;

-- Millenium (1000 rolls)
CREATE TRIGGER IF NOT EXISTS trg_total_rolls_1000
AFTER INSERT ON roll_history
-- Triggers when there are at least 1000 rolls recorded
WHEN (SELECT claimed FROM achievements WHERE achv_script = 'total_rolls_1000') = 0
  AND (SELECT total_rolls FROM user_state WHERE id = 1) >= 1000
BEGIN
  UPDATE achievements SET claimed = 1 WHERE achv_script = 'total_rolls_1000';
  UPDATE user_state SET points = points + (
    SELECT reward_points FROM achievements WHERE achv_script = 'total_rolls_1000'
  ) WHERE id = 1;
END;

-- Low Roller (first 1 rolled on a d20)
CREATE TRIGGER IF NOT EXISTS trg_low_roller
AFTER INSERT ON roll_history
-- Triggers when the first 1 is rolled AND the die type is d20
WHEN NEW.result = 1
  AND NEW.die_type = 20
  AND (SELECT claimed FROM achievements WHERE achv_script = 'low_roller') = 0
BEGIN
  UPDATE achievements SET claimed = 1 WHERE achv_script = 'low_roller';
  UPDATE user_state SET points = points + (
    SELECT reward_points FROM achievements WHERE achv_script = 'low_roller'
  ) WHERE id = 1;
END;

-- High Roller (Points exceed 1000)
CREATE TRIGGER IF NOT EXISTS trg_high_roller
AFTER UPDATE OF points ON user_state
-- Trigger when stored points exceed 1000
WHEN NEW.points >= 1000
  AND (SELECT claimed FROM achievements WHERE achv_script = 'high_roller') = 0
BEGIN
  UPDATE achievements SET claimed = 1 WHERE achv_script = 'high_roller';
  UPDATE user_state SET points = points + (
    SELECT reward_points FROM achievements WHERE achv_script = 'high_roller'
  ) WHERE id = 1;
END;