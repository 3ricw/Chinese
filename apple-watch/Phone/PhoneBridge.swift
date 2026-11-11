import Foundation
import WatchConnectivity

@MainActor final class PhoneBridge: NSObject, ObservableObject, WCSessionDelegate {
    @Published private(set) var pack: WristPack?
    @Published private(set) var history: [WristSummary] = []
    @Published private(set) var status = "Connecting to your Watch…"
    @Published private(set) var ready = false
    @Published var error: String?
    private var channel: WCSession?
    override init() {
        super.init()
        do {
            let file = try LocalFiles.url("phone-pack.json")
            if FileManager.default.fileExists(atPath: file.path) { pack = try WristPack.decode(Data(contentsOf: file)) }
            if let saved = try? LocalFiles.read("phone-history.json", as: [WristSummary].self) {
                history = saved.compactMap { try? $0.validated() }.prefix(12).map { $0 }
            }
        } catch { self.error = error.localizedDescription }
        guard WCSession.isSupported() else { status = "Watch connectivity is unavailable on this device."; return }
        channel = WCSession.default; channel?.delegate = self; channel?.activate()
    }
    func importPack(_ url: URL) {
        let scoped = url.startAccessingSecurityScopedResource()
        defer { if scoped { url.stopAccessingSecurityScopedResource() } }
        do {
            let size = try url.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
            guard size <= 100_000 else { throw WristError.tooLarge }
            let incoming = try WristPack.decode(Data(contentsOf: url))
            try LocalFiles.write(incoming, to: "phone-pack.json")
            pack = incoming; status = "Set imported. Send it to your Watch."; error = nil
        } catch { self.error = error.localizedDescription }
    }
    func sendPack() {
        guard let pack, let channel, channel.activationState == .activated else {
            status = "Wait for Watch connectivity, then try Send to Watch again."; return
        }
        guard channel.isPaired, channel.isWatchAppInstalled else {
            status = "Install and open the Watch app on your paired Watch first."; return
        }
        do {
            try channel.updateApplicationContext(["pack": try JSONEncoder().encode(pack)])
            status = "Queued for Watch delivery. Keep both apps installed; delivery can happen in the background."
        } catch { self.error = error.localizedDescription }
    }
    nonisolated func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        let ready = activationState == .activated
        let message = error?.localizedDescription
        Task { @MainActor in
            self.ready = ready
            self.status = message ?? (ready ? "Ready to send a set." : "Watch connection is not ready.")
        }
    }
    nonisolated func sessionDidBecomeInactive(_ session: WCSession) {
        Task { @MainActor in self.ready = false; self.status = "Watch connection is changing…" }
    }
    nonisolated func sessionDidDeactivate(_ session: WCSession) { session.activate() }
    nonisolated func session(_ session: WCSession, didReceiveApplicationContext context: [String: Any]) {
        let incoming = context["summaries"] as? Data
        let receivedID = context["receivedPackID"] as? String
        Task { @MainActor in
            if let incoming, incoming.count <= 30_000 {
                do {
                    let decoded = try JSONDecoder().decode([WristSummary].self, from: incoming)
                    guard decoded.count <= 12 else { throw WristError.invalidRound }
                    let valid = try decoded.map { try $0.validated() }
                    var combined = Dictionary(self.history.map { ($0.id, $0) }, uniquingKeysWith: { a, _ in a })
                    for summary in valid { combined[summary.id] = summary }
                    let next = Array(combined.values.sorted { $0.finishedAt > $1.finishedAt }.prefix(12))
                    try LocalFiles.write(next, to: "phone-history.json"); self.history = next
                } catch { self.error = error.localizedDescription }
            }
            if let receivedID, receivedID == self.pack?.id { self.status = "Set received on your Watch." }
        }
    }
    nonisolated func sessionWatchStateDidChange(_ session: WCSession) {
        Task { @MainActor in self.status = session.isWatchAppInstalled ? "Watch app detected. Send your set when ready." : "Install the Watch app on your paired Watch." }
    }
}
