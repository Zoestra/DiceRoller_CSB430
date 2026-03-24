import { Alert, Button, StyleSheet, Switch } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { useSettings } from '../../context/SettingsContext.jsx';
import { resetDatabase } from '../../db/db.js';

export default function SettingsScreen() {
  const { theme, textSize, updateTheme, updateTextSize } = useSettings();

  async function handleWipeDatabase() {
    Alert.alert(
      'Confirm Wipe',
      'This will permanently delete all app data (roll history, skins, achievements, and settings). Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDatabase();
              Alert.alert('Success', 'Database wiped. App data will reinitialize on next use.');
            } catch (error) {
              Alert.alert('Error', error?.message ?? String(error));
            }
          },
        },
      ]
    );
  }

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

      <ThemedView style={styles.section}>
        <ThemedText>Danger Zone</ThemedText>
        <Button
          title="Wipe Database"
          color="#d9534f"
          onPress={handleWipeDatabase}
        />
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
