import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";

export const instructors = sqliteTable("instructors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
});

export const content = sqliteTable("content", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // meditation, sleepStory, soundscape, breathwork, video, focusMusic, reflect
  categoryId: text("category_id").references(() => categories.id),
  instructorId: text("instructor_id").references(() => instructors.id),
  durationSeconds: integer("duration_seconds"),
  thumbnailUrl: text("thumbnail_url"),
  audioUrl: text("audio_url"),
  tags: text("tags"), // JSON array stored as text
  isPremium: integer("is_premium", { mode: "boolean" }).default(false),
  difficulty: text("difficulty"), // beginner, intermediate, advanced
  createdAt: text("created_at"),
});

export const collections = sqliteTable("collections", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type"), // program, playlist, editorial, dailyPicks
  thumbnailUrl: text("thumbnail_url"),
  gradientColors: text("gradient_colors"), // JSON array
  totalSessions: integer("total_sessions"),
  estimatedDailyMinutes: integer("estimated_daily_minutes"),
  isPremium: integer("is_premium", { mode: "boolean" }).default(false),
});

export const collectionContents = sqliteTable(
  "collection_contents",
  {
    collectionId: text("collection_id")
      .notNull()
      .references(() => collections.id),
    contentId: text("content_id")
      .notNull()
      .references(() => content.id),
    sortOrder: integer("sort_order").default(0),
  },
  (table) => [primaryKey({ columns: [table.collectionId, table.contentId] })]
);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  joinedAt: text("joined_at").notNull(),
  // Preferences (flattened)
  reminderTime: text("reminder_time"),
  preferredDuration: integer("preferred_duration"),
  preferredTypes: text("preferred_types"), // JSON array
  notificationsEnabled: integer("notifications_enabled", { mode: "boolean" }).default(true),
  // Subscription (flattened)
  subscriptionPlan: text("subscription_plan"),
  subscriptionExpiresAt: text("subscription_expires_at"),
});

export const userProgress = sqliteTable("user_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  contentId: text("content_id")
    .notNull()
    .references(() => content.id),
  status: text("status").notNull().default("notStarted"), // notStarted, inProgress, completed
  progressSeconds: integer("progress_seconds").default(0),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
});

export const savedContent = sqliteTable(
  "saved_content",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    contentId: text("content_id")
      .notNull()
      .references(() => content.id),
    savedAt: text("saved_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.contentId] })]
);

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id),
  role: text("role").notNull(), // user, assistant
  text: text("text").notNull(),
  timestamp: text("timestamp").notNull(),
  feedback: text("feedback"),
});

export const suggestionPrompts = sqliteTable("suggestion_prompts", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
});
