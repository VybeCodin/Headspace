import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { describeRoute, resolver } from "hono-openapi";
import type { AppDatabase } from "../db/index";
import * as schema from "../db/schema";
import { formatDuration } from "../lib/helpers";
import { SleepMeditateSchema } from "../lib/types";

export function sleepMeditateRoutes(db: AppDatabase) {
  const router = new Hono();

  // GET /api/sleep-meditate
  router.get("/", describeRoute({
    tags: ["Sleep & Meditate"],
    summary: "Get sleep and meditation feed",
    responses: {
      200: { description: "Sleep & meditate feed", content: { "application/json": { schema: resolver(SleepMeditateSchema) } } },
    },
  }), (c) => {
    // Section 1: Tonight's picks (sleep stories + soundscapes with duration)
    const tonightIds = ["cnt_040", "cnt_041"];
    const tonightItems = tonightIds.map((id) => {
      const cnt = db.select().from(schema.content).where(eq(schema.content.id, id)).get();
      let instructorName: string | undefined;
      if (cnt?.instructorId) {
        const inst = db
          .select()
          .from(schema.instructors)
          .where(eq(schema.instructors.id, cnt.instructorId))
          .get();
        instructorName = inst?.name;
      }
      return {
        id: cnt?.id ?? id,
        title: cnt?.title ?? "",
        type: cnt?.type ?? "",
        subtitle: cnt?.description ?? undefined,
        durationLabel: formatDuration(cnt?.durationSeconds ?? null),
        durationSeconds: cnt?.durationSeconds ?? undefined,
        thumbnailUrl: cnt?.thumbnailUrl ?? undefined,
        instructorName,
      };
    });

    // Section 2: Background sounds
    const soundIds = ["cnt_050", "cnt_051", "cnt_052"];
    const soundItems = soundIds.map((id) => {
      const cnt = db.select().from(schema.content).where(eq(schema.content.id, id)).get();
      return {
        id: cnt?.id ?? id,
        title: cnt?.title ?? "",
        type: cnt?.type ?? "",
        subtitle: cnt?.description ?? undefined,
        durationLabel: formatDuration(cnt?.durationSeconds ?? null),
        durationSeconds: cnt?.durationSeconds ?? undefined,
        thumbnailUrl: cnt?.thumbnailUrl ?? undefined,
      };
    });

    // Section 3: Wind down routines (collection col_020)
    const windDownIds = ["cnt_060", "cnt_061"];
    const windDownItems = windDownIds.map((id) => {
      const cnt = db.select().from(schema.content).where(eq(schema.content.id, id)).get();
      return {
        id: cnt?.id ?? id,
        title: cnt?.title ?? "",
        type: cnt?.type ?? "",
        subtitle: cnt?.description ?? undefined,
        durationLabel: formatDuration(cnt?.durationSeconds ?? null),
        durationSeconds: cnt?.durationSeconds ?? undefined,
        thumbnailUrl: cnt?.thumbnailUrl ?? undefined,
      };
    });

    return c.json({
      sections: [
        {
          id: "tonight_picks",
          type: "tonight_picks",
          title: "Tonight's picks",
          items: tonightItems,
        },
        {
          id: "soundscapes",
          type: "soundscapes",
          title: "Background sounds",
          items: soundItems,
        },
        {
          id: "wind_down",
          type: "collection",
          title: "Wind down routines",
          collectionId: "col_020",
          items: windDownItems,
        },
      ],
    });
  });

  return router;
}
