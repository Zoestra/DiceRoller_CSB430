/**
 * Dice tray selector component.
 *
 * Renders selectable die types in a horizontal tray and highlights the active die.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import { Pressable, StyleSheet, View } from 'react-native';

import Svg, { G, Path } from 'react-native-svg';
import TexturedDieFace, { DIE_GEOMETRY } from './textured-die-face.jsx';

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
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        {DIE_TYPES.map(function (dieType) {
          const isActive = dieType === activeDieType;
          const singleDieSize = isActive ? 42 : 28;
          const d100DieSize = isActive ? 32 : 22;

          return (
            <Pressable
              key={`die-${dieType}`}
              accessibilityRole="button"
              accessibilityLabel={`Select d${dieType}`}
              style={[styles.dieButton, isActive ? styles.dieButtonActive : null]}
              onPress={function handlePress() {
                onSelectDieType(dieType);
              }}>
              <View style={[styles.diePreviewFrame, isActive ? styles.diePreviewFrameActive : null]}>
                {isActive ? (
                  <Svg
                    viewBox="0 0 50 50"
                    width="100%"
                    height="100%"
                    style={[styles.activeDieSvgOutline, { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }]}
                    preserveAspectRatio="xMidYMid meet"
                    pointerEvents="none"
                  >
                    <G transform={DIE_GEOMETRY[dieType]?.groupTransform || undefined}>
                      <Path
                        d={DIE_GEOMETRY[dieType]?.outline?.d}
                        stroke="#222"
                        strokeWidth={1.7}
                        fill="none"
                        opacity={0.8}
                      />
                    </G>
                  </Svg>
                ) : null}
                {dieType === 100 ? (
                  <View style={[styles.d100Preview, isActive ? styles.d100PreviewActive : null]}>
                    <View style={[styles.d100RightDie, isActive ? styles.d100RightDieActive : null]}>
                      <TexturedDieFace setId={setId} dieType={10} size={d100DieSize} hideLabel />
                    </View>
                    <View style={[styles.d100LeftDie, isActive ? styles.d100LeftDieActive : null]}>
                      <TexturedDieFace
                        setId={setId}
                        dieType={10}
                        size={d100DieSize}
                        hideLabel
                        backgroundFill="#fff"
                      />
                    </View>
                  </View>
                ) : (
                  <TexturedDieFace setId={setId} dieType={dieType} size={singleDieSize} hideLabel />
                )}
              </View>
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
    width: 36,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dieButtonActive: {
    width: 56,
  },
  diePreviewFrame: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  diePreviewFrameActive: {
    width: 48,
    height: 42,
  },
  activeDieSvgOutline: {
    zIndex: 0,
  },
  d100Preview: {
    width: 30,
    height: 24,
  },
  d100PreviewActive: {
    width: 42,
    height: 35,
  },
  d100RightDie: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  d100RightDieActive: {
    top: 0,
  },
  d100LeftDie: {
    position: 'absolute',
    left: 0,
    top: 3,
  },
  d100LeftDieActive: {
    top: 7,
  },
});
