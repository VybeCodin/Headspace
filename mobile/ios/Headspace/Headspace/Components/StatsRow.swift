import SwiftUI

struct StatsRow: View {
    let icon: String
    let iconColor: Color
    let value: String
    let label: String

    var body: some View {
        HStack(spacing: 14) {
            // Icon circle
            RoundedRectangle(cornerRadius: 10)
                .fill(iconColor.opacity(0.15))
                .frame(width: 44, height: 44)
                .overlay(
                    Image(systemName: icon)
                        .font(.system(size: 18))
                        .foregroundColor(iconColor)
                )

            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(HeadspaceTheme.primaryText)
                Text(label)
                    .font(.system(size: 14))
                    .foregroundColor(HeadspaceTheme.secondaryText)
            }

            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}

#Preview {
    VStack(spacing: 0) {
        StatsRow(
            icon: "square.fill",
            iconColor: HeadspaceTheme.orange,
            value: "56 minutes",
            label: "Average session length"
        )
        Divider().padding(.horizontal, 16)
        StatsRow(
            icon: "moon.fill",
            iconColor: HeadspaceTheme.focusBlue,
            value: "5,399 minutes",
            label: "Total session time"
        )
    }
    .background(
        RoundedRectangle(cornerRadius: 16)
            .fill(HeadspaceTheme.cardBackground)
    )
    .padding()
}
