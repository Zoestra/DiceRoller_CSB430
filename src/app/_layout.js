/**
 * Root app layout and navigation shell.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */
import { DarkTheme , DefaultTheme , ThemeProvider } from '@react-navigation/native' ;
import { Stack } from 'expo-router' ;
import { StatusBar } from 'expo-status-bar' ;
import 'react-native-reanimated' ;
import { DiceProvider } from '@/DiceContext' ;
import { SettingsProvider } from '@/context/SettingsContext' ;
import { useSettings } from '@/context/SettingsContext' ;

export const unstable_settings = {
  anchor : '(tabs)' ,
} ;

export default function RootLayout ( ) {
  const { theme } = useSettings();

  return (
    <SettingsProvider>
      <DiceProvider>
        <ThemeProvider value = { theme === 'dark' ? DarkTheme : DefaultTheme } >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </DiceProvider>
    </SettingsProvider>
  ) ;
}
