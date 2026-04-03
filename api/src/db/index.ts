import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";

export function createDb(url?: string) {
  const sqlite = new Database(url || process.env.DATABASE_URL || "./headspace.db");
  sqlite.exec("PRAGMA journal_mode = WAL;");
  sqlite.exec("PRAGMA foreign_keys = ON;");
  return drizzle(sqlite, { schema });
}

export type AppDatabase = ReturnType<typeof createDb>;

// Default singleton for production
let db: AppDatabase | null = null;

export function getDb(): AppDatabase {
  if (!db) {
    db = createDb();
  }
  return db;
}
