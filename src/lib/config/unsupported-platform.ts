export class UnsupportedPlatformError extends Error {
    constructor(platform: string, arch: string) {
        super(`Unsupported platform: ${platform} with architecture: ${arch}`)
    }
}
