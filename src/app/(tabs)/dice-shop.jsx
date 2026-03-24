import React from 'react';
import { View, StyleSheet } from 'react-native';
import DiceView from '../../components/textured-die';
import PurchaseButton from '../../components/purchase-button';
import { getDB } from '../../db/db';

export default function ShopScreen() {
  return (
    <View style={styles.container}>
      <DiceView setId={2} />
      <PurchaseButton
        setId={2}
        price={20}
        owned={false}
        onPurchaseSuccess={() => console.log('Purchase Complete')}
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
});
