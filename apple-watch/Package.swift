// swift-tools-version: 5.9
import PackageDescription
let package = Package(name: "WristCore", products: [.library(name: "WristCore", targets: ["WristCore"])], targets: [
    .target(name: "WristCore", path: "Shared", sources: ["WristCore.swift"]),
    .testTarget(name: "WristCoreTests", dependencies: ["WristCore"], path: "CoreTests", resources: [.copy("sample-pack.json")])
])
