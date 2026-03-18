/**
 * NOTE: This file was written with AI assistance (Qwen Code).
 */

import { Asset } from 'expo-asset';
import * as SQLite from 'expo-sqlite';

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

// ============ User State Queries ============

/**
 * Get current user points
 * @returns {Promise<number>}
 */
export async function getPoints() {
  const database = await getDB();
  const result = await database.getFirstAsync('SELECT points FROM user_state WHERE id = 1');
  return result?.points ?? 100;
}

/**
 * Update user points
 * @param {number} points - New points value
 */
export async function setPoints(points) {
  const database = await getDB();
  await database.runAsync(
    'UPDATE user_state SET points = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
    [points]
  );
}

/**
 * Add points to current balance
 * @param {number} amount - Points to add
 */
export async function addPoints(amount) {
  const database = await getDB();
  await database.runAsync(
    'UPDATE user_state SET points = points + ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
    [amount]
  );
}

/**
 * Deduct points from current balance
 * @param {number} amount - Points to deduct
 * @returns {Promise<boolean>} - True if successful, false if insufficient points
 */
export async function deductPoints(amount) {
  const currentPoints = await getPoints();
  if (currentPoints < amount) {
    return false;
  }
  await addPoints(-amount);
  return true;
}

// ============ Dice Sets Queries ============

/**
 * Get all dice sets
 * @returns {Promise<Array>}
 */
export async function getAllDiceSets() {
  const database = await getDB();
  return await database.getAllAsync('SELECT * FROM dice_sets ORDER BY id');
}

/**
 * Get equipped dice set
 * @returns {Promise<Object|null>}
 */
export async function getEquippedDiceSet() {
  const database = await getDB();
  return await database.getFirstAsync('SELECT * FROM dice_sets WHERE equipped = 1');
}

/**
 * Equip a dice set
 * @param {number} setId - ID of the set to equip
 */
export async function equipDiceSet(setId) {
  const database = await getDB();
  await database.runAsync('UPDATE dice_sets SET equipped = 0');
  await database.runAsync('UPDATE dice_sets SET equipped = 1 WHERE id = ?', [setId]);
}

/**
 * Purchase a dice set
 * @param {number} setId - ID of the set to purchase
 * @param {number} cost - Cost of the set
 * @returns {Promise<boolean>} - True if purchase successful
 */
export async function purchaseDiceSet(setId, cost) {
  const canDeduct = await deductPoints(cost);
  if (!canDeduct) {
    return false;
  }
  const database = await getDB();
  await database.runAsync('UPDATE dice_sets SET owned = 1 WHERE id = ?', [setId]);
  return true;
}

// ============ Skins Queries ============
// NOTE: Skin functionality is handled by dallasWed (Issues #24-27, #39)
// Stubs provided for integration - implement in src/db/skins.js or similar

/**
 * Get all skins
 * @returns {Promise<Array>}
 */
export async function getAllSkins() {
  // TODO: Implement per issue #24-27
  throw new Error('Skin functionality not yet implemented - see issue #24');
}

/**
 * Get equipped skin
 * @returns {Promise<Object|null>}
 */
export async function getEquippedSkin() {
  // TODO: Implement per issue #24-27
  throw new Error('Skin functionality not yet implemented - see issue #24');
}

/**
 * Equip a skin
 * @param {number} skinId - ID of the skin to equip
 */
export async function equipSkin(skinId) {
  // TODO: Implement per issue #24-27
  throw new Error('Skin functionality not yet implemented - see issue #24');
}

/**
 * Purchase a skin
 * @param {number} skinId - ID of the skin to purchase
 * @param {number} cost - Cost of the skin
 * @returns {Promise<boolean>} - True if purchase successful
 */
export async function purchaseSkin(skinId, cost) {
  // TODO: Implement per issue #24-27
  throw new Error('Skin functionality not yet implemented - see issue #24');
}

// ============ Roll History Queries ============

/**
 * Insert a roll into history
 * @param {number} setId - Dice set ID
 * @param {number} dieType - Type of die (e.g., 20)
 * @param {number} result - Final result
 */
export async function insertRoll(setId, dieType, result) {
  const database = await getDB();
  await database.runAsync(
    'INSERT INTO roll_history (set_id, die_type, result) VALUES (?, ?, ?)',
    [setId, dieType, result]
  );
  await database.runAsync('UPDATE user_state SET total_rolls = total_rolls + 1 WHERE id = 1');
}

/**
 * Get roll history with optional filters
 * @param {Object} options - Filter options
 * @param {number} options.setId - Filter by dice set
 * @param {number} options.limit - Limit number of results
 * @returns {Promise<Array>}
 */
export async function getRollHistory({ setId, limit = 100 } = {}) {
  const database = await getDB();
  if (setId) {
    return await database.getAllAsync(
      'SELECT * FROM roll_history WHERE set_id = ? ORDER BY rolled_at DESC LIMIT ?',
      [setId, limit]
    );
  }
  return await database.getAllAsync(
    'SELECT * FROM roll_history ORDER BY rolled_at DESC LIMIT ?',
    [limit]
  );
}

/**
 * Get stats for a specific dice set
 * @param {number} setId - Dice set ID
 * @returns {Promise<Object>}
 */
export async function getDiceSetStats(setId) {
  const database = await getDB();
  return await database.getFirstAsync(`
    SELECT 
      COUNT(*) as total_rolls,
      AVG(result) as average,
      MIN(result) as min_roll,
      MAX(result) as max_roll,
      SUM(CASE WHEN result = 20 THEN 1 ELSE 0 END) as nat_20s,
      SUM(CASE WHEN result = 1 THEN 1 ELSE 0 END) as nat_1s
    FROM roll_history 
    WHERE set_id = ?
  `, [setId]);
}

/**
 * Get distribution data for histogram
 * @param {number} setId - Dice set ID
 * @returns {Promise<Array>}
 */
export async function getRollDistribution(setId) {
  const database = await getDB();
  return await database.getAllAsync(`
    SELECT result, COUNT(*) as count
    FROM roll_history
    WHERE set_id = ?
    GROUP BY result
    ORDER BY result
  `, [setId]);
}

// ============ Achievement Queries ============
// NOTE: Achievement functionality is handled by dallasWed (Issues #28-31, #39)
// Stubs provided for integration - implement in src/db/achievements.js or similar

/**
 * Get all achievements
 * @returns {Promise<Array>}
 */
export async function getAllAchievements() {
  // TODO: Implement per issue #28-31
  throw new Error('Achievement functionality not yet implemented - see issue #28');
}

/**
 * Get achievement by name
 * @param {string} name - Achievement name
 * @returns {Promise<Object|null>}
 */
export async function getAchievementByName(name) {
  // TODO: Implement per issue #28-31
  throw new Error('Achievement functionality not yet implemented - see issue #28');
}

/**
 * Update achievement progress
 * @param {string} name - Achievement name
 * @param {number} progress - New progress value
 */
export async function updateAchievementProgress(name, progress) {
  // TODO: Implement per issue #28-31
  throw new Error('Achievement functionality not yet implemented - see issue #28');
}

/**
 * Claim a completed achievement
 * @param {string} name - Achievement name
 * @returns {Promise<boolean>} - True if claim successful
 */
export async function claimAchievement(name) {
  // TODO: Implement per issue #28-31
  throw new Error('Achievement functionality not yet implemented - see issue #28');
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
  await getDB(); // Reinitialize
}
