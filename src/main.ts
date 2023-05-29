import 'dotenv/config'
import './lib/env'

import { baseLogger } from './lib'
import { SpotifyService } from './services/spotify'

const main = async () => {
    const spotifyService = new SpotifyService(baseLogger)
}

main()
