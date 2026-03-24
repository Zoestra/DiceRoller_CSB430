import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { DiceProvider } from '../hooks/DiceContext';
import { SettingsProvider } from '../hooks/SettingsContext';
import { useSettings } from '../hooks/SettingsContext';

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
