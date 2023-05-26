import { TrackInformation } from './track-information'

export class Track {
    public readonly ISRC: string
    public readonly information: TrackInformation
    public readonly title: string
    public readonly artist: string

    constructor(
        ISRC: string,
        information: TrackInformation,
        title: string,
        artist: string,
    ) {
        this.ISRC = ISRC
        this.information = information
        this.title = title
        this.artist = artist
    }

    public get youtubeName(): string {
        return `${this.title} - ${this.artist}`
    }
}
