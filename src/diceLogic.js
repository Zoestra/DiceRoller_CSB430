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

function getCursedBuckets(dieType) {
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

function getChaoticBuckets(dieType) {
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

function getMidBuckets(dieType) {
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

function getBetrayerBuckets(dieType, rollCount, betrayerTurnAfter) {
  if (rollCount <= betrayerTurnAfter) {
    return getLuckyBuckets(dieType);
  }
  return getCursedBuckets(dieType);
}

function normalizeAttitude(attitude) {
  if (typeof attitude !== 'string') {
    return 'Balanced';
  }
  const trimmed = attitude.trim();
  return trimmed.length > 0 ? trimmed : 'Balanced';
}

export function getWeightedResult(attitude, dieType, options = {}) {
  if (!SUPPORTED_DIE_TYPES.includes(dieType)) {
    throw new Error(`Unsupported die type: ${dieType}`);
  }

  const normalizedAttitude = normalizeAttitude(attitude);
  const faces = createFaceList(dieType);
  const rollCount = options.rollCount ?? 1;

  switch (normalizedAttitude) {
    case 'Lucky':
      return randomFromBuckets(getLuckyBuckets(dieType));
    case 'Cursed':
      return randomFromBuckets(getCursedBuckets(dieType));
    case 'Chaotic':
      return randomFromBuckets(getChaoticBuckets(dieType));
    case 'Mid':
      return randomFromBuckets(getMidBuckets(dieType));
    case 'Betrayer': {
      const betrayerTurnAfter = options.betrayerTurnAfter;
      const isValidBetrayerTurnAfter = Number.isInteger(betrayerTurnAfter)
        && betrayerTurnAfter > 20
        && betrayerTurnAfter < 50;
      if (!isValidBetrayerTurnAfter) {
        throw new Error('Betrayer roll requires betrayerTurnAfter with 20 < x < 50');
      }
      return randomFromBuckets(getBetrayerBuckets(dieType, rollCount, betrayerTurnAfter));
    }
    case 'Balanced':
    default:
      return randomFromValues(faces);
  }
}
