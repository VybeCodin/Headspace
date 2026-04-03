import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { describeRoute, resolver } from "hono-openapi";
import type { AppDatabase } from "../db/index";
import * as schema from "../db/schema";
import { NotFoundError } from "../lib/errors";
import { computeStats, computeStreak, getRecentContentIds, parseJsonArray } from "../lib/helpers";
import { ProfileSchema, ErrorSchema } from "../lib/types";

export function profileRoutes(db: AppDatabase) {
  const router = new Hono();

  // GET /api/users/:id/profile
  router.get("/:id/profile", describeRoute({
    tags: ["Profile"],
    summary: "Get user profile with stats",
    responses: {
      200: { description: "User profile", content: { "application/json": { schema: resolver(ProfileSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver(ErrorSchema) } } },
    },
  }), (c) => {
    const userId = c.req.param("id");

    const user = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get();

    if (!user) throw new NotFoundError("User", userId);

    const stats = computeStats(db, userId);
    const streak = computeStreak(db, userId);

    // Saved content IDs
    const saved = db
      .select()
      .from(schema.savedContent)
      .where(eq(schema.savedContent.userId, userId))
      .all();
    const savedContentIds = saved.map((s) => s.contentId);

    // Recent content IDs
    const recentContentIds = getRecentContentIds(db, userId, 5);

    return c.json({
      user: {
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
      },
      stats,
      streak,
      savedContentIds,
      recentContentIds,
    });
  });

  return router;
}
