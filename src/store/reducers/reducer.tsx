import * as types from '../types/action-types'
import { IPlayerState } from '../../models/player.interface'
import { ISong } from '../../models/track.interface'



const initialState: IPlayerState = {
    playlist: [],
    song: {
        name: "Select a song!"
    },
    volume: 28,
    isPlaying: false,
    isSongSet: false, 
    selectedIndex: null
}

const findIndex = (state: IPlayerState, action: any) => 
    state.playlist.findIndex(
        (song: ISong) => 
            {
                return song.name === action.song.name
            }
    )


export default function rootReducer(state = initialState, action) {

    switch (action.type) {
        case types.SET_PLAYLIST: {
            return {
                ...state,
                playlist: action.playlist
            }
        }
        case types.SET_CURRENTLY_PLAYING_SONG: {

            const index = findIndex(state, action)

            return {
                ...state,
                song: action.song,
                isPlaying: true,
                isSongSet: true,
                selectedIndex: index
            }

        }
        case types.ADD_UPLOADED_TRACK_TO_PLAYLIST: {

            const playlist = [ ...state.playlist, action.track ]

            return {
                ...state,
                playlist: playlist
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