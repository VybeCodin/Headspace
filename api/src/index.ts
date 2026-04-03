import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { createDb } from "./db/index";
import { seed } from "./db/seed";

const port = parseInt(process.env.PORT || "3000");

const db = createDb();
await seed(db);

const app = createApp(db);

// Vercel serverless: export the app
export default app;

// Local dev: start Node.js HTTP server
if (!process.env.VERCEL) {
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Headspace API running on http://localhost:${port}`);
  });
}
