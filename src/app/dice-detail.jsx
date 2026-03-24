import { Pressable, StyleSheet } from 'react-native';
import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import { useDiceContext } from '../DiceContext';
import { useRouter } from 'expo-router';

import D6 from '../../assets/images/Dice_Blanks/D6_Blank.svg';
import D8 from '../../assets/images/Dice_Blanks/d8.svg';

const DICE_IMAGES = {
  6: D6,
  8: D8,
};

export default function DiceDetail() {
  const { activeDieType, equippedSetId } = useDiceContext();
  const router = useRouter();

  const DiceImage = DICE_IMAGES[activeDieType];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        d{activeDieType} Details
      </ThemedText>

      {DiceImage && <DiceImage width={140} height={140} />}

      <ThemedText style={styles.info}>
        Equipped Set ID: {equippedSetId}
      </ThemedText>

      <Pressable style={styles.button} onPress={() => router.back()}>
        <ThemedText style={styles.buttonText}>Back</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  info: {
    opacity: 0.7,
    fontSize: 18,
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  buttonText: {
    fontWeight: '600',
    color: 'white',
  },
});
