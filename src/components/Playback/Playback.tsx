import React, { Component } from 'react'
import { connect } from 'react-redux'

import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map'
import { IPlayerState } from '../../models/player.interface'
import { IPlayerProps } from '../../models/player-state.interface'

import './Playback.scss'
import '../../assets/default.png'

import { streamingUtility } from '../../store/effects/effects'
import { IAudioMetadata } from 'music-metadata-browser'

import { create } from 'exif-parser'
import Controls from '../Controls/Controls'
import { Tooltip, Slider } from '@material-ui/core'

interface Props {
    children: React.ReactElement;
    open: boolean;
    value: number;
}


@connect(mapStateToProps, mapDispatchToProps)
export default class Playback extends Component<IPlayerState, IPlayerProps> {

    private picture: string = '/default.png'

    constructor(props) {
        super(props)
        this.initializeSubscriptions()
    }

    private initializeSubscriptions(): void {

        // streamingUtility.trackMetadata$.subscribe(
        //     (metadata: IAudioMetadata) => this.handleMetadata(metadata)
        // )

    }

    public render(): JSX.Element {
        return (
            <div className="Playback__Enclosure">
                <div className="Playback__Enclosure-Start">
                    {"0:00"}
                </div>
                <div className="Playback__Enclosure-Slider">
                    <Slider
                        ValueLabelComponent={ValueLabelComponent}
                        aria-label="custom thumb label"
                        defaultValue={0}
                    />
                </div>
                <div className="Playback__Enclosure-End">
                    {"5:00"}
                </div>
            </div>
        )
    }
}


function ValueLabelComponent(props: Props) {
    const { children, open, value } = props;

    return (
        <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
            {children}
        </Tooltip>
    );
}