import React, { Component } from 'react'
import { connect } from 'react-redux'

import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map'
import { IPlayerState } from '../../models/player.interface'
import { IPlayerProps } from '../../models/player-state.interface'

import './Info.scss'
import '../../assets/default.png'

import { streamingUtility } from '../../store/effects/effects'
import { IAudioMetadata } from 'music-metadata-browser'

import { create } from 'exif-parser'
import Controls from '../Controls/Controls'
import { Tooltip, Slider } from '@material-ui/core'
import Playback from '../Playback/Playback'

interface Props {
    children: React.ReactElement;
    open: boolean;
    value: number;
}


@connect(mapStateToProps, mapDispatchToProps)
export default class Info extends Component<IPlayerState, IPlayerProps> {

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

    private handleMetadata(metadata: IAudioMetadata): void {

        const pictures = metadata.common.picture
        console.log(pictures)
        for (let i = 0; i < pictures.length; i++) {
            let parser = create(pictures[i].data).parse()

            console.log(parser)
        }
    }

    private configureView(): JSX.Element {
        if (this.props.isSongSet) {
            return (
                <div className="Info__Enclosure">
                    <div className="Info__Enclosure-Artwork">
                        <img className="Artwork" src={ this.picture } alt="Album Artwork" />
                    </div>
                    <div className="Info__Enclosure-Title"> 
                        <h5 className="Ellipse__Temp">{ this.props.song.name }</h5> {/* Info__Enclosure-Banner */}
                    </div> 
                    <div className="Info__Enclosure-Playback">
                        <Playback></Playback>
                    </div>
                </div>
            )
        } 
        else {
            return (
                <div className="Info__Enclosure">
                    <h5 className="Info__Enclosure-Default">{ this.props.song.name }</h5>
                </div>
            )
        }
    }
    
    public render(): JSX.Element {
        return (
            <div className="Info">
                { this.configureView() }
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