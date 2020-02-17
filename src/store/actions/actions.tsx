import { ADD_ALL_SONGS } from '../types/action-types'

export function addAllSongs(payload) {
    return { type: ADD_ALL_SONGS, payload }
}