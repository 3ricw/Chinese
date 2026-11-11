import Foundation
import WatchConnectivity

@MainActor final class WatchStore: NSObject, ObservableObject, WCSessionDelegate {
    @Published private(set) var pack: WristPack?
    @Published private(set) var round: WristRound?
    @Published private(set) var history: [WristSummary] = []
    @Published private(set) var status = "Import a set in the iPhone companion."
    @Published var error: String?
    private var channel: WCSession?
    override init() {
        super.init()
        do {
            let file = try LocalFiles.url("watch-pack.json")
            if FileManager.default.fileExists(atPath: file.path) { pack = try WristPack.decode(Data(contentsOf: file)) }
            let roundFile = try LocalFiles.url("watch-round.json")
            if FileManager.default.fileExists(atPath: roundFile.path) { round = try LocalFiles.read("watch-round.json", as: WristRound.self).validated() }
            if let saved = try? LocalFiles.read("watch-history.json", as: [WristSummary].self) {
                history = saved.compactMap { try? $0.validated() }.prefix(12).map { $0 }
            }
        } catch { self.error = error.localizedDescription }
        if pack != nil { status = "Set saved for offline practice." }
        if WCSession.isSupported() { channel = WCSession.default; channel?.delegate = self; channel?.activate() }
        // Recover a completion whose summary write was interrupted.
        if let round, round.complete { finish(round) }
    }
    func start() {
        guard round == nil || round?.complete == true, let pack else { return }
        if let round, round.complete, !history.contains(where: { $0.id == round.id }) {
            finish(round)
            guard history.contains(where: { $0.id == round.id }) else { return }
        }
        commit(WristRound(pack: pack))
    }
    func reveal(roundID: UUID, cardID: String) { guard var candidate = round, candidate.id == roundID, candidate.current?.id == cardID else { return }; candidate.reveal(); commit(candidate) }
    func help(roundID: UUID, cardID: String) { guard var candidate = round, candidate.id == roundID, candidate.current?.id == cardID else { return }; candidate.useHelp(); commit(candidate) }
    func rate(_ value: WristRating, roundID: UUID, cardID: String) {
        guard var candidate = round, candidate.id == roundID, candidate.rate(value, expectedCardID: cardID) else { return }
        if commit(candidate), candidate.complete { finish(candidate) }
    }
    @discardableResult private func commit(_ candidate: WristRound) -> Bool {
        do { try LocalFiles.write(candidate, to: "watch-round.json"); round = candidate; return true }
        catch { self.error = "This round could not be saved. " + error.localizedDescription; return false }
    }
    private func finish(_ completed: WristRound) {
        guard completed.complete, !history.contains(where: { $0.id == completed.id }) else { return }
        let next = Array(([WristSummary(round: completed)] + history).prefix(12))
        do { try LocalFiles.write(next, to: "watch-history.json"); history = next; acknowledge() }
        catch { self.error = "Round finished, but its summary could not be saved. Reopen the app to retry." }
    }
    func retrySync() { if let round, round.complete { finish(round) }; acknowledge() }
    private func acknowledge() {
        guard let channel, channel.activationState == .activated else { return }
        do {
            var context: [String: Any] = ["summaries": try JSONEncoder().encode(history)]
            if let pack { context["receivedPackID"] = pack.id }
            try channel.updateApplicationContext(context)
        } catch { status = "Saved on Watch. Open the iPhone companion later to retry delivery." }
    }
    nonisolated func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        let data = session.receivedApplicationContext["pack"] as? Data
        let message = error?.localizedDescription
        Task { @MainActor in
            if let data { self.receive(data) }
            if let message { self.status = message }
            self.acknowledge()
        }
    }
    nonisolated func session(_ session: WCSession, didReceiveApplicationContext context: [String: Any]) {
        guard let data = context["pack"] as? Data else { return }
        Task { @MainActor in self.receive(data) }
    }
    private func receive(_ data: Data) {
        do {
            let incoming = try WristPack.decode(data)
            if incoming.id != pack?.id {
                try LocalFiles.write(incoming, to: "watch-pack.json"); pack = incoming
                status = round?.complete == false ? "New set saved. Finish your current round first." : "New set ready."
            }
            acknowledge()
        } catch { self.error = error.localizedDescription }
    }
}
