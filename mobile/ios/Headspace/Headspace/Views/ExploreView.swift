import SwiftUI

struct ExploreView: View {
    @Environment(DataService.self) private var dataService
    @State private var searchText = ""

    var body: some View {
        NavigationStack {
            Group {
                if let data = dataService.exploreData {
                    ScrollView(showsIndicators: false) {
                        VStack(alignment: .leading, spacing: 24) {
                            searchBar
                            categoryGrid(data.categories)
                            if let featured = data.featuredCollection {
                                featuredCollectionView(featured)
                            }
                            guidedProgramsSection(data.guidedPrograms)
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
            .background(HeadspaceTheme.background)
            .task { await dataService.loadExplore() }
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

    // MARK: - Category Grid
    private func categoryGrid(_ categories: [Category]) -> some View {
        LazyVGrid(columns: [
            GridItem(.flexible(), spacing: 12),
            GridItem(.flexible(), spacing: 12)
        ], spacing: 12) {
            ForEach(categories) { category in
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
        .padding(.horizontal, -20)
        .padding(.horizontal, 20)
        .background(
            Rectangle()
                .fill(HeadspaceTheme.sectionBackground)
                .padding(.horizontal, -20)
        )
    }
}

#Preview {
    ExploreView()
        .environment(DataService())
}
