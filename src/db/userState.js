/**
 * User State Database Queries
 *
 * Handles all queries related to user_state table (points, settings).
 *
 * ---
 * NOTE: This file was written with AI assistance (Qwen Code).
 * ---
 */

import { getDB } from './db.js';

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
