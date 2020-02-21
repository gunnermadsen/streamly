import { IPlayerState } from "../store/reducers/reducer"
import * as action from "../store/types/action-types"


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
                  previousTrack: track      => dispatch({ type: action.PREVIOUS_TRACK, song: track }),
                  fetchPlaylist: ()         => dispatch({ type: action.FETCH_PLAYLIST }),
                    addPlaylist: playlist   => dispatch({ type: action.SET_PLAYLIST, playlist: playlist }),
                      nextTrack: track      => dispatch({ type: action.NEXT_TRACK, song: track }),
                      setVolume: volume     => dispatch({ type: action.SET_VOLUME, volume: volume })
    }
}
