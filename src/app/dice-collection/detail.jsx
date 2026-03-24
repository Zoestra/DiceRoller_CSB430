import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { useDiceContext } from '../../DiceContext';
import D10 from '../../../assets/images/Dice_Blanks/D10_outline.svg';
import D12 from '../../../assets/images/Dice_Blanks/D12_outline.svg';
import D20 from '../../../assets/images/Dice_Blanks/D20_outline.svg';
import D4 from '../../../assets/images/Dice_Blanks/D4_outline.svg';
import D6 from '../../../assets/images/Dice_Blanks/D6_outline.svg';
import D8 from '../../../assets/images/Dice_Blanks/D8_outline.svg';

const DICE_IMAGES = {
  4: D4,
  6: D6,
  8: D8,
  10: D10,
  12: D12,
  20: D20,
};

export default function DiceDetailScreen() {
  const { activeDieType, equippedSetId } = useDiceContext();
  const DiceImage = DICE_IMAGES[activeDieType];

  return (
    <View style={styles.container}>
      <ThemedText type="title">d{activeDieType}</ThemedText>

      <View style={styles.imageWrapper}>
        <DiceImage width={120} height={120} />
      </View>

      <ThemedText>Equipped Set ID: {equippedSetId}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  imageWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
