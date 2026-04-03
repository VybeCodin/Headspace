import { createDb } from "../src/db/index";
import { seed } from "../src/db/seed";
import { createApp } from "../src/app";

export function createTestApp() {
  const db = createDb(":memory:");
  seed(db);
  return createApp(db);
}

export function request(app: ReturnType<typeof createTestApp>, path: string, init?: RequestInit) {
  return app.request(path, init);
}
