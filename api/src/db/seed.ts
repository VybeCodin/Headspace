import { eq, sql } from "drizzle-orm";
import type { AppDatabase } from "./index";
import * as schema from "./schema";

export async function seed(db: AppDatabase) {
  // Create tables if they don't exist
  db.run(sql`CREATE TABLE IF NOT EXISTS instructors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_url TEXT
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS content (
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

  db.run(sql`CREATE TABLE IF NOT EXISTS collections (
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

  db.run(sql`CREATE TABLE IF NOT EXISTS collection_contents (
    collection_id TEXT NOT NULL REFERENCES collections(id),
    content_id TEXT NOT NULL REFERENCES content(id),
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (collection_id, content_id)
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS users (
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

  db.run(sql`CREATE TABLE IF NOT EXISTS user_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    content_id TEXT NOT NULL REFERENCES content(id),
    status TEXT NOT NULL DEFAULT 'notStarted',
    progress_seconds INTEGER DEFAULT 0,
    started_at TEXT,
    completed_at TEXT
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS saved_content (
    user_id TEXT NOT NULL REFERENCES users(id),
    content_id TEXT NOT NULL REFERENCES content(id),
    saved_at TEXT NOT NULL,
    PRIMARY KEY (user_id, content_id)
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id)
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id),
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    feedback TEXT
  )`);

  db.run(sql`CREATE TABLE IF NOT EXISTS suggestion_prompts (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL
  )`);

  // Idempotent: check if already seeded
  const existing = db.select().from(schema.users).all();
  if (existing.length > 0) return;

  // --- Instructors ---
  db.insert(schema.instructors).values([
    { id: "inst_001", name: "Sarah Mitchell", avatarUrl: "https://cdn.app.com/instructors/sarah.jpg" },
    { id: "inst_002", name: "James Porter", avatarUrl: "https://cdn.app.com/instructors/james.jpg" },
  ]).run();

  // --- Categories ---
  db.insert(schema.categories).values([
    { id: "cat_meditate", name: "Meditate", slug: "meditate", icon: "circle.fill", color: "#F47D20", sortOrder: 0 },
    { id: "cat_sleep", name: "Sleep", slug: "sleep", icon: "moon.fill", color: "#8264C8", sortOrder: 1 },
    { id: "cat_move", name: "Move", slug: "move", icon: "forward.fill", color: "#00A050", sortOrder: 2 },
    { id: "cat_focus", name: "Focus", slug: "focus", icon: "music.note", color: "#3C64C8", sortOrder: 3 },
  ]).run();

  // --- Content (14 items) ---
  db.insert(schema.content).values([
    {
      id: "cnt_001", title: "Finding Calm in Chaos", description: "A guided meditation to find peace amid daily stress.",
      type: "meditation", categoryId: "cat_meditate", instructorId: "inst_001",
      durationSeconds: 600, tags: JSON.stringify(["stress", "beginner", "guided", "morning"]),
      isPremium: false, difficulty: "beginner", createdAt: "2025-01-15",
    },
    {
      id: "cnt_012", title: "Treat Yourself to 5 Gentle Breaths",
      description: "A quick breathwork exercise to reset your nervous system.",
      type: "breathwork", categoryId: "cat_meditate",
      durationSeconds: 60, tags: JSON.stringify(["breathwork", "quick"]),
      isPremium: false, createdAt: "2025-03-01",
    },
    {
      id: "cnt_020", title: "How's your day so far?",
      description: "Take a moment to reflect on your day.",
      type: "reflect", categoryId: "cat_meditate",
      tags: JSON.stringify(["reflect", "daily"]),
      isPremium: false, createdAt: "2025-03-10",
    },
    {
      id: "cnt_021", title: "Choice",
      description: "A 20-minute meditation on embracing choice in daily life.",
      type: "meditation", categoryId: "cat_meditate",
      durationSeconds: 1200, tags: JSON.stringify(["meditation", "daily"]),
      isPremium: false, createdAt: "2025-03-10",
    },
    {
      id: "cnt_022", title: "Slow Down",
      description: "A calming sleep story to ease you into rest.",
      type: "sleepStory", categoryId: "cat_sleep",
      durationSeconds: 420, tags: JSON.stringify(["sleep", "story"]),
      isPremium: false, createdAt: "2025-03-10",
    },
    {
      id: "cnt_030", title: "Appreciation of Everyday Life",
      description: "A short video on finding gratitude in the mundane.",
      type: "video", categoryId: "cat_meditate",
      durationSeconds: 60, tags: JSON.stringify(["video", "gratitude"]),
      isPremium: false, createdAt: "2025-02-01",
    },
    {
      id: "cnt_031", title: "Cultivating Hope for the Future",
      description: "An inspiring video about building hope through mindfulness.",
      type: "video", categoryId: "cat_meditate",
      durationSeconds: 240, tags: JSON.stringify(["video", "hope"]),
      isPremium: false, createdAt: "2025-02-15",
    },
    {
      id: "cnt_040", title: "Rain on a Tin Roof",
      description: "45 minutes of gentle rain sounds on a tin roof.",
      type: "soundscape", categoryId: "cat_sleep",
      durationSeconds: 2700, tags: JSON.stringify(["sleep", "rain", "soundscape"]),
      isPremium: false, createdAt: "2025-01-20",
    },
    {
      id: "cnt_041", title: "The Cottage Garden",
      description: "A soothing sleep story set in a peaceful countryside garden.",
      type: "sleepStory", categoryId: "cat_sleep", instructorId: "inst_002",
      durationSeconds: 1800, tags: JSON.stringify(["sleep", "story"]),
      isPremium: true, createdAt: "2025-02-10",
    },
    {
      id: "cnt_050", title: "Ocean Waves",
      description: "Looping ocean wave sounds for deep relaxation.",
      type: "soundscape", categoryId: "cat_sleep",
      tags: JSON.stringify(["soundscape", "loop"]),
      isPremium: false, createdAt: "2025-01-05",
    },
    {
      id: "cnt_051", title: "Forest Night",
      description: "Nighttime forest ambience with crickets and owls.",
      type: "soundscape", categoryId: "cat_sleep",
      tags: JSON.stringify(["soundscape", "loop"]),
      isPremium: false, createdAt: "2025-01-05",
    },
    {
      id: "cnt_052", title: "Gentle Rain",
      description: "Soft rain sounds for focus or sleep.",
      type: "soundscape", categoryId: "cat_sleep",
      tags: JSON.stringify(["soundscape", "loop"]),
      isPremium: false, createdAt: "2025-01-05",
    },
    {
      id: "cnt_060", title: "Body Scan for Sleep",
      description: "A 15-minute body scan meditation designed for bedtime.",
      type: "meditation", categoryId: "cat_sleep",
      durationSeconds: 900, tags: JSON.stringify(["sleep", "body-scan"]),
      isPremium: false, createdAt: "2025-02-20",
    },
    {
      id: "cnt_061", title: "Letting Go of the Day",
      description: "A 5-minute breathwork session to release the day's tension.",
      type: "breathwork", categoryId: "cat_sleep",
      durationSeconds: 300, tags: JSON.stringify(["sleep", "breathwork"]),
      isPremium: false, createdAt: "2025-02-20",
    },
  ]).run();

  // --- Collections ---
  db.insert(schema.collections).values([
    {
      id: "col_001", title: "CBT for Anxiety & Depression",
      description: "A structured program using cognitive behavioral therapy techniques.",
      type: "program", gradientColors: JSON.stringify(["#FF6496", "#FF9664"]),
      totalSessions: 21, estimatedDailyMinutes: 10, isPremium: true,
    },
    {
      id: "col_002", title: "Finding Your Best Sleep",
      description: "A comprehensive sleep improvement program.",
      type: "program", gradientColors: JSON.stringify(["#0064DC", "#1E8CFF"]),
      totalSessions: 18, estimatedDailyMinutes: 10, isPremium: true,
    },
    {
      id: "col_010", title: "Self-Care for Parents",
      description: "Quick mindfulness exercises designed for busy parents.",
      type: "editorial", thumbnailUrl: "https://cdn.app.com/collections/parents.jpg",
      isPremium: false,
    },
    {
      id: "col_020", title: "Wind down routines",
      description: "Evening routines to help you unwind before bed.",
      type: "playlist",
      isPremium: false,
    },
  ]).run();

  // --- Collection Contents ---
  db.insert(schema.collectionContents).values([
    { collectionId: "col_020", contentId: "cnt_060", sortOrder: 0 },
    { collectionId: "col_020", contentId: "cnt_061", sortOrder: 1 },
  ]).run();

  // --- Users ---
  db.insert(schema.users).values({
    id: "usr_001", name: "Samuel East", email: "samuel@example.com",
    avatarUrl: "https://cdn.app.com/avatars/usr_001.jpg",
    joinedAt: "2021-09-14",
    reminderTime: "07:30",
    preferredDuration: 10,
    preferredTypes: JSON.stringify(["meditation", "sleepStory"]),
    notificationsEnabled: true,
    subscriptionPlan: "premium",
    subscriptionExpiresAt: "2026-12-01",
  }).run();

  // --- User Progress (96 completed sessions for stats) ---
  const progressEntries: Array<{
    id: string; userId: string; contentId: string;
    status: string; progressSeconds: number;
    startedAt: string; completedAt: string | null;
  }> = [];

  // Generate 96 completed sessions spread across content
  const contentIds = [
    "cnt_001", "cnt_012", "cnt_020", "cnt_021", "cnt_022",
    "cnt_030", "cnt_031", "cnt_040", "cnt_041", "cnt_050",
    "cnt_051", "cnt_052", "cnt_060", "cnt_061",
  ];
  const durations = [600, 60, 120, 1200, 420, 60, 240, 2700, 1800, 1800, 1800, 1800, 900, 300];

  for (let i = 0; i < 96; i++) {
    const cIdx = i % contentIds.length;
    const day = 96 - i; // days ago
    const date = new Date(2026, 3, 3); // April 3, 2026
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split("T")[0];

    progressEntries.push({
      id: `prog_${String(i + 1).padStart(3, "0")}`,
      userId: "usr_001",
      contentId: contentIds[cIdx],
      status: "completed",
      progressSeconds: durations[cIdx],
      startedAt: dateStr,
      completedAt: dateStr,
    });
  }

  // Add one in-progress entry for cnt_012 (30s progress)
  progressEntries.push({
    id: "prog_current_001",
    userId: "usr_001",
    contentId: "cnt_012",
    status: "inProgress",
    progressSeconds: 30,
    startedAt: "2026-04-03",
    completedAt: null,
  });

  // Insert progress in batches
  for (let i = 0; i < progressEntries.length; i += 20) {
    const batch = progressEntries.slice(i, i + 20);
    db.insert(schema.userProgress).values(batch).run();
  }

  // --- Saved Content ---
  db.insert(schema.savedContent).values([
    { userId: "usr_001", contentId: "cnt_001", savedAt: "2025-06-01" },
    { userId: "usr_001", contentId: "cnt_012", savedAt: "2025-08-15" },
    { userId: "usr_001", contentId: "cnt_040", savedAt: "2025-09-20" },
  ]).run();

  // --- Conversations ---
  db.insert(schema.conversations).values({
    id: "conv_001", userId: "usr_001",
  }).run();

  // --- Messages ---
  db.insert(schema.messages).values({
    id: "msg_001",
    conversationId: "conv_001",
    role: "assistant",
    text: "Hey Samuel! Looking for some calm tonight? I noticed you enjoy rain sounds and sleepcasts.",
    timestamp: "2026-04-03T20:00:00Z",
  }).run();

  // --- Suggestion Prompts ---
  db.insert(schema.suggestionPrompts).values([
    { id: "sug_001", text: "I'm feeling overwhelmed" },
    { id: "sug_002", text: "Help me fall asleep" },
    { id: "sug_003", text: "Prepare for a conversation" },
    { id: "sug_004", text: "I need a quick break" },
  ]).run();
}
