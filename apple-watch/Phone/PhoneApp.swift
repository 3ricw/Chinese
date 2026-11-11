import SwiftUI
import UniformTypeIdentifiers

@main struct EricsChinesePhoneApp: App {
    @StateObject private var bridge = PhoneBridge()
    @State private var importing = false
    var body: some Scene {
        WindowGroup {
            NavigationStack {
                List {
                    Section {
                        Label("Five cards, on your wrist", systemImage: "applewatch").font(.title2.bold())
                        Text("Export a Watch practice set from Tools in Eric’s Chinese, then import that file here.")
                        Button("Import practice set", systemImage: "square.and.arrow.down") { importing = true }
                            .frame(minHeight: 44)
                    }
                    if let pack = bridge.pack {
                        Section(pack.title) {
                            Text(pack.cards.map { $0.form(script: pack.script) }.joined(separator: "  "))
                                .font(.largeTitle).accessibilityLabel("Cards: " + pack.cards.map(\.s).joined(separator: ", "))
                            Text("\(pack.cards.count) cards · \(pack.script == "traditional" ? "Traditional" : "Simplified")")
                                .foregroundStyle(.secondary)
                            Button("Send to Watch", systemImage: "applewatch.radiowaves.left.and.right") { bridge.sendPack() }
                                .disabled(!bridge.ready).frame(minHeight: 44)
                            Text(bridge.status).font(.footnote).accessibilityAddTraits(.updatesFrequently)
                        }
                    } else { Section { Text(bridge.status).font(.footnote) } }
                    if !bridge.history.isEmpty {
                        Section("Recent Watch rounds") {
                            ForEach(bridge.history) { item in
                                VStack(alignment: .leading, spacing: 6) {
                                    Text(item.title).font(.headline)
                                    Text("\(item.unassisted) read before revealing · \(item.supportedOrMissed) supported or missed")
                                    Text(Date(timeIntervalSince1970: item.finishedAt / 1000), style: .date)
                                        .font(.caption).foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                    Section("Your learning progress") {
                        Text("Watch rounds are practice copies. They do not change website mastery, XP, streaks, or companion rewards. Browser saves remain on their original device.")
                            .font(.footnote).foregroundStyle(.secondary)
                        Link("Open Eric’s Chinese", destination: URL(string: "https://3ricw.github.io/Chinese/")!)
                    }
                }
                .navigationTitle("Eric’s Chinese").tint(.mint)
                .fileImporter(isPresented: $importing, allowedContentTypes: [.json]) { result in
                    switch result { case .success(let url): bridge.importPack(url); case .failure(let error): bridge.error = error.localizedDescription }
                }
                .alert("Could not complete that action", isPresented: Binding(get: { bridge.error != nil }, set: { if !$0 { bridge.error = nil } })) {
                    Button("OK", role: .cancel) { bridge.error = nil }
                } message: { Text(bridge.error ?? "Try again.") }
            }
        }
    }
}
