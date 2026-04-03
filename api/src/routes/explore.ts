import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { describeRoute, resolver } from "hono-openapi";
import type { AppDatabase } from "../db/index";
import * as schema from "../db/schema";
import { parseJsonArray } from "../lib/helpers";
import { ExploreSchema } from "../lib/types";

export function exploreRoutes(db: AppDatabase) {
  const router = new Hono();

  // GET /api/explore
  router.get("/", describeRoute({
    tags: ["Explore"],
    summary: "Get explore feed",
    responses: {
      200: { description: "Explore feed", content: { "application/json": { schema: resolver(ExploreSchema) } } },
    },
  }), async (c) => {
    // Categories with content count
    const cats = await db.select().from(schema.categories).all();
    const categories = await Promise.all(
      cats
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map(async (cat) => {
          const contentCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(schema.content)
            .where(eq(schema.content.categoryId, cat.id))
            .get();

          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            color: cat.color,
            description: cat.description,
            contentCount: contentCount?.count ?? 0,
            sortOrder: cat.sortOrder,
          };
        })
    );

    // Featured collection (editorial type)
    const featured = await db
      .select()
      .from(schema.collections)
      .where(eq(schema.collections.type, "editorial"))
      .get();

    const featuredCollection = featured
      ? {
          collectionId: featured.id,
          title: featured.title,
          description: featured.description ?? "",
          thumbnailUrl: featured.thumbnailUrl,
        }
      : null;

    // Guided programs
    const programs = await db
      .select()
      .from(schema.collections)
      .where(eq(schema.collections.type, "program"))
      .all();

    const guidedPrograms = programs.map((p) => ({
      id: p.id,
      title: p.title,
      totalSessions: p.totalSessions ?? 0,
      dailyMinutes: p.estimatedDailyMinutes ? `<${p.estimatedDailyMinutes} min/day` : "",
      gradientColors: parseJsonArray(p.gradientColors),
    }));

    return c.json({
      categories,
      featuredCollection,
      guidedPrograms,
    });
  });

  return router;
}
