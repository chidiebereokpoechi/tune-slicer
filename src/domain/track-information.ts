import { Duration } from 'luxon'
import { Key } from './key'

export interface TrackInformation {
    /**
     * Combination of the root note and scale
     */
    key?: Key
    /**
     * Beats per minute
     */
    bpm?: number
    /**
     * Track length
     */
    length: Duration
}
