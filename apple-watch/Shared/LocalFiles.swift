import Foundation

enum LocalFiles {
    static func url(_ name: String) throws -> URL {
        let root = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
            .appendingPathComponent("EricsChinese", isDirectory: true)
        try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
        return root.appendingPathComponent(name)
    }
    static func read<T: Decodable>(_ name: String, as: T.Type) throws -> T {
        try JSONDecoder().decode(T.self, from: Data(contentsOf: url(name)))
    }
    static func write<T: Encodable>(_ value: T, to name: String) throws {
        try JSONEncoder().encode(value).write(to: url(name), options: .atomic)
    }
    static func remove(_ name: String) throws { let path = try url(name); if FileManager.default.fileExists(atPath: path.path) { try FileManager.default.removeItem(at: path) } }
}
