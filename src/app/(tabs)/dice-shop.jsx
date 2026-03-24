import React from 'react';
import { View, StyleSheet } from 'react-native';
import DiceView from '../../components/textured-die';

export default function ShopScreen() {
  return (
    <View style={styles.container}>
      <DiceView setId={1} />
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