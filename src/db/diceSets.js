/**
 * Dice Sets Database Queries
 *
 * Handles all queries related to dice_sets table.
 *
 * ---
 * NOTE: This file was written with AI assistance (Qwen Code, GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import { getDB } from './db.js';

/**
 * Get hidden Betrayer turn threshold for a set.
 * Intended for internal logic/tests only.
 *
 * @param {number} setId - Dice set ID
 * @returns {Promise<number|null>}
 */
export async function getBetrayerTurnAfter(setId) {
  const database = await getDB();
  const row = await database.getFirstAsync(
    'SELECT betrayer_turn_after FROM dice_sets WHERE id = ? AND attitude = ?',
    [setId, 'Betrayer']
  );
  return row?.betrayer_turn_after ?? null;
}
