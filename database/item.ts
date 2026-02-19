import db from './db';
import * as Crypto from 'expo-crypto';

export const addItem = async (name: string, category: string, quantity: number, price: number, threshold: number) => {
  const id = Crypto.randomUUID();
  const timestamp = new Date().toISOString();

  try {
    await db.runAsync(
      'INSERT INTO items (id, name, category, quantity, price, threshold, isDirty, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
      [id, name, category, quantity, price, threshold, timestamp]
    );
    return { success: true };
  } catch (error) {
    console.error("Add item failed:", error);
    return { success: false, error };
  }
};



// src/database/items.ts (Add these functions)

export const updateItem = async (id: string, name: string, category: string, quantity: number, price: number, threshold: number) => {
  const timestamp = new Date().toISOString();
  try {
    await db.runAsync(
      'UPDATE items SET name = ?, category = ?, quantity = ?, price = ?, threshold = ?, isDirty = 1, lastUpdated = ? WHERE id = ?',
      [name, category, quantity, price, threshold, timestamp, id]
    );
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const deleteItem = async (id: string) => {
  try {
    // In a real app, you might want to delete associated transactions too
    await db.runAsync('DELETE FROM items WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};