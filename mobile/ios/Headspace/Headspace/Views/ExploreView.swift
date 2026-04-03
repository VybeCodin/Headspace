import SwiftUI

struct ExploreView: View {
    @Environment(DataService.self) private var dataService
    @State private var searchText = ""
    @State private var searchResults: [Content] = []
    @State private var isSearching = false
    @State private var selectedAudioItem: Content?
    @State private var selectedVideoItem: Content?

    var body: some View {
        NavigationStack {
            Group {
                if let data = dataService.exploreData {
                    ScrollView(showsIndicators: false) {
                        VStack(alignment: .leading, spacing: 24) {
                            searchBar

                            if searchText.isEmpty {
                                categoryGrid(data.categories)
                                if let featured = data.featuredCollection {
                                    featuredCollectionView(featured)
                                }
                                guidedProgramsSection(data.guidedPrograms)
                            } else if isSearching {
                                ProgressView()
                                    .frame(maxWidth: .infinity, minHeight: 100)
                            } else if searchResults.isEmpty {
                                VStack(spacing: 8) {
                                    Text("No results found")
                                        .font(.system(size: 17, weight: .semibold))
                                        .foregroundColor(HeadspaceTheme.primaryText)
                                    Text("Try a different search term")
                                        .font(.system(size: 14))
                                        .foregroundColor(HeadspaceTheme.secondaryText)
                                }
                                .frame(maxWidth: .infinity, minHeight: 200)
                            } else {
                                searchResultsList
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.top, 16)
                        .padding(.bottom, 40)
                    }
                } else if case .error(let msg) = dataService.exploreState {
                    ErrorStateView(message: msg, retry: dataService.retryExplore)
                } else {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
            .background(HeadspaceTheme.background.ignoresSafeArea())
            .task { await dataService.loadExplore() }
            .onChange(of: searchText) { _, query in
                Task { await performSearch(query) }
            }
            .fullScreenCover(item: $selectedAudioItem) { item in
                AudioPlayerView(item: item.asTodaySectionItem)
                    .environment(dataService)
            }
            .fullScreenCover(item: $selectedVideoItem) { item in
                VideoPlayerView(item: item.asTodaySectionItem)
                    .environment(dataService)
            }
        }
    }

    // MARK: - Search Bar
    private var searchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(HeadspaceTheme.secondaryText)
                .font(.system(size: 18))

            TextField("Search Headspace", text: $searchText)
                .font(.system(size: 16))
                .foregroundColor(HeadspaceTheme.primaryText)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(HeadspaceTheme.cardBackground)
        )
    }

    // MARK: - Search Results
    private var searchResultsList: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("\(searchResults.count) result\(searchResults.count == 1 ? "" : "s")")
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(HeadspaceTheme.secondaryText)

            ForEach(searchResults) { item in
                Button {
                    if item.type == .video {
                        selectedVideoItem = item
                    } else {
                        selectedAudioItem = item
                    }
                } label: {
                    searchResultRow(item)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private func searchResultRow(_ item: Content) -> some View {
        HStack(spacing: 14) {
            RoundedRectangle(cornerRadius: 10)
                .fill(item.asTodaySectionItem.gradient)
                .frame(width: 56, height: 56)
                .overlay(
                    Image(systemName: iconForType(item.type))
                        .font(.system(size: 20))
                        .foregroundColor(.white)
                )

            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(HeadspaceTheme.primaryText)
                    .lineLimit(1)

                HStack(spacing: 6) {
                    Text(item.type.displayName)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(HeadspaceTheme.orange)

                    if !item.durationLabel.isEmpty {
                        Text("·")
                            .foregroundColor(HeadspaceTheme.secondaryText)
                        Text(item.durationLabel)
                            .font(.system(size: 12))
                            .foregroundColor(HeadspaceTheme.secondaryText)
                    }

                    if let instructor = item.instructor {
                        Text("·")
                            .foregroundColor(HeadspaceTheme.secondaryText)
                        Text(instructor.name)
                            .font(.system(size: 12))
                            .foregroundColor(HeadspaceTheme.secondaryText)
                    }
                }
            }

            Spacer()

            Button {
                Task { await dataService.toggleFavorite(contentId: item.id) }
            } label: {
                Image(systemName: dataService.savedContentIds.contains(item.id) ? "heart.fill" : "heart")
                    .font(.system(size: 18))
                    .foregroundColor(dataService.savedContentIds.contains(item.id) ? .red : Color.gray.opacity(0.4))
            }

            Image(systemName: "play.circle.fill")
                .font(.system(size: 28))
                .foregroundColor(HeadspaceTheme.orange)
        }
        .padding(12)
        .background(RoundedRectangle(cornerRadius: 14).fill(Color.white))
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

    private func performSearch(_ query: String) async {
        let trimmed = query.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else {
            searchResults = []
            return
        }
        isSearching = true
        do {
            searchResults = try await dataService.searchContent(query: trimmed)
        } catch {
            searchResults = []
        }
        isSearching = false
    }

    // MARK: - Category Grid
    private func categoryGrid(_ categories: [Category]) -> some View {
        let filtered = categories.filter { !["Move", "Focus"].contains($0.name) }
        return LazyVGrid(columns: [
            GridItem(.flexible(), spacing: 12),
            GridItem(.flexible(), spacing: 12)
        ], spacing: 12) {
            ForEach(filtered) { category in
                NavigationLink {
                    CategoryDetailView(category: category)
                        .environment(dataService)
                } label: {
                    CategoryButton(category: category)
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Featured Collection
    private func featuredCollectionView(_ featured: FeaturedCollection) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Featured Collection")
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(HeadspaceTheme.primaryText)

            NavigationLink {
                CollectionDetailView(
                    collectionId: featured.collectionId,
                    collectionTitle: featured.title,
                    gradientColors: [HeadspaceTheme.orange, HeadspaceTheme.darkOrange]
                )
                .environment(dataService)
            } label: {
                FeaturedCard(
                    title: featured.title,
                    subtitle: featured.description
                )
            }
            .buttonStyle(.plain)
        }
    }

    // MARK: - Guided Programs
    private func guidedProgramsSection(_ programs: [GuidedProgramSummary]) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Guided Programs")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(HeadspaceTheme.primaryText)

                Text("A structured mix of mindfulness activities and practices used in therapy, proven to help you feel better.")
                    .font(.system(size: 15))
                    .foregroundColor(HeadspaceTheme.secondaryText)
                    .lineSpacing(3)
            }

            ForEach(programs) { program in
                NavigationLink {
                    CollectionDetailView(
                        collectionId: program.collectionId,
                        collectionTitle: program.title,
                        gradientColors: program.gradientColors.map { Color(hex: $0) }
                    )
                    .environment(dataService)
                } label: {
                    ProgramCard(program: program)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.top, 8)
        .padding(.bottom, 8)
    }
}

#Preview {
    ExploreView()
        .environment(DataService())
}
