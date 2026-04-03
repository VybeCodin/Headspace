import SwiftUI

struct ProgramCard: View {
    let program: GuidedProgramSummary

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 8) {
                Text(program.title)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                    .lineLimit(2)

                HStack(spacing: 6) {
                    Image(systemName: "play.rectangle.fill")
                        .font(.system(size: 12))
                    Text("\(program.totalSessions) sessions • \(program.dailyMinutes)")
                        .font(.system(size: 13))
                }
                .foregroundColor(.white.opacity(0.9))
            }
            .padding(20)

            Spacer()

            ZStack {
                Circle()
                    .fill(Color.white.opacity(0.2))
                    .frame(width: 60, height: 60)
                Image(systemName: "person.fill")
                    .font(.system(size: 28))
                    .foregroundColor(.white.opacity(0.5))
            }
            .padding(.trailing, 16)
        }
        .frame(height: 110)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(program.gradient)
        )
    }
}

#Preview {
    let program = GuidedProgramSummary(
        collectionId: "col_001", title: "CBT for Anxiety & Depression",
        totalSessions: 21, dailyMinutes: "<10 min a day",
        gradientColors: ["#FF6496", "#FF9664"]
    )
    ProgramCard(program: program)
        .padding()
        .background(HeadspaceTheme.sectionBackground)
}
