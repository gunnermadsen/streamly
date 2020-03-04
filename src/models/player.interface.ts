import { ISong } from "./track.interface";

export interface IPlayerState {
    playlist?: ISong[] 
    song?: ISong
    volume?: number
    isPlaying?: boolean
    isSongSet?: boolean
    selectedIndex?: number
    addAllSongs?(action: any)
    fetchPlaylist?()
    setAudioContext?(song: ISong)
    uploadFile?(files: FileList)
    setCurrentlyPlayingSong?(action: any)
    setVolume?(volume: number)
    nextTrack?(track: ISong)
    previousTrack?(track: ISong)
    setPlayingState?(state: boolean)
    stopStreaming?()

}