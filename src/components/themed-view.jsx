import { View } from 'react-native';
import { useSettings } from '../context/SettingsContext.jsx';

export function ThemedView({ style, ...otherProps }) {
  const { theme } = useSettings();

  return (
    <View
      style={[{ backgroundColor: theme === 'dark' ? '#000' : '#fff' }, style]}
      {...otherProps}
    />
  );
}
