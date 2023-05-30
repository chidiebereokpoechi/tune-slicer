import { Duration } from 'luxon'
import { Track, TrackInformation } from '../../domain'
import { SpotifyTrack } from './domain'

export const mapSpotifyTrackToDomain = (track: SpotifyTrack): Track => {
    const {
        name: title,
        external_ids: { isrc },
        duration_ms,
        preview_url,
    } = track

    const artist = track.artists[0]
    const trackInformation: TrackInformation = {
        length: Duration.fromMillis(duration_ms),
    }

    return new Track(
        isrc,
        trackInformation,
        title,
        artist.name,
        preview_url ?? undefined,
    )
}
