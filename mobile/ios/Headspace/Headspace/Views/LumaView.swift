import SwiftUI

struct LumaView: View {
    @Environment(DataService.self) private var dataService
    @State private var messageText = ""

    var body: some View {
        ZStack {
            HeadspaceTheme.pinkGradient
                .ignoresSafeArea()

            VStack(spacing: 0) {
                topBar
                chatContent
                Spacer()
                bottomSection
            }
        }
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

            // Luma avatar (small)
            lumaAvatarSmall

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
    private var chatContent: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 16) {
                // Luma avatar large
                lumaAvatarLarge
                    .frame(maxWidth: .infinity)
                    .padding(.top, 8)

                // Messages from data
                ForEach(dataService.lumaData.conversation.messages) { message in
                    if message.isFromUser {
                        userBubble(message.text)
                    } else {
                        assistantBubble(message.text)
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
    private var bottomSection: some View {
        VStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Explore more with \(dataService.lumaData.assistant.name)")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(HeadspaceTheme.secondaryText)
                    .padding(.horizontal, 20)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(dataService.lumaData.suggestions) { suggestion in
                            SuggestionChip(text: suggestion.text) {
                                dataService.sendMessage(suggestion.text)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }

            inputBar
        }
        .padding(.bottom, 8)
        .background(
            Color.white
                .cornerRadius(24, corners: [.topLeft, .topRight])
                .ignoresSafeArea(edges: .bottom)
        )
    }

    private var inputBar: some View {
        HStack(spacing: 12) {
            TextField("Share your thoughts...", text: $messageText)
                .font(.system(size: 16))
                .foregroundColor(HeadspaceTheme.primaryText)

            Button(action: {
                guard !messageText.isEmpty else { return }
                dataService.sendMessage(messageText)
                messageText = ""
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
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
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
