import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { describeRoute, resolver } from "hono-openapi";
import { z } from "zod";
import type { AppDatabase } from "../db/index";
import * as schema from "../db/schema";
import { NotFoundError } from "../lib/errors";
import { parseJsonArray, parseTags } from "../lib/helpers";
import { CollectionSchema, CollectionDetailSchema, ErrorSchema } from "../lib/types";

export function collectionsRoutes(db: AppDatabase) {
  const router = new Hono();

  // GET /api/collections
  router.get("/", describeRoute({
    tags: ["Collections"],
    summary: "List collections",
    responses: {
      200: { description: "Collection list", content: { "application/json": { schema: resolver(z.array(CollectionSchema)) } } },
    },
  }), async (c) => {
    const type = c.req.query("type");
    let rows = await db.select().from(schema.collections).all();

    if (type) rows = rows.filter((r) => r.type === type);

    return c.json(rows.map(formatCollection));
  });

  // GET /api/collections/:id
  router.get("/:id", describeRoute({
    tags: ["Collections"],
    summary: "Get collection by ID",
    responses: {
      200: { description: "Collection detail", content: { "application/json": { schema: resolver(CollectionDetailSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver(ErrorSchema) } } },
    },
  }), async (c) => {
    const id = c.req.param("id");
    const row = await db
      .select()
      .from(schema.collections)
      .where(eq(schema.collections.id, id))
      .get();

    if (!row) throw new NotFoundError("Collection", id);

    // Get content IDs
    const contents = (await db
      .select()
      .from(schema.collectionContents)
      .where(eq(schema.collectionContents.collectionId, id))
      .all())
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const contentItems = (await Promise.all(contents.map(async (cc) => {
      const cnt = await db.select().from(schema.content).where(eq(schema.content.id, cc.contentId)).get();
      if (!cnt) return null;
      let instructor = null;
      if (cnt.instructorId) {
        instructor = await db.select().from(schema.instructors).where(eq(schema.instructors.id, cnt.instructorId)).get();
      }
      return {
        id: cnt.id, title: cnt.title, description: cnt.description, type: cnt.type,
        categoryId: cnt.categoryId,
        instructor: instructor ? { id: instructor.id, name: instructor.name, avatarUrl: instructor.avatarUrl } : null,
        durationSeconds: cnt.durationSeconds, thumbnailUrl: cnt.thumbnailUrl, audioUrl: cnt.audioUrl,
        tags: parseTags(cnt.tags), isPremium: cnt.isPremium, difficulty: cnt.difficulty, createdAt: cnt.createdAt,
      };
    }))).filter(Boolean);

    return c.json({
      ...formatCollection(row),
      contentIds: contents.map((cc) => cc.contentId),
      items: contentItems,
    });
  });

  return router;
}

function formatCollection(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    thumbnailUrl: row.thumbnailUrl,
    gradientColors: parseJsonArray(row.gradientColors),
    totalSessions: row.totalSessions,
    estimatedDailyMinutes: row.estimatedDailyMinutes,
    isPremium: row.isPremium,
  };
}
