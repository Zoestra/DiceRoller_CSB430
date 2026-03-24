import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { DiceProvider } from '../DiceContext.js';
<<<<<<< HEAD
import { SettingsProvider } from '../context/SettingsContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
=======
import { SettingsProvider, useSettings } from '../context/SettingsContext.jsx';
>>>>>>> f7a6a365c511fc3d8eb7aefe66c1d12a07cd9610

export const unstable_settings = {
  anchor: '(tabs)',
};

function LayoutWithSettings() {
  const { theme } = useSettings();

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
<<<<<<< HEAD
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
=======
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: '#111' }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaView>
>>>>>>> f7a6a365c511fc3d8eb7aefe66c1d12a07cd9610
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
<<<<<<< HEAD
      <DiceProvider>
        <LayoutWithSettings />
      </DiceProvider>
=======
      <SafeAreaProvider>
        <DiceProvider>
          <LayoutWithSettings />
        </DiceProvider>
      </SafeAreaProvider>
>>>>>>> f7a6a365c511fc3d8eb7aefe66c1d12a07cd9610
    </SettingsProvider>
  );
}
