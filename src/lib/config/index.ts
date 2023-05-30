/* eslint-disable indent */
import { assignWith, get, set } from 'lodash'
import path from 'path'
import { UnsupportedPlatformError } from './unsupported-platform'

interface Configuration {
    readonly logLevel: string
    readonly spotifyClientId: string
    readonly spotifyClientSecret: string
    readonly ffmpegExecutablePath: string
    readonly ytDlpExecutablePath: string
    readonly downloadPath: string
    readonly allowanceInSeconds: number
}

export class Config {
    private readonly configuration: Configuration

    constructor() {
        this.configuration = this.buildConfig()
    }

    private buildConfig(): Configuration {
        const defaultConfig = this.defaults
        const envOverrides: Partial<Configuration> = {
            logLevel: process.env.LOG_LEVEL,
            spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
            spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            ffmpegExecutablePath: process.env.FFMPEG_EXECUTABLE_PATH,
            ytDlpExecutablePath: process.env.YT_DLP_EXECUTABLE_PATH,
            downloadPath: process.env.DOWNLOAD_PATH,
            allowanceInSeconds: process.env.ALLOWANCE_IN_SECONDS
                ? +process.env.ALLOWANCE_IN_SECONDS
                : undefined,
        }

        return assignWith(
            defaultConfig,
            envOverrides,
            (objValue, srcValue, key) => {
                if (key && !(key in defaultConfig)) return
                if (srcValue === undefined) return objValue
            },
        )
    }

    private get defaults(): Configuration {
        const platform = this.platform

        return {
            logLevel: 'info',
            spotifyClientId: '',
            spotifyClientSecret: '',
            ffmpegExecutablePath: path.resolve(
                __dirname,
                `../../../bin/${platform}/ffmpeg`,
            ),
            ytDlpExecutablePath: path.resolve(
                __dirname,
                `../../../bin/${platform}/yt-dlp`,
            ),
            downloadPath: path.resolve(__dirname, '../../../downloads'),
            allowanceInSeconds: 2,
        }
    }

    // TODO: Fix this up so that it doesn't error out if the user overrides it correctly
    // and clean up the platform discriminating logic
    private get platform() {
        const platform = process.platform
        const arch = process.arch

        switch (platform) {
            case 'linux':
                return 'linux'
            case 'win32':
                if (arch !== 'arm64')
                    throw new UnsupportedPlatformError(platform, arch)
                return 'win32'
            case 'darwin':
                return 'macos'
            default:
                throw new UnsupportedPlatformError(platform, arch)
        }
    }

    public setValue<T extends keyof Configuration>(
        key: T,
        value: Configuration[T],
    ): void {
        set(this.configuration, key, value)
    }

    public getValue<T extends keyof Configuration>(key: T): Configuration[T] {
        return get(this.configuration, key)
    }
}
