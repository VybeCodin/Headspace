import { getRequestListener } from "@hono/node-server";
import { createApp } from "./app";
import { createDb } from "./db/index";
import { seed } from "./db/seed";

const db = createDb();
const seedPromise = seed(db);
const app = createApp(db);

const listener = getRequestListener(app.fetch);

export default async function handler(req: any, res: any) {
  await seedPromise;
  return listener(req, res);
}
