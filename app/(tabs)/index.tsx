import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Pressable, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import db from '../../database/db';
import { StationeryItem } from '../../database/schema';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/screenwrapper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Crypto from 'expo-crypto';

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [items, setItems] = useState<StationeryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StationeryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Input State
  const [selectedItem, setSelectedItem] = useState<StationeryItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionQty, setTransactionQty] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadInventory();
    }, [])
  );

  const loadInventory = async () => {
    const result = await db.getAllAsync<StationeryItem>('SELECT * FROM items ORDER BY name ASC');
    setItems(result);
    setFilteredItems(result);
  };

  const handleTransaction = async (type: 'SALE' | 'IMPORT') => {
    if (!selectedItem || !transactionQty) return;

    const amount = parseInt(transactionQty);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid number.");
      return;
    }

    const newQty = type === 'SALE' ? selectedItem.quantity - amount : selectedItem.quantity + amount;

    if (type === 'SALE' && selectedItem.quantity < amount) {
      Alert.alert("Low Stock", `Only ${selectedItem.quantity} left in stock.`);
      return;
    }

    try {
      await db.withTransactionAsync(async () => {
        // Update stock and mark for MongoDB sync
        await db.runAsync('UPDATE items SET quantity = ?, isDirty = 1 WHERE id = ?', [newQty, selectedItem.id]);
        
        // Log transaction
        await db.runAsync(
          `INSERT INTO transactions (id, itemId, qtySold, totalPrice, timestamp) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            Crypto.randomUUID(), 
            selectedItem.id, 
            type === 'SALE' ? amount : -amount, 
            type === 'SALE' ? (selectedItem.price * amount) : 0
          ]
        );
      });
      
      setModalVisible(false);
      setTransactionQty('');
      loadInventory();
    } catch (error) {
      Alert.alert("Error", "Transaction failed to save.");
    }
  };

  const renderItem = ({ item }: { item: StationeryItem }) => {
    const isLowStock = item.quantity <= item.threshold;
    return (
      <Pressable 
        style={styles.card} 
        onPress={() => {
          setSelectedItem(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.cardInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCategory}>{item.category || 'General'}</Text>
          <Text style={[styles.itemQty, isLowStock ? styles.lowStockText : styles.normalStockText]}>
            {item.quantity} in stock
          </Text>
        </View>
        <Pressable onPress={() => router.push(`/item/${item.id}`)} style={styles.editBtn}>
          <Ionicons name="create-outline" size={22} color="#94A3B8" />
        </Pressable>
      </Pressable>
    );
  };

  return (
      <View style={styles.container}>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Search items..."
            placeholderTextColor="#64748B"
            onChangeText={(text) => setFilteredItems(items.filter(i => i.name.toLowerCase().includes(text.toLowerCase())))}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 150 }}
        />

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
                <Pressable onPress={() => { setModalVisible(false); setTransactionQty(''); }}>
                  <Ionicons name="close-circle" size={28} color="#475569" />
                </Pressable>
              </View>

              <Text style={styles.label}>Quantity to Adjust:</Text>
              <TextInput 
                style={styles.modalInput}
                placeholder="0"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                autoFocus={true}
                value={transactionQty}
                onChangeText={setTransactionQty}
              />

              <View style={styles.modalActions}>
                <Pressable style={[styles.actionBtn, styles.saleBtn]} onPress={() => handleTransaction('SALE')}>
                  <Text style={styles.btnText}>Record Sale</Text>
                </Pressable>

                <Pressable style={[styles.actionBtn, styles.importBtn]} onPress={() => handleTransaction('IMPORT')}>
                  <Text style={styles.btnText}>Restock</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Pressable 
          style={[styles.fab, { bottom: insets.bottom + 50 }]}
          onPress={() => router.push('/item/add')}
        >
          <Ionicons name="add" size={32} color="white" />
        </Pressable>
      </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#0F172A' },
  container: { flex: 1 },
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', 
    margin: 16, paddingHorizontal: 16, borderRadius: 10, height: 50, borderWidth: 1, borderColor: '#38BDF8' 
  },
  searchInput: { flex: 1, color: '#1E293B', marginLeft: 10 },
  card: { 
    flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 18, 
    marginHorizontal: 16, marginBottom: 12, borderRadius: 10, alignItems: 'center',
    borderWidth: 1, borderColor: '#334155' 
  },
  cardInfo: { flex: 1 },
  itemName: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  itemCategory: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  itemQty: { fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  normalStockText: { color: '#38BDF8' },
  lowStockText: { color: '#EF4444' },
  editBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 6 ,borderWidth: 1, borderColor: '#94A3B8' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { 
    backgroundColor: '#F1F5F9', borderRadius: 10, padding: 25, 
    borderWidth: 1, borderColor: '#334155' 
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: 'black' },
  label: { color: '#94A3B8', fontSize: 14, marginBottom: 10 },
  modalInput: { 
    backgroundColor: '#F1F5F9', borderRadius: 8, padding: 10, 
    color: 'black', fontSize: 24, fontWeight: 'bold', textAlign: 'center',
    borderWidth: 1, borderColor: '#0F172A', marginBottom: 25
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 0.48, height: 50, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  saleBtn: { backgroundColor: '#EF4444' },
  importBtn: { backgroundColor: '#10B981' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  fab: { 
    position: 'absolute', right: 20, backgroundColor: '#2563EB', 
    width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' 
  }
});