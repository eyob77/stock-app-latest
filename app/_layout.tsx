import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { initializeDatabase } from '../database/db';
import { SafeAreaProvider,SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Initialize the DB when the app first loads
    initializeDatabase()
      .then(() => setDbReady(true))
      .catch((err) => console.error(err));
  }, []);
   useEffect(() => {
    if (Platform.OS === 'android') {
      // Sets the system navigation bar (Home/Back/Recent) to black
      // Sets the buttons themselves to light/white so they are visible on black
      NavigationBar.setButtonStyleAsync('dark');
    }
  },[])

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

        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="item/add" options={{ title: 'Add New Item' }} />
          <Stack.Screen name="item/[id]" options={{ title: 'Edit Item' }} />
        </Stack>
    </SafeAreaProvider>
  );
}