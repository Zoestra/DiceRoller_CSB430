/**
 * Roll History Database Queries
 *
 * Handles all queries related to roll_history table.
 *
 * ---
 * NOTE: This file was written with AI assistance (Qwen Code).
 * ---
 */

import { getDB } from './db.js';

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
  // total_rolls is auto-incremented by after_roll_insert trigger
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
      SUM(CASE WHEN result = die_type THEN 1 ELSE 0 END) as max_rolls,
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
