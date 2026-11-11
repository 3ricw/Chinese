import Foundation

public enum WristError: LocalizedError {
    case invalidPack, invalidRound, tooLarge
    public var errorDescription: String? {
        switch self {
        case .invalidPack: return "Choose a Watch set exported from Eric’s Chinese (1–5 cards). Progress backups are a different file."
        case .invalidRound: return "The saved round could not be restored. Your practice set is still available."
        case .tooLarge: return "This file is too large for a five-card Watch set."
        }
    }
}
public struct WristCard: Codable, Equatable, Identifiable {
    public let id, s, t, pinyin, meaning, note: String
    public func form(script: String) -> String { script == "traditional" ? t : s }
}
public struct WristPack: Codable, Equatable, Identifiable {
    public let format: String
    public let version: Int
    public let id: String
    public let createdAt: Double // JavaScript milliseconds, not Foundation's date epoch.
    public let course, courseName, script, title: String
    public let cards: [WristCard]
    public static func decode(_ data: Data) throws -> Self {
        guard data.count <= 100_000 else { throw WristError.tooLarge }
        guard let pack = try? JSONDecoder().decode(Self.self, from: data) else { throw WristError.invalidPack }
        guard pack.format == "erics-chinese-wrist", pack.version == 1,
              !pack.id.isEmpty, pack.id.count <= 120, pack.createdAt.isFinite, pack.createdAt >= 0,
              ["chinese-1", "chinese-2"].contains(pack.course),
              ["simplified", "traditional"].contains(pack.script),
              !pack.title.isEmpty, pack.title.count <= 160, pack.courseName.count <= 80,
              (1...5).contains(pack.cards.count), Set(pack.cards.map(\.id)).count == pack.cards.count,
              pack.cards.allSatisfy({ c in
                  (c.id.hasPrefix("character:") || c.id.hasPrefix("word:cw-")) && c.id.count <= 80 &&
                  !c.s.isEmpty && !c.t.isEmpty && c.s.count <= 30 && c.t.count <= 30 &&
                  !c.pinyin.isEmpty && c.pinyin.count <= 160 && !c.meaning.isEmpty &&
                  c.meaning.count <= 400 && c.note.count <= 600
              }) else { throw WristError.invalidPack }
        return pack
    }
}
public enum WristRating: String, Codable, CaseIterable { case again, almost, gotIt }
public struct WristAnswer: Codable, Equatable {
    public let cardID: String
    public let rating: WristRating
    public let assisted: Bool
}
public struct WristRound: Codable, Equatable, Identifiable {
    public let id: UUID
    public let pack: WristPack // Snapshot: receiving another set cannot change a round in progress.
    public private(set) var answers: [WristAnswer]
    public private(set) var revealed: Bool
    public private(set) var assisted: Bool
    public var current: WristCard? { answers.count < pack.cards.count ? pack.cards[answers.count] : nil }
    public var complete: Bool { current == nil }
    public var unassisted: Int { answers.filter { $0.rating == .gotIt && !$0.assisted }.count }
    public init(pack: WristPack) { id = UUID(); self.pack = pack; answers = []; revealed = false; assisted = false }
    public mutating func reveal() { guard current != nil else { return }; revealed = true }
    public mutating func useHelp() { guard current != nil else { return }; assisted = true }
    @discardableResult public mutating func rate(_ value: WristRating, expectedCardID: String) -> Bool {
        guard revealed, let card = current, card.id == expectedCardID else { return false }
        answers.append(WristAnswer(cardID: card.id, rating: value, assisted: assisted))
        revealed = false; assisted = false; return true
    }
    public func validated() throws -> Self {
        _ = try WristPack.decode(JSONEncoder().encode(pack))
        guard answers.count <= pack.cards.count,
              answers.enumerated().allSatisfy({ i, answer in answer.cardID == pack.cards[i].id }),
              !complete || (!revealed && !assisted) else { throw WristError.invalidRound }
        return self
    }
}
public struct WristSummary: Codable, Equatable, Identifiable {
    public let id: UUID
    public let packID, title: String
    public let finishedAt: Double
    public let total, unassisted, supportedOrMissed: Int
    public init(round: WristRound, now: Date = Date()) {
        id = round.id; packID = round.pack.id; title = round.pack.title
        finishedAt = now.timeIntervalSince1970 * 1000
        total = round.answers.count; unassisted = round.unassisted; supportedOrMissed = total - unassisted
    }
    public func validated() throws -> Self {
        guard (1...5).contains(total), (0...total).contains(unassisted), supportedOrMissed == total - unassisted,
              finishedAt.isFinite, finishedAt >= 0, packID.count <= 120, title.count <= 160 else { throw WristError.invalidRound }
        return self
    }
}
