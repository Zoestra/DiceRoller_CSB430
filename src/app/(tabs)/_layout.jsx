import { getDB } from '../../db/db';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system/next';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { HapticTab } from '../../components/haptic-tab';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';

async function initializeDatabase() {
  const db = await getDB();

  // Check if DB has already been initialized
  const result = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='user_state'`
  );

  if (result) return; // Already initialized, skip

  // Load the SQL file from assets
  const asset = Asset.fromModule(require('../../../db/init-db.sql'));
  await asset.downloadAsync();

  const file = new File(asset.localUri);
  const sql = await file.text();

  await db.execAsync(sql);
  console.log('Database initialized successfully');
}

export default function TabLayout() {
  const { theme } = useSettings();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initializeDatabase()
      .then(() => setDbReady(true))
      .catch(console.error);
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[theme].background,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />

      {/* Dice Collection tab restored */}
      <Tabs.Screen
        name="dice-collection"
        options={{
          title: 'Dice Collection',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.grid.2x2.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="dice-shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
