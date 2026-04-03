import { z } from "zod";

export const ContentTypeEnum = z.enum([
  "meditation", "sleepStory", "soundscape", "breathwork", "video", "focusMusic", "reflect",
]);

export const DifficultyEnum = z.enum(["beginner", "intermediate", "advanced"]);

export const ProgressStatusEnum = z.enum(["notStarted", "inProgress", "completed"]);

export const CollectionTypeEnum = z.enum(["program", "playlist", "editorial", "dailyPicks"]);

export const MessageRoleEnum = z.enum(["user", "assistant"]);

// Query schemas
export const contentQuerySchema = z.object({
  type: ContentTypeEnum.optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  difficulty: DifficultyEnum.optional(),
  isPremium: z.enum(["true", "false"]).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1),
});

export const collectionQuerySchema = z.object({
  type: CollectionTypeEnum.optional(),
});

export const progressQuerySchema = z.object({
  status: ProgressStatusEnum.optional(),
});

// Body schemas
export const createProgressSchema = z.object({
  contentId: z.string(),
  progressSeconds: z.number().int().min(0),
});

export const updateProgressSchema = z.object({
  progressSeconds: z.number().int().min(0).optional(),
  status: ProgressStatusEnum.optional(),
});

export const updatePreferencesSchema = z.object({
  reminderTime: z.string().optional(),
  preferredDuration: z.number().int().optional(),
  preferredTypes: z.array(z.string()).optional(),
  notificationsEnabled: z.boolean().optional(),
});

export const sendMessageSchema = z.object({
  text: z.string().min(1),
});

export const saveContentSchema = z.object({
  contentId: z.string(),
});

// ── Response schemas (for OpenAPI docs) ──────────────────────────

export const InstructorSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});

export const ContentSchema = z.object({
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
  createdAt: z.string().nullable(),
});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  description: z.string().nullable(),
  contentCount: z.number(),
  sortOrder: z.number().nullable(),
});

export const CollectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  type: CollectionTypeEnum,
  thumbnailUrl: z.string().nullable(),
  gradientColors: z.array(z.string()),
  totalSessions: z.number().nullable(),
  estimatedDailyMinutes: z.number().nullable(),
  isPremium: z.boolean(),
});

export const CollectionDetailSchema = CollectionSchema.extend({
  contentIds: z.array(z.string()),
});

export const UserPreferencesSchema = z.object({
  reminderTime: z.string().nullable(),
  preferredDuration: z.number().nullable(),
  preferredTypes: z.array(z.string()),
  notificationsEnabled: z.boolean(),
});

export const UserSubscriptionSchema = z.object({
  plan: z.string(),
  expiresAt: z.string().nullable(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  joinedAt: z.string().nullable(),
  preferences: UserPreferencesSchema,
  subscription: UserSubscriptionSchema,
});

export const ProgressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  contentId: z.string(),
  status: ProgressStatusEnum,
  progressSeconds: z.number(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});

export const StatsSchema = z.object({
  totalSessions: z.number(),
  totalMinutes: z.number(),
  avgSessionMinutes: z.number(),
  currentStreakDays: z.number(),
  longestStreakDays: z.number(),
});

export const FeedItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  subtitle: z.string().optional(),
  durationLabel: z.string().nullable().optional(),
  durationSeconds: z.number().optional(),
  progressSeconds: z.number().optional(),
  thumbnailUrl: z.string().optional(),
  icon: z.string().optional(),
  instructorName: z.string().optional(),
});

export const FeedSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  layout: z.string().optional(),
  collectionId: z.string().optional(),
  items: z.array(FeedItemSchema),
});

export const TodaySchema = z.object({
  greeting: z.string(),
  date: z.string(),
  sections: z.array(FeedSectionSchema),
});

export const ExploreSchema = z.object({
  categories: z.array(CategorySchema),
  featuredCollection: z.object({
    collectionId: z.string(),
    title: z.string(),
    description: z.string(),
    thumbnailUrl: z.string().nullable(),
  }).nullable(),
  guidedPrograms: z.array(z.object({
    id: z.string(),
    title: z.string(),
    totalSessions: z.number(),
    dailyMinutes: z.string(),
    gradientColors: z.array(z.string()),
  })),
});

export const SleepMeditateSchema = z.object({
  sections: z.array(FeedSectionSchema),
});

export const LumaMessageSchema = z.object({
  id: z.string(),
  role: MessageRoleEnum,
  text: z.string(),
  timestamp: z.string(),
  feedback: z.string().nullable().optional(),
});

export const LumaConversationSchema = z.object({
  assistant: z.object({
    name: z.string(),
    avatarStyle: z.string(),
    persona: z.string(),
  }),
  conversation: z.object({
    id: z.string(),
    userId: z.string(),
    messages: z.array(LumaMessageSchema),
  }).nullable(),
  suggestions: z.array(z.object({ id: z.string(), text: z.string() })),
});

export const SavedItemSchema = z.object({
  userId: z.string(),
  contentId: z.string(),
  savedAt: z.string(),
});

export const StreakSchema = z.object({
  current: z.number(),
  message: z.string(),
  weeklyActivity: z.array(z.boolean()),
});

export const ProfileSchema = z.object({
  user: UserSchema,
  stats: StatsSchema,
  streak: StreakSchema,
  savedContentIds: z.array(z.string()),
  recentContentIds: z.array(z.string()),
});

export const ErrorSchema = z.object({
  error: z.string(),
});

export const SuccessSchema = z.object({
  success: z.boolean(),
});
