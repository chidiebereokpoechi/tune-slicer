import { Logger } from 'winston'
import { Track } from './domain'
import { Config, baseLogger } from './lib'
import { SpotifyService } from './services/spotify'
import { DownloaderService } from './services/downloader'
import { countBy } from 'lodash'

interface TrackSearchInput {
    name: string
    artist?: string
}

export class TuneSlicer {
    private readonly config: Config
    private readonly logger: Logger
    private readonly spotifyService: SpotifyService
    private readonly downloadService: DownloaderService

    constructor() {
        this.config = new Config()
        this.logger = baseLogger.child({
            app: TuneSlicer.name,
        })

        this.logger.level = this.config.getValue('logLevel')
        this.spotifyService = new SpotifyService(this.config, this.logger)
        this.downloadService = new DownloaderService(this.config, this.logger)
    }

    public async searchTracks({
        name,
        artist,
    }: TrackSearchInput): Promise<Track[]> {
        return await this.spotifyService.searchForTrack({
            name,
            artist,
        })
    }

    public async downloadTrack(track: Track): Promise<void> {
        const responses = await Promise.all([
            await this.downloadService.downloadTrack(track, 'acapella'),
            await this.downloadService.downloadTrack(track, 'full'),
            await this.downloadService.downloadTrack(track, 'instrumental'),
        ])

        const sucesses = countBy(responses, Boolean)

        this.logger.info('Track downloaded', {
            attempted: responses.length,
            sucesses,
        })
    }
}
