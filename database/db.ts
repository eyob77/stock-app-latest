// src/database/db.ts
import * as SQLite from 'expo-sqlite';
import { CREATE_ITEMS_TABLE, CREATE_TRANSACTIONS_TABLE } from './schema';

// 1. Open (or create) the database file on the phone
// This creates a file named "stationery_stock.db" in the app's internal folder
const db = SQLite.openDatabaseSync('stationery_stock.db');

export const initializeDatabase = async () => {
  try {
    // 2. Execute the table creation queries from our schema
    // execAsync allows us to run multiple SQL commands at once
    await db.execAsync(`
      PRAGMA foreign_keys = ON; 
      ${CREATE_ITEMS_TABLE}
      ${CREATE_TRANSACTIONS_TABLE}
    `);
    
    console.log("✅ Database & Tables initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw new Error("Could not initialize database");
  }
};

export default db;