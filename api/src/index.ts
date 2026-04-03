import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { createDb } from "./db/index";
import { seed } from "./db/seed";

const port = parseInt(process.env.PORT || "3000");

const db = createDb();
const app = createApp(db);

seed(db).then(() => {
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Headspace API running on http://localhost:${port}`);
  });
});
