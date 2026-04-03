import SwiftUI

struct ErrorStateView: View {
    let message: String
    let retry: () async -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "wifi.slash")
                .font(.system(size: 40))
                .foregroundColor(HeadspaceTheme.secondaryText)

            Text(message)
                .font(.system(size: 15))
                .foregroundColor(HeadspaceTheme.secondaryText)
                .multilineTextAlignment(.center)

            Button {
                Task { await retry() }
            } label: {
                Text("Try Again")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 10)
                    .background(Capsule().fill(HeadspaceTheme.orange))
            }
        }
        .padding(40)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
