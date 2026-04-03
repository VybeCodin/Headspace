import SwiftUI

@main
struct HeadspaceApp: App {
    @State private var dataService = DataService()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(dataService)
                .background(HeadspaceTheme.background.ignoresSafeArea())
        }
    }
}
