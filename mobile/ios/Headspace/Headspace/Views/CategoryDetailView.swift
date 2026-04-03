import SwiftUI

struct CategoryDetailView: View {
    let category: Category
    @Environment(DataService.self) private var dataService
    @State private var items: [Content] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var selectedItem: Content?

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
                        // Category header
                        categoryHeader

                        // Content list
                        LazyVStack(spacing: 0) {
                            ForEach(items) { item in
                                Button { selectedItem = item } label: {
                                    contentRow(item)
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
        .task { await loadItems() }
        .fullScreenCover(item: $selectedItem) { item in
            VideoPlayerView(item: item.asTodaySectionItem)
                .environment(dataService)
        }
    }

    // MARK: - Header

    private var categoryHeader: some View {
        VStack(spacing: 16) {
            ZStack {
                LinearGradient(
                    colors: [category.swiftColor, category.swiftColor.opacity(0.6)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )

                // Decorative circles
                Circle()
                    .fill(Color.white.opacity(0.08))
                    .frame(width: 200, height: 200)
                    .offset(x: 100, y: -40)
                Circle()
                    .fill(Color.white.opacity(0.06))
                    .frame(width: 150, height: 150)
                    .offset(x: -80, y: 50)

                VStack(spacing: 8) {
                    Image(systemName: category.icon)
                        .font(.system(size: 36, weight: .medium))
                        .foregroundStyle(.white)
                    Text(category.name)
                        .font(.system(size: 28, weight: .bold))
                        .foregroundStyle(.white)
                    if let desc = category.description {
                        Text(desc)
                            .font(.system(size: 14))
                            .foregroundStyle(.white.opacity(0.8))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                    Text("\(items.count) sessions")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(.white.opacity(0.7))
                        .padding(.top, 2)
                }
                .padding(.vertical, 32)
            }
            .frame(height: 200)
            .clipShape(RoundedRectangle(cornerRadius: 0))
        }
    }

    // MARK: - Content Row

    private func contentRow(_ item: Content) -> some View {
        HStack(spacing: 14) {
            // Thumbnail
            RoundedRectangle(cornerRadius: 10)
                .fill(
                    LinearGradient(
                        colors: [category.swiftColor.opacity(0.3), category.swiftColor.opacity(0.15)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 56, height: 56)
                .overlay(
                    Image(systemName: iconForType(item.type))
                        .font(.system(size: 20))
                        .foregroundStyle(category.swiftColor)
                )

            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(HeadspaceTheme.primaryText)
                    .lineLimit(1)

                HStack(spacing: 6) {
                    Text(item.type.rawValue.capitalized)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(category.swiftColor)

                    if !item.durationLabel.isEmpty {
                        Text("·")
                            .foregroundStyle(HeadspaceTheme.secondaryText)
                        Text(item.durationLabel)
                            .font(.system(size: 12))
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
                .font(.system(size: 28))
                .foregroundStyle(category.swiftColor)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
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
