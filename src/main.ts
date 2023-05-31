import 'dotenv/config'
import { TuneSlicer } from './core'

const main = async () => {
    const core = new TuneSlicer()
    const [track] = await core.searchTracks({
        name: 'nights',
        artist: 'frank ocean',
    })

    await core.downloadTrack(track)
}

main()
