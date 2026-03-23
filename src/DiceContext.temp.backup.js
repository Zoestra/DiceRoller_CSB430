/**
 * Global Dice Context Provider
 *
 * Provides app-wide state for points, equipped set, and active die type.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot).
 * ---
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getActiveSetId, getPoints, setActiveSetId, setPoints } from '@/db/db.js';

const DiceContext = createContext(null);

export function DiceProvider({ children }) {
  const [points, setPointsState] = useState(null);
  const [equippedSetId, setEquippedSetIdState] = useState(null);
  const [activeDieType, setActiveDieTypeState] = useState(20);

  useEffect(function initializeContext() {
    void refresh();
  }, []);

  async function refresh() {
    try {
      const [nextPoints, nextSetId] = await Promise.all([getPoints(), getActiveSetId()]);
      setPointsState(nextPoints);
      setEquippedSetIdState(nextSetId);
    } catch {
      setPointsState(100);
      setEquippedSetIdState(1);
    }
  }

  async function setPointsValue(value) {
    setPointsState(value);
    await setPoints(value);
  }

  async function setEquippedSetId(setId) {
    setEquippedSetIdState(setId);
    await setActiveSetId(setId);
  }

  function setActiveDieType(dieType) {
    setActiveDieTypeState(dieType);
  }

  const value = useMemo(
    function buildContextValue() {
      return {
        points,
        equippedSetId,
        activeDieType,
        refresh,
        setPointsValue,
        setEquippedSetId,
        setActiveDieType,
      };
    },
    [points, equippedSetId, activeDieType]
  );

  return <DiceContext.Provider value={value}>{children}</DiceContext.Provider>;
}

export function useDiceContext() {
  const context = useContext(DiceContext);
  if (!context) {
    throw new Error('useDiceContext must be used inside DiceProvider');
  }
  return context;
}
