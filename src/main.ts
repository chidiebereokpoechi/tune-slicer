import 'dotenv/config'
import './lib/config'

import { TuneSlicer } from './core'

const main = async () => {
    const core = new TuneSlicer()
    const tracks = await core.searchTracks({ name: 'Un poco loco' })
    const track = tracks[0]
    await core.processTrack(track)
}

main()
