/**
 * DiceContext Tests
 *
 * Tests for the global dice context provider and hook.
 * Uses real SQLite test harness + rendered React tree.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot).
 * ---
 */

import { act, render, waitFor } from '@testing-library/react-native';

import { DiceProvider, useDiceContext } from '@/DiceContext.js';
import {
    createFreshTestDatabase,
    getOpenDatabaseAsyncForTests,
    teardownTestDatabase,
} from '@/db/__tests__/testDatabase.js';
import {
    __resetDbForTests,
    __restoreOpenDatabaseForTests,
    __setOpenDatabaseForTests,
    getActiveSetId,
    getPoints,
} from '@/db/db.js';

function ContextProbe({ onValue }) {
  const value = useDiceContext();
  onValue(value);
  return null;
}

describe('DiceContext', function () {
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

  test('useDiceContext warns and returns fallback outside provider', function () {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(function () {});
    let fallbackContext = null;

    function BareConsumer() {
      fallbackContext = useDiceContext();
      return null;
    }

    expect(function renderBareConsumer() {
      render(<BareConsumer />);
    }).not.toThrow();

    expect(warnSpy).toHaveBeenCalledWith(
      'useDiceContext called outside DiceProvider; returning fallback context.'
    );
    expect(fallbackContext).not.toBeNull();
    expect(fallbackContext.equippedSetId).toBe(1);
    expect(fallbackContext.activeDieType).toBe(20);
    expect(typeof fallbackContext.setPointsValue).toBe('function');

    warnSpy.mockRestore();
  });

  test('loads seeded database state on mount', async function () {
    let latestContext = null;

    render(
      <DiceProvider>
        <ContextProbe onValue={function (value) { latestContext = value; }} />
      </DiceProvider>
    );

    await waitFor(function () {
      expect(latestContext).not.toBeNull();
      expect(latestContext.points).toBe(100);
      expect(latestContext.equippedSetId).toBe(1);
      expect(latestContext.activeDieType).toBe(20);
    });
  });

  test('setPointsValue writes database and updates context state', async function () {
    let latestContext = null;

    render(
      <DiceProvider>
        <ContextProbe onValue={function (value) { latestContext = value; }} />
      </DiceProvider>
    );

    await waitFor(function () {
      expect(latestContext).not.toBeNull();
      expect(latestContext.points).toBe(100);
    });

    await act(async function () {
      await latestContext.setPointsValue(250);
    });

    await waitFor(function () {
      expect(latestContext.points).toBe(250);
    });

    expect(await getPoints()).toBe(250);
  });

  test('setEquippedSetId writes database and updates context state', async function () {
    let latestContext = null;

    render(
      <DiceProvider>
        <ContextProbe onValue={function (value) { latestContext = value; }} />
      </DiceProvider>
    );

    await waitFor(function () {
      expect(latestContext).not.toBeNull();
      expect(latestContext.equippedSetId).toBe(1);
    });

    await act(async function () {
      await latestContext.setEquippedSetId(2);
    });

    await waitFor(function () {
      expect(latestContext.equippedSetId).toBe(2);
    });

    expect(await getActiveSetId()).toBe(2);
  });

  test('setActiveDieType updates client-side context state', async function () {
    let latestContext = null;

    render(
      <DiceProvider>
        <ContextProbe onValue={function (value) { latestContext = value; }} />
      </DiceProvider>
    );

    await waitFor(function () {
      expect(latestContext).not.toBeNull();
      expect(latestContext.activeDieType).toBe(20);
    });

    await act(async function () {
      latestContext.setActiveDieType(6);
    });

    await waitFor(function () {
      expect(latestContext.activeDieType).toBe(6);
    });

    expect(await getPoints()).toBe(100);
    expect(await getActiveSetId()).toBe(1);
  });

  test('refresh pulls latest values when database changed externally', async function () {
    let latestContext = null;

    render(
      <DiceProvider>
        <ContextProbe onValue={function (value) { latestContext = value; }} />
      </DiceProvider>
    );

    await waitFor(function () {
      expect(latestContext).not.toBeNull();
    });

    await act(async function () {
      await latestContext.setPointsValue(777);
      await latestContext.setEquippedSetId(4);
    });

    await waitFor(function () {
      expect(latestContext.points).toBe(777);
      expect(latestContext.equippedSetId).toBe(4);
    });

    expect(await getPoints()).toBe(777);
    expect(await getActiveSetId()).toBe(4);
  });
});
