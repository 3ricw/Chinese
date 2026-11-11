import XCTest
@testable import WristCore

final class WristCoreTests: XCTestCase {
    func sampleData() throws -> Data { try Data(contentsOf: XCTUnwrap(Bundle.module.url(forResource: "sample-pack", withExtension: "json"))) }
    func pack() throws -> WristPack { try WristPack.decode(sampleData()) }
    func altered(_ change: (inout [String: Any]) -> Void) throws -> Data {
        var object = try XCTUnwrap(JSONSerialization.jsonObject(with: sampleData()) as? [String: Any]); change(&object)
        return try JSONSerialization.data(withJSONObject: object)
    }
    func testBrowserExportDecodesWithScriptsAndNotes() throws {
        let value = try pack()
        XCTAssertEqual(value.cards.count, 2); XCTAssertEqual(value.script, "traditional")
        XCTAssertEqual(value.cards[0].id, "character:你")
        XCTAssertEqual(value.cards[0].note, "Person on the left; familiar face")
        XCTAssertEqual(value.cards[0].form(script: value.script), "你")
    }
    func testBackupsAreRejected() { XCTAssertThrowsError(try WristPack.decode(Data("{\"version\":2,\"cards\":{}}".utf8))) }
    func testEmptyPackIsRejected() throws { XCTAssertThrowsError(try WristPack.decode(altered { $0["cards"] = [] })) }
    func testDuplicateCardIDsAreRejected() throws {
        let data = try altered { object in let card = (object["cards"] as! [[String: Any]])[0]; object["cards"] = [card, card] }
        XCTAssertThrowsError(try WristPack.decode(data))
    }
    func testOversizedFilesAreRejectedBeforeDecoding() { XCTAssertThrowsError(try WristPack.decode(Data(repeating: 0x20, count: 100_001))) }
    func testUnsupportedScriptAndVersionAreRejected() throws {
        XCTAssertThrowsError(try WristPack.decode(altered { $0["script"] = "other" }))
        XCTAssertThrowsError(try WristPack.decode(altered { $0["version"] = 2 }))
    }
    func testCannotRateBeforeRevealing() throws {
        var round = WristRound(pack: try pack()); XCTAssertFalse(round.rate(.gotIt, expectedCardID: "character:你")); XCTAssertEqual(round.answers.count, 0)
    }
    func testDelayedCallbackCannotAnswerNextCard() throws {
        var round = WristRound(pack: try pack()); round.reveal()
        XCTAssertTrue(round.rate(.gotIt, expectedCardID: "character:你"))
        round.reveal(); XCTAssertFalse(round.rate(.gotIt, expectedCardID: "character:你")); XCTAssertEqual(round.answers.count, 1)
    }
    func testHelpSurvivesSavingAndCannotCountAsUnassisted() throws {
        var round = WristRound(pack: try pack()); round.useHelp(); round.reveal()
        round = try JSONDecoder().decode(WristRound.self, from: JSONEncoder().encode(round)).validated()
        XCTAssertTrue(round.assisted); XCTAssertTrue(round.rate(.gotIt, expectedCardID: "character:你")); XCTAssertEqual(round.unassisted, 0)
    }
    func testSummaryKeepsRoundIdentityAndCounts() throws {
        var round = WristRound(pack: try pack())
        while let card = round.current { round.reveal(); XCTAssertTrue(round.rate(.gotIt, expectedCardID: card.id)) }
        let summary = try WristSummary(round: round).validated()
        XCTAssertEqual(summary.id, round.id); XCTAssertEqual(summary.total, 2); XCTAssertEqual(summary.unassisted, 2)
        XCTAssertEqual(summary.supportedOrMissed, 0)
    }
    func testReceivingAnotherPackCannotMutateTheRoundSnapshot() throws {
        var round = WristRound(pack: try pack())
        let incoming = try WristPack.decode(altered { $0["id"] = "new-pack"; $0["title"] = "New set" })
        XCTAssertNotEqual(round.pack.id, incoming.id); round.reveal(); XCTAssertEqual(round.current?.id, "character:你")
    }
}
