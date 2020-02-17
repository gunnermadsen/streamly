import * as types from '../types/action-types'

const initialState = {
    songs: []
}

export default function rootReducer(state = initialState, action) {

    switch (action.type) {
        case types.ADD_ALL_SONGS: {
            return {
                ...state,
                songs: action.payload.songs
            }
        }
        default: {
            return state
        }
    }
}