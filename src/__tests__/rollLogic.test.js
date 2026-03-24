/**
 * Roll Logic Tests
 *
 * Verifies roll pipeline inserts history, awards points, and returns payload.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import {
    createFreshTestDatabase,
    getOpenDatabaseAsyncForTests,
    teardownTestDatabase,
} from '@/db/__tests__/testDatabase.js';
import {
    __resetDbForTests,
    __restoreOpenDatabaseForTests,
    __setOpenDatabaseForTests,
    getDB,
    getPoints,
    getRollHistory,
    insertRoll,
} from '@/db/db.js';
import { getWeightedResult } from '@/diceLogic.js';
import { rollDie } from '@/rollLogic.js';

async function withSeededRandom(seed, callback) {
  const originalRandom = Math.random;
  let state = seed >>> 0;

  Math.random = function () {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };

  try {
    return await callback();
  } finally {
    Math.random = originalRandom;
  }
}

describe('rollLogic#rollDie', function () {
  beforeEach(async function () {
    await createFreshTestDatabase();
    __setOpenDatabaseForTests(getOpenDatabaseAsyncForTests());
    __resetDbForTests();
  });

  afterEach(async function () {
    await teardownTestDatabase();
  });

  afterAll(function () {
    __restoreOpenDatabaseForTests();
  });

  test('inserts roll, awards points equal to roll value, returns result object', async function () {
    const beforePoints = await getPoints();
    const payload = await rollDie({ setId: 1, dieType: 20 });
    const afterPoints = await getPoints();

    expect(payload.setId).toBe(1);
    expect(payload.dieType).toBe(20);
    expect(payload.awardedPoints).toBe(payload.result);

    expect(afterPoints).toBe(beforePoints + payload.result);

    const history = await getRollHistory({ setId: 1, limit: 1 });
    expect(history[0].set_id).toBe(1);
    expect(history[0].die_type).toBe(20);
    expect(history[0].result).toBe(payload.result);
  });

  test('throws for invalid inputs', async function () {
    await expect(rollDie({ setId: 0, dieType: 20 })).rejects.toThrow(
      'rollDie requires a positive integer setId'
    );
    await expect(rollDie({ setId: 1, dieType: -1 })).rejects.toThrow(
      'rollDie requires a positive integer dieType'
    );
  });

  test('throws for unknown setId', async function () {
    await expect(rollDie({ setId: 9999, dieType: 20 })).rejects.toThrow('Unknown dice set');
  });

  test('Betrayer rolls from Lucky table before turn and Cursed table after turn', async function () {
    const database = await getDB();
    const betrayerTurnAfter = 30;

    await database.runAsync(
      'UPDATE dice_sets SET owned = 1, betrayer_turn_after = ? WHERE id = 5',
      [betrayerTurnAfter]
    );

    await database.runAsync('DELETE FROM roll_history WHERE set_id = 5');
    for (let index = 0; index < 10; index += 1) {
      await insertRoll(5, 20, 10);
    }

    const expectedPreTurn = await withSeededRandom(1111, async function () {
      return getWeightedResult('Lucky', 20, {
        betrayerTurnAfter,
      });
    });

    const preTurnPayload = await withSeededRandom(1111, async function () {
      return rollDie({ setId: 5, dieType: 20 });
    });

    expect(preTurnPayload.attitude).toBe('Lucky');
    expect(preTurnPayload.result).toBe(expectedPreTurn);

    await database.runAsync('DELETE FROM roll_history WHERE set_id = 5');
    for (let index = 0; index < 40; index += 1) {
      await insertRoll(5, 20, 10);
    }

    const expectedPostTurn = await withSeededRandom(2222, async function () {
      return getWeightedResult('Cursed', 20, {});
    });

    const postTurnPayload = await withSeededRandom(2222, async function () {
      return rollDie({ setId: 5, dieType: 20 });
    });

    expect(postTurnPayload.attitude).toBe('Cursed');
    expect(postTurnPayload.result).toBe(expectedPostTurn);
  });

  test('d100 uses two d10 rolls and logs percentile result', async function () {
    const payload = await withSeededRandom(3333, async function () {
      return rollDie({ setId: 1, dieType: 100 });
    });

    expect(payload.dieType).toBe(100);
    expect(payload.result).toBeGreaterThanOrEqual(1);
    expect(payload.result).toBeLessThanOrEqual(100);
    expect(payload).not.toHaveProperty('d100Breakdown');

    const history = await getRollHistory({ setId: 1, limit: 1 });
    expect(history[0].die_type).toBe(100);
    expect(history[0].result).toBe(payload.result);
  });
});
