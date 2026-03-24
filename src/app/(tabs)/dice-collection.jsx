import { Pressable, StyleSheet, FlatList } from 'react-native';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { useDiceContext } from '../../DiceContext';
import { useSettings } from '../../context/SettingsContext';

const CLASSIC_DICE = [
  { dieType: 4, label: 'd4' },
  { dieType: 6, label: 'd6' },
  { dieType: 8, label: 'd8' },
  { dieType: 10, label: 'd10' },
  { dieType: 12, label: 'd12' },
  { dieType: 20, label: 'd20' },
];

export default function DiceCollectionScreen() {
  const { activeDieType, setActiveDieType, equippedSetId } = useDiceContext();
  const { textSize } = useSettings();

  function handlePress(dieType) {
    // The inspector screen isn't implemented yet.
    // This will be replaced with router.push() once that screen exists.
    setActiveDieType(dieType);
    console.log(`Selected die type: d${dieType}`);
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={[styles.header, { fontSize: textSize + 6 }]}>
        Dice Collection
      </ThemedText>

      <ThemedText style={[styles.subheader, { fontSize: textSize }]}>
        Equipped Set ID: {equippedSetId}
      </ThemedText>

      <FlatList
        data={CLASSIC_DICE}
        numColumns={2}
        keyExtractor={(item) => item.dieType.toString()}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const isActive = item.dieType === activeDieType;

          return (
            <Pressable
              onPress={() => handlePress(item.dieType)}
              style={[styles.card, isActive && styles.activeCard]}
            >
              <ThemedText style={[styles.cardText, { fontSize: textSize + 4 }]}>
                {item.label}
              </ThemedText>
            </Pressable>
          );
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subheader: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  grid: {
    paddingVertical: 8,
    gap: 12,
  },
  card: {
    flex: 1,
    margin: 8,
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    opacity: 0.9,
  },
  activeCard: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  cardText: {
    fontWeight: '600',
  },
});
