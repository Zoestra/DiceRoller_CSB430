import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import DiceView from '../../components/textured-die';
import PurchaseButton from '../../components/purchase-button';

// For development purposes
import { addPoints, getPoints } from '../../db/userState';

export default function ShopScreen() {
  const [points, setPoints] = useState(0);

  async function refreshPoints() {
    const latest = await getPoints();
    setPoints(latest);
  }

  useEffect(() => {
    refreshPoints();
  }, []);

  async function handleAddPoints() {
    await addPoints(25);
    refreshPoints();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pointsDisplay}>{points} pts</Text>
      <TouchableOpacity
        style={styles.devButton}
        onPress={handleAddPoints}>
          <Text style={styles.devButtonText}>+ 25 pts (dev)</Text>
        </TouchableOpacity>
      <DiceView setId={2} />
      <PurchaseButton
        setId={2}
        price={20}
        owned={false}
        userPoints={points}
        onPurchaseSuccess={refreshPoints}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
  },
  devButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 20,
  },
  devButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  pointsDisplay: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});