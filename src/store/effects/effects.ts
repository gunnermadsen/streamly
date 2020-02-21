import { call, put, takeEvery, all } from 'redux-saga/effects'

import { PlaylistNetworkUtility } from '../../utils/playlist.http'
import { FETCH_PLAYLIST, PLAYLIST_FETCH_FAILED, SET_PLAYLIST, BEGIN_STREAMING, SET_CURRENTLY_PLAYING_SONG } from '../types/action-types'


function* fetchPlaylist(action) {
    try {

        const playlist = yield call(PlaylistNetworkUtility.fetchPlaylist)

        yield put({ type: SET_PLAYLIST, playlist: playlist })

    } catch (error) {

        yield put({ type: PLAYLIST_FETCH_FAILED, message: error })

    }
}

function* initiateSocketStream(action) {
    
}

// generator function syntax * () => yield value

export default function* sagaInitializer() {
    yield all([
        takeEvery(FETCH_PLAYLIST, fetchPlaylist),
        takeEvery(SET_CURRENTLY_PLAYING_SONG, initiateSocketStream)
    ])
}


