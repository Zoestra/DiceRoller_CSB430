import { View, Text, Switch, Button } from 'react-native';
import { useSettings } from '@/context/SettingsContext';

export default function SettingsScreen() {
  const { theme, textSize, updateTheme, updateTextSize } = useSettings();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: textSize }}>Settings</Text>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: textSize }}>Dark Mode</Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={(value) => updateTheme(value ? 'dark' : 'light')}
        />
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: textSize }}>Text Size: {textSize}</Text>
        <Button title="Increase" onPress={() => updateTextSize(textSize + 1)} />
        <Button title="Decrease" onPress={() => updateTextSize(textSize - 1)} />
      </View>
    </View>
  );
}
