import React, { Component } from 'react'
import { connect } from 'react-redux'
import { environment as env } from '../../environment/environment'

import Playlist from '../Playlist/Playlist'
import Controls from '../Controls/Controls'
import Volume from '../Volume/Volume'
import Info from '../Info/Info'
import Uploader from '../Uploader/Uploader'
import Visualizer from '../Visualizer/Visualizer'



import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map'
import { IPlayerState } from '../../models/player.interface'
import { IPlayerProps } from '../../models/player-state.interface'

import './Streamer.scss'
import { ISong } from '../../models/track.interface'

import { streamingUtility } from '../../store/effects/effects'


@connect(mapStateToProps, mapDispatchToProps)
export default class Streamer extends Component<IPlayerState, IPlayerProps> {

    constructor(props) {
        super(props)
        this.props.fetchPlaylist()
    }

    private playNextSong(): void {

        const index = this.props.selectedIndex
 
        let song: ISong

        if (this.props.playlist.length - 1 === index) {
            song = this.props.playlist[0]
        }
        else {
            song = this.props.playlist[index + 1]
        }

        this.props.setCurrentlyPlayingSong(song)

    }

    private logMetadata(event: any): void {
        console.log(event)
    }


    public render(): JSX.Element {
        return (
            <div className="Streamer">
                <main className="Streamer__Enclosure-Main">
                    <header className="Main__Header">
                        <h3>Streamily</h3>
                        <Uploader></Uploader>
                    </header>
                    <div className="Main__Controls">
                        <div className="Main__Controls-Info">
                            <Info></Info>
                        </div>
                        <div className="Main__Controls-Actions">
                            <Controls></Controls>
                        </div>
                        <div className="Main__Controls-Volume">
                            <Volume></Volume>
                        </div>
                    </div>
                    <div className="Main__Playlist">
                        <Playlist></Playlist>
                    </div>
                    <div className="Main__Visualizer">
                        <Visualizer></Visualizer>
                    </div>
                </main>
            </div>
        )
    }

}
 //Streamer__Enclosure-Header