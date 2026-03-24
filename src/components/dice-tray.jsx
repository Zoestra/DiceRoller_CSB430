/**
 * Dice tray selector component.
 *
 * Renders selectable die types in a horizontal tray and excludes the active die.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import { Pressable, StyleSheet, View } from 'react-native';

import TexturedDieFace from './textured-die-face.jsx';
import { ThemedText } from './themed-text';

const DIE_TYPES = [4, 6, 8, 10, 12, 20, 100];

/**
 * @param {{
 *   activeDieType: number,
 *   onSelectDieType: (dieType: number) => void,
 *   setId?: number,
 *   style?: import('react-native').StyleProp<import('react-native').ViewStyle>
 * }} props
 */
export function DiceTray({ activeDieType, onSelectDieType, setId = 1, style }) {
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
              <View style={styles.diePreviewFrame}>
                {dieType === 100 ? (
                  <View style={styles.d100Preview}>
                    <View style={styles.d100RightDie}>
                      <TexturedDieFace setId={setId} dieType={10} size={24} hideLabel />
                    </View>
                    <View style={styles.d100LeftDie}>
                      <TexturedDieFace
                        setId={setId}
                        dieType={10}
                        size={24}
                        hideLabel
                        backgroundFill="#fff"
                      />
                    </View>
                  </View>
                ) : (
                  <TexturedDieFace setId={setId} dieType={dieType} size={30} hideLabel />
                )}
              </View>
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
  diePreviewFrame: {
    width: 34,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  d100Preview: {
    width: 34,
    height: 28,
  },
  d100RightDie: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  d100LeftDie: {
    position: 'absolute',
    left: 0,
    top: 4,
  },
  dieLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '900',
    color: '#111',
  },
});
