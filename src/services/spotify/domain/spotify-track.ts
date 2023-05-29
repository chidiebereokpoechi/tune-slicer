import { SpotifyArtist } from './spotify-artist'

export interface SpotifyTrack {
    readonly id: string
    readonly name: string
    readonly duration_ms: number
    readonly artists: SpotifyArtist[]
    readonly external_ids: {
        isrc: string
        ean: string
        upc: string
    }
    readonly external_urls: {
        spotify: string
    }
    readonly preview_url: string
}

export interface SpotifyTrackSearchResponse {
    readonly tracks: {
        href: string
        limit: number
        next: string
        offset: number
        previous: string
        total: number
        items: SpotifyTrack[]
    }
}
