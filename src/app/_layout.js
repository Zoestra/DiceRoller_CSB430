import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { DiceProvider } from '../DiceContext.js';
import { SettingsProvider } from '../context/SettingsContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

export const unstable_settings = {
  anchor: '(tabs)',
};

function LayoutWithSettings() {
  const { theme } = useSettings();

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <DiceProvider>
        <LayoutWithSettings />
      </DiceProvider>
    </SettingsProvider>
  );
}
