import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { describeRoute, resolver } from "hono-openapi";
import type { AppDatabase } from "../db/index";
import * as schema from "../db/schema";
import { NotFoundError } from "../lib/errors";
import { computeStats } from "../lib/helpers";
import { StatsSchema, ErrorSchema } from "../lib/types";

export function statsRoutes(db: AppDatabase) {
  const router = new Hono();

  // GET /api/users/:id/stats
  router.get("/:id/stats", describeRoute({
    tags: ["Stats"],
    summary: "Get user statistics",
    responses: {
      200: { description: "User stats", content: { "application/json": { schema: resolver(StatsSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver(ErrorSchema) } } },
    },
  }), async (c) => {
    const userId = c.req.param("id");

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get();

    if (!user) throw new NotFoundError("User", userId);

    const stats = await computeStats(db, userId);
    return c.json(stats);
  });

  return router;
}
