import SwiftUI

struct ContentView: View {
    @Environment(DataService.self) private var dataService
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            TodayView()
                .tabItem {
                    Image(systemName: selectedTab == 0 ? "house.fill" : "house")
                    Text("Today")
                }
                .tag(0)

            ExploreView()
                .tabItem {
                    Image(systemName: selectedTab == 1 ? "square.grid.2x2.fill" : "square.grid.2x2")
                    Text("Explore")
                }
                .tag(1)

            LumaView()
                .tabItem {
                    Image(systemName: "bubble.left.and.bubble.right")
                    Text("Luma")
                }
                .tag(2)

            ProfileView()
                .tabItem {
                    Image(systemName: selectedTab == 3 ? "person.fill" : "person")
                    Text(dataService.userName())
                }
                .tag(3)
        }
        .tint(HeadspaceTheme.primaryText)
        .task { await dataService.loadProfile() }
    }
}

#Preview {
    ContentView()
        .environment(DataService())
}
