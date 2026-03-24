/**
 * Dice Logic Tests
 *
 * Verifies weighted roll behavior for each attitude.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import { getD100Result, getWeightedResult } from '@/diceLogic.js';

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
    }).toThrow('Invalid turn threshold');
  });

  test('throws error for unsupported die type', function () {
    expect(function callWithUnsupportedDie() {
      getWeightedResult('Balanced', 3);
    }).toThrow('Unsupported die type: 3');
  });

  test('throws error for invalid attitude inputs', function () {
    const invalidCases = [
      {
        attitude: null,
        message: 'Invalid attitude type: expected string, got object',
      },
      {
        attitude: '   ',
        message: 'Invalid attitude value: attitude cannot be empty',
      },
      {
        attitude: 'SuperLucky',
        message: 'Unsupported attitude: SuperLucky',
      },
    ];

    invalidCases.forEach(function (invalidCase) {
      expect(function callWithInvalidAttitude() {
        getWeightedResult(invalidCase.attitude, 20);
      }).toThrow(invalidCase.message);
    });
  });

  test('d100 returns percentile integer range', function () {
    withSeededRandom(77, function () {
      for (let index = 0; index < 200; index += 1) {
        const result = getD100Result('Balanced', { rollCount: 1 });
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(100);
      }
    });
  });

  test('d100 uses weighted tens and unweighted ones', function () {
    let combinedResult = null;
    withSeededRandom(2025, function () {
      combinedResult = getD100Result('Lucky', { rollCount: 5 });
    });

    let expectedTens = null;
    let expectedOnes = null;
    withSeededRandom(2025, function () {
      expectedTens = getWeightedResult('Lucky', 10, { rollCount: 5 });
      expectedOnes = getWeightedResult('Balanced', 10, {});
    });

    const expectedTensValue = (expectedTens - 1) * 10;
    const expectedOnesValue = expectedOnes - 1;
    const expectedResult = expectedTensValue + expectedOnesValue === 0
      ? 100
      : expectedTensValue + expectedOnesValue;

    expect(combinedResult).toBe(expectedResult);
  });
});
