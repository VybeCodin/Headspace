import SwiftUI

struct ExploreView: View {
    @Environment(DataService.self) private var dataService
    @State private var searchText = ""

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                searchBar
                categoryGrid
                featuredCollection
                guidedProgramsSection
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            .padding(.bottom, 40)
        }
        .background(HeadspaceTheme.background)
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
    private var categoryGrid: some View {
        LazyVGrid(columns: [
            GridItem(.flexible(), spacing: 12),
            GridItem(.flexible(), spacing: 12)
        ], spacing: 12) {
            ForEach(dataService.exploreData.categories) { category in
                CategoryButton(category: category)
            }
        }
    }

    // MARK: - Featured Collection
    private var featuredCollection: some View {
        let featured = dataService.exploreData.featuredCollection
        return VStack(alignment: .leading, spacing: 12) {
            Text("Featured Collection")
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(HeadspaceTheme.primaryText)

            FeaturedCard(
                title: featured.title,
                subtitle: featured.description
            )
        }
    }

    // MARK: - Guided Programs
    private var guidedProgramsSection: some View {
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

            ForEach(dataService.exploreData.guidedPrograms) { program in
                ProgramCard(program: program)
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
