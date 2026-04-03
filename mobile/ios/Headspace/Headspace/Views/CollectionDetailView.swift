import SwiftUI

struct CollectionDetailView: View {
    let collectionId: String
    let collectionTitle: String
    let gradientColors: [Color]

    @Environment(DataService.self) private var dataService
    @State private var detail: CollectionDetail?
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var selectedItem: Content?

    var bgGradient: LinearGradient {
        LinearGradient(
            colors: gradientColors.isEmpty
                ? [Color(red: 0.0, green: 0.39, blue: 0.86), Color(red: 0.12, green: 0.55, blue: 1.0)]
                : gradientColors,
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    var body: some View {
        ZStack {
            HeadspaceTheme.background.ignoresSafeArea()

            if isLoading {
                ProgressView()
            } else if let error = errorMessage {
                VStack(spacing: 12) {
                    Text(error)
                        .foregroundStyle(HeadspaceTheme.secondaryText)
                    Button("Retry") {
                        isLoading = true
                        errorMessage = nil
                        Task { await loadDetail() }
                    }
                }
            } else if let detail {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        collectionHeader(detail)

                        LazyVStack(spacing: 0) {
                            ForEach(Array(detail.items.enumerated()), id: \.element.id) { index, item in
                                Button { selectedItem = item } label: {
                                    sessionRow(item, number: index + 1)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.top, 8)
                    }
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadDetail() }
        .fullScreenCover(item: $selectedItem) { item in
            VideoPlayerView(item: item.asTodaySectionItem)
                .environment(dataService)
        }
    }

    // MARK: - Header

    private func collectionHeader(_ detail: CollectionDetail) -> some View {
        ZStack {
            bgGradient

            // Decorative elements
            Circle()
                .fill(Color.white.opacity(0.08))
                .frame(width: 220, height: 220)
                .offset(x: 110, y: -30)
            Circle()
                .fill(Color.white.opacity(0.06))
                .frame(width: 160, height: 160)
                .offset(x: -90, y: 60)

            VStack(spacing: 10) {
                Image(systemName: "books.vertical")
                    .font(.system(size: 32, weight: .medium))
                    .foregroundStyle(.white)

                Text(detail.title)
                    .font(.system(size: 26, weight: .bold))
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)

                if let desc = detail.description {
                    Text(desc)
                        .font(.system(size: 14))
                        .foregroundStyle(.white.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .lineLimit(3)
                        .padding(.horizontal, 32)
                }

                HStack(spacing: 16) {
                    if let sessions = detail.totalSessions, sessions > 0 {
                        Label("\(sessions) sessions", systemImage: "list.bullet")
                    }
                    if let daily = detail.estimatedDailyMinutes, daily > 0 {
                        Label("<\(daily) min/day", systemImage: "clock")
                    }
                }
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(.white.opacity(0.7))
                .padding(.top, 4)
            }
            .padding(.vertical, 32)
        }
        .frame(height: 240)
    }

    // MARK: - Session Row

    private func sessionRow(_ item: Content, number: Int) -> some View {
        HStack(spacing: 14) {
            // Session number
            Text("\(number)")
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .frame(width: 32, height: 32)
                .background(
                    Circle().fill(
                        LinearGradient(
                            colors: gradientColors.isEmpty ? [.blue, .blue.opacity(0.7)] : gradientColors,
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                )

            VStack(alignment: .leading, spacing: 3) {
                Text(item.title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(HeadspaceTheme.primaryText)
                    .lineLimit(1)

                HStack(spacing: 6) {
                    Text(item.type.rawValue.capitalized)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(gradientColors.first ?? .blue)

                    if !item.durationLabel.isEmpty {
                        Text("·")
                            .foregroundStyle(HeadspaceTheme.secondaryText)
                        Text(item.durationLabel)
                            .font(.system(size: 12))
                            .foregroundStyle(HeadspaceTheme.secondaryText)
                    }
                }
            }

            Spacer()

            Image(systemName: "play.circle.fill")
                .font(.system(size: 28))
                .foregroundStyle(gradientColors.first ?? .blue)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
    }

    // MARK: - Helpers

    private func loadDetail() async {
        do {
            detail = try await dataService.loadCollection(id: collectionId)
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }
}
