import SwiftUI

@main struct EricsChineseWatchApp: App {
    @StateObject private var store = WatchStore()
    var body: some Scene { WindowGroup { WristHome().environmentObject(store) } }
}
struct WristHome: View {
    @EnvironmentObject private var store: WatchStore
    @State private var showNote = false
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 12) {
                    if let round = store.round, let card = round.current {
                        ProgressView(value: Double(round.answers.count), total: Double(round.pack.cards.count)).tint(.mint)
                            .accessibilityLabel("\(round.answers.count) of \(round.pack.cards.count) practiced")
                        Text("\(round.answers.count + 1) / \(round.pack.cards.count)").font(.caption).foregroundStyle(.secondary)
                        Text(card.form(script: round.pack.script)).font(.system(size: card.s.count > 2 ? 40 : 66, weight: .medium))
                            .minimumScaleFactor(0.5).lineLimit(2).frame(maxWidth: .infinity, minHeight: 76)
                            .accessibilityLabel(card.form(script: round.pack.script))
                        if round.revealed {
                            Text(card.pinyin).font(.headline)
                            Text(card.meaning).font(.body)
                            if round.assisted { Label("Supported practice", systemImage: "hand.raised").font(.caption).foregroundStyle(.secondary) }
                            Text("Rate what you knew before revealing.").font(.caption2).foregroundStyle(.secondary)
                            Button("Again · could not read") { store.rate(.again, roundID: round.id, cardID: card.id) }.tint(.red)
                            Button("Almost · hesitated") { store.rate(.almost, roundID: round.id, cardID: card.id) }
                            Button("Got it · read before reveal") { store.rate(.gotIt, roundID: round.id, cardID: card.id) }.tint(.mint)
                        } else {
                            Text("Read it before revealing.").font(.caption).foregroundStyle(.secondary)
                            Button("Show answer") { store.reveal(roundID: round.id, cardID: card.id) }.tint(.mint)
                        }
                        if !card.note.isEmpty {
                            Button("My memory note", systemImage: "note.text") { store.help(roundID: round.id, cardID: card.id); if store.round?.assisted == true { showNote = true } }
                                .font(.caption)
                        }
                    } else if let round = store.round, round.complete {
                        Image(systemName: "checkmark.circle.fill").font(.largeTitle).foregroundStyle(.mint)
                        Text("Round complete").font(.headline)
                        Text("\(round.unassisted) read without help\n\(round.answers.count - round.unassisted) supported or missed")
                        Text("Watch practice stays separate from website mastery and rewards.").font(.caption).foregroundStyle(.secondary)
                        Button("Practice next set") { showNote = false; store.start() }.tint(.mint)
                        Button("Retry phone delivery") { store.retrySync() }.font(.caption)
                    } else if let pack = store.pack {
                        Image(systemName: "character.book.closed.fill").font(.title).foregroundStyle(.mint)
                        Text(pack.title).font(.headline)
                        Text("\(pack.cards.count) reading cards\nAvailable offline").font(.caption).foregroundStyle(.secondary)
                        Button("Start short review") { store.start() }.tint(.mint)
                    } else {
                        Image(systemName: "iphone.and.arrow.forward").font(.largeTitle).foregroundStyle(.mint)
                        Text("Send a practice set").font(.headline)
                        Text("In the website, open Tools → Apple Watch. Export a set, then import and send it using the iPhone companion.")
                            .font(.caption)
                    }
                    Text(store.status).font(.caption2).foregroundStyle(.secondary)
                }.buttonStyle(.bordered).controlSize(.large).padding(.horizontal, 4)
            }
            .navigationTitle("Eric’s Chinese").navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showNote) {
                ScrollView { VStack(alignment: .leading, spacing: 12) {
                    Text("Your memory note").font(.headline)
                    Text(store.round?.current?.note ?? "")
                    Text("This answer counts as supported practice.").font(.caption).foregroundStyle(.secondary)
                    Button("Back to the word") { showNote = false }
                }.padding() }
            }
            .alert("Could not complete that action", isPresented: Binding(get: { store.error != nil }, set: { if !$0 { store.error = nil } })) {
                Button("OK", role: .cancel) { store.error = nil }
            } message: { Text(store.error ?? "Try again.") }
        }
    }
}
