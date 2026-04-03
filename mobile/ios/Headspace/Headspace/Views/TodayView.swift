import SwiftUI

struct TodayView: View {
    @Environment(DataService.self) private var dataService
    @State private var selectedFilter = 0
    @State private var selectedItem: TodaySectionItem?
    @State private var selectedVideoItem: TodaySectionItem?
    private let filters = ["Recents", "Favorites"]

    var body: some View {
        Group {
            if let data = dataService.todayData {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        skyHeader

                        VStack(alignment: .leading, spacing: 24) {
                            // Greeting
                            Text(data.greeting)
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(HeadspaceTheme.primaryText)
                                .padding(.top, 16)

                            filterPills

                            // Dynamic sections from data
                            ForEach(data.sections) { section in
                                sectionView(for: section)
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 40)
                    }
                }
                .ignoresSafeArea(edges: .top)
            } else if case .error(let msg) = dataService.todayState {
                ErrorStateView(message: msg, retry: dataService.retryToday)
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .background(HeadspaceTheme.background)
        .task { await dataService.loadToday() }
        .fullScreenCover(item: $selectedItem) { item in
            AudioPlayerView(item: item)
                .environment(dataService)
        }
        .fullScreenCover(item: $selectedVideoItem) { item in
            VideoPlayerView(item: item)
                .environment(dataService)
        }
    }

    // MARK: - Section Router
    @ViewBuilder
    private func sectionView(for section: TodaySection) -> some View {
        switch section.type {
        case "continue_listening":
            continueListeningSection(section)
        case "daily_essentials":
            dailyEssentialsSection(section)
        case "editorial":
            editorialSection(section)
        default:
            genericSection(section)
        }
    }

    // MARK: - Continue Listening
    private func continueListeningSection(_ section: TodaySection) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            if let item = section.items.first {
                Button {
                    selectedItem = item
                } label: {
                    HStack(spacing: 12) {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(
                                LinearGradient(
                                    colors: [.purple.opacity(0.3), .pink.opacity(0.3)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 80, height: 80)
                            .overlay(
                                Circle()
                                    .fill(.purple.opacity(0.5))
                                    .frame(width: 30, height: 30)
                            )

                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.title)
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(HeadspaceTheme.primaryText)
                                .lineLimit(1)
                            HStack(spacing: 4) {
                                Image(systemName: "play.fill")
                                    .font(.system(size: 10))
                                Text("\(item.subtitle ?? item.type) • \(item.durationLabel ?? "")")
                                    .font(.system(size: 13))
                            }
                            .foregroundColor(HeadspaceTheme.secondaryText)

                            // Progress bar
                            if let progress = item.progressSeconds, let total = item.durationSeconds, total > 0 {
                                GeometryReader { geo in
                                    ZStack(alignment: .leading) {
                                        Capsule().fill(Color.gray.opacity(0.2))
                                        Capsule().fill(HeadspaceTheme.orange)
                                            .frame(width: geo.size.width * CGFloat(progress) / CGFloat(total))
                                    }
                                }
                                .frame(height: 4)
                            }
                        }

                        Spacer()
                    }
                    .padding(12)
                    .background(RoundedRectangle(cornerRadius: 16).fill(Color.white))
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Daily Essentials
    private func dailyEssentialsSection(_ section: TodaySection) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(section.title)
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(HeadspaceTheme.primaryText)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(section.items) { item in
                        Button { selectedVideoItem = item } label: {
                            DailyEssentialCard(item: item)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    // MARK: - Editorial (two column)
    private func editorialSection(_ section: TodaySection) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(section.title)
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(HeadspaceTheme.primaryText)

            HStack(spacing: 12) {
                ForEach(section.items) { item in
                    Button { selectedVideoItem = item } label: {
                        EditorialCard(item: item)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: - Generic fallback
    private func genericSection(_ section: TodaySection) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(section.title)
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(HeadspaceTheme.primaryText)

            ForEach(section.items) { item in
                Text(item.title)
                    .font(.system(size: 15))
                    .foregroundColor(HeadspaceTheme.primaryText)
            }
        }
    }

    // MARK: - Sky Header
    private var skyHeader: some View {
        ZStack {
            HeadspaceTheme.skyGradient
                .frame(height: 200)

            VStack {
                Spacer()
                HStack(spacing: 0) {
                    cloudShape.offset(x: -20, y: 20)
                    Spacer()
                    cloudShape.offset(x: 20, y: 10)
                }
                HStack {
                    cloudShape.scaleEffect(1.5).offset(y: 30)
                    Spacer()
                    cloudShape.scaleEffect(1.3).offset(y: 25)
                    Spacer()
                    cloudShape.scaleEffect(1.2).offset(y: 35)
                }
            }
            .frame(height: 200)

            VStack {
                Spacer()
                HStack(spacing: -30) {
                    pinkCloud
                    pinkCloud.scaleEffect(x: 1.2, y: 1)
                    pinkCloud
                    pinkCloud.scaleEffect(x: 1.3, y: 1)
                }
                .offset(y: 20)
            }
            .frame(height: 200)

            VStack {
                Image(systemName: "sparkle")
                    .font(.system(size: 28, weight: .medium))
                    .foregroundColor(.white)
                    .padding(.top, 80)
                Spacer()
            }
            .frame(height: 200)
        }
    }

    private var cloudShape: some View {
        Ellipse()
            .fill(Color.white.opacity(0.9))
            .frame(width: 80, height: 40)
    }

    private var pinkCloud: some View {
        Ellipse()
            .fill(Color(red: 1, green: 0.78, blue: 0.86).opacity(0.8))
            .frame(width: 120, height: 50)
    }

    // MARK: - Filter Pills
    private var filterPills: some View {
        HStack(spacing: 8) {
            ForEach(0..<filters.count, id: \.self) { index in
                Button(action: { selectedFilter = index }) {
                    Text(filters[index])
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(selectedFilter == index ? HeadspaceTheme.primaryText : HeadspaceTheme.secondaryText)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(
                            Capsule()
                                .fill(selectedFilter == index ? Color.white : Color.clear)
                                .shadow(color: selectedFilter == index ? Color.black.opacity(0.05) : .clear, radius: 2, y: 1)
                        )
                }
            }
            Spacer()
        }
    }
}

// MARK: - Editorial Card
struct EditorialCard: View {
    let item: TodaySectionItem

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            RoundedRectangle(cornerRadius: 12)
                .fill(item.gradient)
                .frame(height: 120)
                .overlay(
                    Image(systemName: "person.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.white.opacity(0.5))
                )

            Text(item.title)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(HeadspaceTheme.primaryText)
                .lineLimit(2)

            if let duration = item.durationLabel {
                HStack(spacing: 4) {
                    Image(systemName: "play.fill")
                        .font(.system(size: 10))
                    Text("\(item.type.capitalized) • \(duration)")
                        .font(.system(size: 13))
                }
                .foregroundColor(HeadspaceTheme.secondaryText)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(RoundedRectangle(cornerRadius: 16).fill(Color.white))
    }
}

#Preview {
    TodayView()
        .environment(DataService())
}
