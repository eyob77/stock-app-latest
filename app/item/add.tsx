import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { addItem } from '../../database/item';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import FontAwesome from '@expo/vector-icons/build/FontAwesome';
// import { Save, Package, Tag, Hash, Bell } from 'lucide-react-native';

export default function AddItemScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    threshold: '5', // Default alert level
  });

  const handleSave = async () => {
    const { name, category, quantity, price, threshold } = form;

    if (!name || !quantity || !price) {
      Alert.alert("Error", "Please fill in Name, Quantity, and Price.");
      return;
    }

    const result = await addItem(
      name,
      category,
      parseInt(quantity),
      parseFloat(price),
      parseInt(threshold)
    );

    if (result.success) {
      Alert.alert("Success", "Item registered!", [{ text: "OK", onPress: () => router.back() }]);
    }
  };

  return (
    
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>New Stationery Item</Text>

        <View style={styles.inputGroup}>
          <Ionicons name="add-circle-outline" size={20} color="#007AFF" style={styles.addIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Item Name (e.g. Blue Gel Pen)" 
            value={form.name}
            onChangeText={(t) => setForm({...form, name: t})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="folder-outline" size={20} color="#007AFF" style={styles.folderIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Category (e.g. Writing)" 
            value={form.category}
            onChangeText={(t) => setForm({...form, category: t})}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            {/* <Hash size={20} color="#007AFF" /> */}
            <FontAwesome name="hashtag" size={18} color="#007AFF" style={styles.hashIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Quantity" 
              keyboardType="numeric"
              value={form.quantity}
              onChangeText={(t) => setForm({...form, quantity: t})}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={{ fontWeight: 'bold', color: '#007AFF' }}>$</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Price" 
              keyboardType="decimal-pad"
              value={form.price}
              onChangeText={(t) => setForm({...form, price: t})}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="alert-circle" size={20} color="#d32f2f" style={styles.alertIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Low Stock Alert Threshold" 
            keyboardType="numeric"
            value={form.threshold}
            onChangeText={(t) => setForm({...form, threshold: t})}
          />
        </View>
        <Text style={styles.hint}>You will get a notification when stock hits this number.</Text>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="save" size={20} color="white" style={styles.saveIcon} />
          <Text style={styles.saveButtonText}>Save Item</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  inputGroup: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    marginBottom: 15,
    height: 50
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  row: { flexDirection: 'row' },
  hint: { fontSize: 12, color: '#888', marginBottom: 30, marginTop: -10 },
  saveButton: { 
    backgroundColor: '#007AFF', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: 10 
  },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  saveIcon: { marginRight: 5 },
  alertIcon: { marginRight: 5 },
  hashIcon: { marginRight: 5 },
  folderIcon: { marginRight: 5 },
  addIcon: { marginRight: 5 }
});