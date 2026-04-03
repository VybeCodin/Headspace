// Today Feed
export interface TodayItem {
  id: string;
  title: string;
  type: string;
  subtitle: string;
  durationLabel: string | null;
  durationSeconds?: number;
  progressSeconds?: number;
  gradientColors: [string, string];
}

export interface Section {
  id: string;
  type: string;
  title: string;
  layout?: string;
  items: TodayItem[];
}

export interface TodayData {
  greeting: string;
  date: string;
  sections: Section[];
}

// Explore
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string | null;
  contentCount: number;
  sortOrder: number;
}

export interface FeaturedCollection {
  collectionId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}

export interface GuidedProgram {
  id: string;
  title: string;
  totalSessions: number;
  dailyMinutes: string;
  gradientColors: [string, string];
}

export interface ExploreData {
  categories: Category[];
  featuredCollection: FeaturedCollection;
  guidedPrograms: GuidedProgram[];
}

// Content Detail
export interface Instructor {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  type: string;
  categoryId: string;
  instructor: Instructor | null;
  durationSeconds: number | null;
  thumbnailUrl: string | null;
  audioUrl: string;
  tags: string[];
  isPremium: boolean;
  difficulty: string | null;
  createdAt: string;
}

// Collection
export interface CollectionDetail {
  id: string;
  title: string;
  description: string;
  type: string;
  thumbnailUrl: string | null;
  gradientColors: [string, string];
  totalSessions: number;
  estimatedDailyMinutes: number;
  isPremium: boolean;
  contentIds: string[];
  items: Content[];
}

// Luma Chat
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  feedback: string | null;
}

export interface SuggestionPrompt {
  id: string;
  text: string;
}

export interface LumaAssistant {
  name: string;
  avatarStyle: string;
  persona: string;
}

export interface LumaData {
  assistant: LumaAssistant;
  conversation: {
    id: string;
    userId: string;
    messages: ChatMessage[];
  };
  suggestions: SuggestionPrompt[];
}

// Profile
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  joinedAt: string;
  preferences: {
    reminderTime: string;
    preferredDuration: number;
    preferredTypes: string[];
    notificationsEnabled: boolean;
  };
  subscription: {
    plan: string;
    expiresAt: string;
  };
}

export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  avgSessionMinutes: number;
  currentStreakDays: number;
  longestStreakDays: number;
}

export interface StreakData {
  current: number;
  message: string;
  weeklyActivity: boolean[];
}

export interface ProfileData {
  user: UserProfile;
  stats: UserStats;
  streak: StreakData;
  savedContentIds: string[];
  recentContentIds: string[];
}
