import SwiftUI

// MARK: - Content Types

enum ContentType: String, Codable, CaseIterable {
    case meditation
    case sleepStory = "sleep_story"
    case soundscape
    case breathwork
    case video
    case focusMusic = "focus_music"
    case reflect

    var displayName: String {
        switch self {
        case .meditation: return "Meditation"
        case .sleepStory: return "Sleep Story"
        case .soundscape: return "Soundscape"
        case .breathwork: return "Breathwork"
        case .video: return "Video"
        case .focusMusic: return "Focus Music"
        case .reflect: return "Reflect"
        }
    }
}

enum Difficulty: String, Codable {
    case beginner, intermediate, advanced
}

enum ProgressStatus: String, Codable {
    case notStarted = "not_started"
    case inProgress = "in_progress"
    case completed
}

enum CollectionType: String, Codable {
    case program, playlist, editorial, dailyPicks = "daily_picks"
}

enum MessageRole: String, Codable {
    case user, assistant
}

// MARK: - Core Entities

struct Instructor: Identifiable, Codable {
    let id: String
    let name: String
    let avatarUrl: String

    enum CodingKeys: String, CodingKey {
        case id, name
        case avatarUrl = "avatar_url"
    }
}

struct Content: Identifiable, Codable {
    let id: String
    let title: String
    let description: String?
    let type: ContentType
    let categoryId: String?
    let instructor: Instructor?
    let durationSeconds: Int?
    let thumbnailUrl: String?
    let audioUrl: String?
    let tags: [String]
    let isPremium: Bool
    let difficulty: Difficulty?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, title, description, type, instructor, tags, difficulty
        case categoryId = "category_id"
        case durationSeconds = "duration_seconds"
        case thumbnailUrl = "thumbnail_url"
        case audioUrl = "audio_url"
        case isPremium = "is_premium"
        case createdAt = "created_at"
    }

    var durationLabel: String {
        guard let seconds = durationSeconds else { return "" }
        let minutes = seconds / 60
        return minutes == 1 ? "1 min" : "\(minutes) min"
    }
}

struct Category: Identifiable, Codable {
    let id: String
    let name: String
    let slug: String?
    let icon: String
    let color: String
    let description: String?
    let contentCount: Int?
    let sortOrder: Int?

    enum CodingKeys: String, CodingKey {
        case id, name, slug, icon, color, description
        case contentCount = "content_count"
        case sortOrder = "sort_order"
    }

    var swiftColor: Color {
        Color(hex: color)
    }
}

struct ContentCollection: Identifiable, Codable {
    let id: String
    let title: String
    let description: String?
    let type: CollectionType?
    let thumbnailUrl: String?
    let gradientColors: [String]?
    let contentIds: [String]?
    let totalSessions: Int?
    let estimatedDailyMinutes: Int?
    let isPremium: Bool?

    enum CodingKeys: String, CodingKey {
        case id, title, description, type
        case thumbnailUrl = "thumbnail_url"
        case gradientColors = "gradient_colors"
        case contentIds = "content_ids"
        case totalSessions = "total_sessions"
        case estimatedDailyMinutes = "estimated_daily_minutes"
        case isPremium = "is_premium"
    }

    var gradient: LinearGradient {
        guard let colors = gradientColors, colors.count >= 2 else {
            return LinearGradient(colors: [.gray], startPoint: .leading, endPoint: .trailing)
        }
        return LinearGradient(
            colors: colors.map { Color(hex: $0) },
            startPoint: .leading,
            endPoint: .trailing
        )
    }
}

// MARK: - User

struct UserPreferences: Codable {
    let reminderTime: String?
    let preferredDuration: Int?
    let preferredTypes: [String]?
    let notificationsEnabled: Bool

    enum CodingKeys: String, CodingKey {
        case reminderTime = "reminder_time"
        case preferredDuration = "preferred_duration"
        case preferredTypes = "preferred_types"
        case notificationsEnabled = "notifications_enabled"
    }
}

struct Subscription: Codable {
    let plan: String
    let expiresAt: String

    enum CodingKeys: String, CodingKey {
        case plan
        case expiresAt = "expires_at"
    }
}

struct AppUser: Identifiable, Codable {
    let id: String
    let name: String
    let email: String?
    let avatarUrl: String?
    let joinedAt: String
    let preferences: UserPreferences?
    let subscription: Subscription?

    enum CodingKeys: String, CodingKey {
        case id, name, email, preferences, subscription
        case avatarUrl = "avatar_url"
        case joinedAt = "joined_at"
    }

    var joinedDateFormatted: String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: joinedAt) else { return "" }
        let display = DateFormatter()
        display.dateFormat = "MMMM yyyy"
        return "Joined in \(display.string(from: date))"
    }
}

struct UserProgress: Identifiable, Codable {
    let id: String
    let userId: String
    let contentId: String
    let status: ProgressStatus
    let progressSeconds: Int
    let completedAt: String?
    let startedAt: String?

    enum CodingKeys: String, CodingKey {
        case id, status
        case userId = "user_id"
        case contentId = "content_id"
        case progressSeconds = "progress_seconds"
        case completedAt = "completed_at"
        case startedAt = "started_at"
    }
}

struct UserStats: Codable {
    let totalSessions: Int
    let totalMinutes: Int
    let avgSessionMinutes: Int
    let currentStreakDays: Int
    let longestStreakDays: Int

    enum CodingKeys: String, CodingKey {
        case totalSessions = "total_sessions"
        case totalMinutes = "total_minutes"
        case avgSessionMinutes = "avg_session_minutes"
        case currentStreakDays = "current_streak_days"
        case longestStreakDays = "longest_streak_days"
    }
}

// MARK: - Today Tab

struct TodaySectionItem: Identifiable, Codable {
    var id: String { contentId }
    let contentId: String
    let title: String
    let type: String
    let subtitle: String?
    let durationLabel: String?
    let durationSeconds: Int?
    let progressSeconds: Int?
    let thumbnailUrl: String?
    let gradientColors: [String]?
    let icon: String?
    let instructorName: String?

    enum CodingKeys: String, CodingKey {
        case title, type, subtitle, icon
        case contentId = "content_id"
        case durationLabel = "duration_label"
        case durationSeconds = "duration_seconds"
        case progressSeconds = "progress_seconds"
        case thumbnailUrl = "thumbnail_url"
        case gradientColors = "gradient_colors"
        case instructorName = "instructor_name"
    }

    var gradient: LinearGradient {
        guard let colors = gradientColors, colors.count >= 2 else {
            return LinearGradient(colors: [.gray.opacity(0.3)], startPoint: .top, endPoint: .bottom)
        }
        return LinearGradient(
            colors: colors.map { Color(hex: $0) },
            startPoint: .top,
            endPoint: .bottom
        )
    }
}

struct TodaySection: Identifiable, Codable {
    let id: String
    let type: String
    let title: String
    let layout: String?
    let collectionId: String?
    let items: [TodaySectionItem]

    enum CodingKeys: String, CodingKey {
        case id, type, title, layout, items
        case collectionId = "collection_id"
    }
}

struct TodayData: Codable {
    let greeting: String
    let date: String
    let sections: [TodaySection]
}

// MARK: - Explore Tab

struct FeaturedCollection: Codable {
    let collectionId: String
    let title: String
    let description: String
    let thumbnailUrl: String?

    enum CodingKeys: String, CodingKey {
        case title, description
        case collectionId = "collection_id"
        case thumbnailUrl = "thumbnail_url"
    }
}

struct GuidedProgramSummary: Identifiable, Codable {
    var id: String { collectionId }
    let collectionId: String
    let title: String
    let totalSessions: Int
    let dailyMinutes: String
    let gradientColors: [String]

    enum CodingKeys: String, CodingKey {
        case title
        case collectionId = "collection_id"
        case totalSessions = "total_sessions"
        case dailyMinutes = "daily_minutes"
        case gradientColors = "gradient_colors"
    }

    var gradient: LinearGradient {
        LinearGradient(
            colors: gradientColors.map { Color(hex: $0) },
            startPoint: .leading,
            endPoint: .trailing
        )
    }
}

struct ExploreData: Codable {
    let categories: [Category]
    let featuredCollection: FeaturedCollection
    let guidedPrograms: [GuidedProgramSummary]

    enum CodingKeys: String, CodingKey {
        case categories
        case featuredCollection = "featured_collection"
        case guidedPrograms = "guided_programs"
    }
}

// MARK: - Sleep & Meditate Tab

struct SleepMeditateData: Codable {
    let sections: [TodaySection]
}

// MARK: - Luma (AI Assistant)

struct LumaAssistant: Codable {
    let name: String
    let avatarStyle: String
    let persona: String

    enum CodingKeys: String, CodingKey {
        case name, persona
        case avatarStyle = "avatar_style"
    }
}

struct ChatMessage: Identifiable, Codable {
    let id: String
    let role: MessageRole
    let text: String
    let timestamp: String
    var feedback: String?

    var isFromUser: Bool { role == .user }
}

struct Conversation: Identifiable, Codable {
    let id: String
    let userId: String
    var messages: [ChatMessage]

    enum CodingKeys: String, CodingKey {
        case id, messages
        case userId = "user_id"
    }
}

struct SuggestionPrompt: Identifiable, Codable {
    let id: String
    let text: String
}

struct LumaData: Codable {
    let assistant: LumaAssistant
    var conversation: Conversation
    let suggestions: [SuggestionPrompt]
}

// MARK: - Profile Tab

struct StreakData: Codable {
    let current: Int
    let message: String
    let weeklyActivity: [Bool]

    enum CodingKeys: String, CodingKey {
        case current, message
        case weeklyActivity = "weekly_activity"
    }
}

struct ProfileData: Codable {
    let user: AppUser
    let stats: UserStats
    let streak: StreakData
    let savedContentIds: [String]
    let recentContentIds: [String]

    enum CodingKeys: String, CodingKey {
        case user, stats, streak
        case savedContentIds = "saved_content_ids"
        case recentContentIds = "recent_content_ids"
    }
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255.0
        let g = Double((int >> 8) & 0xFF) / 255.0
        let b = Double(int & 0xFF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}
