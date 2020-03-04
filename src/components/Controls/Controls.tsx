import React, { Component } from 'react'
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import PauseIcon from '@material-ui/icons/Pause'
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import IconButton from '@material-ui/core/IconButton'

import './Controls.scss'

import { connect } from 'react-redux'
import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map';
import { environment as env } from '../../environment/environment'

import { IPlayerState } from '../../models/player.interface';
import { IPlayerProps } from '../../models/player-state.interface';

import { streamingUtility } from '../../store/effects/effects'


@connect(mapStateToProps, mapDispatchToProps)
export default class Controls extends Component<IPlayerState, IPlayerProps> {

    public setPlayingState(event: any): void {

        // if the play button is clicked, and a song has NOT been set, 
        // dispatch an action to play the first song, then exit the method
        if (!this.props.isSongSet) {

            this.props.setCurrentlyPlayingSong(this.props.playlist[0])
            streamingUtility.audioElementRef.src = `${env.apiUrl}/repository/${env.userId}/${this.props.playlist[0].name}`

            return 
        }

        const isPlaying = !this.props.isPlaying

        this.props.setPlayingState(isPlaying)

    }

    public playPreviousSong(): void {
        const track = this.props.playlist[this.props.selectedIndex - 1]

        this.props.previousTrack(track)
    }

    public playNextSong(): void {
        const track = this.props.playlist[this.props.selectedIndex + 1]
        
        this.props.nextTrack(track)
    }

    public render(): JSX.Element {
        return (
            <div className="Controls">
                <div className="Controls__Track">
                    <div className="Controls__Track-Action">
                        <IconButton className="" color="primary" aria-label="add an alarm" onClick={() => this.playPreviousSong()}>
                            <SkipPreviousIcon />
                        </IconButton>
                        <IconButton className="Action__Center" color="primary" aria-label="Pause the current track" onClick={event => this.setPlayingState(event)}>
                            {
                                this.props.isPlaying ? <PauseIcon /> : <PlayArrowIcon />
                            }
                        </IconButton>
                        <IconButton className="" color="primary" aria-label="add an alarm" onClick={() => this.playNextSong()}>
                            <SkipNextIcon />
                        </IconButton>
                    </div>
                </div>
            </div>
        )
    }
}
