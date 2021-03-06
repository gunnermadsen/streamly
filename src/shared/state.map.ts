import * as action from "../store/types/action-types"
import { IPlayerState } from "../models/player.interface"


export const mapStateToProps = (state: IPlayerState) => {
    return {
        playlist: state.playlist,
        song: state.song,
        isPlaying: state.isPlaying,
        isSongSet: state.isSongSet,
        volume: state.volume
    }
}

export const mapDispatchToProps = dispatch => {
    return {
        setCurrentlyPlayingSong: track      => dispatch({ type: action.SET_CURRENTLY_PLAYING_SONG, song: track }),
                setPlayingState: track      => dispatch({ type: action.SET_PLAYING_STATE, song: track }),
                setAudioContext: ()         => dispatch({ type: action.SET_AUDIO_CONTEXT }),
                  fetchPlaylist: ()         => dispatch({ type: action.FETCH_PLAYLIST }),
                  stopStreaming: ()         => dispatch({ type: action.STOP_STREAMING }),
                  previousTrack: track      => dispatch({ type: action.PREVIOUS_TRACK, song: track }),
                    addPlaylist: playlist   => dispatch({ type: action.SET_PLAYLIST, playlist: playlist }),
                      nextTrack: track      => dispatch({ type: action.NEXT_TRACK, song: track }),
                      setVolume: volume     => dispatch({ type: action.SET_VOLUME, volume: volume })
    }
}
