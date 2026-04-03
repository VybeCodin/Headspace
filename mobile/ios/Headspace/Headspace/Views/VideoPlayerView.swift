import SwiftUI
import AVKit

struct VideoPlayerView: View {
    let item: TodaySectionItem
    @Environment(DataService.self) private var dataService
    @Environment(\.dismiss) private var dismiss
    @State private var avPlayer: AVPlayer?
    @State private var loadError: String?
    @State private var isLoading = true

    private var bgGradient: LinearGradient {
        let colors: [Color] = if let hex = item.gradientColors, hex.count >= 2 {
            hex.map { Color(hex: $0) }
        } else {
            [Color(red: 0.0, green: 0.39, blue: 0.86), Color(red: 0.12, green: 0.55, blue: 1.0)]
        }
        return LinearGradient(
            colors: colors + [colors.last!.opacity(0.6)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    var body: some View {
        ZStack {
            bgGradient.ignoresSafeArea()

            VStack(spacing: 0) {
                // Top bar
                HStack {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundStyle(.white)
                            .frame(width: 32, height: 32)
                            .background(.ultraThinMaterial, in: Circle())
                    }
                    Spacer()
                    Text("NOW PLAYING")
                        .font(.system(size: 11, weight: .bold))
                        .tracking(1.5)
                        .foregroundStyle(.white.opacity(0.7))
                    Spacer()
                    Button {
                        Task { await dataService.toggleFavorite(contentId: item.contentId) }
                    } label: {
                        Image(systemName: dataService.savedContentIds.contains(item.contentId) ? "heart.fill" : "heart")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundStyle(dataService.savedContentIds.contains(item.contentId) ? .red : .white)
                            .frame(width: 32, height: 32)
                            .background(.ultraThinMaterial, in: Circle())
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 8)

                Spacer()

                if let error = loadError {
                    errorView(error)
                } else if isLoading {
                    loadingView
                } else if let avPlayer {
                    videoContent(player: avPlayer)
                }

                Spacer()
            }
        }
        .task { await loadAndPlay() }
        .onDisappear {
            avPlayer?.pause()
            avPlayer = nil
        }
    }

    // MARK: - Video Content

    private func videoContent(player: AVPlayer) -> some View {
        VStack(spacing: 24) {
            // Video player
            VideoPlayer(player: player)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .shadow(color: .black.opacity(0.3), radius: 20, y: 10)
                .aspectRatio(16/9, contentMode: .fit)
                .padding(.horizontal, 20)

            // Title + metadata
            VStack(spacing: 8) {
                Text(item.title)
                    .font(.system(size: 22, weight: .bold))
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
                    .shadow(color: .black.opacity(0.15), radius: 4, y: 2)

                if let subtitle = item.subtitle ?? item.instructorName {
                    Text(subtitle)
                        .font(.system(size: 14))
                        .foregroundStyle(.white.opacity(0.75))
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                }

                HStack(spacing: 12) {
                    Label(item.type.capitalized, systemImage: "play.rectangle.fill")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.9))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 5)
                        .background(Capsule().fill(.white.opacity(0.2)))

                    if let duration = item.durationLabel {
                        Label(duration, systemImage: "clock")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(.white.opacity(0.9))
                            .padding(.horizontal, 14)
                            .padding(.vertical, 5)
                            .background(Capsule().fill(.white.opacity(0.2)))
                    }
                }
                .padding(.top, 4)
            }
            .padding(.horizontal, 32)
        }
    }

    // MARK: - States

    private var loadingView: some View {
        VStack(spacing: 20) {
            ProgressView()
                .tint(.white)
                .scaleEffect(1.5)
            Text("Loading video...")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(.white.opacity(0.8))
        }
    }

    private func errorView(_ message: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 40))
                .foregroundStyle(.white.opacity(0.8))
            Text(message)
                .font(.system(size: 15))
                .foregroundStyle(.white.opacity(0.8))
                .multilineTextAlignment(.center)
            Button {
                loadError = nil
                isLoading = true
                Task { await loadAndPlay() }
            } label: {
                Text("Try Again")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 28)
                    .padding(.vertical, 12)
                    .background(Capsule().fill(.white.opacity(0.25)))
            }
        }
        .padding(.horizontal, 32)
    }

    // MARK: - Helpers

    private func loadAndPlay() async {
        do {
            let content = try await dataService.loadContent(id: item.contentId)
            guard let urlString = content.audioUrl, let url = URL(string: urlString) else {
                loadError = "No video available for this content"
                return
            }

            try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .moviePlayback)
            try? AVAudioSession.sharedInstance().setActive(true)

            let player = AVPlayer(url: url)
            self.avPlayer = player
            isLoading = false
            player.play()
        } catch {
            loadError = error.localizedDescription
        }
    }
}
