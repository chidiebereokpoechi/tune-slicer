import { map } from 'lodash'
import { Logger } from 'winston'
import { Track } from '../../domain'
import { env, fetcher } from '../../lib'
import { SpotifyTrackSearchResponse } from './domain'
import { mapSpotifyTrackToDomain } from './mapper'

interface TrackSearchInput {
    readonly name: string
    readonly artist?: string
}

export class SpotifyService {
    private readonly logger: Logger

    constructor(logger: Logger) {
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
                    client_id: env.SPOTIFY_CLIENT_ID,
                    client_secret: env.SPOTIFY_CLIENT_SECRET,
                },
                contentType: 'application/x-www-form-urlencoded',
            },
            this.logger,
        )

        return access_token
    }

    public async searchForTrack({
        name,
        artist,
    }: TrackSearchInput): Promise<Optional<Track[]>> {
        const { tracks } = await fetcher.get<SpotifyTrackSearchResponse>(
            {
                url: 'https://api.spotify.com/v1/search',
                query: {
                    q: name + (artist ? `artist:${artist}` : ''),
                    type: 'track',
                },
                apiToken: await this.getApiToken(),
            },
            this.logger,
        )

        return map(tracks.items, mapSpotifyTrackToDomain)
    }
}
