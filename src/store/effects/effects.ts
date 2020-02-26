import { call, put, takeEvery, all } from 'redux-saga/effects'
import { PlaylistNetworkUtility } from '../../utils/streamer.util'
import * as types from '../types/action-types'

export const streamingUtility = new PlaylistNetworkUtility()

const id = '5d2f818f81808747b77a8d17'

function* fetchPlaylist(action) {
    try {

        const playlist = yield call(streamingUtility.fetchPlaylist)

        yield put({ type: types.SET_PLAYLIST, playlist: playlist })

    } catch (error) {

        yield put({ type: types.PLAYLIST_FETCH_FAILED, message: error })

    }
}

function* startAudioContext(action) {
    try {
        yield call(() => streamingUtility.setAudioContext())
    }
    catch (error) {
        yield put({ type: types.SET_AUDIO_CONTEXT_FAILED })
    }
}

function* initiateSocketStream(action) {
    try {

        yield call(() => streamingUtility.emitEvent('track', { ...action.song, id: id }))

    }
    catch (error) {

        yield put({ type: types.TRACK_STREAM_FAILED })

    }
}

export default function* sagaInitializer() {
    yield all([
        takeEvery(types.FETCH_PLAYLIST, fetchPlaylist),
        takeEvery(types.SET_CURRENTLY_PLAYING_SONG, initiateSocketStream),
        takeEvery(types.SET_AUDIO_CONTEXT, startAudioContext)
    ])
}
