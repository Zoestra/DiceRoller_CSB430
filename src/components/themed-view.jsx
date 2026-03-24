import { View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSettings } from '@/context/SettingsContext';

export function ThemedView({ style, lightColor, darkColor, ...otherProps }) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const { theme } = useSettings();

  return <View style={[{ backgroundColor, backgroundColor: theme === 'dark' ? '#000' : '#fff' }, style]} {...otherProps} />;
}
