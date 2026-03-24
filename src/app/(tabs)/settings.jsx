import { Switch, Button, StyleSheet } from 'react-native';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { useSettings } from '../../hooks/SettingsContext.jsx';

export default function SettingsScreen() {
  const { theme, textSize, updateTheme, updateTextSize } = useSettings();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Settings</ThemedText>

      <ThemedView style={styles.section}>
        <ThemedText>Dark Mode</ThemedText>
        <Switch
          value={theme === 'dark'}
          onValueChange={(value) => updateTheme(value ? 'dark' : 'light')}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText>Text Size: {textSize}</ThemedText>
        <Button title="Increase" onPress={() => updateTextSize(textSize + 1)} />
        <Button title="Decrease" onPress={() => updateTextSize(Math.max(10, textSize - 1))} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginTop: 20,
  },
});
