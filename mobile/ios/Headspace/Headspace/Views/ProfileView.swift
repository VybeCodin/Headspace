import SwiftUI

struct ProfileView: View {
    @Environment(DataService.self) private var dataService

    private var profile: ProfileData { dataService.profileData }
    private var stats: UserStats { profile.stats }
    private var user: AppUser { profile.user }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                profileHeader
                VStack(alignment: .leading, spacing: 24) {
                    statsSection
                    streakSection
                    progressSection
                }
                .padding(.horizontal, 20)
                .padding(.top, 24)
                .padding(.bottom, 40)
            }
        }
        .background(HeadspaceTheme.background)
        .ignoresSafeArea(edges: .top)
    }

    // MARK: - Profile Header
    private var profileHeader: some View {
        ZStack(alignment: .topTrailing) {
            HeadspaceTheme.orangeGradient
                .frame(height: 260)

            VStack(spacing: 8) {
                Spacer().frame(height: 60)

                ZStack {
                    Circle()
                        .fill(Color.gray.opacity(0.4))
                        .frame(width: 100, height: 100)
                    VStack(spacing: 2) {
                        HStack(spacing: 16) {
                            Capsule().fill(Color.white.opacity(0.7)).frame(width: 20, height: 3).rotationEffect(.degrees(-10))
                            Capsule().fill(Color.white.opacity(0.7)).frame(width: 20, height: 3).rotationEffect(.degrees(10))
                        }
                        Image(systemName: "mouth")
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.5))
                    }
                    Ellipse()
                        .fill(Color(red: 0.9, green: 0.78, blue: 0.24))
                        .frame(width: 80, height: 40)
                        .offset(y: -40)
                        .rotationEffect(.degrees(-5))
                }

                Text(user.name)
                    .font(.system(size: 26, weight: .bold))
                    .foregroundColor(.white)

                Text(user.joinedDateFormatted)
                    .font(.system(size: 15))
                    .foregroundColor(.white.opacity(0.8))

                Spacer().frame(height: 16)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 260)

            Button(action: {}) {
                Circle()
                    .fill(Color.white)
                    .frame(width: 44, height: 44)
                    .overlay(
                        Image(systemName: "gearshape")
                            .font(.system(size: 18))
                            .foregroundColor(HeadspaceTheme.primaryText)
                    )
            }
            .padding(.top, 60)
            .padding(.trailing, 20)
        }
    }

    // MARK: - Stats Section
    private var statsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Stats")
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(HeadspaceTheme.primaryText)

            VStack(spacing: 0) {
                StatsRow(
                    icon: "square.fill",
                    iconColor: HeadspaceTheme.orange,
                    value: "\(stats.avgSessionMinutes) minutes",
                    label: "Average session length"
                )
                Divider().padding(.horizontal, 16)
                StatsRow(
                    icon: "moon.fill",
                    iconColor: HeadspaceTheme.focusBlue,
                    value: "\(formatNumber(stats.totalMinutes)) minutes",
                    label: "Total session time"
                )
                Divider().padding(.horizontal, 16)
                StatsRow(
                    icon: "diamond.fill",
                    iconColor: HeadspaceTheme.moveGreen,
                    value: "\(stats.totalSessions) sessions",
                    label: "Sessions completed"
                )
            }
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(HeadspaceTheme.cardBackground)
            )
        }
    }

    // MARK: - Streak Section
    private var streakSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Run Streak")
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(HeadspaceTheme.primaryText)

            HStack(spacing: 16) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(
                            LinearGradient(
                                colors: [.mint.opacity(0.3), .pink.opacity(0.2), .yellow.opacity(0.3)],
                                startPoint: .topLeading, endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 80, height: 80)
                    Image(systemName: "diamond.fill")
                        .font(.system(size: 30))
                        .foregroundStyle(
                            LinearGradient(colors: [.mint, .teal], startPoint: .top, endPoint: .bottom)
                        )
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(profile.streak.message)
                        .font(.system(size: 15))
                        .foregroundColor(HeadspaceTheme.secondaryText)
                        .lineSpacing(3)
                }

                Spacer()

                Button(action: {}) {
                    Image(systemName: "eye.circle")
                        .font(.system(size: 24))
                        .foregroundColor(HeadspaceTheme.primaryText)
                }
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 16).fill(HeadspaceTheme.cardBackground)
            )

            // Weekly activity dots
            HStack(spacing: 8) {
                ForEach(0..<profile.streak.weeklyActivity.count, id: \.self) { i in
                    let active = profile.streak.weeklyActivity[i]
                    Circle()
                        .fill(active ? HeadspaceTheme.orange : Color.gray.opacity(0.2))
                        .frame(width: 12, height: 12)
                }
                Spacer()
            }
            .padding(.horizontal, 4)
        }
    }

    // MARK: - Progress Section
    private var progressSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("My Progress")
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(HeadspaceTheme.primaryText)

            RoundedRectangle(cornerRadius: 16)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "#FFC832"), Color(hex: "#FFB41E")],
                        startPoint: .leading, endPoint: .trailing
                    )
                )
                .frame(height: 160)
                .overlay(
                    ZStack {
                        WavyLines()
                            .stroke(Color.orange.opacity(0.4), lineWidth: 3)
                        Circle()
                            .fill(HeadspaceTheme.orange)
                            .frame(width: 50, height: 50)
                            .overlay(
                                Text("(~)")
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundColor(.white)
                            )
                    }
                )
                .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }

    private func formatNumber(_ number: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        return formatter.string(from: NSNumber(value: number)) ?? "\(number)"
    }
}

struct WavyLines: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let width = rect.width
        let height = rect.height
        for i in 0..<3 {
            let yOffset = height * 0.3 + CGFloat(i) * 25
            path.move(to: CGPoint(x: 0, y: yOffset))
            path.addCurve(
                to: CGPoint(x: width, y: yOffset + 10),
                control1: CGPoint(x: width * 0.3, y: yOffset - 20),
                control2: CGPoint(x: width * 0.7, y: yOffset + 30)
            )
        }
        return path
    }
}

#Preview {
    ProfileView()
        .environment(DataService())
}
