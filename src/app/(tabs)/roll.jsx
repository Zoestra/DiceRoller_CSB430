/**
 * Main dice rolling screen.
 *
 * Implements UI from Figma and wires roll actions to persisted roll logic.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useDiceContext } from '../../DiceContext.js';
import { DiceTray } from '../../components/dice-tray.jsx';
import TexturedDieFace from '../../components/textured-die-face.jsx';
import { ThemedText } from '../../components/themed-text';
import { getDB } from '../../db/db.js';
import { rollDie } from '../../rollLogic.js';

function getD100FaceLabels(resultValue) {
  if (!Number.isInteger(resultValue) || resultValue < 1 || resultValue > 100) {
    return {
      tensLabel: '?',
      onesLabel: '?',
    };
  }

  if (resultValue === 100) {
    return {
      tensLabel: '00',
      onesLabel: '0',
    };
  }

  const tensValue = Math.floor(resultValue / 10) * 10;
  const onesValue = resultValue % 10;

  return {
    tensLabel: String(tensValue).padStart(2, '0'),
    onesLabel: String(onesValue),
  };
}

export default function RollScreen() {
  const router = useRouter();
  const { points, equippedSetId, activeDieType, refresh, setActiveDieType } = useDiceContext();

  const [setName, setSetName] = useState('Classic');
  const [lastResult, setLastResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const d100FaceLabels = getD100FaceLabels(lastResult);

  useEffect(
    function loadSetNameEffect() {
      async function loadSetName() {
        const selectedSetId = equippedSetId ?? 1;
        const database = await getDB();
        const row = await database.getFirstAsync('SELECT set_name FROM dice_sets WHERE id = ?', [
          selectedSetId,
        ]);
        if (row?.set_name) {
          setSetName(String(row.set_name));
        } else {
          setSetName('Classic');
        }
      }

      void loadSetName();
    },
    [equippedSetId]
  );

  useEffect(
    function resetDisplayedResultOnDieChange() {
      setLastResult(null);
    },
    [activeDieType]
  );

  async function handleRollPress() {
    if (isRolling) {
      return;
    }

    setErrorMessage('');
    setIsRolling(true);
    try {
      const selectedSetId = equippedSetId ?? 1;
      const rollResult = await rollDie({
        setId: selectedSetId,
        dieType: activeDieType,
      });
      setLastResult(rollResult.result);
      await refresh();
    } catch (error) {
      const message = error?.message ?? 'Roll failed';
      setErrorMessage(message);
    } finally {
      setIsRolling(false);
    }
  }

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
    }
  }

  function handleSettingsPress() {
    router.push('/(tabs)/settings');
  }

  function handleStatsPress() {
    router.push('/(tabs)/stats');
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable style={styles.squareButton} onPress={handleBackPress}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#111" />
        </Pressable>
        <View style={styles.titleBox}>
          <ThemedText style={styles.titleText}>{setName}</ThemedText>
        </View>
        <Pressable style={styles.smallSquareButton} onPress={handleSettingsPress}>
          <MaterialCommunityIcons name="cog-outline" size={20} color="#111" />
        </Pressable>
      </View>

      <View style={styles.mainDieArea}>
        {activeDieType === 100 ? (
          <View style={styles.percentileDiceRow}>
            <TexturedDieFace
              setId={equippedSetId ?? 1}
              dieType={10}
              displayLabel={d100FaceLabels.tensLabel}
              labelY={28.2}
              labelFontSize={11.75}
              size={132}
            />
            <TexturedDieFace
              setId={equippedSetId ?? 1}
              dieType={10}
              displayLabel={d100FaceLabels.onesLabel}
              labelY={28.2}
              labelFontSize={13}
              size={132}
            />
          </View>
        ) : (
          <TexturedDieFace
            setId={equippedSetId ?? 1}
            dieType={activeDieType}
            resultValue={lastResult}
            size={240}
          />
        )}
        <ThemedText style={styles.pointsText}>{`Points: ${points}`}</ThemedText>
        {errorMessage.length > 0 ? <ThemedText style={styles.errorText}>{errorMessage}</ThemedText> : null}
      </View>

      <View style={styles.bottomArea}>
        <DiceTray
          activeDieType={activeDieType}
          onSelectDieType={setActiveDieType}
          setId={equippedSetId ?? 1}
        />

        <Pressable style={styles.rollButton} onPress={handleRollPress}>
          {isRolling ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.rollButtonText}>ROLL DICE</ThemedText>
          )}
        </Pressable>

        <Pressable style={styles.statsButton} onPress={handleStatsPress}>
          <MaterialCommunityIcons name="chart-bar" size={20} color="#111" />
          <ThemedText style={styles.statsButtonText}>STATS</ThemedText>
        </Pressable>
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
  },
  topBar: {
    height: 72,
    borderBottomWidth: 4,
    borderColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  squareButton: {
    width: 44,
    height: 44,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallSquareButton: {
    width: 32,
    height: 32,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: {
    width: 200,
    height: 44,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    color: '#111',
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  mainDieArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  pointsText: {
    marginTop: 12,
    color: '#111',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  percentileDiceRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  errorText: {
    marginTop: 6,
    color: '#8b0000',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bottomArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },
  rollButton: {
    width: '100%',
    height: 56,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rollButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 24,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statsButton: {
    width: '100%',
    height: 56,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  statsButtonText: {
    color: '#111',
    fontWeight: '900',
    fontSize: 24,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
