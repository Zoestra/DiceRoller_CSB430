/**
 * Dice Logic Tests
 *
 * Verifies weighted roll behavior for each attitude.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import { getWeightedResult } from '@/diceLogic.js';

function withSeededRandom(seed, callback) {
  const originalRandom = Math.random;
  let state = seed >>> 0;

  Math.random = function () {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };

  try {
    callback();
  } finally {
    Math.random = originalRandom;
  }
}

function sampleAverage(attitude, dieType, count, startRollCount = 1) {
  let sum = 0;
  for (let index = 0; index < count; index += 1) {
    const rollCount = startRollCount + index;
    const value = getWeightedResult(attitude, dieType, { rollCount });
    sum += value;
  }
  return sum / count;
}

function getSingleRollWithSeed(attitude, dieType, options, seed) {
  let result = null;
  withSeededRandom(seed, function () {
    result = getWeightedResult(attitude, dieType, options);
  });
  return result;
}

describe('diceLogic#getWeightedResult', function () {
  test('returns values within die range', function () {
    withSeededRandom(7, function () {
      for (let i = 0; i < 200; i += 1) {
        const value = getWeightedResult('Balanced', 20);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(20);
      }
    });
  });

  test('Lucky averages higher than Balanced and Cursed lower than Balanced', function () {
    withSeededRandom(12345, function () {
      const sampleCount = 4000;
      const luckyAverage = sampleAverage('Lucky', 20, sampleCount);
      const balancedAverage = sampleAverage('Balanced', 20, sampleCount);
      const cursedAverage = sampleAverage('Cursed', 20, sampleCount);

      expect(luckyAverage).toBeGreaterThan(balancedAverage);
      expect(cursedAverage).toBeLessThan(balancedAverage);
    });
  });

  test('Betrayer starts lucky then trends lower after turn', function () {
    withSeededRandom(2026, function () {
      let earlySum = 0;
      let lateSum = 0;
      for (let index = 0; index < 2000; index += 1) {
        earlySum += getWeightedResult('Betrayer', 20, {
          rollCount: 10,
          betrayerTurnAfter: 30,
        });
        lateSum += getWeightedResult('Betrayer', 20, {
          rollCount: 40,
          betrayerTurnAfter: 30,
        });
      }
      const earlyAverage = earlySum / 2000;
      const lateAverage = lateSum / 2000;

      expect(earlyAverage).toBeGreaterThan(lateAverage);
    });
  });

  test('Betrayer respects configured hidden turn point', function () {
    withSeededRandom(99, function () {
      let averageWithSmallTurn = 0;
      let averageWithLargeTurn = 0;

      for (let index = 0; index < 2000; index += 1) {
        averageWithSmallTurn += getWeightedResult('Betrayer', 20, {
          rollCount: 25,
          betrayerTurnAfter: 21,
        });
        averageWithLargeTurn += getWeightedResult('Betrayer', 20, {
          rollCount: 25,
          betrayerTurnAfter: 49,
        });
      }

      averageWithSmallTurn = averageWithSmallTurn / 2000;
      averageWithLargeTurn = averageWithLargeTurn / 2000;

      expect(averageWithLargeTurn).toBeGreaterThan(averageWithSmallTurn);
    });
  });

  test('Betrayer uses Lucky table before turn and Cursed table after turn', function () {
    const dieType = 20;
    const turnPoint = 35;

    for (let seed = 1; seed <= 200; seed += 1) {
      const preTurnBetrayer = getSingleRollWithSeed(
        'Betrayer',
        dieType,
        { rollCount: 20, betrayerTurnAfter: turnPoint },
        seed
      );
      const lucky = getSingleRollWithSeed('Lucky', dieType, {}, seed);
      expect(preTurnBetrayer).toBe(lucky);

      const postTurnBetrayer = getSingleRollWithSeed(
        'Betrayer',
        dieType,
        { rollCount: 40, betrayerTurnAfter: turnPoint },
        seed
      );
      const cursed = getSingleRollWithSeed('Cursed', dieType, {}, seed);
      expect(postTurnBetrayer).toBe(cursed);
    }
  });

  test('Betrayer throws when betrayerTurnAfter is missing', function () {
    expect(function callWithoutBetrayerThreshold() {
      getWeightedResult('Betrayer', 20, { rollCount: 1 });
    }).toThrow('Betrayer roll requires betrayerTurnAfter with 20 < x < 50');
  });

  test('throws error for unsupported die type', function () {
    expect(function callWithUnsupportedDie() {
      getWeightedResult('Balanced', 3);
    }).toThrow('Unsupported die type: 3');
  });
});
