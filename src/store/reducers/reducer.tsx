import * as types from '../types/action-types'

export interface ISong {
    name?: string
}

export interface IPlayerState {
    playlist?: ISong[]
    song?: ISong
    volume?: number
    isPlaying?: boolean
    isSongSet?: boolean
    addAllSongs?(action: any)
    fetchPlaylist?()
    setCurrentlyPlayingSong?(action: any)
    setVolume?(volume: number)
    nextTrack?(track: ISong)
    previousTrack?(track: ISong)
    setPlayingState?(state: boolean)

}

export interface IPlayerProps { }

const initialState: IPlayerState = {
    playlist: [],
    song: {
        name: "Select a song!"
    },
    volume: 28,
    isPlaying: false,
    isSongSet: false
}



export default function rootReducer(state = initialState, action) {

    switch (action.type) {
        case types.SET_PLAYLIST: {
            return {
                ...state,
                playlist: action.playlist
            }
        }
        case types.SET_CURRENTLY_PLAYING_SONG: {
            return {
                ...state,
                song: action.song,
                isPlaying: true,
                isSongSet: true
            }
        }
        case types.SET_VOLUME: {
            return {
                ...state,
                volume: action.volume 
            }
        }
        case types.SET_PLAYING_STATE: {
            return {
                ...state,
                isPlaying: action.isPlaying,
                isSongSet: true
            }
        }
        case types.PREVIOUS_TRACK: {
            return {
                ...state,
                song: action.song
            }
        }
        case types.NEXT_TRACK: {
            return {
                ...state,
                song: action.song
            }
        }
        default: {
            return state
        }
    }
}