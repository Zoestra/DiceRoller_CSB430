import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getPoints, deductPoints } from '@/db/userState';
import { getDB } from '@/db/db';

export default function PurchaseButton({ setId, price, owned, userPoints, onPurchaseSuccess }) {
  const [purchasing, setPurchasing] = useState(false);

  async function handlePurchase() {
    if (purchasing || owned) return;

    try {
      setPurchasing(true);
      const success = await deductPoints(price);

      if (success) {
        // Update owned status in dice_sets
        const db = await getDB();
        await db.runAsync(
          'UPDATE dice_sets SET owned = 1 WHERE id = ?',
          [setId]
        );
        onPurchaseSuccess?.();
      } else {
        alert('Not enough points!');
      }
    } catch (err) {
      console.error('Purchase failed:', err.message);
    } finally {
      setPurchasing(false);
    }
  }

  const canAfford = userPoints >= price;

  if (owned) {
    return (
      <TouchableOpacity style={[styles.button, styles.owned]} disabled>
        <Text style={styles.label}>Owned</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, canAfford ? styles.canAfford : styles.cantAfford]}
      onPress={handlePurchase}
      disabled={!canAfford || purchasing}
    >
      {purchasing
        ? <ActivityIndicator color="#fff" />
        : <Text style={styles.label}>{canAfford ? `Buy — ${price} pts` : `Need ${price - userPoints} more pts`}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 160,
  },
  canAfford: {
    backgroundColor: '#4caf50',
  },
  cantAfford: {
    backgroundColor: '#555',
  },
  owned: {
    backgroundColor: '#1a73e8',
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});