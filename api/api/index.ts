import { handle } from "hono/vercel";
import { createApp } from "../src/app";
import { createDb } from "../src/db/index";
import { seed } from "../src/db/seed";

const db = createDb();
const seedPromise = seed(db);
const app = createApp(db);

const handler = handle(app);

export default async function (req: Request, ctx: any) {
  await seedPromise;
  return handler(req, ctx);
}
