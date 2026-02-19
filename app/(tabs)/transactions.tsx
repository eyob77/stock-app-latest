import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Alert, StyleSheet, Platform } from 'react-native';
import db from '../../database/db';
import { recordSale } from '../../database/transactions'; // Assuming this handles the isDirty = 1 logic
import { StationeryItem } from '../../database/schema';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function TransactionsScreen() {
  const [items, setItems] = useState<StationeryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<StationeryItem | null>(null);
  const [qty, setQty] = useState('');

  const loadItems = async () => {
    const result = await db.getAllAsync<StationeryItem>('SELECT * FROM items ORDER BY name ASC');
    setItems(result);
  };

  useEffect(() => { loadItems(); }, []);

  const handleTransaction = async (type: 'SALE' | 'IMPORT') => {
    if (!selectedItem || !qty) {
      Alert.alert("Wait", "Please select an item and enter quantity");
      return;
    }
    
    const amount = parseInt(qty);
    if (type === 'SALE' && amount > selectedItem.quantity) {
      Alert.alert("Error", "Not enough stock!");
      return;
    }

    // Adjusting for Import vs Sale
    // Note: You might need to update your recordSale function to handle imports
    // or create a separate recordImport function.
    const result = await recordSale(
      selectedItem.id, 
      selectedItem.name, 
      type === 'SALE' ? amount : -amount, // Negative for recordSale logic usually subtracts
      selectedItem.price, 
      selectedItem.quantity, 
      selectedItem.threshold
    );

    if (result.success) {
      Alert.alert("Success", `${type === 'SALE' ? 'Sold' : 'Restocked'} ${selectedItem.name}`);
      setQty('');
      setSelectedItem(null);
      loadItems();
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Inventory Movement</Text>
        
        <Text style={styles.sectionLabel}>1. Select Stationery Item</Text>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable 
              style={[styles.itemCard, selectedItem?.id === item.id && styles.selectedCard]} 
              onPress={() => setSelectedItem(item)}
            >
              <Text style={[styles.itemName, selectedItem?.id === item.id && styles.selectedText]}>
                {item.name}
              </Text>
              <Text style={styles.itemStock}>{item.quantity} in stock</Text>
            </Pressable>
          )}
        />

        {selectedItem && (
          <View style={styles.actionArea}>
            <View style={styles.selectedHeader}>
                <Ionicons name="pencil" size={18} color="#0a7ea4" />
                <Text style={styles.selectedTitle}>Managing: {selectedItem.name}</Text>
            </View>

            <TextInput 
              placeholder="Enter Quantity" 
              placeholderTextColor="#64748B"
              keyboardType="numeric" 
              value={qty}
              onChangeText={setQty}
              style={styles.input}
            />

            <View style={styles.buttonRow}>
              <Pressable 
                style={[styles.actionBtn, styles.saleBtn]} 
                onPress={() => handleTransaction('SALE')}
              >
                <Ionicons name="cart-outline" size={20} color="white" />
                <Text style={styles.btnText}>Record Sale</Text>
              </Pressable>

              <Pressable 
                style={[styles.actionBtn, styles.importBtn]} 
                onPress={() => handleTransaction('IMPORT')}
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.btnText}>Import</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#11181C', marginBottom: 20 },
  sectionLabel: { fontSize: 14, color: '#94A3B8', marginBottom: 12, fontWeight: '600', textTransform: 'uppercase' },
  listContent: { paddingBottom: 20 },
  itemCard: { 
    flexDirection: 'row',
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
  },
  selectedCard: { borderColor: '#0a7ea4', borderWidth: 2, backgroundColor: '#e8f4fc' },
  itemName: { fontSize: 16, fontWeight: '600', color: '#11181C' },
  selectedText: { color: '#0a7ea4' },
  itemStock: { fontSize: 13, color: '#666', marginTop: 4 },
  actionArea: { 
    marginTop: 'auto', 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    marginBottom: 80 // Space for the floating tab bar
  },
  selectedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  selectedTitle: { color: '#11181C', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  input: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 15, 
    color: '#11181C', 
    fontSize: 18, 
    marginBottom: 20,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc'
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { 
    flex: 0.48, 
    flexDirection: 'row', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  saleBtn: { backgroundColor: '#EF4444' },
  importBtn: { backgroundColor: '#10B981' },
  btnText: { color: 'white', fontWeight: 'bold', marginLeft: 8 }
});