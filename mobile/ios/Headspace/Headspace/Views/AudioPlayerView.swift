import SwiftUI

struct AudioPlayerView: View {
    let item: TodaySectionItem
    @Environment(DataService.self) private var dataService
    @Environment(\.dismiss) private var dismiss
    @State private var player = AudioPlayerService()
    @State private var loadError: String?

    private var bgGradient: LinearGradient {
        let colors: [Color] = if let hex = item.gradientColors, hex.count >= 2 {
            hex.map { Color(hex: $0) }
        } else {
            [Color(red: 0.48, green: 0.18, blue: 0.75), Color(red: 0.78, green: 0.43, blue: 0.84)]
        }
        return LinearGradient(
            colors: colors + [colors.last!.opacity(0.7)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    var body: some View {
        ZStack {
            // Rich background
            bgGradient.ignoresSafeArea()

            // Decorative circles
            Circle()
                .fill(Color.white.opacity(0.06))
                .frame(width: 400, height: 400)
                .offset(x: -100, y: -250)
            Circle()
                .fill(Color.white.opacity(0.05))
                .frame(width: 300, height: 300)
                .offset(x: 150, y: 300)

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
                    // Balance spacer
                    Color.clear.frame(width: 32, height: 32)
                }
                .padding(.horizontal, 20)
                .padding(.top, 8)

                Spacer()

                if let error = loadError ?? player.error {
                    errorView(error)
                } else if player.isLoading {
                    loadingView
                } else {
                    playerContent
                }

                Spacer()
            }
        }
        .task { await loadAndPlay() }
        .onDisappear {
            let seconds = Int(player.currentTime)
            player.cleanup()
            if seconds > 0 {
                Task {
                    await dataService.postProgress(contentId: item.contentId, progressSeconds: seconds)
                }
            }
        }
    }

    // MARK: - Player Content

    private var playerContent: some View {
        VStack(spacing: 36) {
            // Artwork area
            ZStack {
                // Outer glow ring
                Circle()
                    .fill(Color.white.opacity(0.08))
                    .frame(width: 200, height: 200)

                Circle()
                    .fill(Color.white.opacity(0.1))
                    .frame(width: 160, height: 160)

                // Inner artwork circle
                Circle()
                    .fill(.ultraThinMaterial)
                    .frame(width: 130, height: 130)
                    .overlay(
                        Image(systemName: "waveform")
                            .font(.system(size: 44, weight: .medium))
                            .foregroundStyle(.white)
                            .symbolEffect(.variableColor.iterative, options: .repeating, isActive: player.isPlaying)
                    )
                    .shadow(color: .black.opacity(0.2), radius: 20, y: 10)
            }

            // Title + metadata
            VStack(spacing: 8) {
                Text(item.title)
                    .font(.system(size: 24, weight: .bold))
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
                    .shadow(color: .black.opacity(0.15), radius: 4, y: 2)

                if let subtitle = item.subtitle ?? item.instructorName {
                    Text(subtitle)
                        .font(.system(size: 15))
                        .foregroundStyle(.white.opacity(0.75))
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                }

                Text(item.type.capitalized)
                    .font(.system(size: 12, weight: .semibold))
                    .tracking(0.5)
                    .foregroundStyle(.white.opacity(0.9))
                    .padding(.horizontal, 14)
                    .padding(.vertical, 5)
                    .background(Capsule().fill(.white.opacity(0.2)))
                    .padding(.top, 2)
            }
            .padding(.horizontal, 32)

            // Slider + times
            VStack(spacing: 6) {
                Slider(
                    value: Binding(
                        get: { player.currentTime },
                        set: { player.seek(to: $0) }
                    ),
                    in: 0...max(player.duration, 1)
                )
                .tint(.white)

                HStack {
                    Text(formatTime(player.currentTime))
                    Spacer()
                    Text("-\(formatTime(max(player.duration - player.currentTime, 0)))")
                }
                .font(.system(size: 12, weight: .medium, design: .monospaced))
                .foregroundStyle(.white.opacity(0.6))
            }
            .padding(.horizontal, 28)

            // Playback controls
            HStack(spacing: 44) {
                Button { player.seek(to: max(player.currentTime - 15, 0)) } label: {
                    Image(systemName: "gobackward.15")
                        .font(.system(size: 26, weight: .medium))
                        .foregroundStyle(.white.opacity(0.85))
                }

                Button { player.togglePlayPause() } label: {
                    ZStack {
                        Circle()
                            .fill(.white)
                            .frame(width: 72, height: 72)
                            .shadow(color: .black.opacity(0.15), radius: 10, y: 4)

                        Image(systemName: player.isPlaying ? "pause.fill" : "play.fill")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundStyle(Color(hex: item.gradientColors?.first ?? "#7B2FBE"))
                            .offset(x: player.isPlaying ? 0 : 2)
                    }
                }

                Button { player.seek(to: min(player.currentTime + 15, player.duration)) } label: {
                    Image(systemName: "goforward.15")
                        .font(.system(size: 26, weight: .medium))
                        .foregroundStyle(.white.opacity(0.85))
                }
            }
            .padding(.bottom, 8)
        }
    }

    // MARK: - States

    private var loadingView: some View {
        VStack(spacing: 20) {
            ProgressView()
                .tint(.white)
                .scaleEffect(1.5)
            Text("Preparing your session...")
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
                loadError = "No audio available for this content"
                return
            }
            player.load(url: url, startAt: Double(item.progressSeconds ?? 0))
        } catch {
            loadError = error.localizedDescription
        }
    }

    private func formatTime(_ seconds: Double) -> String {
        guard seconds.isFinite && seconds >= 0 else { return "0:00" }
        let mins = Int(seconds) / 60
        let secs = Int(seconds) % 60
        return String(format: "%d:%02d", mins, secs)
    }
}
