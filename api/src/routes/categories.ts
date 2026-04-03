import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { describeRoute, resolver } from "hono-openapi";
import { z } from "zod";
import type { AppDatabase } from "../db/index";
import * as schema from "../db/schema";
import { CategorySchema } from "../lib/types";

export function categoriesRoutes(db: AppDatabase) {
  const router = new Hono();

  // GET /api/categories
  router.get("/", describeRoute({
    tags: ["Categories"],
    summary: "List all categories",
    responses: {
      200: { description: "Category list", content: { "application/json": { schema: resolver(z.array(CategorySchema)) } } },
    },
  }), async (c) => {
    const cats = await db.select().from(schema.categories).all();

    const result = await Promise.all(
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

    return c.json(result);
  });

  return router;
}
