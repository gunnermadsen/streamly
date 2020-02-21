import { environment } from "../environment/environment"
import { ISong } from "../store/reducers/reducer"

export class PlaylistNetworkUtility {
    public static async fetchPlaylist(): Promise<ISong>  {
        try {
            const response = await fetch(`${environment.apiUrl}/api/playlist?id=5d2f818f81808747b77a8d17`, { method: 'GET' })

            const playlist = await response.json()

            return playlist

        } catch (error) {
            throw error
        }
    }
}

// const default =[{ name: "Unable to load playlist. Check your internet connection" }]
// return defualt