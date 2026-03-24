import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [textSize, setTextSize] = useState(16);

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const savedTheme = await AsyncStorage.getItem("theme");
    const savedTextSize = await AsyncStorage.getItem("textSize");

    if (savedTheme) setTheme(savedTheme);
    if (savedTextSize) setTextSize(Number(savedTextSize));
  }

  async function updateTheme(value) {
    setTheme(value);
    await AsyncStorage.setItem("theme", value);
  }

  async function updateTextSize(value) {
    setTextSize(value);
    await AsyncStorage.setItem("textSize", String(value));
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
