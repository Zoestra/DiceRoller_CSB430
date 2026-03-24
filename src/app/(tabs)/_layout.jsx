<<<<<<< HEAD
import { getDB } from '../../db/db';
=======
import { getDB } from '@/db/db';
>>>>>>> f7a6a365c511fc3d8eb7aefe66c1d12a07cd9610
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { HapticTab } from '../../components/haptic-tab';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
<<<<<<< HEAD
import { useSettings } from '../../context/SettingsContext';

async function initializeDatabase() {
  const db = await getDB();

  const result = await db.getFirstAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='user_state'`
  );

  if (result) return;
=======
import { useSettings } from '../../context/SettingsContext.jsx';

async function initializeDatabase() {
  await getDB();
>>>>>>> f7a6a365c511fc3d8eb7aefe66c1d12a07cd9610
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
        name="roll"
        options={{
          title: 'Roll',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="die.face.5.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      {/*
      <Tabs.Screen
        name="dice-collection"
        options={{
          title: 'Dice Collection',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.grid.2x2.fill" color={color} />,
        }}
      />
      */}
      <Tabs.Screen
        name="dice-shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
<<<<<<< HEAD

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
=======
>>>>>>> f7a6a365c511fc3d8eb7aefe66c1d12a07cd9610
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
