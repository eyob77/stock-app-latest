import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Pressable, 
  Modal, 
  Dimensions, 
  Platform 
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Internal Imports
import db from '../../database/db';
import { Transaction } from '../../database/schema';
import { ScreenWrapper } from '@/components/screenwrapper';

const { width } = Dimensions.get('window');

interface TransactionWithItem extends Transaction {
  name: string;
}

export default function TransactionHistoryScreen() {
  const [history, setHistory] = useState<TransactionWithItem[]>([]);
  const [selectedTx, setSelectedTx] = useState<TransactionWithItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      // JOIN with items table to get the name of the stationery
      const result = await db.getAllAsync<TransactionWithItem>(`
        SELECT t.*, i.name 
        FROM transactions t 
        JOIN items i ON t.itemId = i.id 
        ORDER BY t.timestamp DESC
      `);
      setHistory(result);
    } catch (error) {
      console.error("Failed to load transaction history:", error);
    }
  };

  const renderItem = ({ item }: { item: TransactionWithItem }) => {
    const date = new Date(item.timestamp);
    const dayDisplay = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    const timeDisplay = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <Pressable 
        style={styles.historyCard} 
        onPress={() => {
          setSelectedTx(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.leftContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.timestamp}>{dayDisplay} • {timeDisplay}</Text>
        </View>
        
        <View style={styles.rightContent}>
          <Text style={[
            styles.qtyText, 
            item.qtySold > 0 ? styles.saleColor : styles.importColor
          ]}>
            {item.qtySold > 0 ? `-${item.qtySold}` : `+${Math.abs(item.qtySold)}`}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#475569" style={{marginLeft: 8}} />
        </View>
      </Pressable>
    );
  };

  return (
      <View style={styles.container}>
        <Text style={styles.header}>Activity Log</Text>
        
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#1E293B" />
              <Text style={styles.emptyText}>No activity recorded yet.</Text>
            </View>
          }
        />

        {/* --- DETAIL MODAL (RECEIPT) --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Receipt Header */}
              <View style={styles.detailHeader}>
                <View style={[
                  styles.iconCircle, 
                  { backgroundColor: selectedTx?.qtySold! > 0 ? '#334155' : '#064e3b' }
                ]}>
                  <Ionicons 
                    name={selectedTx?.qtySold! > 0 ? "cart" : "download"} 
                    size={32} 
                    color={selectedTx?.qtySold! > 0 ? "white" : "#34D399"} 
                  />
                </View>
                <Text style={styles.detailTitle}>
                  {selectedTx?.qtySold! > 0 ? "Sale Summary" : "Restock Summary"}
                </Text>
              </View>

              {/* Transaction Data Rows */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Stationery Item</Text>
                <Text style={styles.infoValue}>{selectedTx?.name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transaction Day</Text>
                <Text style={styles.infoValue}>
                  {selectedTx && new Date(selectedTx.timestamp).toLocaleDateString([], { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Clock Time</Text>
                <Text style={styles.infoValue}>
                  {selectedTx && new Date(selectedTx.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Stock Change</Text>
                <Text style={[
                  styles.infoValue, 
                  selectedTx?.qtySold! > 0 ? styles.saleColor : styles.importColor
                ]}>
                  {selectedTx?.qtySold! > 0 
                    ? `Reduced by ${selectedTx?.qtySold}` 
                    : `Increased by ${Math.abs(selectedTx?.qtySold!)}`}
                </Text>
              </View>

              {selectedTx?.qtySold! > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total Revenue</Text>
                  <Text style={[styles.infoValue, { color: '#38BDF8' }]}>
                    ${selectedTx?.totalPrice.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Internal ID</Text>
                <Text style={styles.idValue}>{selectedTx?.id.substring(0, 18)}...</Text>
              </View>

              {/* Close Button */}
              <Pressable 
                style={styles.closeBtn} 
                onPress={() => {
                    setModalVisible(false);
                    setSelectedTx(null);
                }}
              >
                <Text style={styles.closeBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#0F172A', 
    marginTop: 20, 
    marginBottom: 10 
  },
  listPadding: { paddingBottom: 140, paddingTop: 10 },
  historyCard: {
    backgroundColor: '#F8FAFC',
    padding: 18,
    borderRadius: 22,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  leftContent: { flex: 1 },
  itemName: { color: '#0F172A', fontSize: 17, fontWeight: '700' },
  timestamp: { color: '#64748B', fontSize: 13, marginTop: 4 },
  rightContent: { flexDirection: 'row', alignItems: 'center' },
  qtyText: { fontSize: 17, fontWeight: '800' },
  saleColor: { color: '#F87171' },
  importColor: { color: '#34D399' },
  
  // Empty State
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#475569', fontSize: 16, marginTop: 15 },

  // Detail Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.85)', 
    justifyContent: 'center', 
    padding: 25 
  },
  modalContent: { 
    backgroundColor: '#F8FAFC', 
    borderRadius: 15, 
    padding: 25, 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  detailHeader: { alignItems: 'center', marginBottom: 25 },
  iconCircle: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  detailTitle: { color: 'white', fontSize: 22, fontWeight: '900' },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#334155' 
  },
  infoLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  infoValue: { color: '#0F172A', fontSize: 15, fontWeight: '700', textAlign: 'right', flex: 1, marginLeft: 20 },
  idValue: { color: '#475569', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  closeBtn: { 
    backgroundColor: '#2563EB', 
    marginTop: 25, 
    padding: 10, 
    borderRadius: 9, 
    alignItems: 'center' 
  },
  closeBtnText: { color: 'white', fontWeight: '900', fontSize: 16 },
});