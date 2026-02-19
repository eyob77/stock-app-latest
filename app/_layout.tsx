import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { initializeDatabase } from '../database/db';
import { SafeAreaProvider,SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Initialize the DB when the app first loads
    initializeDatabase()
      .then(() => setDbReady(true))
      .catch((err) => console.error(err));
  }, []);

  // Show a loading spinner while the database is setting up
  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Once ready, render the actual app screens
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="item/add" options={{ title: 'Add New Item' }} />
          <Stack.Screen name="item/[id]" options={{ title: 'Edit Item' }} />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}