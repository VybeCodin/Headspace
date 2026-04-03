import SwiftUI

struct CategoryButton: View {
    let category: Category

    var body: some View {
        Button(action: {}) {
            HStack(spacing: 10) {
                categoryIcon
                Text(category.name)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(HeadspaceTheme.primaryText)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(HeadspaceTheme.cardBackground)
            )
        }
    }

    @ViewBuilder
    private var categoryIcon: some View {
        switch category.icon {
        case "circle.fill":
            Circle()
                .fill(category.swiftColor)
                .frame(width: 24, height: 24)
        default:
            Image(systemName: category.icon)
                .font(.system(size: 18))
                .foregroundColor(category.swiftColor)
        }
    }
}

#Preview {
    let categories = [
        Category(id: "cat_meditate", name: "Meditate", slug: nil, icon: "circle.fill", color: "#F47D20", description: nil, contentCount: nil, sortOrder: nil),
        Category(id: "cat_sleep", name: "Sleep", slug: nil, icon: "moon.fill", color: "#8264C8", description: nil, contentCount: nil, sortOrder: nil),
    ]
    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
        ForEach(categories) { CategoryButton(category: $0) }
    }
    .padding()
    .background(HeadspaceTheme.background)
}
