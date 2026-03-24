/**
 * Stats screen scaffold.
 *
 * Uses the same shared DiceTray component as Roll screen.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import { StyleSheet, View } from 'react-native';

import { useDiceContext } from '../../DiceContext.js';
import { DiceTray } from '../../components/dice-tray.jsx';
import { ThemedText } from '../../components/themed-text';

export default function StatsScreen() {
  const { activeDieType, equippedSetId, points, setActiveDieType } = useDiceContext();

  return (
    <View style={styles.screen}>
      <View style={styles.headerBox}>
        <ThemedText style={styles.headerText}>STATS</ThemedText>
      </View>

      <View style={styles.contentArea}>
        <ThemedText style={styles.summaryText}>{`Active Die: d${activeDieType}`}</ThemedText>
        <ThemedText style={styles.summaryText}>{`Points: ${points}`}</ThemedText>
      </View>

      <View style={styles.trayArea}>
        <DiceTray
          activeDieType={activeDieType}
          onSelectDieType={setActiveDieType}
          setId={equippedSetId ?? 1}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e8e8e8',
    borderWidth: 4,
    borderColor: '#000',
    padding: 16,
  },
  headerBox: {
    width: '100%',
    height: 56,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#111',
    fontWeight: '900',
    fontSize: 24,
    letterSpacing: 0.8,
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  summaryText: {
    color: '#111',
    fontWeight: '900',
    fontSize: 18,
    textTransform: 'uppercase',
  },
  trayArea: {
    width: '100%',
  },
});
