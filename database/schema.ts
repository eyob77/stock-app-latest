// src/database/schema.ts

// 1. Define the TypeScript interface for an Item
export interface StationeryItem {
  id: string;           // Unique UUID
  name: string;         // e.g., "A4 Notebook"
  category: string;     // e.g., "Paper", "Pens"
  quantity: number;     // Current stock level
  price: number;        // Unit price
  threshold: number;    // The "Low Stock" alert level
  isDirty: number;      // 0 for synced, 1 for "needs backup to MongoDB"
  lastUpdated: string;  // ISO timestamp
}

// 2. Define the TypeScript interface for a Transaction
export interface Transaction {
  id: string;
  itemId: string;       // Foreign key to the item sold
  qtySold: number;
  totalPrice: number;
  timestamp: string;    // When the sale happened
}

// 3. SQL Query to initialize the Items table
export const CREATE_ITEMS_TABLE = `
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    quantity INTEGER DEFAULT 0,
    price REAL DEFAULT 0.0,
    threshold INTEGER DEFAULT 5,
    isDirty INTEGER DEFAULT 1,
    lastUpdated TEXT NOT NULL
  );
`;

// 4. SQL Query to initialize the Transactions table
export const CREATE_TRANSACTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY NOT NULL,
    itemId TEXT NOT NULL,
    qtySold INTEGER NOT NULL,
    totalPrice REAL NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (itemId) REFERENCES items (id)
  );
`;