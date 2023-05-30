import { randomUUID } from 'crypto'
import { mkdirSync, rmSync } from 'fs'
import path from 'path'
import { Logger } from 'winston'
import { Track } from '../../domain'
import { Config, Runner } from '../../lib'

export class DownloaderService {
    private readonly config: Config
    private readonly logger: Logger
    private readonly ytDlp: Runner
    private readonly ffmpeg: Runner

    constructor(config: Config, logger: Logger) {
        this.config = config
        this.logger = logger.child({
            module: DownloaderService.name,
        })

        this.ytDlp = new Runner(
            'yt-dlp',
            config.getValue('ytDlpExecutablePath') as string,
            this.logger,
            { successCodes: [0, 101] },
        )

        this.ffmpeg = new Runner(
            'ffmpeg',
            config.getValue('ffmpegExecutablePath') as string,
            this.logger,
        )
    }

    private getTrackDownloadPath(track: Track): string {
        const { artist, title } = track
        const directory = path.resolve(
            this.config.getValue('downloadPath'),
            artist,
            title,
        )

        mkdirSync(directory, { recursive: true })
        return path.resolve(directory, `${track.formattedName}.wav`)
    }

    private getVideoDownloadPath(): string {
        return path.resolve(
            this.config.getValue('downloadPath'),
            `${randomUUID()}`,
        )
    }

    private getDurationFilter(track: Track): string {
        const allowanceInSeconds = this.config.getValue('allowanceInSeconds')
        const durationInSeconds = Math.floor(
            track.information.length.as('seconds'),
        )

        const lowerLimit = durationInSeconds - allowanceInSeconds
        const upperLimit = durationInSeconds + allowanceInSeconds
        return `"duration>=${lowerLimit} & duration<=${upperLimit}"`
    }

    public async downloadTrack(track: Track): Promise<void> {
        const videoOutput = this.getVideoDownloadPath()
        const trackOutput = this.getTrackDownloadPath(track)
        const durationFilter = this.getDurationFilter(track)

        await this.ytDlp.run([
            '--max-downloads',
            '1',
            '--match-filter',
            durationFilter,
            '-f',
            'ba',
            '-o',
            videoOutput,
            `"ytsearch4:${track.searchableName}"`,
        ])

        await this.ffmpeg.run(['-i', videoOutput, `"${trackOutput}"`, '-y'])
        rmSync(videoOutput)
    }
}
