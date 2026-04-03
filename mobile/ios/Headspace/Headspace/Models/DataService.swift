import SwiftUI

enum LoadingState {
    case idle
    case loading
    case loaded
    case error(String)
}

@MainActor
@Observable
final class DataService {

    // MARK: - Tab Data
    var todayData: TodayData?
    var exploreData: ExploreData?
    var lumaData: LumaData?
    var profileData: ProfileData?

    // MARK: - Loading States
    var todayState: LoadingState = .idle
    var exploreState: LoadingState = .idle
    var lumaState: LoadingState = .idle
    var profileState: LoadingState = .idle

    // MARK: - Content Store
    var contentStore: [String: Content] = [:]

    // MARK: - User Progress
    var progressByContentId: [String: UserProgress] = [:]

    private let api = APIClient.shared

    // MARK: - Lookups

    func content(for id: String) -> Content? {
        contentStore[id]
    }

    func userName() -> String {
        guard let name = profileData?.user.name else { return "You" }
        return name.components(separatedBy: " ").first ?? name
    }

    // MARK: - Content Detail

    func loadContent(id: String) async throws -> Content {
        if let cached = contentStore[id] { return cached }
        let content = try await api.fetchContent(id)
        contentStore[id] = content
        return content
    }

    func loadCategoryContent(categoryId: String) async throws -> [Content] {
        let items = try await api.fetchContentByCategory(categoryId)
        for item in items { contentStore[item.id] = item }
        return items
    }

    func loadCollection(id: String) async throws -> CollectionDetail {
        let detail = try await api.fetchCollection(id)
        for item in detail.items { contentStore[item.id] = item }
        return detail
    }

    // MARK: - Search

    private var allContent: [Content]?

    func searchContent(query: String) async throws -> [Content] {
        if allContent == nil {
            allContent = try await api.fetchAllContent()
            for item in allContent! { contentStore[item.id] = item }
        }
        let q = query.lowercased()
        return allContent!.filter { item in
            item.title.lowercased().contains(q)
            || (item.description?.lowercased().contains(q) ?? false)
            || item.type.displayName.lowercased().contains(q)
            || item.tags.contains(where: { $0.lowercased().contains(q) })
        }
    }

    // MARK: - User Progress

    func loadUserProgress() async {
        do {
            let progressList = try await api.fetchUserProgress()
            for p in progressList {
                progressByContentId[p.contentId] = p
            }
        } catch {
            // Silently fail — progress is supplementary
        }
    }

    func refreshUserProgress() async {
        progressByContentId = [:]
        await loadUserProgress()
    }

    func postProgress(contentId: String, progressSeconds: Int) async {
        do {
            let updated = try await api.postProgress(contentId: contentId, progressSeconds: progressSeconds)
            progressByContentId[updated.contentId] = updated
        } catch {
            // Silently fail
        }
    }

    // MARK: - Load Methods

    func loadToday() async {
        guard case .idle = todayState else { return }
        todayState = .loading
        do {
            todayData = try await api.fetchToday()
            todayState = .loaded
        } catch {
            todayState = .error(error.localizedDescription)
        }
    }

    func loadExplore() async {
        guard case .idle = exploreState else { return }
        exploreState = .loading
        do {
            exploreData = try await api.fetchExplore()
            exploreState = .loaded
        } catch {
            exploreState = .error(error.localizedDescription)
        }
    }

    func loadLuma() async {
        guard case .idle = lumaState else { return }
        lumaState = .loading
        do {
            lumaData = try await api.fetchLuma()
            lumaState = .loaded
        } catch {
            lumaState = .error(error.localizedDescription)
        }
    }

    func loadProfile() async {
        guard case .idle = profileState else { return }
        profileState = .loading
        do {
            profileData = try await api.fetchProfile()
            profileState = .loaded
        } catch {
            profileState = .error(error.localizedDescription)
        }
    }

    // MARK: - Retry

    func retryToday() async {
        todayState = .idle
        await loadToday()
    }

    func retryExplore() async {
        exploreState = .idle
        await loadExplore()
    }

    func retryLuma() async {
        lumaState = .idle
        await loadLuma()
    }

    func retryProfile() async {
        profileState = .idle
        await loadProfile()
    }

    // MARK: - Luma Actions

    func sendMessage(_ text: String) async {
        let userMsg = ChatMessage(
            id: "msg_\(UUID().uuidString.prefix(8))",
            role: .user,
            text: text,
            timestamp: ISO8601DateFormatter().string(from: Date()),
            feedback: nil
        )
        lumaData?.conversation?.messages.append(userMsg)

        do {
            let reply = try await api.sendLumaMessage(text)
            lumaData?.conversation?.messages.append(reply)
        } catch {
            // Remove the optimistic user message on failure
            lumaData?.conversation?.messages.removeAll { $0.id == userMsg.id }
        }
    }
}
