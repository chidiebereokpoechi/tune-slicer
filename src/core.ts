import { Logger } from 'winston'
import { Track } from './domain'
import { Config, baseLogger } from './lib'
import { SpotifyService } from './services/spotify'
import { DownloaderService } from './services/downloader'

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

    public async processTrack(track: Track): Promise<void> {
        await this.downloadService.downloadTrack(track)
    }
}
