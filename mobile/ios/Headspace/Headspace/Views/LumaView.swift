import SwiftUI

struct LumaView: View {
    @Environment(DataService.self) private var dataService
    @State private var messageText = ""

    var body: some View {
        Group {
            if let data = dataService.lumaData {
                ZStack {
                    HeadspaceTheme.pinkGradient
                        .ignoresSafeArea()

                    VStack(spacing: 0) {
                        topBar
                        chatContent(data)
                        Spacer()
                        bottomSection(data)
                    }
                }
            } else if case .error(let msg) = dataService.lumaState {
                ErrorStateView(message: msg, retry: dataService.retryLuma)
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .task { await dataService.loadLuma() }
    }

    // MARK: - Top Bar
    private var topBar: some View {
        HStack {
            Button(action: {}) {
                Circle()
                    .fill(Color.white.opacity(0.8))
                    .frame(width: 44, height: 44)
                    .overlay(
                        Image(systemName: "ellipsis")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(HeadspaceTheme.primaryText)
                    )
            }

            Spacer()

            Text("Luma")
                .font(.system(size: 17, weight: .bold))
                .foregroundColor(HeadspaceTheme.primaryText)

            Spacer()

            Button(action: {}) {
                Circle()
                    .fill(Color.white.opacity(0.8))
                    .frame(width: 44, height: 44)
                    .overlay(
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(HeadspaceTheme.primaryText)
                    )
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 8)
    }

    private var lumaAvatarSmall: some View {
        Circle()
            .fill(
                RadialGradient(
                    colors: [
                        Color(red: 1, green: 0.71, blue: 0.2),
                        HeadspaceTheme.orange
                    ],
                    center: .center,
                    startRadius: 0,
                    endRadius: 20
                )
            )
            .frame(width: 40, height: 40)
            .overlay(
                Text("~~")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white.opacity(0.8))
            )
    }

    // MARK: - Chat Content
    private func chatContent(_ data: LumaData) -> some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 16) {
                // Luma avatar large
                lumaAvatarLarge
                    .frame(maxWidth: .infinity)
                    .padding(.top, 8)

                // Messages from data
                if let conversation = data.conversation {
                    ForEach(conversation.messages) { message in
                        if message.isFromUser {
                            userBubble(message.text)
                        } else {
                            assistantBubble(message.text)
                        }
                    }
                }

                Spacer(minLength: 200)
            }
            .padding(.horizontal, 20)
        }
    }

    private var lumaAvatarLarge: some View {
        Circle()
            .fill(
                RadialGradient(
                    colors: [
                        Color(red: 1, green: 0.78, blue: 0.39),
                        HeadspaceTheme.orange,
                        Color(red: 1, green: 0.59, blue: 0.39)
                    ],
                    center: .center,
                    startRadius: 5,
                    endRadius: 35
                )
            )
            .frame(width: 70, height: 70)
            .overlay(
                Text("~~~")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white.opacity(0.7))
            )
    }

    // MARK: - Message Bubbles
    private func assistantBubble(_ text: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(text)
                .font(.system(size: 17))
                .foregroundColor(HeadspaceTheme.primaryText)
                .lineSpacing(4)

            HStack(spacing: 16) {
                Button(action: {}) {
                    Image(systemName: "hand.thumbsup")
                        .font(.system(size: 18))
                        .foregroundColor(HeadspaceTheme.secondaryText)
                }
                Button(action: {}) {
                    Image(systemName: "hand.thumbsdown")
                        .font(.system(size: 18))
                        .foregroundColor(HeadspaceTheme.secondaryText)
                }
            }
        }
    }

    private func userBubble(_ text: String) -> some View {
        HStack {
            Spacer()
            Text(text)
                .font(.system(size: 16))
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(HeadspaceTheme.primaryText)
                )
        }
    }

    // MARK: - Bottom Section
    private func bottomSection(_ data: LumaData) -> some View {
        VStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Explore more with \(data.assistant.name)")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(HeadspaceTheme.secondaryText)
                    .padding(.horizontal, 20)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(data.suggestions) { suggestion in
                            SuggestionChip(text: suggestion.text) {
                                Task { await dataService.sendMessage(suggestion.text) }
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }

            inputBar
        }
        .padding(.bottom, 16)
        .background(
            HeadspaceTheme.background
                .cornerRadius(24, corners: [.topLeft, .topRight])
        )
    }

    private var inputBar: some View {
        HStack(spacing: 12) {
            TextField("Share your thoughts...", text: $messageText, prompt: Text("Share your thoughts...").foregroundColor(HeadspaceTheme.secondaryText))
                .font(.system(size: 16))
                .foregroundColor(HeadspaceTheme.primaryText)

            Button(action: {
                guard !messageText.isEmpty else { return }
                let text = messageText
                messageText = ""
                Task { await dataService.sendMessage(text) }
            }) {
                HStack(spacing: 6) {
                    Image(systemName: "waveform")
                        .font(.system(size: 14, weight: .semibold))
                    Text("Talk")
                        .font(.system(size: 15, weight: .semibold))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(Capsule().fill(HeadspaceTheme.primaryText))
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 28)
                .stroke(Color.gray.opacity(0.25), lineWidth: 1)
                .background(RoundedRectangle(cornerRadius: 28).fill(HeadspaceTheme.cardBackground))
        )
        .padding(.horizontal, 16)
    }
}

// MARK: - Corner Radius Extension
extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

#Preview {
    LumaView()
        .environment(DataService())
}
