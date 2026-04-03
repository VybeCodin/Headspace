import SwiftUI

@Observable
final class DataService {

    // MARK: - Tab Data
    var todayData: TodayData
    var exploreData: ExploreData
    var sleepMeditateData: SleepMeditateData
    var lumaData: LumaData
    var profileData: ProfileData

    // MARK: - Content Store (all content by ID for lookups)
    var contentStore: [String: Content]

    init() {
        // Build the content store
        let allContent = Self.buildContentStore()
        self.contentStore = Dictionary(uniqueKeysWithValues: allContent.map { ($0.id, $0) })

        // Initialize each tab
        self.todayData = Self.buildTodayData()
        self.exploreData = Self.buildExploreData()
        self.sleepMeditateData = Self.buildSleepMeditateData()
        self.lumaData = Self.buildLumaData()
        self.profileData = Self.buildProfileData()
    }

    // MARK: - Lookups

    func content(for id: String) -> Content? {
        contentStore[id]
    }

    func userName() -> String {
        profileData.user.name.components(separatedBy: " ").first ?? profileData.user.name
    }

    // MARK: - Luma Actions

    func sendMessage(_ text: String) {
        let msg = ChatMessage(
            id: "msg_\(UUID().uuidString.prefix(8))",
            role: .user,
            text: text,
            timestamp: ISO8601DateFormatter().string(from: Date()),
            feedback: nil
        )
        lumaData.conversation.messages.append(msg)
    }

    // MARK: - Dummy Data Builders

    private static func buildContentStore() -> [Content] {
        [
            Content(id: "cnt_001", title: "Finding Calm in Chaos",
                    description: "A 10-minute guided meditation to help you find stillness when life feels overwhelming.",
                    type: .meditation, categoryId: "cat_stress",
                    instructor: Instructor(id: "ins_001", name: "Sarah Mitchell", avatarUrl: "https://cdn.app.com/instructors/sarah.jpg"),
                    durationSeconds: 600, thumbnailUrl: "https://cdn.app.com/thumbs/cnt_001.jpg",
                    audioUrl: "https://cdn.app.com/audio/cnt_001.mp3",
                    tags: ["stress", "beginner", "guided", "morning"], isPremium: false, difficulty: .beginner, createdAt: "2026-03-15T10:00:00Z"),

            Content(id: "cnt_012", title: "Treat Yourself to 5 Gentle Breaths",
                    description: "A quick breathwork exercise.",
                    type: .breathwork, categoryId: "cat_meditate", instructor: nil,
                    durationSeconds: 60, thumbnailUrl: "https://cdn.app.com/thumbs/cnt_012.jpg",
                    audioUrl: nil, tags: ["breathwork", "quick"], isPremium: false, difficulty: .beginner, createdAt: nil),

            Content(id: "cnt_020", title: "How's your day so far?",
                    description: "Check in and stay grounded.",
                    type: .reflect, categoryId: "cat_meditate", instructor: nil,
                    durationSeconds: nil, thumbnailUrl: nil, audioUrl: nil,
                    tags: ["reflect", "daily"], isPremium: false, difficulty: nil, createdAt: nil),

            Content(id: "cnt_021", title: "Choice",
                    description: "Today's meditation.",
                    type: .meditation, categoryId: "cat_meditate", instructor: nil,
                    durationSeconds: 1200, thumbnailUrl: nil, audioUrl: nil,
                    tags: ["meditation", "daily"], isPremium: false, difficulty: .beginner, createdAt: nil),

            Content(id: "cnt_022", title: "Slow Down",
                    description: "The Walk — a calming sleep story.",
                    type: .sleepStory, categoryId: "cat_sleep", instructor: nil,
                    durationSeconds: 420, thumbnailUrl: nil, audioUrl: nil,
                    tags: ["sleep", "story"], isPremium: false, difficulty: nil, createdAt: nil),

            Content(id: "cnt_030", title: "Appreciation of Everyday Life",
                    description: "A short video on finding beauty in the ordinary.",
                    type: .video, categoryId: "cat_meditate", instructor: nil,
                    durationSeconds: 60, thumbnailUrl: "https://cdn.app.com/thumbs/cnt_030.jpg",
                    audioUrl: nil, tags: ["video", "gratitude"], isPremium: false, difficulty: nil, createdAt: nil),

            Content(id: "cnt_031", title: "Cultivating Hope for the Future",
                    description: "A video about building optimism.",
                    type: .video, categoryId: "cat_meditate", instructor: nil,
                    durationSeconds: 240, thumbnailUrl: "https://cdn.app.com/thumbs/cnt_031.jpg",
                    audioUrl: nil, tags: ["video", "hope"], isPremium: false, difficulty: nil, createdAt: nil),

            Content(id: "cnt_040", title: "Rain on a Tin Roof",
                    description: "Drift off to the sound of rain.",
                    type: .soundscape, categoryId: "cat_sleep", instructor: nil,
                    durationSeconds: 2700, thumbnailUrl: "https://cdn.app.com/thumbs/cnt_040.jpg",
                    audioUrl: nil, tags: ["sleep", "rain", "soundscape"], isPremium: false, difficulty: nil, createdAt: nil),

            Content(id: "cnt_041", title: "The Cottage Garden",
                    description: "A bedtime story set in a peaceful garden.",
                    type: .sleepStory, categoryId: "cat_sleep",
                    instructor: Instructor(id: "ins_002", name: "James Porter", avatarUrl: ""),
                    durationSeconds: 1800, thumbnailUrl: "https://cdn.app.com/thumbs/cnt_041.jpg",
                    audioUrl: nil, tags: ["sleep", "story"], isPremium: true, difficulty: nil, createdAt: nil),

            Content(id: "cnt_050", title: "Ocean Waves",
                    description: "Looping ocean soundscape.", type: .soundscape, categoryId: "cat_sleep",
                    instructor: nil, durationSeconds: nil, thumbnailUrl: nil, audioUrl: nil,
                    tags: ["soundscape", "loop"], isPremium: false, difficulty: nil, createdAt: nil),

            Content(id: "cnt_051", title: "Forest Night",
                    description: "Looping forest soundscape.", type: .soundscape, categoryId: "cat_sleep",
                    instructor: nil, durationSeconds: nil, thumbnailUrl: nil, audioUrl: nil,
                    tags: ["soundscape", "loop"], isPremium: false, difficulty: nil, createdAt: nil),

            Content(id: "cnt_052", title: "Gentle Rain",
                    description: "Looping rain soundscape.", type: .soundscape, categoryId: "cat_sleep",
                    instructor: nil, durationSeconds: nil, thumbnailUrl: nil, audioUrl: nil,
                    tags: ["soundscape", "loop"], isPremium: false, difficulty: nil, createdAt: nil),

            Content(id: "cnt_060", title: "Body Scan for Sleep",
                    description: "A guided body scan meditation.", type: .meditation, categoryId: "cat_sleep",
                    instructor: nil, durationSeconds: 900, thumbnailUrl: nil, audioUrl: nil,
                    tags: ["sleep", "body-scan"], isPremium: false, difficulty: .beginner, createdAt: nil),

            Content(id: "cnt_061", title: "Letting Go of the Day",
                    description: "Breathwork to release tension.", type: .breathwork, categoryId: "cat_sleep",
                    instructor: nil, durationSeconds: 300, thumbnailUrl: nil, audioUrl: nil,
                    tags: ["sleep", "breathwork"], isPremium: false, difficulty: .beginner, createdAt: nil),
        ]
    }

    private static func buildTodayData() -> TodayData {
        TodayData(
            greeting: "Good morning, Samuel",
            date: "2026-04-03",
            sections: [
                TodaySection(id: "sec_continue", type: "continue_listening", title: "Pick up where you left off", layout: nil, collectionId: nil, items: [
                    TodaySectionItem(contentId: "cnt_012", title: "Treat Yourself to 5 Gentle Breaths", type: "breathwork",
                                     subtitle: "Mindful Activity", durationLabel: "1 min", durationSeconds: 60, progressSeconds: 30,
                                     thumbnailUrl: "https://cdn.app.com/thumbs/cnt_012.jpg", gradientColors: nil, icon: nil, instructorName: nil)
                ]),
                TodaySection(id: "sec_daily", type: "daily_essentials", title: "Daily essentials", layout: "horizontal_scroll", collectionId: nil, items: [
                    TodaySectionItem(contentId: "cnt_020", title: "How's your day so far?", type: "reflect",
                                     subtitle: "Check in and stay grounded.", durationLabel: nil, durationSeconds: nil, progressSeconds: nil,
                                     thumbnailUrl: nil, gradientColors: ["#FFB450", "#FF9664"], icon: "sparkles", instructorName: nil),
                    TodaySectionItem(contentId: "cnt_021", title: "Choice", type: "meditation",
                                     subtitle: "Today's Meditation", durationLabel: "3-20 min", durationSeconds: nil, progressSeconds: nil,
                                     thumbnailUrl: nil, gradientColors: ["#FFDC64", "#FFC850"], icon: "face.smiling", instructorName: nil),
                    TodaySectionItem(contentId: "cnt_022", title: "Slow Down", type: "sleep_story",
                                     subtitle: "The Walk", durationLabel: "3-7 min", durationSeconds: nil, progressSeconds: nil,
                                     thumbnailUrl: nil, gradientColors: ["#FF8C32", "#E05A28"], icon: "leaf.fill", instructorName: nil),
                ]),
                TodaySection(id: "sec_spring", type: "editorial", title: "Your spring reset", layout: "two_column", collectionId: nil, items: [
                    TodaySectionItem(contentId: "cnt_030", title: "Appreciation of Everyday Life", type: "video",
                                     subtitle: nil, durationLabel: "1 min", durationSeconds: 60, progressSeconds: nil,
                                     thumbnailUrl: "https://cdn.app.com/thumbs/cnt_030.jpg", gradientColors: nil, icon: nil, instructorName: nil),
                    TodaySectionItem(contentId: "cnt_031", title: "Cultivating Hope for the Future", type: "video",
                                     subtitle: nil, durationLabel: "4 min", durationSeconds: 240, progressSeconds: nil,
                                     thumbnailUrl: "https://cdn.app.com/thumbs/cnt_031.jpg", gradientColors: nil, icon: nil, instructorName: nil),
                ]),
            ]
        )
    }

    private static func buildExploreData() -> ExploreData {
        ExploreData(
            categories: [
                Category(id: "cat_meditate", name: "Meditate", slug: "meditate", icon: "circle.fill", color: "#F47D20", description: nil, contentCount: nil, sortOrder: 1),
                Category(id: "cat_sleep", name: "Sleep", slug: "sleep", icon: "moon.fill", color: "#8264C8", description: nil, contentCount: nil, sortOrder: 2),
                Category(id: "cat_move", name: "Move", slug: "move", icon: "forward.fill", color: "#00A050", description: nil, contentCount: nil, sortOrder: 3),
                Category(id: "cat_focus", name: "Focus", slug: "focus", icon: "music.note", color: "#3C64C8", description: nil, contentCount: nil, sortOrder: 4),
            ],
            featuredCollection: FeaturedCollection(
                collectionId: "col_010",
                title: "Self-Care for Parents",
                description: "You deserve a minute. Take a brief moment for yourself.",
                thumbnailUrl: "https://cdn.app.com/collections/parents.jpg"
            ),
            guidedPrograms: [
                GuidedProgramSummary(collectionId: "col_001", title: "CBT for Anxiety & Depression",
                                     totalSessions: 21, dailyMinutes: "<10 min a day", gradientColors: ["#FF6496", "#FF9664"]),
                GuidedProgramSummary(collectionId: "col_002", title: "Finding Your Best Sleep",
                                     totalSessions: 18, dailyMinutes: "<10 min a day", gradientColors: ["#0064DC", "#1E8CFF"]),
            ]
        )
    }

    private static func buildSleepMeditateData() -> SleepMeditateData {
        SleepMeditateData(sections: [
            TodaySection(id: "sec_tonight", type: "tonight_picks", title: "Tonight's picks", layout: nil, collectionId: nil, items: [
                TodaySectionItem(contentId: "cnt_040", title: "Rain on a Tin Roof", type: "soundscape",
                                 subtitle: nil, durationLabel: "45 min", durationSeconds: 2700, progressSeconds: nil,
                                 thumbnailUrl: "https://cdn.app.com/thumbs/cnt_040.jpg", gradientColors: nil, icon: nil, instructorName: nil),
                TodaySectionItem(contentId: "cnt_041", title: "The Cottage Garden", type: "sleep_story",
                                 subtitle: nil, durationLabel: "30 min", durationSeconds: 1800, progressSeconds: nil,
                                 thumbnailUrl: "https://cdn.app.com/thumbs/cnt_041.jpg", gradientColors: nil, icon: nil, instructorName: "James Porter"),
            ]),
            TodaySection(id: "sec_sounds", type: "soundscapes", title: "Background sounds", layout: nil, collectionId: nil, items: [
                TodaySectionItem(contentId: "cnt_050", title: "Ocean Waves", type: "soundscape",
                                 subtitle: nil, durationLabel: "Loop", durationSeconds: nil, progressSeconds: nil,
                                 thumbnailUrl: nil, gradientColors: nil, icon: "water.waves", instructorName: nil),
                TodaySectionItem(contentId: "cnt_051", title: "Forest Night", type: "soundscape",
                                 subtitle: nil, durationLabel: "Loop", durationSeconds: nil, progressSeconds: nil,
                                 thumbnailUrl: nil, gradientColors: nil, icon: "leaf.fill", instructorName: nil),
                TodaySectionItem(contentId: "cnt_052", title: "Gentle Rain", type: "soundscape",
                                 subtitle: nil, durationLabel: "Loop", durationSeconds: nil, progressSeconds: nil,
                                 thumbnailUrl: nil, gradientColors: nil, icon: "cloud.rain", instructorName: nil),
            ]),
            TodaySection(id: "sec_wind_down", type: "collection", title: "Wind down routines", layout: nil, collectionId: "col_020", items: [
                TodaySectionItem(contentId: "cnt_060", title: "Body Scan for Sleep", type: "meditation",
                                 subtitle: nil, durationLabel: "15 min", durationSeconds: 900, progressSeconds: nil,
                                 thumbnailUrl: nil, gradientColors: nil, icon: nil, instructorName: nil),
                TodaySectionItem(contentId: "cnt_061", title: "Letting Go of the Day", type: "breathwork",
                                 subtitle: nil, durationLabel: "5 min", durationSeconds: 300, progressSeconds: nil,
                                 thumbnailUrl: nil, gradientColors: nil, icon: nil, instructorName: nil),
            ]),
        ])
    }

    private static func buildLumaData() -> LumaData {
        LumaData(
            assistant: LumaAssistant(name: "Luma", avatarStyle: "warm_gradient", persona: "calm, supportive, mindfulness-focused"),
            conversation: Conversation(id: "conv_001", userId: "usr_001", messages: [
                ChatMessage(id: "msg_001", role: .assistant,
                            text: "Hey Samuel! Looking for some calm tonight? I noticed you enjoy rain sounds and sleepcasts.",
                            timestamp: "2026-04-03T21:30:00Z", feedback: nil)
            ]),
            suggestions: [
                SuggestionPrompt(id: "sug_001", text: "I'm feeling overwhelmed"),
                SuggestionPrompt(id: "sug_002", text: "Help me fall asleep"),
                SuggestionPrompt(id: "sug_003", text: "Prepare for a conversation"),
                SuggestionPrompt(id: "sug_004", text: "I need a quick break"),
            ]
        )
    }

    private static func buildProfileData() -> ProfileData {
        ProfileData(
            user: AppUser(
                id: "usr_001", name: "Samuel East", email: "samuel@example.com",
                avatarUrl: "https://cdn.app.com/avatars/usr_001.jpg",
                joinedAt: "2021-09-14T00:00:00Z",
                preferences: UserPreferences(reminderTime: "07:30", preferredDuration: 10,
                                             preferredTypes: ["meditation", "sleep_story"], notificationsEnabled: true),
                subscription: Subscription(plan: "premium", expiresAt: "2026-12-01T00:00:00Z")
            ),
            stats: UserStats(totalSessions: 96, totalMinutes: 5399, avgSessionMinutes: 56, currentStreakDays: 0, longestStreakDays: 14),
            streak: StreakData(current: 0, message: "Consistency is key. Come back to your practice at times that feel good for you.", weeklyActivity: [false, true, true, false, false, false, false]),
            savedContentIds: ["cnt_001", "cnt_012", "cnt_040"],
            recentContentIds: ["cnt_012", "cnt_030", "cnt_021"]
        )
    }
}
