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

import { DEFAULT_POINTS, getActiveSetId, getPoints, setActiveSetId, setPoints } from '@/db/db.js';

const DiceContext = createContext(null);

const DEFAULT_EQUIPPED_SET_ID = 1;
const DEFAULT_ACTIVE_DIE_TYPE = 20;

/**
 * @typedef {Object} DiceContextValue
 * @property {number} points
 * @property {number} equippedSetId
 * @property {number} activeDieType
 * @property {() => Promise<void>} refresh
 * @property {(value: number) => Promise<void>} setPointsValue
 * @property {(setId: number | null | undefined) => Promise<void>} setEquippedSetId
 * @property {(dieType: number) => void} setActiveDieType
 */

/**
 * @param {{ children: import('react').ReactNode }} props
 */
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

  /**
   * @param {number} value
   */
  async function setPointsValue(value) {
    await setPoints(value);
    await refreshStateFromDatabase();
  }

  /**
   * @param {number | null | undefined} setId
   */
  async function setEquippedSetId(setId) {
    const normalizedSetId = setId ?? DEFAULT_EQUIPPED_SET_ID;
    await setActiveSetId(normalizedSetId);
    await refreshStateFromDatabase();
  }

  /**
   * @param {number} dieType
   */
  function setActiveDieType(dieType) {
    setActiveDieTypeState(dieType);
  }

  /** @type {DiceContextValue} */
  /** @type {DiceContextValue} */
  const contextValue = {
    points,
    equippedSetId,
    activeDieType,
    refresh: refreshStateFromDatabase,
    setPointsValue,
    setEquippedSetId,
    setActiveDieType,
  };

  return <DiceContext.Provider value={contextValue}>{children}</DiceContext.Provider>;
}

/**
 * @returns {DiceContextValue}
 * @throws {Error} If called outside DiceProvider
 */
export function useDiceContext() {
  const context = useContext(DiceContext);
  if (context === null) {
    throw new Error('useDiceContext must be called within a DiceProvider');
  }
  return context;
}
