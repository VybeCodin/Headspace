var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/serverless.ts
import { handle } from "hono/vercel";

// src/app.ts
import { Hono as Hono13 } from "hono";
import { cors } from "hono/cors";
import { openAPIRouteHandler } from "hono-openapi";
import { Scalar } from "@scalar/hono-api-reference";

// src/lib/errors.ts
var AppError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
  statusCode;
};
var NotFoundError = class extends AppError {
  constructor(resource, id) {
    super(404, `${resource} '${id}' not found`);
    this.name = "NotFoundError";
  }
};

// src/middleware/logger.ts
async function logger(c, next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${c.req.method} ${c.req.path} ${c.res.status} ${ms}ms`);
}

// src/routes/content.ts
import { Hono } from "hono";
import { eq as eq2 } from "drizzle-orm";
import { describeRoute, resolver } from "hono-openapi";
import { z as z2 } from "zod";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  categories: () => categories,
  collectionContents: () => collectionContents,
  collections: () => collections,
  content: () => content,
  conversations: () => conversations,
  instructors: () => instructors,
  messages: () => messages,
  savedContent: () => savedContent,
  suggestionPrompts: () => suggestionPrompts,
  userProgress: () => userProgress,
  users: () => users
});
import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
var instructors = sqliteTable("instructors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url")
});
var categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0)
});
var content = sqliteTable("content", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  // meditation, sleepStory, soundscape, breathwork, video, focusMusic, reflect
  categoryId: text("category_id").references(() => categories.id),
  instructorId: text("instructor_id").references(() => instructors.id),
  durationSeconds: integer("duration_seconds"),
  thumbnailUrl: text("thumbnail_url"),
  audioUrl: text("audio_url"),
  tags: text("tags"),
  // JSON array stored as text
  isPremium: integer("is_premium", { mode: "boolean" }).default(false),
  difficulty: text("difficulty"),
  // beginner, intermediate, advanced
  createdAt: text("created_at")
});
var collections = sqliteTable("collections", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type"),
  // program, playlist, editorial, dailyPicks
  thumbnailUrl: text("thumbnail_url"),
  gradientColors: text("gradient_colors"),
  // JSON array
  totalSessions: integer("total_sessions"),
  estimatedDailyMinutes: integer("estimated_daily_minutes"),
  isPremium: integer("is_premium", { mode: "boolean" }).default(false)
});
var collectionContents = sqliteTable(
  "collection_contents",
  {
    collectionId: text("collection_id").notNull().references(() => collections.id),
    contentId: text("content_id").notNull().references(() => content.id),
    sortOrder: integer("sort_order").default(0)
  },
  (table) => [primaryKey({ columns: [table.collectionId, table.contentId] })]
);
var users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  joinedAt: text("joined_at").notNull(),
  // Preferences (flattened)
  reminderTime: text("reminder_time"),
  preferredDuration: integer("preferred_duration"),
  preferredTypes: text("preferred_types"),
  // JSON array
  notificationsEnabled: integer("notifications_enabled", { mode: "boolean" }).default(true),
  // Subscription (flattened)
  subscriptionPlan: text("subscription_plan"),
  subscriptionExpiresAt: text("subscription_expires_at")
});
var userProgress = sqliteTable("user_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  contentId: text("content_id").notNull().references(() => content.id),
  status: text("status").notNull().default("notStarted"),
  // notStarted, inProgress, completed
  progressSeconds: integer("progress_seconds").default(0),
  startedAt: text("started_at"),
  completedAt: text("completed_at")
});
var savedContent = sqliteTable(
  "saved_content",
  {
    userId: text("user_id").notNull().references(() => users.id),
    contentId: text("content_id").notNull().references(() => content.id),
    savedAt: text("saved_at").notNull()
  },
  (table) => [primaryKey({ columns: [table.userId, table.contentId] })]
);
var conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id)
});
var messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull().references(() => conversations.id),
  role: text("role").notNull(),
  // user, assistant
  text: text("text").notNull(),
  timestamp: text("timestamp").notNull(),
  feedback: text("feedback")
});
var suggestionPrompts = sqliteTable("suggestion_prompts", {
  id: text("id").primaryKey(),
  text: text("text").notNull()
});

// src/lib/helpers.ts
import { eq, and, desc } from "drizzle-orm";
function getGreeting(name) {
  const hour = (/* @__PURE__ */ new Date()).getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}
function getTodayDate() {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
function parseTags(tagsJson) {
  if (!tagsJson) return [];
  try {
    return JSON.parse(tagsJson);
  } catch {
    return [];
  }
}
function parseJsonArray(json) {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}
async function computeStats(db2, userId) {
  const progress = await db2.select().from(userProgress).where(
    and(
      eq(userProgress.userId, userId),
      eq(userProgress.status, "completed")
    )
  ).all();
  const totalSessions = progress.length;
  const totalMinutes = Math.round(
    progress.reduce((sum, p) => sum + (p.progressSeconds || 0), 0) / 60
  );
  const avgSessionMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  const completedDates = [
    ...new Set(
      progress.filter((p) => p.completedAt).map((p) => p.completedAt)
    )
  ].sort().reverse();
  let currentStreakDays = 0;
  let longestStreakDays = 0;
  if (completedDates.length > 0) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (completedDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
    currentStreakDays = streak;
    const sortedAsc = [...completedDates].sort();
    let tempStreak = 1;
    longestStreakDays = 1;
    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = new Date(sortedAsc[i - 1]);
      const curr = new Date(sortedAsc[i]);
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / (1e3 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        tempStreak++;
        longestStreakDays = Math.max(longestStreakDays, tempStreak);
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
  }
  return {
    totalSessions,
    totalMinutes,
    avgSessionMinutes,
    currentStreakDays,
    longestStreakDays
  };
}
async function computeStreak(db2, userId) {
  const stats = await computeStats(db2, userId);
  const current = stats.currentStreakDays;
  let message;
  if (current === 0) {
    message = "Start a session today to begin your streak!";
  } else if (current < 3) {
    message = "You're building momentum. Keep it going!";
  } else if (current < 7) {
    message = "Great consistency this week!";
  } else {
    message = `Amazing! ${current} days in a row!`;
  }
  const today = /* @__PURE__ */ new Date();
  const weeklyActivity = [];
  const progress = await db2.select().from(userProgress).where(
    and(
      eq(userProgress.userId, userId),
      eq(userProgress.status, "completed")
    )
  ).all();
  const completedDates = new Set(
    progress.filter((p) => p.completedAt).map((p) => p.completedAt)
  );
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    weeklyActivity.push(completedDates.has(dateStr));
  }
  return { current, message, weeklyActivity };
}
function formatDuration(seconds) {
  if (!seconds) return null;
  if (seconds < 60) return `${seconds} sec`;
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}
async function getRecentContentIds(db2, userId, limit = 5) {
  const recent = await db2.select({ contentId: userProgress.contentId }).from(userProgress).where(eq(userProgress.userId, userId)).orderBy(desc(userProgress.startedAt)).limit(limit).all();
  return recent.map((r) => r.contentId);
}

// src/lib/types.ts
import { z } from "zod";
var ContentTypeEnum = z.enum([
  "meditation",
  "sleepStory",
  "soundscape",
  "breathwork",
  "video",
  "focusMusic",
  "reflect"
]);
var DifficultyEnum = z.enum(["beginner", "intermediate", "advanced"]);
var ProgressStatusEnum = z.enum(["notStarted", "inProgress", "completed"]);
var CollectionTypeEnum = z.enum(["program", "playlist", "editorial", "dailyPicks"]);
var MessageRoleEnum = z.enum(["user", "assistant"]);
var contentQuerySchema = z.object({
  type: ContentTypeEnum.optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  difficulty: DifficultyEnum.optional(),
  isPremium: z.enum(["true", "false"]).optional()
});
var searchQuerySchema = z.object({
  q: z.string().min(1)
});
var collectionQuerySchema = z.object({
  type: CollectionTypeEnum.optional()
});
var progressQuerySchema = z.object({
  status: ProgressStatusEnum.optional()
});
var createProgressSchema = z.object({
  contentId: z.string(),
  progressSeconds: z.number().int().min(0)
});
var updateProgressSchema = z.object({
  progressSeconds: z.number().int().min(0).optional(),
  status: ProgressStatusEnum.optional()
});
var updatePreferencesSchema = z.object({
  reminderTime: z.string().optional(),
  preferredDuration: z.number().int().optional(),
  preferredTypes: z.array(z.string()).optional(),
  notificationsEnabled: z.boolean().optional()
});
var sendMessageSchema = z.object({
  text: z.string().min(1)
});
var saveContentSchema = z.object({
  contentId: z.string()
});
var InstructorSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable()
});
var ContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  type: ContentTypeEnum,
  categoryId: z.string().nullable(),
  instructor: InstructorSchema.nullable(),
  durationSeconds: z.number().nullable(),
  thumbnailUrl: z.string().nullable(),
  audioUrl: z.string().nullable(),
  tags: z.array(z.string()),
  isPremium: z.boolean(),
  difficulty: DifficultyEnum.nullable(),
  createdAt: z.string().nullable()
});
var CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  description: z.string().nullable(),
  contentCount: z.number(),
  sortOrder: z.number().nullable()
});
var CollectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  type: CollectionTypeEnum,
  thumbnailUrl: z.string().nullable(),
  gradientColors: z.array(z.string()),
  totalSessions: z.number().nullable(),
  estimatedDailyMinutes: z.number().nullable(),
  isPremium: z.boolean()
});
var CollectionDetailSchema = CollectionSchema.extend({
  contentIds: z.array(z.string())
});
var UserPreferencesSchema = z.object({
  reminderTime: z.string().nullable(),
  preferredDuration: z.number().nullable(),
  preferredTypes: z.array(z.string()),
  notificationsEnabled: z.boolean()
});
var UserSubscriptionSchema = z.object({
  plan: z.string(),
  expiresAt: z.string().nullable()
});
var UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  joinedAt: z.string().nullable(),
  preferences: UserPreferencesSchema,
  subscription: UserSubscriptionSchema
});
var ProgressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  contentId: z.string(),
  status: ProgressStatusEnum,
  progressSeconds: z.number(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable()
});
var StatsSchema = z.object({
  totalSessions: z.number(),
  totalMinutes: z.number(),
  avgSessionMinutes: z.number(),
  currentStreakDays: z.number(),
  longestStreakDays: z.number()
});
var FeedItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  subtitle: z.string().optional(),
  durationLabel: z.string().nullable().optional(),
  durationSeconds: z.number().optional(),
  progressSeconds: z.number().optional(),
  thumbnailUrl: z.string().optional(),
  icon: z.string().optional(),
  instructorName: z.string().optional()
});
var FeedSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  layout: z.string().optional(),
  collectionId: z.string().optional(),
  items: z.array(FeedItemSchema)
});
var TodaySchema = z.object({
  greeting: z.string(),
  date: z.string(),
  sections: z.array(FeedSectionSchema)
});
var ExploreSchema = z.object({
  categories: z.array(CategorySchema),
  featuredCollection: z.object({
    collectionId: z.string(),
    title: z.string(),
    description: z.string(),
    thumbnailUrl: z.string().nullable()
  }).nullable(),
  guidedPrograms: z.array(z.object({
    id: z.string(),
    title: z.string(),
    totalSessions: z.number(),
    dailyMinutes: z.string(),
    gradientColors: z.array(z.string())
  }))
});
var SleepMeditateSchema = z.object({
  sections: z.array(FeedSectionSchema)
});
var LumaMessageSchema = z.object({
  id: z.string(),
  role: MessageRoleEnum,
  text: z.string(),
  timestamp: z.string(),
  feedback: z.string().nullable().optional()
});
var LumaConversationSchema = z.object({
  assistant: z.object({
    name: z.string(),
    avatarStyle: z.string(),
    persona: z.string()
  }),
  conversation: z.object({
    id: z.string(),
    userId: z.string(),
    messages: z.array(LumaMessageSchema)
  }).nullable(),
  suggestions: z.array(z.object({ id: z.string(), text: z.string() }))
});
var SavedItemSchema = z.object({
  userId: z.string(),
  contentId: z.string(),
  savedAt: z.string()
});
var StreakSchema = z.object({
  current: z.number(),
  message: z.string(),
  weeklyActivity: z.array(z.boolean())
});
var ProfileSchema = z.object({
  user: UserSchema,
  stats: StatsSchema,
  streak: StreakSchema,
  savedContentIds: z.array(z.string()),
  recentContentIds: z.array(z.string())
});
var ErrorSchema = z.object({
  error: z.string()
});
var SuccessSchema = z.object({
  success: z.boolean()
});

// src/routes/content.ts
function contentRoutes(db2) {
  const router = new Hono();
  router.get("/", describeRoute({
    tags: ["Content"],
    summary: "List and filter content",
    responses: {
      200: { description: "Content list", content: { "application/json": { schema: resolver(z2.array(ContentSchema)) } } }
    }
  }), async (c) => {
    const { type, category, tag, difficulty, isPremium } = c.req.query();
    let rows = await db2.select().from(content).all();
    if (type) rows = rows.filter((r) => r.type === type);
    if (category) rows = rows.filter((r) => r.categoryId === category);
    if (tag) rows = rows.filter((r) => parseTags(r.tags).includes(tag));
    if (difficulty) rows = rows.filter((r) => r.difficulty === difficulty);
    if (isPremium !== void 0) {
      const premium = isPremium === "true";
      rows = rows.filter((r) => r.isPremium === premium);
    }
    const items = await Promise.all(rows.map((r) => formatContent(r, db2)));
    return c.json(items);
  });
  router.get("/search", describeRoute({
    tags: ["Content"],
    summary: "Search content",
    responses: {
      200: { description: "Search results", content: { "application/json": { schema: resolver(z2.array(ContentSchema)) } } }
    }
  }), async (c) => {
    const q = c.req.query("q");
    if (!q) return c.json([]);
    const lower = q.toLowerCase();
    const rows = await db2.select().from(content).all();
    const filtered = rows.filter(
      (r) => r.title.toLowerCase().includes(lower) || r.description?.toLowerCase().includes(lower) || parseTags(r.tags).some((t) => t.toLowerCase().includes(lower))
    );
    return c.json(await Promise.all(filtered.map((r) => formatContent(r, db2))));
  });
  router.get("/:id", describeRoute({
    tags: ["Content"],
    summary: "Get content by ID",
    responses: {
      200: { description: "Content detail", content: { "application/json": { schema: resolver(ContentSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver(ErrorSchema) } } }
    }
  }), async (c) => {
    const id = c.req.param("id");
    const row = await db2.select().from(content).where(eq2(content.id, id)).get();
    if (!row) throw new NotFoundError("Content", id);
    return c.json(await formatContent(row, db2));
  });
  return router;
}
async function formatContent(row, db2) {
  let instructor = null;
  if (row.instructorId) {
    instructor = await db2.select().from(instructors).where(eq2(instructors.id, row.instructorId)).get();
  }
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    categoryId: row.categoryId,
    instructor: instructor ? { id: instructor.id, name: instructor.name, avatarUrl: instructor.avatarUrl } : null,
    durationSeconds: row.durationSeconds,
    thumbnailUrl: row.thumbnailUrl,
    audioUrl: row.audioUrl,
    tags: parseTags(row.tags),
    isPremium: row.isPremium,
    difficulty: row.difficulty,
    createdAt: row.createdAt
  };
}

// src/routes/categories.ts
import { Hono as Hono2 } from "hono";
import { eq as eq3, sql } from "drizzle-orm";
import { describeRoute as describeRoute2, resolver as resolver2 } from "hono-openapi";
import { z as z3 } from "zod";
function categoriesRoutes(db2) {
  const router = new Hono2();
  router.get("/", describeRoute2({
    tags: ["Categories"],
    summary: "List all categories",
    responses: {
      200: { description: "Category list", content: { "application/json": { schema: resolver2(z3.array(CategorySchema)) } } }
    }
  }), async (c) => {
    const cats = await db2.select().from(categories).all();
    const result = await Promise.all(
      cats.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map(async (cat) => {
        const contentCount = await db2.select({ count: sql`count(*)` }).from(content).where(eq3(content.categoryId, cat.id)).get();
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          color: cat.color,
          description: cat.description,
          contentCount: contentCount?.count ?? 0,
          sortOrder: cat.sortOrder
        };
      })
    );
    return c.json(result);
  });
  return router;
}

// src/routes/collections.ts
import { Hono as Hono3 } from "hono";
import { eq as eq4 } from "drizzle-orm";
import { describeRoute as describeRoute3, resolver as resolver3 } from "hono-openapi";
import { z as z4 } from "zod";
function collectionsRoutes(db2) {
  const router = new Hono3();
  router.get("/", describeRoute3({
    tags: ["Collections"],
    summary: "List collections",
    responses: {
      200: { description: "Collection list", content: { "application/json": { schema: resolver3(z4.array(CollectionSchema)) } } }
    }
  }), async (c) => {
    const type = c.req.query("type");
    let rows = await db2.select().from(collections).all();
    if (type) rows = rows.filter((r) => r.type === type);
    return c.json(rows.map(formatCollection));
  });
  router.get("/:id", describeRoute3({
    tags: ["Collections"],
    summary: "Get collection by ID",
    responses: {
      200: { description: "Collection detail", content: { "application/json": { schema: resolver3(CollectionDetailSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver3(ErrorSchema) } } }
    }
  }), async (c) => {
    const id = c.req.param("id");
    const row = await db2.select().from(collections).where(eq4(collections.id, id)).get();
    if (!row) throw new NotFoundError("Collection", id);
    const contents = (await db2.select().from(collectionContents).where(eq4(collectionContents.collectionId, id)).all()).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const contentItems = (await Promise.all(contents.map(async (cc) => {
      const cnt = await db2.select().from(content).where(eq4(content.id, cc.contentId)).get();
      if (!cnt) return null;
      let instructor = null;
      if (cnt.instructorId) {
        instructor = await db2.select().from(instructors).where(eq4(instructors.id, cnt.instructorId)).get();
      }
      return {
        id: cnt.id,
        title: cnt.title,
        description: cnt.description,
        type: cnt.type,
        categoryId: cnt.categoryId,
        instructor: instructor ? { id: instructor.id, name: instructor.name, avatarUrl: instructor.avatarUrl } : null,
        durationSeconds: cnt.durationSeconds,
        thumbnailUrl: cnt.thumbnailUrl,
        audioUrl: cnt.audioUrl,
        tags: parseTags(cnt.tags),
        isPremium: cnt.isPremium,
        difficulty: cnt.difficulty,
        createdAt: cnt.createdAt
      };
    }))).filter(Boolean);
    return c.json({
      ...formatCollection(row),
      contentIds: contents.map((cc) => cc.contentId),
      items: contentItems
    });
  });
  return router;
}
function formatCollection(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    thumbnailUrl: row.thumbnailUrl,
    gradientColors: parseJsonArray(row.gradientColors),
    totalSessions: row.totalSessions,
    estimatedDailyMinutes: row.estimatedDailyMinutes,
    isPremium: row.isPremium
  };
}

// src/routes/users.ts
import { Hono as Hono4 } from "hono";
import { eq as eq5 } from "drizzle-orm";
import { describeRoute as describeRoute4, resolver as resolver4 } from "hono-openapi";
function usersRoutes(db2) {
  const router = new Hono4();
  router.get("/:id", describeRoute4({
    tags: ["Users"],
    summary: "Get user by ID",
    responses: {
      200: { description: "User detail", content: { "application/json": { schema: resolver4(UserSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver4(ErrorSchema) } } }
    }
  }), async (c) => {
    const id = c.req.param("id");
    const user = await db2.select().from(users).where(eq5(users.id, id)).get();
    if (!user) throw new NotFoundError("User", id);
    return c.json(formatUser(user));
  });
  router.patch("/:id/preferences", describeRoute4({
    tags: ["Users"],
    summary: "Update user preferences",
    responses: {
      200: { description: "Updated user", content: { "application/json": { schema: resolver4(UserSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver4(ErrorSchema) } } }
    }
  }), async (c) => {
    const id = c.req.param("id");
    const user = await db2.select().from(users).where(eq5(users.id, id)).get();
    if (!user) throw new NotFoundError("User", id);
    const body = await c.req.json();
    const updates = {};
    if (body.reminderTime !== void 0) updates.reminderTime = body.reminderTime;
    if (body.preferredDuration !== void 0) updates.preferredDuration = body.preferredDuration;
    if (body.preferredTypes !== void 0)
      updates.preferredTypes = JSON.stringify(body.preferredTypes);
    if (body.notificationsEnabled !== void 0)
      updates.notificationsEnabled = body.notificationsEnabled;
    if (Object.keys(updates).length > 0) {
      await db2.update(users).set(updates).where(eq5(users.id, id)).run();
    }
    const updated = await db2.select().from(users).where(eq5(users.id, id)).get();
    return c.json(formatUser(updated));
  });
  return router;
}
function formatUser(user) {
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
      notificationsEnabled: user.notificationsEnabled
    },
    subscription: {
      plan: user.subscriptionPlan,
      expiresAt: user.subscriptionExpiresAt
    }
  };
}

// src/routes/progress.ts
import { Hono as Hono5 } from "hono";
import { eq as eq6, and as and2 } from "drizzle-orm";
import { describeRoute as describeRoute5, resolver as resolver5 } from "hono-openapi";
import { z as z5 } from "zod";
function progressRoutes(db2) {
  const router = new Hono5();
  router.get("/:id/progress", describeRoute5({
    tags: ["Progress"],
    summary: "List user progress",
    responses: {
      200: { description: "Progress list", content: { "application/json": { schema: resolver5(z5.array(ProgressSchema)) } } }
    }
  }), async (c) => {
    const userId = c.req.param("id");
    const status = c.req.query("status");
    let rows = await db2.select().from(userProgress).where(eq6(userProgress.userId, userId)).all();
    if (status) rows = rows.filter((r) => r.status === status);
    return c.json(rows.map(formatProgress));
  });
  router.post("/:id/progress", describeRoute5({
    tags: ["Progress"],
    summary: "Create or update progress",
    responses: {
      200: { description: "Updated progress", content: { "application/json": { schema: resolver5(ProgressSchema) } } },
      201: { description: "Created progress", content: { "application/json": { schema: resolver5(ProgressSchema) } } }
    }
  }), async (c) => {
    const userId = c.req.param("id");
    const body = await c.req.json();
    const { contentId, progressSeconds } = body;
    const existing = await db2.select().from(userProgress).where(
      and2(
        eq6(userProgress.userId, userId),
        eq6(userProgress.contentId, contentId)
      )
    ).get();
    if (existing) {
      const content3 = await db2.select().from(content).where(eq6(content.id, contentId)).get();
      const newStatus = content3?.durationSeconds && progressSeconds >= content3.durationSeconds ? "completed" : "inProgress";
      await db2.update(userProgress).set({
        progressSeconds,
        status: newStatus,
        completedAt: newStatus === "completed" ? (/* @__PURE__ */ new Date()).toISOString().split("T")[0] : existing.completedAt
      }).where(eq6(userProgress.id, existing.id)).run();
      const updated = await db2.select().from(userProgress).where(eq6(userProgress.id, existing.id)).get();
      return c.json(formatProgress(updated));
    }
    const id = `prog_${Date.now()}`;
    const content2 = await db2.select().from(content).where(eq6(content.id, contentId)).get();
    const status = content2?.durationSeconds && progressSeconds >= content2.durationSeconds ? "completed" : progressSeconds > 0 ? "inProgress" : "notStarted";
    await db2.insert(userProgress).values({
      id,
      userId,
      contentId,
      status,
      progressSeconds,
      startedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      completedAt: status === "completed" ? (/* @__PURE__ */ new Date()).toISOString().split("T")[0] : null
    }).run();
    const created = await db2.select().from(userProgress).where(eq6(userProgress.id, id)).get();
    return c.json(formatProgress(created), 201);
  });
  router.patch("/:id/progress/:contentId", describeRoute5({
    tags: ["Progress"],
    summary: "Patch progress for a content item",
    responses: {
      200: { description: "Updated progress", content: { "application/json": { schema: resolver5(ProgressSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver5(ErrorSchema) } } }
    }
  }), async (c) => {
    const userId = c.req.param("id");
    const contentId = c.req.param("contentId");
    const body = await c.req.json();
    const existing = await db2.select().from(userProgress).where(
      and2(
        eq6(userProgress.userId, userId),
        eq6(userProgress.contentId, contentId)
      )
    ).get();
    if (!existing) throw new NotFoundError("Progress", `${userId}/${contentId}`);
    const updates = {};
    if (body.progressSeconds !== void 0) updates.progressSeconds = body.progressSeconds;
    if (body.status !== void 0) {
      updates.status = body.status;
      if (body.status === "completed") {
        updates.completedAt = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      }
    }
    if (Object.keys(updates).length > 0) {
      await db2.update(userProgress).set(updates).where(eq6(userProgress.id, existing.id)).run();
    }
    const updated = await db2.select().from(userProgress).where(eq6(userProgress.id, existing.id)).get();
    return c.json(formatProgress(updated));
  });
  return router;
}
function formatProgress(row) {
  return {
    id: row.id,
    userId: row.userId,
    contentId: row.contentId,
    status: row.status,
    progressSeconds: row.progressSeconds,
    startedAt: row.startedAt,
    completedAt: row.completedAt
  };
}

// src/routes/stats.ts
import { Hono as Hono6 } from "hono";
import { eq as eq7 } from "drizzle-orm";
import { describeRoute as describeRoute6, resolver as resolver6 } from "hono-openapi";
function statsRoutes(db2) {
  const router = new Hono6();
  router.get("/:id/stats", describeRoute6({
    tags: ["Stats"],
    summary: "Get user statistics",
    responses: {
      200: { description: "User stats", content: { "application/json": { schema: resolver6(StatsSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver6(ErrorSchema) } } }
    }
  }), async (c) => {
    const userId = c.req.param("id");
    const user = await db2.select().from(users).where(eq7(users.id, userId)).get();
    if (!user) throw new NotFoundError("User", userId);
    const stats = await computeStats(db2, userId);
    return c.json(stats);
  });
  return router;
}

// src/routes/today.ts
import { Hono as Hono7 } from "hono";
import { eq as eq8, and as and3 } from "drizzle-orm";
import { describeRoute as describeRoute7, resolver as resolver7 } from "hono-openapi";
function todayRoutes(db2) {
  const router = new Hono7();
  router.get("/:id/today", describeRoute7({
    tags: ["Today"],
    summary: "Get personalized daily feed",
    responses: {
      200: { description: "Today feed", content: { "application/json": { schema: resolver7(TodaySchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver7(ErrorSchema) } } }
    }
  }), async (c) => {
    const userId = c.req.param("id");
    const user = await db2.select().from(users).where(eq8(users.id, userId)).get();
    if (!user) throw new NotFoundError("User", userId);
    const inProgress = await db2.select().from(userProgress).where(
      and3(
        eq8(userProgress.userId, userId),
        eq8(userProgress.status, "inProgress")
      )
    ).all();
    const continueItems = await Promise.all(inProgress.map(async (p) => {
      const cnt = await db2.select().from(content).where(eq8(content.id, p.contentId)).get();
      let instructorName;
      if (cnt?.instructorId) {
        const inst = await db2.select().from(instructors).where(eq8(instructors.id, cnt.instructorId)).get();
        instructorName = inst?.name;
      }
      const typeGradients = {
        meditation: ["#F47D20", "#FF9E50"],
        breathwork: ["#7B2FBE", "#C86DD7"],
        sleepStory: ["#2D3A8C", "#6E7BD4"],
        soundscape: ["#1A6B54", "#3CB89C"],
        reflect: ["#E85D75", "#F4A261"],
        video: ["#0064DC", "#1E8CFF"],
        focusMusic: ["#3C64C8", "#6E9EFF"]
      };
      const gradientColors = typeGradients[cnt?.type ?? ""] ?? ["#F47D20", "#FF9E50"];
      return {
        id: cnt?.id ?? p.contentId,
        title: cnt?.title ?? "",
        type: cnt?.type ?? "",
        subtitle: cnt?.description ?? void 0,
        durationLabel: formatDuration(cnt?.durationSeconds ?? null),
        durationSeconds: cnt?.durationSeconds ?? void 0,
        progressSeconds: p.progressSeconds,
        thumbnailUrl: cnt?.thumbnailUrl ?? void 0,
        gradientColors,
        icon: void 0,
        instructorName
      };
    }));
    const dailyIds = ["cnt_020", "cnt_021", "cnt_022"];
    const dailyItems = await Promise.all(dailyIds.map(async (id) => {
      const cnt = await db2.select().from(content).where(eq8(content.id, id)).get();
      const typeGrad = {
        reflect: ["#E85D75", "#F4A261"],
        meditation: ["#F47D20", "#FF9E50"],
        sleepStory: ["#2D3A8C", "#6E7BD4"]
      };
      return {
        id: cnt?.id ?? id,
        title: cnt?.title ?? "",
        type: cnt?.type ?? "",
        subtitle: cnt?.description ?? void 0,
        durationLabel: formatDuration(cnt?.durationSeconds ?? null),
        durationSeconds: cnt?.durationSeconds ?? void 0,
        thumbnailUrl: cnt?.thumbnailUrl ?? void 0,
        gradientColors: typeGrad[cnt?.type ?? ""] ?? ["#F47D20", "#FF9E50"],
        icon: void 0,
        instructorName: void 0
      };
    }));
    const editorialIds = ["cnt_030", "cnt_031"];
    const editorialItems = await Promise.all(editorialIds.map(async (id) => {
      const cnt = await db2.select().from(content).where(eq8(content.id, id)).get();
      return {
        id: cnt?.id ?? id,
        title: cnt?.title ?? "",
        type: cnt?.type ?? "",
        subtitle: cnt?.description ?? void 0,
        durationLabel: formatDuration(cnt?.durationSeconds ?? null),
        durationSeconds: cnt?.durationSeconds ?? void 0,
        thumbnailUrl: cnt?.thumbnailUrl ?? void 0,
        gradientColors: ["#0064DC", "#1E8CFF"],
        icon: void 0,
        instructorName: void 0
      };
    }));
    const sections = [
      {
        id: "continue_listening",
        type: "continue_listening",
        title: "Pick up where you left off",
        layout: void 0,
        collectionId: void 0,
        items: continueItems
      },
      {
        id: "daily_essentials",
        type: "daily_essentials",
        title: "Daily essentials",
        layout: "horizontal_scroll",
        collectionId: void 0,
        items: dailyItems
      },
      {
        id: "editorial",
        type: "editorial",
        title: "Your spring reset",
        layout: "two_column",
        collectionId: void 0,
        items: editorialItems
      }
    ];
    const nonEmpty = sections.filter((s) => s.items.length > 0);
    return c.json({
      greeting: getGreeting(user.name.split(" ")[0]),
      date: getTodayDate(),
      sections: nonEmpty
    });
  });
  return router;
}

// src/routes/explore.ts
import { Hono as Hono8 } from "hono";
import { eq as eq9, sql as sql2 } from "drizzle-orm";
import { describeRoute as describeRoute8, resolver as resolver8 } from "hono-openapi";
function exploreRoutes(db2) {
  const router = new Hono8();
  router.get("/", describeRoute8({
    tags: ["Explore"],
    summary: "Get explore feed",
    responses: {
      200: { description: "Explore feed", content: { "application/json": { schema: resolver8(ExploreSchema) } } }
    }
  }), async (c) => {
    const cats = await db2.select().from(categories).all();
    const categories2 = await Promise.all(
      cats.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map(async (cat) => {
        const contentCount = await db2.select({ count: sql2`count(*)` }).from(content).where(eq9(content.categoryId, cat.id)).get();
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          color: cat.color,
          description: cat.description,
          contentCount: contentCount?.count ?? 0,
          sortOrder: cat.sortOrder
        };
      })
    );
    const featured = await db2.select().from(collections).where(eq9(collections.type, "editorial")).get();
    const featuredCollection = featured ? {
      collectionId: featured.id,
      title: featured.title,
      description: featured.description ?? "",
      thumbnailUrl: featured.thumbnailUrl
    } : null;
    const programs = await db2.select().from(collections).where(eq9(collections.type, "program")).all();
    const guidedPrograms = programs.map((p) => ({
      id: p.id,
      title: p.title,
      totalSessions: p.totalSessions ?? 0,
      dailyMinutes: p.estimatedDailyMinutes ? `<${p.estimatedDailyMinutes} min/day` : "",
      gradientColors: parseJsonArray(p.gradientColors)
    }));
    return c.json({
      categories: categories2,
      featuredCollection,
      guidedPrograms
    });
  });
  return router;
}

// src/routes/sleep-meditate.ts
import { Hono as Hono9 } from "hono";
import { eq as eq10 } from "drizzle-orm";
import { describeRoute as describeRoute9, resolver as resolver9 } from "hono-openapi";
function sleepMeditateRoutes(db2) {
  const router = new Hono9();
  router.get("/", describeRoute9({
    tags: ["Sleep & Meditate"],
    summary: "Get sleep and meditation feed",
    responses: {
      200: { description: "Sleep & meditate feed", content: { "application/json": { schema: resolver9(SleepMeditateSchema) } } }
    }
  }), async (c) => {
    const tonightIds = ["cnt_040", "cnt_041"];
    const tonightItems = await Promise.all(tonightIds.map(async (id) => {
      const cnt = await db2.select().from(content).where(eq10(content.id, id)).get();
      let instructorName;
      if (cnt?.instructorId) {
        const inst = await db2.select().from(instructors).where(eq10(instructors.id, cnt.instructorId)).get();
        instructorName = inst?.name;
      }
      return {
        id: cnt?.id ?? id,
        title: cnt?.title ?? "",
        type: cnt?.type ?? "",
        subtitle: cnt?.description ?? void 0,
        durationLabel: formatDuration(cnt?.durationSeconds ?? null),
        durationSeconds: cnt?.durationSeconds ?? void 0,
        thumbnailUrl: cnt?.thumbnailUrl ?? void 0,
        instructorName
      };
    }));
    const soundIds = ["cnt_050", "cnt_051", "cnt_052"];
    const soundItems = await Promise.all(soundIds.map(async (id) => {
      const cnt = await db2.select().from(content).where(eq10(content.id, id)).get();
      return {
        id: cnt?.id ?? id,
        title: cnt?.title ?? "",
        type: cnt?.type ?? "",
        subtitle: cnt?.description ?? void 0,
        durationLabel: formatDuration(cnt?.durationSeconds ?? null),
        durationSeconds: cnt?.durationSeconds ?? void 0,
        thumbnailUrl: cnt?.thumbnailUrl ?? void 0
      };
    }));
    const windDownIds = ["cnt_060", "cnt_061"];
    const windDownItems = await Promise.all(windDownIds.map(async (id) => {
      const cnt = await db2.select().from(content).where(eq10(content.id, id)).get();
      return {
        id: cnt?.id ?? id,
        title: cnt?.title ?? "",
        type: cnt?.type ?? "",
        subtitle: cnt?.description ?? void 0,
        durationLabel: formatDuration(cnt?.durationSeconds ?? null),
        durationSeconds: cnt?.durationSeconds ?? void 0,
        thumbnailUrl: cnt?.thumbnailUrl ?? void 0
      };
    }));
    return c.json({
      sections: [
        {
          id: "tonight_picks",
          type: "tonight_picks",
          title: "Tonight's picks",
          items: tonightItems
        },
        {
          id: "soundscapes",
          type: "soundscapes",
          title: "Background sounds",
          items: soundItems
        },
        {
          id: "wind_down",
          type: "collection",
          title: "Wind down routines",
          collectionId: "col_020",
          items: windDownItems
        }
      ]
    });
  });
  return router;
}

// src/routes/luma.ts
import { Hono as Hono10 } from "hono";
import { eq as eq11 } from "drizzle-orm";
import { describeRoute as describeRoute10, resolver as resolver10 } from "hono-openapi";
function lumaRoutes(db2) {
  const router = new Hono10();
  router.get("/:id/luma", describeRoute10({
    tags: ["Luma AI"],
    summary: "Get Luma conversation state",
    responses: {
      200: { description: "Conversation state", content: { "application/json": { schema: resolver10(LumaConversationSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver10(ErrorSchema) } } }
    }
  }), async (c) => {
    const userId = c.req.param("id");
    const user = await db2.select().from(users).where(eq11(users.id, userId)).get();
    if (!user) throw new NotFoundError("User", userId);
    let conversation = await db2.select().from(conversations).where(eq11(conversations.userId, userId)).get();
    let messages2 = [];
    if (conversation) {
      messages2 = await db2.select().from(messages).where(eq11(messages.conversationId, conversation.id)).all();
    }
    const suggestions = await db2.select().from(suggestionPrompts).all();
    return c.json({
      assistant: {
        name: "Luma",
        avatarStyle: "warm_gradient",
        persona: "calm, supportive, mindfulness-focused"
      },
      conversation: conversation ? {
        id: conversation.id,
        userId: conversation.userId,
        messages: messages2.map((m) => ({
          id: m.id,
          role: m.role,
          text: m.text,
          timestamp: m.timestamp,
          feedback: m.feedback
        }))
      } : null,
      suggestions: suggestions.map((s) => ({ id: s.id, text: s.text }))
    });
  });
  router.post("/:id/luma/messages", describeRoute10({
    tags: ["Luma AI"],
    summary: "Send message to Luma",
    responses: {
      201: { description: "Assistant reply", content: { "application/json": { schema: resolver10(LumaMessageSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver10(ErrorSchema) } } }
    }
  }), async (c) => {
    const userId = c.req.param("id");
    const body = await c.req.json();
    const userText = body.text;
    const user = await db2.select().from(users).where(eq11(users.id, userId)).get();
    if (!user) throw new NotFoundError("User", userId);
    let conversation = await db2.select().from(conversations).where(eq11(conversations.userId, userId)).get();
    if (!conversation) {
      const convId = `conv_${Date.now()}`;
      await db2.insert(conversations).values({ id: convId, userId }).run();
      conversation = await db2.select().from(conversations).where(eq11(conversations.id, convId)).get();
    }
    const userMsgId = `msg_${Date.now()}_u`;
    await db2.insert(messages).values({
      id: userMsgId,
      conversationId: conversation.id,
      role: "user",
      text: userText,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }).run();
    const reply = generateMockReply(userText, user.name.split(" ")[0]);
    const replyMsgId = `msg_${Date.now()}_a`;
    await db2.insert(messages).values({
      id: replyMsgId,
      conversationId: conversation.id,
      role: "assistant",
      text: reply,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }).run();
    const replyMsg = await db2.select().from(messages).where(eq11(messages.id, replyMsgId)).get();
    return c.json(
      {
        id: replyMsg.id,
        role: replyMsg.role,
        text: replyMsg.text,
        timestamp: replyMsg.timestamp,
        feedback: replyMsg.feedback
      },
      201
    );
  });
  return router;
}
function generateMockReply(userText, firstName) {
  const lower = userText.toLowerCase();
  if (lower.includes("overwhelm") || lower.includes("stress") || lower.includes("anxious")) {
    return `I hear you, ${firstName}. When things feel overwhelming, even one mindful breath can help. Would you like to try a quick breathing exercise?`;
  }
  if (lower.includes("sleep") || lower.includes("can't sleep") || lower.includes("insomnia")) {
    return `Let's help you wind down, ${firstName}. I'd recommend starting with a sleep story or some calming rain sounds. What sounds good?`;
  }
  if (lower.includes("focus") || lower.includes("concentrate") || lower.includes("distract")) {
    return `Focus can be tricky! A short meditation or some focus music might help you get in the zone. Want me to suggest something?`;
  }
  if (lower.includes("break") || lower.includes("quick") || lower.includes("pause")) {
    return `A quick pause can make a big difference. Try "Treat Yourself to 5 Gentle Breaths" \u2014 it's only a minute long!`;
  }
  if (lower.includes("conversation") || lower.includes("prepare") || lower.includes("nervous")) {
    return `Preparing for something important? A grounding meditation can help you feel centered and confident. Would you like to try one?`;
  }
  return `Thanks for sharing, ${firstName}. I'm here to help you find what you need. Would you like a meditation, some calming sounds, or a breathing exercise?`;
}

// src/routes/profile.ts
import { Hono as Hono11 } from "hono";
import { eq as eq12 } from "drizzle-orm";
import { describeRoute as describeRoute11, resolver as resolver11 } from "hono-openapi";
function profileRoutes(db2) {
  const router = new Hono11();
  router.get("/:id/profile", describeRoute11({
    tags: ["Profile"],
    summary: "Get user profile with stats",
    responses: {
      200: { description: "User profile", content: { "application/json": { schema: resolver11(ProfileSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver11(ErrorSchema) } } }
    }
  }), async (c) => {
    const userId = c.req.param("id");
    const user = await db2.select().from(users).where(eq12(users.id, userId)).get();
    if (!user) throw new NotFoundError("User", userId);
    const [stats, streak] = await Promise.all([
      computeStats(db2, userId),
      computeStreak(db2, userId)
    ]);
    const saved = await db2.select().from(savedContent).where(eq12(savedContent.userId, userId)).all();
    const savedContentIds = saved.map((s) => s.contentId);
    const recentContentIds = await getRecentContentIds(db2, userId, 5);
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
          notificationsEnabled: user.notificationsEnabled
        },
        subscription: {
          plan: user.subscriptionPlan,
          expiresAt: user.subscriptionExpiresAt
        }
      },
      stats,
      streak,
      savedContentIds,
      recentContentIds
    });
  });
  return router;
}

// src/routes/saved.ts
import { Hono as Hono12 } from "hono";
import { eq as eq13, and as and4 } from "drizzle-orm";
import { describeRoute as describeRoute12, resolver as resolver12 } from "hono-openapi";
import { z as z6 } from "zod";
function savedRoutes(db2) {
  const router = new Hono12();
  router.get("/:id/saved", describeRoute12({
    tags: ["Saved"],
    summary: "List saved content",
    responses: {
      200: { description: "Saved items", content: { "application/json": { schema: resolver12(z6.array(SavedItemSchema)) } } }
    }
  }), async (c) => {
    const userId = c.req.param("id");
    const saved = await db2.select().from(savedContent).where(eq13(savedContent.userId, userId)).all();
    return c.json(
      saved.map((s) => ({
        userId: s.userId,
        contentId: s.contentId,
        savedAt: s.savedAt
      }))
    );
  });
  router.post("/:id/saved", describeRoute12({
    tags: ["Saved"],
    summary: "Save content",
    responses: {
      200: { description: "Already saved", content: { "application/json": { schema: resolver12(SavedItemSchema) } } },
      201: { description: "Newly saved", content: { "application/json": { schema: resolver12(SavedItemSchema) } } }
    }
  }), async (c) => {
    const userId = c.req.param("id");
    const body = await c.req.json();
    const { contentId } = body;
    const existing = await db2.select().from(savedContent).where(
      and4(
        eq13(savedContent.userId, userId),
        eq13(savedContent.contentId, contentId)
      )
    ).get();
    if (existing) {
      return c.json({ userId, contentId, savedAt: existing.savedAt });
    }
    const savedAt = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    await db2.insert(savedContent).values({ userId, contentId, savedAt }).run();
    return c.json({ userId, contentId, savedAt }, 201);
  });
  router.delete("/:id/saved/:contentId", describeRoute12({
    tags: ["Saved"],
    summary: "Remove saved content",
    responses: {
      200: { description: "Removed", content: { "application/json": { schema: resolver12(SuccessSchema) } } },
      404: { description: "Not found", content: { "application/json": { schema: resolver12(ErrorSchema) } } }
    }
  }), async (c) => {
    const userId = c.req.param("id");
    const contentId = c.req.param("contentId");
    const existing = await db2.select().from(savedContent).where(
      and4(
        eq13(savedContent.userId, userId),
        eq13(savedContent.contentId, contentId)
      )
    ).get();
    if (!existing) throw new NotFoundError("Saved content", contentId);
    await db2.delete(savedContent).where(
      and4(
        eq13(savedContent.userId, userId),
        eq13(savedContent.contentId, contentId)
      )
    ).run();
    return c.json({ success: true });
  });
  return router;
}

// src/app.ts
import { ZodError } from "zod";
function createApp(db2) {
  const app2 = new Hono13();
  app2.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json({ error: err.message }, err.statusCode);
    }
    if (err instanceof ZodError) {
      return c.json({ error: "Validation error", details: err.errors }, 400);
    }
    console.error("Unhandled error:", err);
    return c.json({ error: "Internal server error" }, 500);
  });
  app2.use("*", cors());
  app2.use("*", logger);
  app2.get("/", (c) => c.json({ status: "ok", name: "Headspace API" }));
  app2.route("/api/content", contentRoutes(db2));
  app2.route("/api/categories", categoriesRoutes(db2));
  app2.route("/api/collections", collectionsRoutes(db2));
  app2.route("/api/users", usersRoutes(db2));
  app2.route("/api/users", progressRoutes(db2));
  app2.route("/api/users", statsRoutes(db2));
  app2.route("/api/users", savedRoutes(db2));
  app2.route("/api/users", todayRoutes(db2));
  app2.route("/api/explore", exploreRoutes(db2));
  app2.route("/api/sleep-meditate", sleepMeditateRoutes(db2));
  app2.route("/api/users", lumaRoutes(db2));
  app2.route("/api/users", profileRoutes(db2));
  app2.get(
    "/api/openapi.json",
    openAPIRouteHandler(app2, {
      documentation: {
        info: {
          title: "Headspace API",
          version: "1.0.0",
          description: "REST API for the Headspace meditation & mindfulness app"
        }
      }
    })
  );
  app2.get(
    "/docs",
    Scalar({
      url: "/api/openapi.json"
    })
  );
  return app2;
}

// src/db/index.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
function createDb() {
  const client = process.env.TURSO_DATABASE_URL ? createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  }) : createClient({ url: "file:./headspace.db" });
  return drizzle(client, { schema: schema_exports });
}

// src/db/seed.ts
import { sql as sql3 } from "drizzle-orm";
async function seed(db2) {
  await db2.run(sql3`CREATE TABLE IF NOT EXISTS instructors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_url TEXT
  )`);
  await db2.run(sql3`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
  )`);
  await db2.run(sql3`CREATE TABLE IF NOT EXISTS content (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id),
    instructor_id TEXT REFERENCES instructors(id),
    duration_seconds INTEGER,
    thumbnail_url TEXT,
    audio_url TEXT,
    tags TEXT,
    is_premium INTEGER DEFAULT 0,
    difficulty TEXT,
    created_at TEXT
  )`);
  await db2.run(sql3`CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    thumbnail_url TEXT,
    gradient_colors TEXT,
    total_sessions INTEGER,
    estimated_daily_minutes INTEGER,
    is_premium INTEGER DEFAULT 0
  )`);
  await db2.run(sql3`CREATE TABLE IF NOT EXISTS collection_contents (
    collection_id TEXT NOT NULL REFERENCES collections(id),
    content_id TEXT NOT NULL REFERENCES content(id),
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (collection_id, content_id)
  )`);
  await db2.run(sql3`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    joined_at TEXT NOT NULL,
    reminder_time TEXT,
    preferred_duration INTEGER,
    preferred_types TEXT,
    notifications_enabled INTEGER DEFAULT 1,
    subscription_plan TEXT,
    subscription_expires_at TEXT
  )`);
  await db2.run(sql3`CREATE TABLE IF NOT EXISTS user_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    content_id TEXT NOT NULL REFERENCES content(id),
    status TEXT NOT NULL DEFAULT 'notStarted',
    progress_seconds INTEGER DEFAULT 0,
    started_at TEXT,
    completed_at TEXT
  )`);
  await db2.run(sql3`CREATE TABLE IF NOT EXISTS saved_content (
    user_id TEXT NOT NULL REFERENCES users(id),
    content_id TEXT NOT NULL REFERENCES content(id),
    saved_at TEXT NOT NULL,
    PRIMARY KEY (user_id, content_id)
  )`);
  await db2.run(sql3`CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id)
  )`);
  await db2.run(sql3`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id),
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    feedback TEXT
  )`);
  await db2.run(sql3`CREATE TABLE IF NOT EXISTS suggestion_prompts (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL
  )`);
  const existing = await db2.select().from(users).all();
  if (existing.length > 0) return;
  await db2.insert(instructors).values([
    { id: "inst_001", name: "Sarah Mitchell", avatarUrl: "https://cdn.app.com/instructors/sarah.jpg" },
    { id: "inst_002", name: "James Porter", avatarUrl: "https://cdn.app.com/instructors/james.jpg" }
  ]).run();
  await db2.insert(categories).values([
    { id: "cat_meditate", name: "Meditate", slug: "meditate", icon: "circle.fill", color: "#F47D20", sortOrder: 0 },
    { id: "cat_sleep", name: "Sleep", slug: "sleep", icon: "moon.fill", color: "#8264C8", sortOrder: 1 },
    { id: "cat_move", name: "Move", slug: "move", icon: "forward.fill", color: "#00A050", sortOrder: 2 },
    { id: "cat_focus", name: "Focus", slug: "focus", icon: "music.note", color: "#3C64C8", sortOrder: 3 }
  ]).run();
  await db2.insert(content).values([
    {
      id: "cnt_001",
      title: "Finding Calm in Chaos",
      description: "A guided meditation to find peace amid daily stress.",
      type: "meditation",
      categoryId: "cat_meditate",
      instructorId: "inst_001",
      durationSeconds: 600,
      tags: JSON.stringify(["stress", "beginner", "guided", "morning"]),
      audioUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      isPremium: false,
      difficulty: "beginner",
      createdAt: "2025-01-15"
    },
    {
      id: "cnt_012",
      title: "Treat Yourself to 5 Gentle Breaths",
      description: "A quick breathwork exercise to reset your nervous system.",
      type: "breathwork",
      categoryId: "cat_meditate",
      durationSeconds: 60,
      tags: JSON.stringify(["breathwork", "quick"]),
      audioUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      isPremium: false,
      createdAt: "2025-03-01"
    },
    {
      id: "cnt_020",
      title: "How's your day so far?",
      description: "Take a moment to reflect on your day.",
      type: "reflect",
      categoryId: "cat_meditate",
      tags: JSON.stringify(["reflect", "daily"]),
      audioUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      isPremium: false,
      createdAt: "2025-03-10"
    },
    {
      id: "cnt_021",
      title: "Choice",
      description: "A 20-minute meditation on embracing choice in daily life.",
      type: "meditation",
      categoryId: "cat_meditate",
      durationSeconds: 1200,
      tags: JSON.stringify(["meditation", "daily"]),
      audioUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      isPremium: false,
      createdAt: "2025-03-10"
    },
    {
      id: "cnt_022",
      title: "Slow Down",
      description: "A calming sleep story to ease you into rest.",
      type: "sleepStory",
      categoryId: "cat_sleep",
      durationSeconds: 420,
      tags: JSON.stringify(["sleep", "story"]),
      audioUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      isPremium: false,
      createdAt: "2025-03-10"
    },
    {
      id: "cnt_030",
      title: "Appreciation of Everyday Life",
      description: "A short video on finding gratitude in the mundane.",
      type: "video",
      categoryId: "cat_meditate",
      durationSeconds: 60,
      tags: JSON.stringify(["video", "gratitude"]),
      audioUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      isPremium: false,
      createdAt: "2025-02-01"
    },
    {
      id: "cnt_031",
      title: "Cultivating Hope for the Future",
      description: "An inspiring video about building hope through mindfulness.",
      type: "video",
      categoryId: "cat_meditate",
      durationSeconds: 240,
      tags: JSON.stringify(["video", "hope"]),
      audioUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      isPremium: false,
      createdAt: "2025-02-15"
    },
    {
      id: "cnt_040",
      title: "Rain on a Tin Roof",
      description: "45 minutes of gentle rain sounds on a tin roof.",
      type: "soundscape",
      categoryId: "cat_sleep",
      durationSeconds: 2700,
      tags: JSON.stringify(["sleep", "rain", "soundscape"]),
      audioUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      isPremium: false,
      createdAt: "2025-01-20"
    },
    {
      id: "cnt_041",
      title: "The Cottage Garden",
      description: "A soothing sleep story set in a peaceful countryside garden.",
      type: "sleepStory",
      categoryId: "cat_sleep",
      instructorId: "inst_002",
      durationSeconds: 1800,
      tags: JSON.stringify(["sleep", "story"]),
      audioUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      isPremium: true,
      createdAt: "2025-02-10"
    },
    {
      id: "cnt_050",
      title: "Ocean Waves",
      description: "Looping ocean wave sounds for deep relaxation.",
      type: "soundscape",
      categoryId: "cat_sleep",
      tags: JSON.stringify(["soundscape", "loop"]),
      audioUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      isPremium: false,
      createdAt: "2025-01-05"
    },
    {
      id: "cnt_051",
      title: "Forest Night",
      description: "Nighttime forest ambience with crickets and owls.",
      type: "soundscape",
      categoryId: "cat_sleep",
      tags: JSON.stringify(["soundscape", "loop"]),
      audioUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      isPremium: false,
      createdAt: "2025-01-05"
    },
    {
      id: "cnt_052",
      title: "Gentle Rain",
      description: "Soft rain sounds for focus or sleep.",
      type: "soundscape",
      categoryId: "cat_sleep",
      tags: JSON.stringify(["soundscape", "loop"]),
      audioUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      isPremium: false,
      createdAt: "2025-01-05"
    },
    {
      id: "cnt_060",
      title: "Body Scan for Sleep",
      description: "A 15-minute body scan meditation designed for bedtime.",
      type: "meditation",
      categoryId: "cat_sleep",
      durationSeconds: 900,
      tags: JSON.stringify(["sleep", "body-scan"]),
      audioUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      isPremium: false,
      createdAt: "2025-02-20"
    },
    {
      id: "cnt_061",
      title: "Letting Go of the Day",
      description: "A 5-minute breathwork session to release the day's tension.",
      type: "breathwork",
      categoryId: "cat_sleep",
      durationSeconds: 300,
      tags: JSON.stringify(["sleep", "breathwork"]),
      audioUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      isPremium: false,
      createdAt: "2025-02-20"
    }
  ]).run();
  await db2.insert(collections).values([
    {
      id: "col_001",
      title: "CBT for Anxiety & Depression",
      description: "A structured program using cognitive behavioral therapy techniques.",
      type: "program",
      gradientColors: JSON.stringify(["#FF6496", "#FF9664"]),
      totalSessions: 21,
      estimatedDailyMinutes: 10,
      isPremium: true
    },
    {
      id: "col_002",
      title: "Finding Your Best Sleep",
      description: "A comprehensive sleep improvement program.",
      type: "program",
      gradientColors: JSON.stringify(["#0064DC", "#1E8CFF"]),
      totalSessions: 18,
      estimatedDailyMinutes: 10,
      isPremium: true
    },
    {
      id: "col_010",
      title: "Self-Care for Parents",
      description: "Quick mindfulness exercises designed for busy parents.",
      type: "editorial",
      thumbnailUrl: "https://cdn.app.com/collections/parents.jpg",
      isPremium: false
    },
    {
      id: "col_020",
      title: "Wind down routines",
      description: "Evening routines to help you unwind before bed.",
      type: "playlist",
      isPremium: false
    }
  ]).run();
  await db2.insert(collectionContents).values([
    // CBT for Anxiety & Depression
    { collectionId: "col_001", contentId: "cnt_001", sortOrder: 0 },
    { collectionId: "col_001", contentId: "cnt_012", sortOrder: 1 },
    { collectionId: "col_001", contentId: "cnt_021", sortOrder: 2 },
    { collectionId: "col_001", contentId: "cnt_020", sortOrder: 3 },
    // Finding Your Best Sleep
    { collectionId: "col_002", contentId: "cnt_040", sortOrder: 0 },
    { collectionId: "col_002", contentId: "cnt_041", sortOrder: 1 },
    { collectionId: "col_002", contentId: "cnt_060", sortOrder: 2 },
    { collectionId: "col_002", contentId: "cnt_061", sortOrder: 3 },
    { collectionId: "col_002", contentId: "cnt_022", sortOrder: 4 },
    // Self-Care for Parents (editorial / featured)
    { collectionId: "col_010", contentId: "cnt_030", sortOrder: 0 },
    { collectionId: "col_010", contentId: "cnt_031", sortOrder: 1 },
    { collectionId: "col_010", contentId: "cnt_001", sortOrder: 2 },
    // Wind down routines
    { collectionId: "col_020", contentId: "cnt_060", sortOrder: 0 },
    { collectionId: "col_020", contentId: "cnt_061", sortOrder: 1 }
  ]).run();
  await db2.insert(users).values({
    id: "usr_001",
    name: "Samuel East",
    email: "samuel@example.com",
    avatarUrl: "https://cdn.app.com/avatars/usr_001.jpg",
    joinedAt: "2021-09-14",
    reminderTime: "07:30",
    preferredDuration: 10,
    preferredTypes: JSON.stringify(["meditation", "sleepStory"]),
    notificationsEnabled: true,
    subscriptionPlan: "premium",
    subscriptionExpiresAt: "2026-12-01"
  }).run();
  const progressEntries = [];
  const contentIds = [
    "cnt_001",
    "cnt_012",
    "cnt_020",
    "cnt_021",
    "cnt_022",
    "cnt_030",
    "cnt_031",
    "cnt_040",
    "cnt_041",
    "cnt_050",
    "cnt_051",
    "cnt_052",
    "cnt_060",
    "cnt_061"
  ];
  const durations = [600, 60, 120, 1200, 420, 60, 240, 2700, 1800, 1800, 1800, 1800, 900, 300];
  for (let i = 0; i < 96; i++) {
    const cIdx = i % contentIds.length;
    const day = 96 - i;
    const date = new Date(2026, 3, 3);
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split("T")[0];
    progressEntries.push({
      id: `prog_${String(i + 1).padStart(3, "0")}`,
      userId: "usr_001",
      contentId: contentIds[cIdx],
      status: "completed",
      progressSeconds: durations[cIdx],
      startedAt: dateStr,
      completedAt: dateStr
    });
  }
  progressEntries.push({
    id: "prog_current_001",
    userId: "usr_001",
    contentId: "cnt_012",
    status: "inProgress",
    progressSeconds: 30,
    startedAt: "2026-04-03",
    completedAt: null
  });
  for (let i = 0; i < progressEntries.length; i += 20) {
    const batch = progressEntries.slice(i, i + 20);
    await db2.insert(userProgress).values(batch).run();
  }
  await db2.insert(savedContent).values([
    { userId: "usr_001", contentId: "cnt_001", savedAt: "2025-06-01" },
    { userId: "usr_001", contentId: "cnt_012", savedAt: "2025-08-15" },
    { userId: "usr_001", contentId: "cnt_040", savedAt: "2025-09-20" }
  ]).run();
  await db2.insert(conversations).values({
    id: "conv_001",
    userId: "usr_001"
  }).run();
  await db2.insert(messages).values({
    id: "msg_001",
    conversationId: "conv_001",
    role: "assistant",
    text: "Hey Samuel! Looking for some calm tonight? I noticed you enjoy rain sounds and sleepcasts.",
    timestamp: "2026-04-03T20:00:00Z"
  }).run();
  await db2.insert(suggestionPrompts).values([
    { id: "sug_001", text: "I'm feeling overwhelmed" },
    { id: "sug_002", text: "Help me fall asleep" },
    { id: "sug_003", text: "Prepare for a conversation" },
    { id: "sug_004", text: "I need a quick break" }
  ]).run();
}

// src/serverless.ts
var db = createDb();
var seedPromise = seed(db);
var app = createApp(db);
var handler = handle(app);
async function serverless_default(req, ctx) {
  await seedPromise;
  return handler(req, ctx);
}
export {
  serverless_default as default
};
