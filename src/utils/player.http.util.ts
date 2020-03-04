import { ISong } from "../models/track.interface"
import { environment as env } from '../environment/environment'
import { Observable } from "rxjs"
import { ajax, AjaxRequest, AjaxResponse } from 'rxjs/ajax'
import { mergeMap } from 'rxjs/operators'

export class HttpPlayerUtility {
    public static async fetchPlaylist(): Promise<ISong[]> {
        try {
            const response = await fetch(`${env.apiUrl}/api/playlist?id=${env.userId}`, { method: 'GET' })

            const playlist = await response.json()

            return playlist
        }
        catch (error) {
            throw error
        }
    }


    // save this for conversion to redux-observable -- dont have time right now to convert.
    // need to setup xmlhttp request to server to get audio data
    public static fetchAudioData0(url: string): Observable<AjaxResponse> {

        const options: AjaxRequest = {
            url: url,
            responseType: 'arraybuffer'
        }
        return ajax(options)
    }


}