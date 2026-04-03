import { createApp } from "./app";
import { createDb } from "./db/index";
import { seed } from "./db/seed";

const port = parseInt(process.env.PORT || "3000");

const db = createDb();
await seed(db);

const app = createApp(db);

console.log(`Headspace API running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
