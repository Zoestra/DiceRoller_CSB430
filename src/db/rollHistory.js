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
 * @typedef {Object} RollHistoryRow
 * @property {number} id - Roll ID (auto-increment)
 * @property {number} set_id - Dice set ID
 * @property {number} die_type - Die type (4, 6, 8, 10, 12, or 20)
 * @property {number} result - Roll result (1 to die_type)
 * @property {string} rolled_at - ISO timestamp of roll
 */

/**
 * @typedef {Object} DiceSetStats
 * @property {number} total_rolls - Total number of rolls
 * @property {number} average - Average roll value
 * @property {number} min_roll - Minimum roll value
 * @property {number} max_roll - Maximum roll value
 * @property {number} max_rolls - Count of rolls matching die type (critical successes)
 * @property {number} nat_1s - Count of rolls that were 1 (critical failures)
 */

/**
 * @typedef {Object} RollDistributionEntry
 * @property {number} result - Die face value
 * @property {number} count - Number of times this face was rolled
 */

/**
 * @typedef {Object} RollHistoryOptions
 * @property {number} [setId] - Optional: filter by dice set ID
 * @property {number} [dieType] - Optional: filter by die type
 * @property {number} [limit=100] - Maximum results to return (default 100)
 */

/**
 * Insert a roll into history.
 * Auto-increments total_rolls counter via DB trigger.
 * @param {number} setId - Dice set ID that was rolled
 * @param {number} dieType - Type of die (4, 6, 8, 10, 12, or 20)
 * @param {number} result - Roll result (1 to dieType inclusive)
 * @returns {Promise<void>}
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
 * Get roll history with optional filters.
 * Results ordered by most recent first.
 * @param {RollHistoryOptions} [options] - Filter and limit options
 * @returns {Promise<RollHistoryRow[]>}
 */
export async function getRollHistory({ setId, dieType, limit = 100 } = {}) {
  const database = await getDB();
  const whereClauses = [];
  const params = [];

  if (setId) {
    whereClauses.push('set_id = ?');
    params.push(setId);
  }

  if (dieType) {
    whereClauses.push('die_type = ?');
    params.push(dieType);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  return await database.getAllAsync(
    `SELECT * FROM roll_history ${whereSql} ORDER BY rolled_at DESC LIMIT ?`,
    [...params, limit]
  );
}

/**
 * Get aggregated stats for a specific dice set.
 * Computes average, min, max, critical successes, and critical failures.
 * @param {number} setId - Dice set ID to analyze
 * @param {number} [dieType] - Optional die type filter
 * @returns {Promise<DiceSetStats|null>} - Stats object or null if no rolls exist
 */
export async function getDiceSetStats(setId, dieType) {
  const database = await getDB();
  const params = [setId];
  const dieTypeClause = dieType ? 'AND die_type = ?' : '';
  if (dieType) {
    params.push(dieType);
  }
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
    ${dieTypeClause}
  `, params);
}

/**
 * Get distribution breakdown for a dice set histogram.
 * Shows count of each die face value rolled.
 * @param {number} setId - Dice set ID to analyze
 * @param {number} [dieType] - Optional die type filter
 * @returns {Promise<RollDistributionEntry[]>} - Array of result/count pairs ordered by result value
 */
export async function getRollDistribution(setId, dieType) {
  const database = await getDB();
  const params = [setId];
  const dieTypeClause = dieType ? 'AND die_type = ?' : '';
  if (dieType) {
    params.push(dieType);
  }
  return await database.getAllAsync(`
    SELECT result, COUNT(*) as count
    FROM roll_history
    WHERE set_id = ?
    ${dieTypeClause}
    GROUP BY result
    ORDER BY result
  `, params);
}
