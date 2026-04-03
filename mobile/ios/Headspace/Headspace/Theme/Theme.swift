import SwiftUI

struct HeadspaceTheme {
    // MARK: - Brand Colors
    static let orange = Color(red: 244/255, green: 125/255, blue: 32/255)
    static let darkOrange = Color(red: 220/255, green: 80/255, blue: 20/255)
    static let warmRed = Color(red: 200/255, green: 50/255, blue: 30/255)

    // MARK: - Category Colors
    static let meditateOrange = Color(red: 244/255, green: 125/255, blue: 32/255)
    static let sleepPurple = Color(red: 130/255, green: 100/255, blue: 200/255)
    static let moveGreen = Color(red: 0/255, green: 160/255, blue: 80/255)
    static let focusBlue = Color(red: 60/255, green: 100/255, blue: 200/255)

    // MARK: - Background Colors
    static let background = Color(red: 245/255, green: 241/255, blue: 235/255)
    static let cardBackground = Color(red: 250/255, green: 247/255, blue: 243/255)
    static let sectionBackground = Color(red: 240/255, green: 236/255, blue: 228/255)

    // MARK: - Text Colors
    static let primaryText = Color(red: 40/255, green: 40/255, blue: 40/255)
    static let secondaryText = Color(red: 120/255, green: 115/255, blue: 110/255)

    // MARK: - Gradients
    static let orangeGradient = LinearGradient(
        colors: [warmRed, darkOrange, orange, Color(red: 255/255, green: 180/255, blue: 50/255)],
        startPoint: .top,
        endPoint: .bottom
    )

    static let skyGradient = LinearGradient(
        colors: [
            Color(red: 0/255, green: 120/255, blue: 255/255),
            Color(red: 80/255, green: 170/255, blue: 255/255),
            Color(red: 180/255, green: 220/255, blue: 255/255)
        ],
        startPoint: .top,
        endPoint: .bottom
    )

    static let pinkGradient = LinearGradient(
        colors: [
            Color(red: 255/255, green: 180/255, blue: 200/255),
            Color(red: 255/255, green: 220/255, blue: 230/255),
            Color.white
        ],
        startPoint: .top,
        endPoint: .bottom
    )

    static let sunsetCard = LinearGradient(
        colors: [
            Color(red: 255/255, green: 180/255, blue: 80/255),
            Color(red: 255/255, green: 150/255, blue: 100/255)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let yellowCard = LinearGradient(
        colors: [
            Color(red: 255/255, green: 220/255, blue: 100/255),
            Color(red: 255/255, green: 200/255, blue: 80/255)
        ],
        startPoint: .top,
        endPoint: .bottom
    )

    static let pinkCard = LinearGradient(
        colors: [
            Color(red: 255/255, green: 200/255, blue: 210/255),
            Color(red: 255/255, green: 180/255, blue: 200/255)
        ],
        startPoint: .top,
        endPoint: .bottom
    )

    static let hotPinkGradient = LinearGradient(
        colors: [
            Color(red: 255/255, green: 100/255, blue: 150/255),
            Color(red: 255/255, green: 150/255, blue: 100/255)
        ],
        startPoint: .leading,
        endPoint: .trailing
    )

    static let blueGradient = LinearGradient(
        colors: [
            Color(red: 0/255, green: 100/255, blue: 220/255),
            Color(red: 30/255, green: 140/255, blue: 255/255)
        ],
        startPoint: .leading,
        endPoint: .trailing
    )
}
