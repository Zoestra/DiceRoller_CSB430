/**
 * Dice tray selector component.
 *
 * Renders selectable die types in a horizontal tray and excludes the active die.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

const DIE_TYPES = [4, 6, 8, 10, 12, 20, 100];

const DIE_ICON_BY_TYPE = {
  4: 'dice-d4-outline',
  6: 'dice-d6-outline',
  8: 'dice-d8-outline',
  10: 'dice-d10-outline',
  12: 'dice-d12-outline',
  20: 'dice-d20-outline',
  100: 'dice-multiple-outline',
};

/**
 * @param {{
 *   activeDieType: number,
 *   onSelectDieType: (dieType: number) => void,
 *   style?: import('react-native').StyleProp<import('react-native').ViewStyle>
 * }} props
 */
export function DiceTray({ activeDieType, onSelectDieType, style }) {
  const availableDieTypes = DIE_TYPES.filter(function (dieType) {
    return dieType !== activeDieType;
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        {availableDieTypes.map(function (dieType) {
          return (
            <Pressable
              key={`die-${dieType}`}
              accessibilityRole="button"
              accessibilityLabel={`Select d${dieType}`}
              style={styles.dieButton}
              onPress={function handlePress() {
                onSelectDieType(dieType);
              }}>
              <MaterialCommunityIcons name={DIE_ICON_BY_TYPE[dieType]} size={28} color="#111" />
              <ThemedText style={styles.dieLabel}>{dieType}</ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 84,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
  },
  dieButton: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dieLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '900',
    color: '#111',
  },
});
