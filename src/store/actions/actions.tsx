import { SET_CURRENTLY_PLAYING_SONG, SET_PLAYING_STATE, SET_VOLUME, FETCH_PLAYLIST, SET_PLAYLIST } from '../types/action-types'

export function setPlaylist(payload) {
    return { type: SET_PLAYLIST, payload }
}

export function fetchPlaylist(payload) {
    return { type: FETCH_PLAYLIST, payload }
}

export function setCurrentlyPlayingSong(payload) {
    return { type: SET_CURRENTLY_PLAYING_SONG, payload }
}

export function setVolume(payload) {
    return { type: SET_VOLUME, payload }
}

export function setPlayingState(playload) {
    return { type: SET_PLAYING_STATE }
}