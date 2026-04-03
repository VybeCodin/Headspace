import Foundation

actor APIClient {
    static let shared = APIClient()

    private let baseURL = "https://headspace-api.vercel.app/api"
    private let userId = "usr_001"
    private let session: URLSession
    private let decoder: JSONDecoder

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 15
        self.session = URLSession(configuration: config)
        self.decoder = JSONDecoder()
    }

    // MARK: - Today

    func fetchToday() async throws -> TodayData {
        try await get("\(baseURL)/users/\(userId)/today")
    }

    // MARK: - Explore

    func fetchExplore() async throws -> ExploreData {
        try await get("\(baseURL)/explore")
    }

    // MARK: - Content

    func fetchContent(_ id: String) async throws -> Content {
        try await get("\(baseURL)/content/\(id)")
    }

    func fetchContentByCategory(_ categoryId: String) async throws -> [Content] {
        try await get("\(baseURL)/content?category=\(categoryId)")
    }

    func fetchAllContent() async throws -> [Content] {
        try await get("\(baseURL)/content")
    }

    // MARK: - Collections

    func fetchCollection(_ id: String) async throws -> CollectionDetail {
        try await get("\(baseURL)/collections/\(id)")
    }

    // MARK: - Progress

    func fetchUserProgress() async throws -> [UserProgress] {
        try await get("\(baseURL)/users/\(userId)/progress")
    }

    func postProgress(contentId: String, progressSeconds: Int) async throws -> UserProgress {
        try await post(
            "\(baseURL)/users/\(userId)/progress",
            body: ["contentId": contentId, "progressSeconds": progressSeconds]
        )
    }

    // MARK: - Luma

    func fetchLuma() async throws -> LumaData {
        try await get("\(baseURL)/users/\(userId)/luma")
    }

    func sendLumaMessage(_ text: String) async throws -> ChatMessage {
        try await post("\(baseURL)/users/\(userId)/luma/messages", body: ["text": text])
    }

    // MARK: - Profile

    func fetchProfile() async throws -> ProfileData {
        try await get("\(baseURL)/users/\(userId)/profile")
    }

    // MARK: - Generic Helpers

    private func get<T: Decodable>(_ urlString: String) async throws -> T {
        guard let url = URL(string: urlString) else {
            throw APIError.invalidURL
        }
        let (data, response) = try await session.data(from: url)
        try validate(response)
        return try decoder.decode(T.self, from: data)
    }

    private func post<T: Decodable>(_ urlString: String, body: [String: Any]) async throws -> T {
        guard let url = URL(string: urlString) else {
            throw APIError.invalidURL
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, response) = try await session.data(for: request)
        try validate(response)
        return try decoder.decode(T.self, from: data)
    }

    private func validate(_ response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        guard (200...299).contains(http.statusCode) else {
            throw APIError.httpError(http.statusCode)
        }
    }
}

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(Int)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .invalidResponse: return "Invalid response from server"
        case .httpError(let code): return "Server error (\(code))"
        }
    }
}
