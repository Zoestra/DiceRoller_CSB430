/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '../constants/theme.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { useColorScheme } from './use-color-scheme.js';

export function useThemeColor(props, colorName) {
  const settings = useSettings();
  const systemScheme = useColorScheme();
  const selectedTheme = settings?.theme ?? systemScheme ?? 'light';
  const colorFromProps = props[selectedTheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[selectedTheme][colorName];
}
