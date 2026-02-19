import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import db from '../../database/db';
import { StationeryItem } from '../../database/schema';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/screenwrapper';
// import { Search, Plus, AlertCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<StationeryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StationeryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Load data whenever the user navigates to this screen
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

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(text.toLowerCase()) || 
      item.category?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const renderItem = ({ item }: { item: StationeryItem }) => {
    const isLowStock = item.quantity <= item.threshold;

    return (
      <Pressable 
        style={styles.card} 
        onPress={() => router.push(`/item/${item.id}`)}
      >
        <View style={styles.cardInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCategory}>{item.category || 'No Category'}</Text>
        </View>
        
        <View style={styles.cardStatus}>
          <Text style={[styles.itemQty, isLowStock ? styles.lowStockText : null]}>
            {item.quantity} units
          </Text>
          {/* {isLowStock && <AlertCircle size={16} color="#d32f2f" />} */}
          <Ionicons name="alert-circle" size={20} color="#d32f2f" style={styles.lowStockIcon} />
        </View>
      </Pressable>
    );
  };

  return (

      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
        </View>

        {/* Item List */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No items found.</Text>}
          contentContainerStyle={{ paddingBottom: 80 }}
        />

        {/* Floating Action Button to Add Item */}
        <Pressable 
          style={[
            styles.fab, 
            { bottom: insets.bottom + 40 } // Dynamic position based on system buttons + tab bar height
          ]}
          onPress={() => router.push('/item/add')}
        >
          <Ionicons name="add" size={30} color="white" />
        </Pressable>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    margin: 15, 
    paddingHorizontal: 10, 
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    padding: 15, 
    marginHorizontal: 15, 
    marginBottom: 10, 
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemCategory: { fontSize: 12, color: '#666', marginTop: 2 },
  cardStatus: { alignItems: 'flex-end' },
  itemQty: { fontSize: 15, fontWeight: 'bold' },
  lowStockText: { color: '#d32f2f' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  lowStockIcon: {
    marginTop: 4,
    marginLeft: 4,
  }
});