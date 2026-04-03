import SwiftUI

struct CategoryDetailView: View {
    let category: Category
    @Environment(DataService.self) private var dataService
    @State private var items: [Content] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var selectedItem: Content?
    @State private var selectedVideoItem: Content?

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
                        Task { await loadItems() }
                    }
                }
            } else {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        categoryHeader

                        LazyVStack(spacing: 12) {
                            ForEach(items) { item in
                                Button {
                                    if item.type == .video {
                                        selectedVideoItem = item
                                    } else {
                                        selectedItem = item
                                    }
                                } label: {
                                    contentRow(item)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.top, 20)
                        .padding(.bottom, 40)
                    }
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadItems() }
        .fullScreenCover(item: $selectedItem) { item in
            AudioPlayerView(item: item.asTodaySectionItem)
                .environment(dataService)
        }
        .fullScreenCover(item: $selectedVideoItem) { item in
            VideoPlayerView(item: item.asTodaySectionItem)
                .environment(dataService)
        }
    }

    // MARK: - Header

    private var categoryHeader: some View {
        ZStack {
            LinearGradient(
                colors: [category.swiftColor, category.swiftColor.opacity(0.6)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            // Decorative circles
            Circle()
                .fill(Color.white.opacity(0.1))
                .frame(width: 240, height: 240)
                .offset(x: 120, y: -60)
            Circle()
                .fill(Color.white.opacity(0.08))
                .frame(width: 180, height: 180)
                .offset(x: -100, y: 60)
            Circle()
                .fill(Color.white.opacity(0.05))
                .frame(width: 120, height: 120)
                .offset(x: 60, y: 80)

            VStack(spacing: 12) {
                Image(systemName: category.icon)
                    .font(.system(size: 40, weight: .medium))
                    .foregroundStyle(.white)
                    .frame(width: 72, height: 72)
                    .background(
                        Circle()
                            .fill(Color.white.opacity(0.2))
                    )

                Text(category.name)
                    .font(.system(size: 30, weight: .bold))
                    .foregroundStyle(.white)

                if let desc = category.description {
                    Text(desc)
                        .font(.system(size: 15))
                        .foregroundStyle(.white.opacity(0.85))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                }

                Text("\(items.count) sessions")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 6)
                    .background(
                        Capsule()
                            .fill(Color.white.opacity(0.2))
                    )
                    .padding(.top, 4)
            }
            .padding(.vertical, 36)
        }
        .frame(height: 260)
        .clipShape(
            UnevenRoundedRectangle(
                bottomLeadingRadius: 28,
                bottomTrailingRadius: 28
            )
        )
    }

    // MARK: - Content Row

    private func contentRow(_ item: Content) -> some View {
        HStack(spacing: 14) {
            RoundedRectangle(cornerRadius: 12)
                .fill(
                    LinearGradient(
                        colors: [category.swiftColor.opacity(0.2), category.swiftColor.opacity(0.1)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 52, height: 52)
                .overlay(
                    Image(systemName: iconForType(item.type))
                        .font(.system(size: 20, weight: .medium))
                        .foregroundStyle(category.swiftColor)
                )

            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(HeadspaceTheme.primaryText)
                    .lineLimit(1)

                HStack(spacing: 5) {
                    if !item.durationLabel.isEmpty {
                        Text(item.durationLabel)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(HeadspaceTheme.secondaryText)
                    }

                    if let instructor = item.instructor {
                        Text("·")
                            .foregroundStyle(HeadspaceTheme.secondaryText)
                        Text(instructor.name)
                            .font(.system(size: 12))
                            .foregroundStyle(HeadspaceTheme.secondaryText)
                    }
                }
            }

            Spacer()

            Image(systemName: "play.circle.fill")
                .font(.system(size: 32))
                .foregroundStyle(category.swiftColor)
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white)
                .shadow(color: Color.black.opacity(0.04), radius: 8, y: 2)
        )
    }

    // MARK: - Helpers

    private func loadItems() async {
        do {
            items = try await dataService.loadCategoryContent(categoryId: category.id)
            isLoading = false
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
        }
    }

    private func iconForType(_ type: ContentType) -> String {
        switch type {
        case .meditation: return "brain.head.profile"
        case .breathwork: return "wind"
        case .sleepStory: return "moon.stars"
        case .soundscape: return "waveform"
        case .video: return "play.rectangle"
        case .focusMusic: return "music.note"
        case .reflect: return "sparkles"
        }
    }
}
