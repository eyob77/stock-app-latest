import db from './db';
import * as Notifications from 'expo-notifications';
import * as Crypto from 'expo-crypto';

export const recordSale = async (itemId: string, name: string, qtySold: number, pricePerUnit: number, currentQty: number, threshold: number) => {
  const newQty = currentQty - qtySold;
  const totalPrice = qtySold * pricePerUnit;
  const timestamp = new Date().toISOString();
  const transactionId = Crypto.randomUUID(); // Ensure you have expo-crypto or similar

  try {
    // We use a transaction to ensure both updates happen or neither happens
    await db.withTransactionAsync(async () => {
      // 1. Insert Transaction record
      await db.runAsync(
        'INSERT INTO transactions (id, itemId, qtySold, totalPrice, timestamp) VALUES (?, ?, ?, ?, ?)',
        [transactionId, itemId, qtySold, totalPrice, timestamp]
      );

      // 2. Update Item Quantity and mark as Dirty for MongoDB sync
      await db.runAsync(
        'UPDATE items SET quantity = ?, isDirty = 1, lastUpdated = ? WHERE id = ?',
        [newQty, timestamp, itemId]
      );
    });

    // 3. Check Threshold for Notification
    if (newQty <= threshold) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Low Stock Alert! ⚠️",
          body: `${name} is down to ${newQty} units. Time to restock!`,
        },
        trigger: null, // Send immediately
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Sale failed:", error);
    return { success: false, error };
  }
};