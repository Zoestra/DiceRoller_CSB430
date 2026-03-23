/**
 * Global Dice Context Provider
 *
 * Provides app-wide state for points, equipped set, and active die type.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import { createContext, useContext, useEffect, useState } from 'react';

import { getActiveSetId, getPoints, setActiveSetId, setPoints } from '@/db/db.js';

const DiceContext = createContext(null);

const DEFAULT_POINTS = 100;
const DEFAULT_EQUIPPED_SET_ID = 1;
const DEFAULT_ACTIVE_DIE_TYPE = 20;

export function DiceProvider({ children }) {
  const [points, setPointsState] = useState(DEFAULT_POINTS);
  const [equippedSetId, setEquippedSetIdState] = useState(DEFAULT_EQUIPPED_SET_ID);
  const [activeDieType, setActiveDieTypeState] = useState(DEFAULT_ACTIVE_DIE_TYPE);

  useEffect(function initializeContext() {
    void refreshStateFromDatabase();
  }, []);

  async function refreshStateFromDatabase() {
    const loadedPoints = await getPoints();
    const loadedSetId = await getActiveSetId();
    const normalizedPoints = loadedPoints ?? DEFAULT_POINTS;
    const normalizedSetId = loadedSetId ?? DEFAULT_EQUIPPED_SET_ID;

    setPointsState(normalizedPoints);
    setEquippedSetIdState(normalizedSetId);
  }

  async function setPointsValue(value) {
    await setPoints(value);
    await refreshStateFromDatabase();
  }

  async function setEquippedSetId(setId) {
    const normalizedSetId = setId ?? DEFAULT_EQUIPPED_SET_ID;
    await setActiveSetId(normalizedSetId);
    await refreshStateFromDatabase();
  }

  function setActiveDieType(dieType) {
    setActiveDieTypeState(dieType);
  }

  const contextValue = {
    points: points,
    equippedSetId: equippedSetId,
    activeDieType: activeDieType,
    refresh: refreshStateFromDatabase,
    setPointsValue: setPointsValue,
    setEquippedSetId: setEquippedSetId,
    setActiveDieType: setActiveDieType,
  };

  return <DiceContext.Provider value={contextValue}>{children}</DiceContext.Provider>;
}

export function useDiceContext() {
  const context = useContext(DiceContext);
  if (context === null) {
    throw new Error('useDiceContext must be used within a DiceProvider');
  }
  return context;
}
