import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

export function createDb() {
  const client = process.env.TURSO_DATABASE_URL
    ? createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      })
    : createClient({ url: process.env.VERCEL ? "file:/tmp/headspace.db" : "file:./headspace.db" });

  return drizzle(client, { schema });
}

export type AppDatabase = ReturnType<typeof createDb>;
