import { eq, and, desc } from "drizzle-orm";
import type { AppDatabase } from "../db/index";
import * as schema from "../db/schema";

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) return [];
  try {
    return JSON.parse(tagsJson);
  } catch {
    return [];
  }
}

export function parseJsonArray(json: string | null): string[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function computeStats(db: AppDatabase, userId: string) {
  const progress = db
    .select()
    .from(schema.userProgress)
    .where(
      and(
        eq(schema.userProgress.userId, userId),
        eq(schema.userProgress.status, "completed")
      )
    )
    .all();

  const totalSessions = progress.length;
  const totalMinutes = Math.round(
    progress.reduce((sum, p) => sum + (p.progressSeconds || 0), 0) / 60
  );
  const avgSessionMinutes =
    totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

  // Compute streak
  const completedDates = [
    ...new Set(
      progress
        .filter((p) => p.completedAt)
        .map((p) => p.completedAt!)
    ),
  ].sort().reverse();

  let currentStreakDays = 0;
  let longestStreakDays = 0;

  if (completedDates.length > 0) {
    // Calculate current streak from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);
    let streak = 0;

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (completedDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today might not have a session yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
    currentStreakDays = streak;

    // Calculate longest streak
    const sortedAsc = [...completedDates].sort();
    let tempStreak = 1;
    longestStreakDays = 1;
    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = new Date(sortedAsc[i - 1]);
      const curr = new Date(sortedAsc[i]);
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
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
    longestStreakDays,
  };
}

export function computeStreak(db: AppDatabase, userId: string) {
  const stats = computeStats(db, userId);
  const current = stats.currentStreakDays;

  let message: string;
  if (current === 0) {
    message = "Start a session today to begin your streak!";
  } else if (current < 3) {
    message = "You're building momentum. Keep it going!";
  } else if (current < 7) {
    message = "Great consistency this week!";
  } else {
    message = `Amazing! ${current} days in a row!`;
  }

  // Weekly activity (last 7 days, Monday-Sunday)
  const today = new Date();
  const weeklyActivity: boolean[] = [];

  const progress = db
    .select()
    .from(schema.userProgress)
    .where(
      and(
        eq(schema.userProgress.userId, userId),
        eq(schema.userProgress.status, "completed")
      )
    )
    .all();

  const completedDates = new Set(
    progress.filter((p) => p.completedAt).map((p) => p.completedAt!)
  );

  // Get last 7 days starting from today going back
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    weeklyActivity.push(completedDates.has(dateStr));
  }

  return { current, message, weeklyActivity };
}

export function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null;
  if (seconds < 60) return `${seconds} sec`;
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}

export function getRecentContentIds(db: AppDatabase, userId: string, limit = 5): string[] {
  const recent = db
    .select({ contentId: schema.userProgress.contentId })
    .from(schema.userProgress)
    .where(eq(schema.userProgress.userId, userId))
    .orderBy(desc(schema.userProgress.startedAt))
    .limit(limit)
    .all();
  return recent.map((r) => r.contentId);
}
