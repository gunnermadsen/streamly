import React, { Component } from 'react'
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import PauseIcon from '@material-ui/icons/Pause'
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import IconButton from '@material-ui/core/IconButton'

import { connect } from 'react-redux'
import { IPlayerState, IPlayerProps } from '../../store/reducers/reducer';
import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map';

import './Controls.scss'

@connect(mapStateToProps, mapDispatchToProps)
export default class Controls extends Component<IPlayerState, IPlayerProps>{

    public setPlayingState(event: any): void {

        // if ()

        const isPlaying = !this.props.isPlaying

        const message = this.props.isPlaying ? "Song is playing" : "Song is paused"

        console.log(message)

        this.props.setPlayingState(isPlaying)

    }

    public render(): JSX.Element {
        return (
            <div className="Controls">
                <div className="Controls__Track">
                    <div className="Controls__Track-Action">
                        <IconButton className="" aria-label="add an alarm">
                            <SkipPreviousIcon />
                        </IconButton>
                        <IconButton className="Action__Center" aria-label="Pause the current track" onClick={event => this.setPlayingState(event)}>
                            {
                                this.props.isPlaying ? <PauseIcon /> : <PlayArrowIcon />
                            }
                        </IconButton>
                        <IconButton className="" aria-label="add an alarm">
                            <SkipNextIcon />
                        </IconButton>
                    </div>
                </div>
            </div>
        )
    }
}
