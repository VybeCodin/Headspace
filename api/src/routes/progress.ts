import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { describeRoute, resolver } from "hono-openapi";
import { z } from "zod";
import type { AppDatabase } from "../db/index";
import * as schema from "../db/schema";
import { NotFoundError } from "../lib/errors";
import { ProgressSchema, ErrorSchema } from "../lib/types";

export function progressRoutes(db: AppDatabase) {
  const router = new Hono();

  // GET /api/users/:id/progress
  router.get("/:id/progress", describeRoute({
    tags: ["Progress"],
    summary: "List user progress",
    responses: {
      200: { description: "Progress list", content: { "application/json": { schema: resolver(z.array(ProgressSchema)) } } },
    },
  }), async (c) => {
    const userId = c.req.param("id");
    const status = c.req.query("status");

    let rows = await db
      .select()
      .from(schema.userProgress)
      .where(eq(schema.userProgress.userId, userId))
      .all();

    if (status) rows = rows.filter((r) => r.status === status);

    return c.json(rows.map(formatProgress));
  });

  // POST /api/users/:id/progress
  router.post("/:id/progress", describeRoute({
    tags: ["Progress"],
    summary: "Create or update progress",
    responses: {
      200: { description: "Updated progress", content: { "application/json": { schema: resolver(ProgressSchema) } } },
      201: { description: "Created progress", content: { "application/json": { schema: resolver(ProgressSchema) } } },
    },
  }), async (c) => {
    const userId = c.req.param("id");
    const body = await c.req.json();
    const { contentId, progressSeconds } = body;

    // Check if progress exists
    const existing = await db
      .select()
      .from(schema.userProgress)
      .where(
        and(
          eq(schema.userProgress.userId, userId),
          eq(schema.userProgress.contentId, contentId)
        )
      )
      .get();

    if (existing) {
      // Update existing
      const content = await db
        .select()
        .from(schema.content)
        .where(eq(schema.content.id, contentId))
        .get();

      const newStatus =
        content?.durationSeconds && progressSeconds >= content.durationSeconds
          ? "completed"
          : "inProgress";

      await db.update(schema.userProgress)
        .set({
          progressSeconds,
          status: newStatus,
          completedAt: newStatus === "completed" ? new Date().toISOString().split("T")[0] : existing.completedAt,
        })
        .where(eq(schema.userProgress.id, existing.id))
        .run();

      const updated = (await db
        .select()
        .from(schema.userProgress)
        .where(eq(schema.userProgress.id, existing.id))
        .get())!;
      return c.json(formatProgress(updated));
    }

    // Create new
    const id = `prog_${Date.now()}`;
    const content = await db
      .select()
      .from(schema.content)
      .where(eq(schema.content.id, contentId))
      .get();

    const status =
      content?.durationSeconds && progressSeconds >= content.durationSeconds
        ? "completed"
        : progressSeconds > 0
        ? "inProgress"
        : "notStarted";

    await db.insert(schema.userProgress)
      .values({
        id,
        userId,
        contentId,
        status,
        progressSeconds,
        startedAt: new Date().toISOString().split("T")[0],
        completedAt: status === "completed" ? new Date().toISOString().split("T")[0] : null,
      })
      .run();

    const created = (await db
      .select()
      .from(schema.userProgress)
      .where(eq(schema.userProgress.id, id))
      .get())!;
    return c.json(formatProgress(created), 201);
  });

  // PATCH /api/users/:id/progress/:contentId
  router.patch("/:id/progress/:contentId", describeRoute({
    tags: ["Progress"],
    summary: "Patch progress for a content item",
    responses: {
      200: { description: "Updated progress", content: { "application/json": { schema: resolver(ProgressSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver(ErrorSchema) } } },
    },
  }), async (c) => {
    const userId = c.req.param("id");
    const contentId = c.req.param("contentId");
    const body = await c.req.json();

    const existing = await db
      .select()
      .from(schema.userProgress)
      .where(
        and(
          eq(schema.userProgress.userId, userId),
          eq(schema.userProgress.contentId, contentId)
        )
      )
      .get();

    if (!existing) throw new NotFoundError("Progress", `${userId}/${contentId}`);

    const updates: Record<string, any> = {};
    if (body.progressSeconds !== undefined) updates.progressSeconds = body.progressSeconds;
    if (body.status !== undefined) {
      updates.status = body.status;
      if (body.status === "completed") {
        updates.completedAt = new Date().toISOString().split("T")[0];
      }
    }

    if (Object.keys(updates).length > 0) {
      await db.update(schema.userProgress)
        .set(updates)
        .where(eq(schema.userProgress.id, existing.id))
        .run();
    }

    const updated = (await db
      .select()
      .from(schema.userProgress)
      .where(eq(schema.userProgress.id, existing.id))
      .get())!;
    return c.json(formatProgress(updated));
  });

  return router;
}

function formatProgress(row: any) {
  return {
    id: row.id,
    userId: row.userId,
    contentId: row.contentId,
    status: row.status,
    progressSeconds: row.progressSeconds,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
  };
}
