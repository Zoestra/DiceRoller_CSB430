import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import { useDiceContext } from '../DiceContext';

export default function DiceDetail() {
  const { activeDieType } = useDiceContext();

  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText type="title">Selected Die: d{activeDieType}</ThemedText>
    </ThemedView>
  );
}
