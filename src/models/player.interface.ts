import { ISong } from "./track.interface";

export interface IPlayerState {
    playlist?: ISong[]
    song?: ISong
    volume?: number
    isPlaying?: boolean
    isSongSet?: boolean
    addAllSongs?(action: any)
    fetchPlaylist?()
    setAudioContext?()
    setCurrentlyPlayingSong?(action: any)
    setVolume?(volume: number)
    nextTrack?(track: ISong)
    previousTrack?(track: ISong)
    setPlayingState?(state: boolean)

}