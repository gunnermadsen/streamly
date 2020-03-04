import { call, put, takeEvery, all } from 'redux-saga/effects'
import { PlaylistNetworkUtility } from '../../utils/streamer.util'
import * as types from '../types/action-types'


export const streamingUtility = new PlaylistNetworkUtility()

function* fetchPlaylist() {
    try {

        const playlist = yield call(streamingUtility.fetchPlaylist)

        yield put({ type: types.SET_PLAYLIST, playlist: playlist })

    } catch (error) {

        yield put({ type: types.PLAYLIST_FETCH_FAILED, message: error })

    }
}

function* setVolume(action: any) {
    try {
        yield call(() => streamingUtility.setVolume(action))
    }
    catch (error) {
        yield put({ type: types.SET_VOLUME_FAILED, message: error })
    }
}

function* setPlayingState(action: any) {
    try {
        yield call(() => streamingUtility.setPlayingState(action))
    }
    catch (error) {
        yield put({ type: types.SET_PLAYING_STATE_FAILED, message: error })
    }
}

function* setPlayingSong(action: any) {
    try {
        yield call(() => streamingUtility.fetchAudioData(action))
    }
    catch (error) {
        yield put({ type: types.SET_CURRENTLY_PLAYING_SONG_FAILED, message: error })
    }
}

function* initializeAudioContext(action: any) {
    try {

        yield call(() => streamingUtility.initializeAudioContext(action))


    } 
    catch (error) {
        yield put({ type: types.SET_AUDIO_CONTEXT_FAILED})
    }
}

function* setTrack(action: any) {
    try {

        yield call(() => streamingUtility.setTrack(action))

        yield put({ type: types.SET_CURRENTLY_PLAYING_SONG, song: action.song })
        
    } 
    catch (error) {

        yield put({ type: types.SET_NEXT_TRACK_FAILED })

    }
}

function* uploadFile(action: any) {
    try {

        yield call(() => streamingUtility.uploadFile(action))

        yield put({ type: types.ADD_UPLOADED_TRACK_TO_PLAYLIST, song: action.song })

    }
    catch (error) {

        yield put({ type: types.SET_NEXT_TRACK_FAILED })

    }
}

export default function* sagaInitializer() {
    yield all([
        takeEvery(types.FETCH_PLAYLIST, fetchPlaylist),
        takeEvery(types.SET_AUDIO_CONTEXT, initializeAudioContext),
        takeEvery(types.SET_CURRENTLY_PLAYING_SONG, setPlayingSong),
        takeEvery(types.SET_VOLUME, setVolume),
        takeEvery(types.SET_PLAYING_STATE, setPlayingState),
        takeEvery([ types.PREVIOUS_TRACK, types.NEXT_TRACK ], setTrack),
        takeEvery(types.UPLOAD_FILE, uploadFile)
    ])
}
