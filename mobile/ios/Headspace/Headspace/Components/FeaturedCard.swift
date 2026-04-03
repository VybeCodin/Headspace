import SwiftUI

struct FeaturedCard: View {
    let title: String
    let subtitle: String

    var body: some View {
        HStack(spacing: 0) {
            // Text content
            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(HeadspaceTheme.primaryText)

                Text(subtitle)
                    .font(.system(size: 14))
                    .foregroundColor(HeadspaceTheme.secondaryText)
                    .lineSpacing(3)
                    .lineLimit(3)
            }
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)

            // Decorative illustration
            ZStack {
                // Colorful shapes
                Circle()
                    .fill(Color.green.opacity(0.6))
                    .frame(width: 50, height: 50)
                    .offset(x: 10, y: -10)

                Circle()
                    .fill(Color.pink.opacity(0.5))
                    .frame(width: 60, height: 60)
                    .offset(x: -15, y: 10)

                Circle()
                    .fill(HeadspaceTheme.orange.opacity(0.6))
                    .frame(width: 40, height: 40)
                    .offset(x: 15, y: 15)

                Image(systemName: "star.fill")
                    .font(.system(size: 16))
                    .foregroundColor(.yellow)
                    .offset(x: 25, y: -25)
            }
            .frame(width: 120, height: 100)
            .padding(.trailing, 12)
        }
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(HeadspaceTheme.cardBackground)
        )
    }
}

#Preview {
    FeaturedCard(
        title: "Self-Care for Parents",
        subtitle: "You deserve a minute. Take a brief moment for yourself. Brought to..."
    )
    .padding()
    .background(HeadspaceTheme.background)
}
