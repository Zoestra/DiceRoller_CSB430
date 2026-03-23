/**
 * Roll Function Pipeline
 *
 * Performs a weighted roll, awards points, and persists roll history.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import { addPoints, getDB, insertRoll } from '@/db/db.js';
import { getWeightedResult } from '@/diceLogic.js';

async function getSetConfig(setId) {
  const database = await getDB();
  const row = await database.getFirstAsync(
    'SELECT attitude, betrayer_turn_after FROM dice_sets WHERE id = ?',
    [setId]
  );
  if (!row?.attitude) {
    return {
      attitude: 'Balanced',
      betrayerTurnAfter: null,
    };
  }
  return {
    attitude: row.attitude,
    betrayerTurnAfter: row.betrayer_turn_after ?? null,
  };
}

async function getSetRollCount(setId) {
  const database = await getDB();
  const row = await database.getFirstAsync('SELECT COUNT(*) as total FROM roll_history WHERE set_id = ?', [setId]);
  return row?.total ?? 0;
}

export async function rollDie({ setId, dieType }) {
  if (!Number.isInteger(setId) || setId <= 0) {
    throw new Error('rollDie requires a positive integer setId');
  }
  if (!Number.isInteger(dieType) || dieType <= 0) {
    throw new Error('rollDie requires a positive integer dieType');
  }

  const setConfig = await getSetConfig(setId);
  const priorRollCount = await getSetRollCount(setId);
  const result = getWeightedResult(setConfig.attitude, dieType, {
    rollCount: priorRollCount + 1,
    betrayerTurnAfter: setConfig.betrayerTurnAfter,
  });
  const awardedPoints = result;

  await insertRoll(setId, dieType, result);
  await addPoints(awardedPoints);

  return {
    setId: setId,
    dieType: dieType,
    attitude: setConfig.attitude,
    result: result,
    awardedPoints: awardedPoints,
  };
}
