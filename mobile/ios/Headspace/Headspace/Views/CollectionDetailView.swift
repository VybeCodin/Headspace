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
    @State private var selectedVideoItem: Content?
    @State private var expandedLevels: Set<Int> = [0]

    private var bgGradient: LinearGradient {
        LinearGradient(
            colors: gradientColors.isEmpty
                ? [Color(red: 0.0, green: 0.39, blue: 0.86), Color(red: 0.12, green: 0.55, blue: 1.0)]
                : gradientColors,
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    // MARK: - Level Computation

    private struct Level {
        let index: Int
        let name: String
        let items: [Content]
    }

    private var levels: [Level] {
        guard let detail else { return [] }
        let items = detail.items
        let count = items.count
        let levelNames = ["Learn", "Practice", "Master"]

        if count <= 5 {
            return [Level(index: 0, name: levelNames[0], items: items)]
        } else if count <= 10 {
            let mid = count / 2
            return [
                Level(index: 0, name: levelNames[0], items: Array(items[..<mid])),
                Level(index: 1, name: levelNames[1], items: Array(items[mid...]))
            ]
        } else {
            let third = count / 3
            let twoThirds = third * 2
            return [
                Level(index: 0, name: levelNames[0], items: Array(items[..<third])),
                Level(index: 1, name: levelNames[1], items: Array(items[third..<twoThirds])),
                Level(index: 2, name: levelNames[2], items: Array(items[twoThirds...]))
            ]
        }
    }

    // MARK: - Session State

    private enum SessionState {
        case completed, current, locked
    }

    private var firstIncompleteId: String? {
        guard let detail else { return nil }
        return detail.items.first { dataService.progressByContentId[$0.id]?.status != .completed }?.id
    }

    private func sessionState(for item: Content, inLevel levelIndex: Int) -> SessionState {
        if dataService.progressByContentId[item.id]?.status == .completed {
            return .completed
        }
        if item.id == firstIncompleteId {
            return .current
        }
        return .locked
    }

    private func isLevelLocked(_ levelIndex: Int) -> Bool {
        guard levelIndex > 0 else { return false }
        let previousLevel = levels[levelIndex - 1]
        return previousLevel.items.contains { dataService.progressByContentId[$0.id]?.status != .completed }
    }

    private var completedCount: Int {
        guard let detail else { return 0 }
        return detail.items.filter { dataService.progressByContentId[$0.id]?.status == .completed }.count
    }

    private var nextSession: Content? {
        guard let id = firstIncompleteId, let detail else { return nil }
        return detail.items.first { $0.id == id }
    }

    // MARK: - Body

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack(alignment: .topLeading) {
            HeadspaceTheme.background.ignoresSafeArea()

            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
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
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let detail {
                ZStack(alignment: .bottom) {
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 0) {
                            heroHeader(detail)

                            VStack(spacing: 12) {
                                ForEach(levels, id: \.index) { level in
                                    levelSection(level)
                                }
                            }
                            .padding(.horizontal, 16)
                            .padding(.top, 16)
                            .padding(.bottom, nextSession != nil ? 100 : 24)
                        }
                    }
                    .ignoresSafeArea(edges: .top)

                    if let next = nextSession {
                        nextSessionButton(next)
                    }
                }
            }

            // Custom back button
            Button { dismiss() } label: {
                Circle()
                    .fill(Color.black.opacity(0.3))
                    .frame(width: 40, height: 40)
                    .overlay(
                        Image(systemName: "chevron.left")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                    )
            }
            .padding(.top, 54)
            .padding(.leading, 16)
        }
        .navigationBarHidden(true)
        .task {
            await loadDetail()
            await dataService.loadUserProgress()
        }
        .fullScreenCover(item: $selectedItem) { item in
            AudioPlayerView(item: item.asTodaySectionItem)
                .environment(dataService)
        }
        .fullScreenCover(item: $selectedVideoItem) { item in
            VideoPlayerView(item: item.asTodaySectionItem)
                .environment(dataService)
        }
        .onChange(of: selectedItem?.id) { old, new in
            if old != nil && new == nil {
                Task { await dataService.refreshUserProgress() }
            }
        }
        .onChange(of: selectedVideoItem?.id) { old, new in
            if old != nil && new == nil {
                Task { await dataService.refreshUserProgress() }
            }
        }
    }

    // MARK: - Hero Header

    private func heroHeader(_ detail: CollectionDetail) -> some View {
        ZStack {
            bgGradient

            Circle()
                .fill(Color.white.opacity(0.08))
                .frame(width: 260, height: 260)
                .offset(x: 120, y: -40)
            Circle()
                .fill(Color.white.opacity(0.06))
                .frame(width: 180, height: 180)
                .offset(x: -100, y: 50)
            Circle()
                .fill(Color.white.opacity(0.04))
                .frame(width: 120, height: 120)
                .offset(x: 60, y: 80)

            VStack(spacing: 12) {
                Text("COURSE")
                    .font(.system(size: 11, weight: .bold))
                    .tracking(2)
                    .foregroundStyle(.white.opacity(0.7))

                if let daily = detail.estimatedDailyMinutes, daily > 0 {
                    Text("\(daily) min/day")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(.white.opacity(0.6))
                }

                Text(detail.title)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)

                if let desc = detail.description {
                    Text(desc)
                        .font(.system(size: 14))
                        .foregroundStyle(.white.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .lineLimit(3)
                        .padding(.horizontal, 32)
                }

                let total = detail.items.count
                if total > 0 {
                    HStack(spacing: 6) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 12))
                        Text("\(completedCount)/\(total) sessions completed")
                            .font(.system(size: 13, weight: .semibold))
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Capsule().fill(.white.opacity(0.2)))
                    .padding(.top, 4)
                }
            }
            .padding(.top, 100)
            .padding(.bottom, 36)
        }
        .clipShape(
            UnevenRoundedRectangle(
                topLeadingRadius: 0,
                bottomLeadingRadius: 24,
                bottomTrailingRadius: 24,
                topTrailingRadius: 0
            )
        )
    }

    // MARK: - Level Section

    private func levelSection(_ level: Level) -> some View {
        let locked = isLevelLocked(level.index)
        let isExpanded = expandedLevels.contains(level.index) && !locked
        let completedInLevel = level.items.filter { dataService.progressByContentId[$0.id]?.status == .completed }.count

        return VStack(spacing: 0) {
            // Level header
            Button {
                if !locked {
                    withAnimation(.easeInOut(duration: 0.25)) {
                        if expandedLevels.contains(level.index) {
                            expandedLevels.remove(level.index)
                        } else {
                            expandedLevels.insert(level.index)
                        }
                    }
                }
            } label: {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Level \(level.index + 1)")
                            .font(.system(size: 11, weight: .bold))
                            .tracking(1)
                            .foregroundStyle(locked ? HeadspaceTheme.secondaryText : gradientColors.first ?? .blue)

                        Text(level.name)
                            .font(.system(size: 17, weight: .bold))
                            .foregroundStyle(locked ? HeadspaceTheme.secondaryText : HeadspaceTheme.primaryText)
                    }

                    Spacer()

                    Text("\(completedInLevel)/\(level.items.count)")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(HeadspaceTheme.secondaryText)

                    if locked {
                        Image(systemName: "lock.fill")
                            .font(.system(size: 14))
                            .foregroundStyle(HeadspaceTheme.secondaryText)
                    } else {
                        Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(HeadspaceTheme.secondaryText)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
            }
            .buttonStyle(.plain)

            // Session circles grid
            if isExpanded {
                let globalOffset = globalIndex(for: level)
                sessionCirclesGrid(items: level.items, levelIndex: level.index, globalOffset: globalOffset)
                    .padding(.horizontal, 12)
                    .padding(.bottom, 16)
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(HeadspaceTheme.cardBackground)
        )
    }

    private func globalIndex(for level: Level) -> Int {
        var offset = 0
        for l in levels {
            if l.index == level.index { break }
            offset += l.items.count
        }
        return offset
    }

    // MARK: - Session Circles Grid

    private func sessionCirclesGrid(items: [Content], levelIndex: Int, globalOffset: Int) -> some View {
        let columns = Array(repeating: GridItem(.flexible(), spacing: 8), count: 5)

        return LazyVGrid(columns: columns, spacing: 16) {
            ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                let state = sessionState(for: item, inLevel: levelIndex)
                let number = globalOffset + index + 1

                sessionCircle(item: item, state: state, number: number)
            }
        }
    }

    private func sessionCircle(item: Content, state: SessionState, number: Int) -> some View {
        Button {
            guard state != .locked else { return }
            if item.type == .video {
                selectedVideoItem = item
            } else {
                selectedItem = item
            }
        } label: {
            VStack(spacing: 6) {
                ZStack {
                    switch state {
                    case .completed:
                        Circle()
                            .fill(Color(red: 0.2, green: 0.78, blue: 0.4))
                            .frame(width: 48, height: 48)
                        Image(systemName: "checkmark")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundStyle(.white)

                    case .current:
                        Circle()
                            .fill(bgGradient)
                            .frame(width: 48, height: 48)
                            .shadow(color: (gradientColors.first ?? .blue).opacity(0.4), radius: 6, y: 2)
                        Image(systemName: "play.fill")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundStyle(.white)
                            .offset(x: 1)

                    case .locked:
                        Circle()
                            .fill(Color.gray.opacity(0.2))
                            .frame(width: 48, height: 48)
                        Image(systemName: "lock.fill")
                            .font(.system(size: 14))
                            .foregroundStyle(Color.gray.opacity(0.5))
                    }
                }

                Text("\(number)")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(
                        state == .locked
                            ? Color.gray.opacity(0.5)
                            : HeadspaceTheme.secondaryText
                    )
            }
        }
        .buttonStyle(.plain)
        .allowsHitTesting(state != .locked)
    }

    // MARK: - Next Session Button

    private func nextSessionButton(_ item: Content) -> some View {
        Button {
            if item.type == .video {
                selectedVideoItem = item
            } else {
                selectedItem = item
            }
        } label: {
            HStack(spacing: 10) {
                Image(systemName: "play.fill")
                    .font(.system(size: 14, weight: .bold))
                Text("Next session")
                    .font(.system(size: 16, weight: .bold))
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(bgGradient, in: RoundedRectangle(cornerRadius: 16))
            .shadow(color: (gradientColors.first ?? .blue).opacity(0.35), radius: 12, y: 4)
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 16)
        .background(
            LinearGradient(
                colors: [HeadspaceTheme.background.opacity(0), HeadspaceTheme.background],
                startPoint: .top,
                endPoint: .init(x: 0.5, y: 0.3)
            )
            .ignoresSafeArea()
        )
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
