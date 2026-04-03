import SwiftUI

struct DailyEssentialCard: View {
    let item: TodaySectionItem

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Top area with gradient and icon
            ZStack(alignment: .topTrailing) {
                item.gradient
                    .frame(height: 120)

                if let icon = item.icon {
                    Image(systemName: icon)
                        .font(.system(size: 40, weight: .light))
                        .foregroundColor(.white.opacity(0.6))
                        .padding(12)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(HeadspaceTheme.primaryText)
                    .lineLimit(2)

                HStack(spacing: 4) {
                    Image(systemName: "speaker.wave.2.fill")
                        .font(.system(size: 10))
                    Text(item.subtitle ?? item.type.capitalized)
                        .font(.system(size: 13))
                        .lineLimit(2)
                }
                .foregroundColor(HeadspaceTheme.secondaryText)

                if let duration = item.durationLabel, !duration.isEmpty {
                    Text(duration)
                        .font(.system(size: 13))
                        .foregroundColor(HeadspaceTheme.secondaryText)
                }
            }
            .padding(.horizontal, 12)
            .padding(.bottom, 12)
        }
        .frame(width: 180)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white)
        )
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

#Preview {
    let item = TodaySectionItem(
        contentId: "cnt_020", title: "How's your day so far?", type: "reflect",
        subtitle: "Check in and stay grounded.", durationLabel: nil,
        durationSeconds: nil, progressSeconds: nil, thumbnailUrl: nil,
        gradientColors: ["#FFB450", "#FF9664"], icon: "sparkles", instructorName: nil
    )
    DailyEssentialCard(item: item)
        .padding()
        .background(HeadspaceTheme.background)
}
