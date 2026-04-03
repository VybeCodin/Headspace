import { Hono } from "hono";
import { cors } from "hono/cors";
import { openAPIRouteHandler } from "hono-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import type { AppDatabase } from "./db/index";
import { AppError } from "./lib/errors";
import { logger } from "./middleware/logger";
import { contentRoutes } from "./routes/content";
import { categoriesRoutes } from "./routes/categories";
import { collectionsRoutes } from "./routes/collections";
import { usersRoutes } from "./routes/users";
import { progressRoutes } from "./routes/progress";
import { statsRoutes } from "./routes/stats";
import { todayRoutes } from "./routes/today";
import { exploreRoutes } from "./routes/explore";
import { sleepMeditateRoutes } from "./routes/sleep-meditate";
import { lumaRoutes } from "./routes/luma";
import { profileRoutes } from "./routes/profile";
import { savedRoutes } from "./routes/saved";
import { ZodError } from "zod";

export function createApp(db: AppDatabase) {
  const app = new Hono();

  // Global error handler
  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json({ error: err.message }, err.statusCode as any);
    }
    if (err instanceof ZodError) {
      return c.json({ error: "Validation error", details: err.errors }, 400);
    }
    console.error("Unhandled error:", err);
    return c.json({ error: "Internal server error" }, 500);
  });

  // Global middleware
  app.use("*", cors());
  app.use("*", logger);

  // Health check
  app.get("/", (c) => c.json({ status: "ok", name: "Headspace API" }));

  // Content & Library routes
  app.route("/api/content", contentRoutes(db));
  app.route("/api/categories", categoriesRoutes(db));
  app.route("/api/collections", collectionsRoutes(db));

  // User routes
  app.route("/api/users", usersRoutes(db));

  // Progress routes (nested under users)
  app.route("/api/users", progressRoutes(db));

  // Stats routes (nested under users)
  app.route("/api/users", statsRoutes(db));

  // Saved routes (nested under users)
  app.route("/api/users", savedRoutes(db));

  // Tab feeds
  app.route("/api/users", todayRoutes(db));
  app.route("/api/explore", exploreRoutes(db));
  app.route("/api/sleep-meditate", sleepMeditateRoutes(db));

  // Luma AI routes (nested under users)
  app.route("/api/users", lumaRoutes(db));

  // Profile routes (nested under users)
  app.route("/api/users", profileRoutes(db));

  // OpenAPI spec (runtime-generated)
  app.get(
    "/api/openapi.json",
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          title: "Headspace API",
          version: "1.0.0",
          description: "REST API for the Headspace meditation & mindfulness app",
        },
      },
    })
  );

  // Scalar interactive docs UI
  app.get(
    "/docs",
    Scalar({
      url: "/api/openapi.json",
    })
  );

  return app;
}
