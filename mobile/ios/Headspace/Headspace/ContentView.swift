import SwiftUI

struct ContentView: View {
    @Environment(DataService.self) private var dataService
    @State private var selectedTab = 0

    var body: some View {
        VStack(spacing: 0) {
            ZStack {
                TodayView()
                    .opacity(selectedTab == 0 ? 1 : 0)
                    .allowsHitTesting(selectedTab == 0)
                ExploreView()
                    .opacity(selectedTab == 1 ? 1 : 0)
                    .allowsHitTesting(selectedTab == 1)
                LumaView()
                    .opacity(selectedTab == 2 ? 1 : 0)
                    .allowsHitTesting(selectedTab == 2)
                ProfileView()
                    .opacity(selectedTab == 3 ? 1 : 0)
                    .allowsHitTesting(selectedTab == 3)
            }

            // Custom tab bar — fully opaque, no liquid glass
            HStack(spacing: 0) {
                tabButton(icon: "house", filledIcon: "house.fill", label: "Today", tag: 0)
                tabButton(icon: "square.grid.2x2", filledIcon: "square.grid.2x2.fill", label: "Explore", tag: 1)
                tabButton(icon: "bubble.left.and.bubble.right", filledIcon: "bubble.left.and.bubble.right.fill", label: "Luma", tag: 2)
                tabButton(icon: "person", filledIcon: "person.fill", label: dataService.userName(), tag: 3)
            }
            .padding(.top, 10)
            .padding(.bottom, 4)
            .background(
                HeadspaceTheme.background
                    .shadow(color: .black.opacity(0.05), radius: 4, y: -2)
                    .ignoresSafeArea(edges: .bottom)
            )
        }
        .background(HeadspaceTheme.background.ignoresSafeArea())
        .task { await dataService.loadProfile() }
    }

    private func tabButton(icon: String, filledIcon: String, label: String, tag: Int) -> some View {
        Button {
            selectedTab = tag
        } label: {
            VStack(spacing: 4) {
                Image(systemName: selectedTab == tag ? filledIcon : icon)
                    .font(.system(size: 22))
                Text(label)
                    .font(.system(size: 10, weight: .medium))
            }
            .foregroundColor(selectedTab == tag ? HeadspaceTheme.primaryText : HeadspaceTheme.secondaryText)
            .frame(maxWidth: .infinity)
        }
    }
}

#Preview {
    ContentView()
        .environment(DataService())
}
