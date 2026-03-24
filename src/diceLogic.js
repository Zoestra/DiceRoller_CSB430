/**
 * Weighted Dice Logic
 *
 * Defines attitude-specific roll weighting and returns biased results.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

const SUPPORTED_DIE_TYPES = [4, 6, 8, 10, 12, 20];

/**
 * @typedef {Object} WeightedRollOptions
 * @property {number} [rollCount]
 * @property {number} [betrayerTurnAfter]
 */

function createFaceList(dieType) {
  return Array.from({ length: dieType }, function (_, index) {
    return index + 1;
  });
}

function getRandomInt(maxExclusive) {
  return Math.floor(Math.random() * maxExclusive);
}

function randomFromValues(values) {
  const randomIndex = getRandomInt(values.length);
  return values[randomIndex];
}

function randomFromBuckets(weightedBuckets) {
  const totalWeight = weightedBuckets.reduce(function (sum, bucket) {
    return sum + bucket.weight;
  }, 0);
  let target = Math.random() * totalWeight;

  for (const bucket of weightedBuckets) {
    target -= bucket.weight;
    if (target <= 0) {
      return randomFromValues(bucket.values);
    }
  }

  return randomFromValues(weightedBuckets[weightedBuckets.length - 1].values);
}

function getLuckyBuckets(dieType) {
  const threshold = Math.ceil(dieType * 0.6);
  const high = [];
  const low = [];

  for (let face = 1; face <= dieType; face += 1) {
    if (face >= threshold) {
      high.push(face);
    } else {
      low.push(face);
    }
  }

  return [
    { values: low, weight: 1 },
    { values: high, weight: 3 },
  ];
}

function getCursedTables(dieType) {
  const threshold = Math.floor(dieType * 0.4);
  const low = [];
  const high = [];

  for (let face = 1; face <= dieType; face += 1) {
    if (face <= threshold) {
      low.push(face);
    } else {
      high.push(face);
    }
  }

  return [
    { values: low, weight: 3 },
    { values: high, weight: 1 },
  ];
}

function getChaoticTables(dieType) {
  const middle = [];
  for (let face = 2; face <= dieType - 1; face += 1) {
    middle.push(face);
  }

  return [
    { values: [1], weight: 3 },
    { values: [dieType], weight: 3 },
    { values: middle.length > 0 ? middle : [1, dieType], weight: 1 },
  ];
}

function getMidTables(dieType) {
  const center = (dieType + 1) / 2;
  const nearCenter = [];
  const farFromCenter = [];

  for (let face = 1; face <= dieType; face += 1) {
    if (Math.abs(face - center) <= dieType * 0.25) {
      nearCenter.push(face);
    } else {
      farFromCenter.push(face);
    }
  }

  return [
    { values: nearCenter, weight: 3 },
    { values: farFromCenter.length > 0 ? farFromCenter : nearCenter, weight: 1 },
  ];
}

function normalizeAttitude(attitude) {
  if (typeof attitude !== 'string') {
    throw new Error(`Invalid attitude type: expected string, got ${typeof attitude}`);
  }
  const trimmed = attitude.trim();
  if (trimmed.length === 0) {
    throw new Error('Invalid attitude value: attitude cannot be empty');
  }
  return trimmed;
}

export function resolveRollAttitude(attitude, options = {}) {
  const normalizedAttitude = normalizeAttitude(attitude);
  if (normalizedAttitude !== 'Betrayer') {
    return normalizedAttitude;
  }

  const rollCount = options.rollCount ?? 1;
  const betrayerTurnAfter = options.betrayerTurnAfter;
  if (!Number.isInteger(betrayerTurnAfter) || betrayerTurnAfter <= 20 || betrayerTurnAfter >= 100) {
    throw new Error('Invalid turn threshold');
  }

  if (rollCount <= betrayerTurnAfter) {
    return 'Lucky';
  }
  return 'Cursed';
}

export function getWeightedResult(attitude, dieType, options = {}) {
  if (!SUPPORTED_DIE_TYPES.includes(dieType)) {
    throw new Error(`Unsupported die type: ${dieType}`);
  }

  const resolvedAttitude = resolveRollAttitude(attitude, options);
  const faces = createFaceList(dieType);

  switch (resolvedAttitude) {
    case 'Lucky':
      return randomFromTables(getLuckyTables(dieType));
    case 'Cursed':
      return randomFromTables(getCursedTables(dieType));
    case 'Chaotic':
      return randomFromTables(getChaoticTables(dieType));
    case 'Mid':
      return randomFromTables(getMidTables(dieType));
    case 'Balanced':
      return randomFromValues(faces);
    default:
      throw new Error(`Unsupported attitude: ${resolvedAttitude}`);
  }
}

/**
 * Roll a percentile d100 using two d10 rolls.
 *
 * Tens die uses attitude weighting.
 * Ones die is always unweighted (uniform d10).
 *
 * @param {string} attitude
 * @param {{ rollCount?: number, betrayerTurnAfter?: number }} options
 * @returns {number}
 */
export function getD100Result(attitude, options = {}) {
  const tensRoll = getWeightedResult(attitude, 10, options);
  const onesRoll = getWeightedResult('Balanced', 10, {});

  const tensValue = (tensRoll - 1) * 10;
  const onesValue = onesRoll - 1;

  let result = tensValue + onesValue;
  if (result === 0) {
    result = 100;
  }

  return result;
}
