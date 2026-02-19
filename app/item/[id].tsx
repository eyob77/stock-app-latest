import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import db from '../../database/db';
import { updateItem, deleteItem } from '../../database/item';
import { StationeryItem } from '../../database/schema';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/screenwrapper';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<StationeryItem | null>(null);

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    const result = await db.getFirstAsync<StationeryItem>('SELECT * FROM items WHERE id = ?', [id as string]);
    if (result) setItem(result);
  };

  const handleUpdate = async () => {
    if (!item) return;
    const res = await updateItem(item.id, item.name, item.category, item.quantity, item.price, item.threshold);
    if (res.success) {
      Alert.alert("Success", "Item updated");
      router.back();
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete Item", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          await deleteItem(id as string);
          router.back();
      }}
    ]);
  };

  if (!item) return <Text>Loading...</Text>;

  return (

        <ScrollView style={styles.container}>
          <View style={styles.headerRow}>          
            <TouchableOpacity onPress={confirmDelete}><Ionicons name="trash" size={24} color="#d32f2f" /></TouchableOpacity>
          </View>

          <Text style={styles.label}>Item Name</Text>
          <TextInput 
            style={styles.input} 
            value={item.name} 
            onChangeText={(t) => setItem({...item, name: t})} 
          />

          <Text style={styles.label}>Category</Text>
          <TextInput 
            style={styles.input} 
            value={item.category} 
            onChangeText={(t) => setItem({...item, category: t})} 
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>In Stock</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric"
                value={item.quantity.toString()} 
                onChangeText={(t) => setItem({...item, quantity: parseInt(t) || 0})} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Price</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="decimal-pad"
                value={item.price.toString()} 
                onChangeText={(t) => setItem({...item, price: parseFloat(t) || 0})} 
                />
            </View>
          </View>

          <Text style={styles.label}>Alert Threshold</Text>
          <TextInput 
            style={styles.input} 
            keyboardType="numeric"
            value={item.threshold.toString()} 
            onChangeText={(t) => setItem({...item, threshold: parseInt(t) || 0})} 
            />

          <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
            <Ionicons name="save" size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  backIcon: { marginRight: 10, alignSelf: 'center' },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
  row: { flexDirection: 'row' },
  saveButton: { backgroundColor: '#28a745', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 10, marginTop: 10 },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 }
});