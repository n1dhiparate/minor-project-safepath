// utils/offline/db.js
import { openDatabaseAsync } from "expo-sqlite";

export async function getDBConnection() {
  const db = await openDatabaseAsync("safehub.db");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS safe_places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      type TEXT,
      lat REAL,
      lng REAL,
      address TEXT
    );
  `);
  return db;
}
