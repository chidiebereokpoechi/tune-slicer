import { TrackInformation } from './track-information'

export class Track {
    public readonly ISRC: string
    public readonly information: TrackInformation
    public readonly title: string
    public readonly artist: string
    public readonly previewUrl?: string

    constructor(
        ISRC: string,
        information: TrackInformation,
        title: string,
        artist: string,
        previewUrl?: string,
    ) {
        this.ISRC = ISRC
        this.information = information
        this.title = title
        this.artist = artist
        this.previewUrl = previewUrl
    }

    public get searchableName(): string {
        return `${this.artist} - ${this.title}`
    }

    public get formattedName(): string {
        return `${this.title} by ${this.artist}`
    }
}
