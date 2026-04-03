import { Hono } from "hono";
import { eq, like, or } from "drizzle-orm";
import { describeRoute, resolver } from "hono-openapi";
import { z } from "zod";
import type { AppDatabase } from "../db/index";
import * as schema from "../db/schema";
import { NotFoundError } from "../lib/errors";
import { parseTags } from "../lib/helpers";
import { ContentSchema, ErrorSchema } from "../lib/types";

export function contentRoutes(db: AppDatabase) {
  const router = new Hono();

  // GET /api/content — list + filter
  router.get("/", describeRoute({
    tags: ["Content"],
    summary: "List and filter content",
    responses: {
      200: { description: "Content list", content: { "application/json": { schema: resolver(z.array(ContentSchema)) } } },
    },
  }), (c) => {
    const { type, category, tag, difficulty, isPremium } = c.req.query();

    let rows = db.select().from(schema.content).all();

    if (type) rows = rows.filter((r) => r.type === type);
    if (category) rows = rows.filter((r) => r.categoryId === category);
    if (tag) rows = rows.filter((r) => parseTags(r.tags).includes(tag));
    if (difficulty) rows = rows.filter((r) => r.difficulty === difficulty);
    if (isPremium !== undefined) {
      const premium = isPremium === "true";
      rows = rows.filter((r) => r.isPremium === premium);
    }

    const items = rows.map((r) => formatContent(r, db));
    return c.json(items);
  });

  // GET /api/content/search?q=
  router.get("/search", describeRoute({
    tags: ["Content"],
    summary: "Search content",
    responses: {
      200: { description: "Search results", content: { "application/json": { schema: resolver(z.array(ContentSchema)) } } },
    },
  }), (c) => {
    const q = c.req.query("q");
    if (!q) return c.json([]);

    const lower = q.toLowerCase();
    const rows = db.select().from(schema.content).all();
    const filtered = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(lower) ||
        r.description?.toLowerCase().includes(lower) ||
        parseTags(r.tags).some((t) => t.toLowerCase().includes(lower))
    );

    return c.json(filtered.map((r) => formatContent(r, db)));
  });

  // GET /api/content/:id
  router.get("/:id", describeRoute({
    tags: ["Content"],
    summary: "Get content by ID",
    responses: {
      200: { description: "Content detail", content: { "application/json": { schema: resolver(ContentSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver(ErrorSchema) } } },
    },
  }), (c) => {
    const id = c.req.param("id");
    const row = db
      .select()
      .from(schema.content)
      .where(eq(schema.content.id, id))
      .get();

    if (!row) throw new NotFoundError("Content", id);
    return c.json(formatContent(row, db));
  });

  return router;
}

function formatContent(row: any, db: AppDatabase) {
  let instructor = null;
  if (row.instructorId) {
    instructor = db
      .select()
      .from(schema.instructors)
      .where(eq(schema.instructors.id, row.instructorId))
      .get();
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    categoryId: row.categoryId,
    instructor: instructor
      ? { id: instructor.id, name: instructor.name, avatarUrl: instructor.avatarUrl }
      : null,
    durationSeconds: row.durationSeconds,
    thumbnailUrl: row.thumbnailUrl,
    audioUrl: row.audioUrl,
    tags: parseTags(row.tags),
    isPremium: row.isPremium,
    difficulty: row.difficulty,
    createdAt: row.createdAt,
  };
}
