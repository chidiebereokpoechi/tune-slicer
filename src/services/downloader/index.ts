/* eslint-disable indent */
import { randomUUID } from 'crypto'
import { existsSync, mkdirSync, rmSync } from 'fs'
import path from 'path'
import { Logger } from 'winston'
import { Track } from '../../domain'
import { Config, Runner } from '../../lib'

type Mode = 'acapella' | 'instrumental' | 'full'

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

    private getTrackDownloadPath(track: Track, mode: Mode = 'full'): string {
        const { artist } = track
        const directory = path.resolve(
            this.config.getValue('downloadPath'),
            artist,
        )

        let suffix: string

        switch (mode) {
            case 'acapella':
                suffix = ' (Acapella)'
                break
            case 'instrumental':
                suffix = ' (Instrumental)'
                break
            case 'full':
                suffix = ''
                break
        }

        mkdirSync(directory, { recursive: true })
        return path.resolve(directory, `${track.formattedName}${suffix}.wav`)
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

    private getSearchQuery(track: Track, mode: Mode = 'full'): string {
        switch (mode) {
            case 'acapella':
                return `"ytsearch3:${track.searchableName} Acapella"`
            case 'instrumental':
                return `"ytsearch3:${track.searchableName} Instrumental"`
            case 'full':
                return `"ytsearch3:${track.ISRC}"`
        }
    }

    private verifyPathExists(path: string): void {
        if (!existsSync(path)) {
            throw new Error(`"${path}" does not exist`)
        }
    }

    public async downloadTrack(
        track: Track,
        mode: Mode = 'full',
    ): Promise<boolean> {
        const videoOutput = this.getVideoDownloadPath()
        const trackOutput = this.getTrackDownloadPath(track, mode)
        const durationFilter = this.getDurationFilter(track)
        const searchQuery = this.getSearchQuery(track, mode)

        try {
            await this.ytDlp.run([
                ['--max-downloads', '1'],
                ['--match-filter', durationFilter],
                ['-f', 'ba'],
                ['-o', videoOutput],
                searchQuery,
            ])

            this.verifyPathExists(videoOutput)
            await this.ffmpeg.run([
                ['-i', videoOutput],
                `"${trackOutput}"`,
                '-y',
            ])

            rmSync(videoOutput)
            return true
        } catch (error) {
            this.logger.error('Error occured during track download', {
                error,
                videoOutput,
                trackOutput,
                durationFilter,
                searchQuery,
            })

            return false
        }
    }
}
