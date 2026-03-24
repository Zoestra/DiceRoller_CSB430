<<<<<<< HEAD
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
=======
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
>>>>>>> f7a6a365c511fc3d8eb7aefe66c1d12a07cd9610

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [textSize, setTextSize] = useState(16);

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
<<<<<<< HEAD
    const savedTheme = await AsyncStorage.getItem("theme");
    const savedTextSize = await AsyncStorage.getItem("textSize");

    if (savedTheme) setTheme(savedTheme);
    if (savedTextSize) setTextSize(Number(savedTextSize));
=======
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const savedTheme = await AsyncStorage.getItem("theme");
        const savedTextSize = await AsyncStorage.getItem("textSize");

        if (savedTheme) setTheme(savedTheme);
        if (savedTextSize) setTextSize(Number(savedTextSize));
      }
    } catch (err) {
      // AsyncStorage may be unavailable in some environments (web/test);
      // fallback to in-memory defaults and avoid crashing the app.
      console.warn('AsyncStorage unavailable, using defaults', err);
    }
>>>>>>> f7a6a365c511fc3d8eb7aefe66c1d12a07cd9610
  }

  async function updateTheme(value) {
    setTheme(value);
<<<<<<< HEAD
    await AsyncStorage.setItem("theme", value);
=======
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem("theme", value);
      }
    } catch (err) {
      console.warn('Failed to persist theme to AsyncStorage', err);
    }
>>>>>>> f7a6a365c511fc3d8eb7aefe66c1d12a07cd9610
  }

  async function updateTextSize(value) {
    setTextSize(value);
<<<<<<< HEAD
    await AsyncStorage.setItem("textSize", String(value));
=======
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem("textSize", String(value));
      }
    } catch (err) {
      console.warn('Failed to persist textSize to AsyncStorage', err);
    }
>>>>>>> f7a6a365c511fc3d8eb7aefe66c1d12a07cd9610
  }

  return (
    <SettingsContext.Provider
      value={{ theme, textSize, updateTheme, updateTextSize }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
<<<<<<< HEAD
=======

/*
  NOTE: Minimal safety edits applied by agent to guard AsyncStorage usage.
  - Wrapped `AsyncStorage.getItem` / `AsyncStorage.setItem` calls with existence
    and type checks and `try/catch` to avoid crashing when the native module
    is unavailable (e.g., web or certain test environments).
  - On failure the code now logs a warning via `console.warn` instead of
    throwing. The in-memory state (`theme`, `textSize`) behavior is unchanged:
    values are still updated immediately and persistence is attempted after.
  - These changes are intentionally small and focused solely on preventing
    native-storage crashes; no other logic or persistence semantics were
    modified.

  ---
  NOTE: This change includes AI-assisted fixes (GitHub Copilot, GPT-5 mini).
  ---
*/
>>>>>>> f7a6a365c511fc3d8eb7aefe66c1d12a07cd9610
