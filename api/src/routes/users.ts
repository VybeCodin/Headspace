import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { describeRoute, resolver } from "hono-openapi";
import type { AppDatabase } from "../db/index";
import * as schema from "../db/schema";
import { NotFoundError } from "../lib/errors";
import { parseJsonArray } from "../lib/helpers";
import { UserSchema, ErrorSchema } from "../lib/types";

export function usersRoutes(db: AppDatabase) {
  const router = new Hono();

  // GET /api/users/:id
  router.get("/:id", describeRoute({
    tags: ["Users"],
    summary: "Get user by ID",
    responses: {
      200: { description: "User detail", content: { "application/json": { schema: resolver(UserSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver(ErrorSchema) } } },
    },
  }), (c) => {
    const id = c.req.param("id");
    const user = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .get();

    if (!user) throw new NotFoundError("User", id);
    return c.json(formatUser(user));
  });

  // PATCH /api/users/:id/preferences
  router.patch("/:id/preferences", describeRoute({
    tags: ["Users"],
    summary: "Update user preferences",
    responses: {
      200: { description: "Updated user", content: { "application/json": { schema: resolver(UserSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver(ErrorSchema) } } },
    },
  }), async (c) => {
    const id = c.req.param("id");
    const user = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .get();

    if (!user) throw new NotFoundError("User", id);

    const body = await c.req.json();
    const updates: Record<string, any> = {};

    if (body.reminderTime !== undefined) updates.reminderTime = body.reminderTime;
    if (body.preferredDuration !== undefined) updates.preferredDuration = body.preferredDuration;
    if (body.preferredTypes !== undefined)
      updates.preferredTypes = JSON.stringify(body.preferredTypes);
    if (body.notificationsEnabled !== undefined)
      updates.notificationsEnabled = body.notificationsEnabled;

    if (Object.keys(updates).length > 0) {
      db.update(schema.users).set(updates).where(eq(schema.users.id, id)).run();
    }

    const updated = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .get()!;
    return c.json(formatUser(updated));
  });

  return router;
}

function formatUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    joinedAt: user.joinedAt,
    preferences: {
      reminderTime: user.reminderTime,
      preferredDuration: user.preferredDuration,
      preferredTypes: parseJsonArray(user.preferredTypes),
      notificationsEnabled: user.notificationsEnabled,
    },
    subscription: {
      plan: user.subscriptionPlan,
      expiresAt: user.subscriptionExpiresAt,
    },
  };
}
