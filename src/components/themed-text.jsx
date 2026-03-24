import { StyleSheet, Text } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSettings } from '@/context/SettingsContext';

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const { textSize } = useSettings();

  return (
    <Text
      style={[
        { color, fontSize: textSize },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    lineHeight: 24,
  },
  defaultSemiBold: {
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    color: '#0a7ea4',
  },
});
