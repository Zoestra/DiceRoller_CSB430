/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '../constants/theme.js';
<<<<<<< HEAD
import { useColorScheme } from './use-color-scheme.js';

export function useThemeColor(props, colorName) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];
=======
import { useSettings } from '../context/SettingsContext.jsx';
import { useColorScheme } from './use-color-scheme.js';

export function useThemeColor(props, colorName) {
  const settings = useSettings();
  const systemScheme = useColorScheme();
  const selectedTheme = settings?.theme ?? systemScheme ?? 'light';
  const colorFromProps = props[selectedTheme];
>>>>>>> f7a6a365c511fc3d8eb7aefe66c1d12a07cd9610

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[selectedTheme][colorName];
}
