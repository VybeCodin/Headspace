import SwiftUI

// MARK: - Content Types

enum ContentType: String, Codable, CaseIterable {
    case meditation
    case sleepStory
    case soundscape
    case breathwork
    case video
    case focusMusic
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
    case notStarted
    case inProgress
    case completed
}

enum CollectionType: String, Codable {
    case program, playlist, editorial, dailyPicks
}

enum MessageRole: String, Codable {
    case user, assistant
}

// MARK: - Core Entities

struct Instructor: Identifiable, Codable {
    let id: String
    let name: String
    let avatarUrl: String
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

    var durationLabel: String {
        guard let seconds = durationSeconds else { return "" }
        let minutes = seconds / 60
        return minutes == 1 ? "1 min" : "\(minutes) min"
    }

    var asTodaySectionItem: TodaySectionItem {
        let typeGradients: [String: [String]] = [
            "meditation": ["#F47D20", "#FF9E50"],
            "breathwork": ["#7B2FBE", "#C86DD7"],
            "sleepStory": ["#2D3A8C", "#6E7BD4"],
            "soundscape": ["#1A6B54", "#3CB89C"],
            "reflect": ["#E85D75", "#F4A261"],
            "video": ["#0064DC", "#1E8CFF"],
            "focusMusic": ["#3C64C8", "#6E9EFF"],
        ]
        return TodaySectionItem(
            contentId: id, title: title, type: type.rawValue,
            subtitle: description, durationLabel: durationLabel,
            durationSeconds: durationSeconds, progressSeconds: nil,
            thumbnailUrl: thumbnailUrl,
            gradientColors: typeGradients[type.rawValue] ?? ["#F47D20", "#FF9E50"],
            icon: nil, instructorName: instructor?.name
        )
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

struct CollectionDetail: Identifiable, Codable {
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
    let items: [Content]

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
}

struct Subscription: Codable {
    let plan: String
    let expiresAt: String
}

struct AppUser: Identifiable, Codable {
    let id: String
    let name: String
    let email: String?
    let avatarUrl: String?
    let joinedAt: String
    let preferences: UserPreferences?
    let subscription: Subscription?

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
}

struct UserStats: Codable {
    let totalSessions: Int
    let totalMinutes: Int
    let avgSessionMinutes: Int
    let currentStreakDays: Int
    let longestStreakDays: Int
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
        case contentId = "id"
        case title, type, subtitle, durationLabel, durationSeconds
        case progressSeconds, thumbnailUrl, gradientColors, icon, instructorName
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
}

struct GuidedProgramSummary: Identifiable, Codable {
    var id: String { collectionId }
    let collectionId: String
    let title: String
    let totalSessions: Int
    let dailyMinutes: String
    let gradientColors: [String]

    enum CodingKeys: String, CodingKey {
        case collectionId = "id"
        case title, totalSessions, dailyMinutes, gradientColors
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
    let featuredCollection: FeaturedCollection?
    let guidedPrograms: [GuidedProgramSummary]
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
}

struct SuggestionPrompt: Identifiable, Codable {
    let id: String
    let text: String
}

struct LumaData: Codable {
    let assistant: LumaAssistant
    var conversation: Conversation?
    let suggestions: [SuggestionPrompt]
}

// MARK: - Profile Tab

struct StreakData: Codable {
    let current: Int
    let message: String
    let weeklyActivity: [Bool]
}

struct ProfileData: Codable {
    let user: AppUser
    let stats: UserStats
    let streak: StreakData
    let savedContentIds: [String]
    let recentContentIds: [String]
}

// MARK: - Saved Content

struct SavedItem: Codable {
    let userId: String
    let contentId: String
    let savedAt: String
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
