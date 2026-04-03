import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { describeRoute, resolver } from "hono-openapi";
import type { AppDatabase } from "../db/index";
import * as schema from "../db/schema";
import { NotFoundError } from "../lib/errors";
import { getGreeting, getTodayDate, parseTags, formatDuration } from "../lib/helpers";
import { TodaySchema, ErrorSchema } from "../lib/types";

export function todayRoutes(db: AppDatabase) {
  const router = new Hono();

  // GET /api/users/:id/today
  router.get("/:id/today", describeRoute({
    tags: ["Today"],
    summary: "Get personalized daily feed",
    responses: {
      200: { description: "Today feed", content: { "application/json": { schema: resolver(TodaySchema) } } },
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

    // Section 1: Continue Listening (in-progress items)
    const inProgress = await db
      .select()
      .from(schema.userProgress)
      .where(
        and(
          eq(schema.userProgress.userId, userId),
          eq(schema.userProgress.status, "inProgress")
        )
      )
      .all();

    const continueItems = await Promise.all(inProgress.map(async (p) => {
      const cnt = await db
        .select()
        .from(schema.content)
        .where(eq(schema.content.id, p.contentId))
        .get();

      let instructorName: string | undefined;
      if (cnt?.instructorId) {
        const inst = await db
          .select()
          .from(schema.instructors)
          .where(eq(schema.instructors.id, cnt.instructorId))
          .get();
        instructorName = inst?.name;
      }

      // Resolve gradient from the content's category
      const typeGradients: Record<string, string[]> = {
        meditation: ["#F47D20", "#FF9E50"],
        breathwork: ["#7B2FBE", "#C86DD7"],
        sleepStory: ["#2D3A8C", "#6E7BD4"],
        soundscape: ["#1A6B54", "#3CB89C"],
        reflect: ["#E85D75", "#F4A261"],
        video: ["#0064DC", "#1E8CFF"],
        focusMusic: ["#3C64C8", "#6E9EFF"],
      };
      const gradientColors = typeGradients[cnt?.type ?? ""] ?? ["#F47D20", "#FF9E50"];

      return {
        id: cnt?.id ?? p.contentId,
        title: cnt?.title ?? "",
        type: cnt?.type ?? "",
        subtitle: cnt?.description ?? undefined,
        durationLabel: formatDuration(cnt?.durationSeconds ?? null),
        durationSeconds: cnt?.durationSeconds ?? undefined,
        progressSeconds: p.progressSeconds,
        thumbnailUrl: cnt?.thumbnailUrl ?? undefined,
        gradientColors,
        icon: undefined,
        instructorName,
      };
    }));

    // Section 2: Daily Essentials
    const dailyIds = ["cnt_020", "cnt_021", "cnt_022"];
    const dailyItems = await Promise.all(dailyIds.map(async (id) => {
      const cnt = await db.select().from(schema.content).where(eq(schema.content.id, id)).get();
      const typeGrad: Record<string, string[]> = {
        reflect: ["#E85D75", "#F4A261"],
        meditation: ["#F47D20", "#FF9E50"],
        sleepStory: ["#2D3A8C", "#6E7BD4"],
      };
      return {
        id: cnt?.id ?? id,
        title: cnt?.title ?? "",
        type: cnt?.type ?? "",
        subtitle: cnt?.description ?? undefined,
        durationLabel: formatDuration(cnt?.durationSeconds ?? null),
        durationSeconds: cnt?.durationSeconds ?? undefined,
        thumbnailUrl: cnt?.thumbnailUrl ?? undefined,
        gradientColors: typeGrad[cnt?.type ?? ""] ?? ["#F47D20", "#FF9E50"],
        icon: undefined,
        instructorName: undefined,
      };
    }));

    // Section 3: Editorial (spring reset)
    const editorialIds = ["cnt_030", "cnt_031"];
    const editorialItems = await Promise.all(editorialIds.map(async (id) => {
      const cnt = await db.select().from(schema.content).where(eq(schema.content.id, id)).get();
      return {
        id: cnt?.id ?? id,
        title: cnt?.title ?? "",
        type: cnt?.type ?? "",
        subtitle: cnt?.description ?? undefined,
        durationLabel: formatDuration(cnt?.durationSeconds ?? null),
        durationSeconds: cnt?.durationSeconds ?? undefined,
        thumbnailUrl: cnt?.thumbnailUrl ?? undefined,
        gradientColors: ["#0064DC", "#1E8CFF"],
        icon: undefined,
        instructorName: undefined,
      };
    }));

    const sections = [
      {
        id: "continue_listening",
        type: "continue_listening",
        title: "Pick up where you left off",
        layout: undefined,
        collectionId: undefined,
        items: continueItems,
      },
      {
        id: "daily_essentials",
        type: "daily_essentials",
        title: "Daily essentials",
        layout: "horizontal_scroll",
        collectionId: undefined,
        items: dailyItems,
      },
      {
        id: "editorial",
        type: "editorial",
        title: "Your spring reset",
        layout: "two_column",
        collectionId: undefined,
        items: editorialItems,
      },
    ];

    // Filter out empty sections
    const nonEmpty = sections.filter((s) => s.items.length > 0);

    return c.json({
      greeting: getGreeting(user.name.split(" ")[0]),
      date: getTodayDate(),
      sections: nonEmpty,
    });
  });

  return router;
}
