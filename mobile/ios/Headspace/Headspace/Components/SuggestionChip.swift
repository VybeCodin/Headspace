import SwiftUI

struct SuggestionChip: View {
    let text: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(text)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(HeadspaceTheme.primaryText)
                .padding(.horizontal, 18)
                .padding(.vertical, 14)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(HeadspaceTheme.cardBackground)
                )
        }
    }
}

#Preview {
    HStack {
        SuggestionChip(text: "I'm feeling overwhelmed") {}
        SuggestionChip(text: "Help me fall asleep") {}
    }
    .padding()
}
