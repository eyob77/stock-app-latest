import { View, Text, Button, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import db from '../../database/db';
import { ScreenWrapper } from '@/components/screenwrapper';

export default function SettingsScreen() {
  const [dirtyCount, setDirtyCount] = useState(0);

  const checkSyncStatus = async () => {
    const result = await db.getFirstAsync<{count: number}>('SELECT COUNT(*) as count FROM items WHERE isDirty = 1');
    setDirtyCount(result?.count || 0);
  };

  useEffect(() => { checkSyncStatus(); }, []);

  const handleManualSync = async () => {
    // This is where your MongoDB API call logic will eventually go
    Alert.alert("Syncing", "Connecting to MongoDB backup...");
    
    // logic: fetch all isDirty = 1 -> upload -> set isDirty = 0
    // We will build the background fetch service next!
  };

  return (

      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Settings</Text>
        
        <View style={{ marginVertical: 20, padding: 15, backgroundColor: '#eee', borderRadius: 8 }}>
          <Text>Unsynced Items: {dirtyCount}</Text>
          <Text style={{ color: '#666', fontSize: 12 }}>Next automatic backup in ~5 hours</Text>
        </View>

        <Button title="Sync to MongoDB Now" onPress={handleManualSync} />
      </View>
  );
}