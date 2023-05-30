import { map } from 'lodash'
import { Logger } from 'winston'
import { Track } from '../../domain'
import { Config, fetcher } from '../../lib'
import { SpotifyTrackSearchResponse } from './domain'
import { mapSpotifyTrackToDomain } from './mapper'

interface TrackSearchInput {
    readonly name: string
    readonly artist?: string
}

export class SpotifyService {
    private readonly config: Config
    private readonly logger: Logger

    constructor(config: Config, logger: Logger) {
        this.config = config
        this.logger = logger.child({
            module: SpotifyService.name,
        })
    }

    private async getApiToken(): Promise<string> {
        const { access_token } = await fetcher.post<{ access_token: string }>(
            {
                url: 'https://accounts.spotify.com/api/token',
                body: {
                    grant_type: 'client_credentials',
                    client_id: this.config.getValue('spotifyClientId'),
                    client_secret: this.config.getValue('spotifyClientSecret'),
                },
                contentType: 'application/x-www-form-urlencoded',
            },
            this.logger,
        )

        return access_token
    }

    public async searchForTrack(input: TrackSearchInput): Promise<Track[]> {
        const { name, artist } = input
        const { tracks } = await fetcher.get<SpotifyTrackSearchResponse>(
            {
                url: 'https://api.spotify.com/v1/search',
                query: {
                    q: name + (artist ? ` artist:${artist}` : ''),
                    type: 'track',
                    include_external: 'audio',
                    limit: 3,
                },
                apiToken: await this.getApiToken(),
            },
            this.logger,
        )

        const results = map(tracks.items, mapSpotifyTrackToDomain)
        this.logger.info('Spotify search completed', { input, results })
        return results
    }
}
