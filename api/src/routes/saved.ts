import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { describeRoute, resolver } from "hono-openapi";
import { z } from "zod";
import type { AppDatabase } from "../db/index";
import * as schema from "../db/schema";
import { NotFoundError } from "../lib/errors";
import { SavedItemSchema, ErrorSchema, SuccessSchema } from "../lib/types";

export function savedRoutes(db: AppDatabase) {
  const router = new Hono();

  // GET /api/users/:id/saved
  router.get("/:id/saved", describeRoute({
    tags: ["Saved"],
    summary: "List saved content",
    responses: {
      200: { description: "Saved items", content: { "application/json": { schema: resolver(z.array(SavedItemSchema)) } } },
    },
  }), async (c) => {
    const userId = c.req.param("id");

    const saved = await db
      .select()
      .from(schema.savedContent)
      .where(eq(schema.savedContent.userId, userId))
      .all();

    return c.json(
      saved.map((s) => ({
        userId: s.userId,
        contentId: s.contentId,
        savedAt: s.savedAt,
      }))
    );
  });

  // POST /api/users/:id/saved
  router.post("/:id/saved", describeRoute({
    tags: ["Saved"],
    summary: "Save content",
    responses: {
      200: { description: "Already saved", content: { "application/json": { schema: resolver(SavedItemSchema) } } },
      201: { description: "Newly saved", content: { "application/json": { schema: resolver(SavedItemSchema) } } },
    },
  }), async (c) => {
    const userId = c.req.param("id");
    const body = await c.req.json();
    const { contentId } = body;

    // Check if already saved
    const existing = await db
      .select()
      .from(schema.savedContent)
      .where(
        and(
          eq(schema.savedContent.userId, userId),
          eq(schema.savedContent.contentId, contentId)
        )
      )
      .get();

    if (existing) {
      return c.json({ userId, contentId, savedAt: existing.savedAt });
    }

    const savedAt = new Date().toISOString().split("T")[0];
    await db.insert(schema.savedContent)
      .values({ userId, contentId, savedAt })
      .run();

    return c.json({ userId, contentId, savedAt }, 201);
  });

  // DELETE /api/users/:id/saved/:contentId
  router.delete("/:id/saved/:contentId", describeRoute({
    tags: ["Saved"],
    summary: "Remove saved content",
    responses: {
      200: { description: "Removed", content: { "application/json": { schema: resolver(SuccessSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver(ErrorSchema) } } },
    },
  }), async (c) => {
    const userId = c.req.param("id");
    const contentId = c.req.param("contentId");

    const existing = await db
      .select()
      .from(schema.savedContent)
      .where(
        and(
          eq(schema.savedContent.userId, userId),
          eq(schema.savedContent.contentId, contentId)
        )
      )
      .get();

    if (!existing) throw new NotFoundError("Saved content", contentId);

    await db.delete(schema.savedContent)
      .where(
        and(
          eq(schema.savedContent.userId, userId),
          eq(schema.savedContent.contentId, contentId)
        )
      )
      .run();

    return c.json({ success: true });
  });

  return router;
}
