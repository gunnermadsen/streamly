import React, { Component } from 'react'
import { connect } from 'react-redux'


import Playlist from '../Playlist/Playlist'
import Controls from '../Controls/Controls'
import Volume from '../Volume/Volume'
import Info from '../Info/Info'

import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map'
import { IPlayerState } from '../../models/player.interface'
import { IPlayerProps } from '../../models/player-state.interface'

import './Streamer.scss'

@connect(mapStateToProps, mapDispatchToProps)
export default class Streamer extends Component<IPlayerState, IPlayerProps> {

    constructor(props) {
        super(props)
        this.props.fetchPlaylist()
    }


    public render(): JSX.Element {
        // onClick={() => this.props.setCurrentlyPlayingSong} playlist={this.props.playlist}
        return (
            <div className="Streamer">
                <div className="Streamer__Enclosure">
                    <header className="Streamer__Enclosure-Header">
                        <h3>Streamily</h3>
                    </header>
                    <main className="Streamer__Enclosure-Main">
                        <div className="Main__Controls">
                            <Controls></Controls>
                            <div className="Main__Controls-Info">
                                <Info></Info>
                            </div>
                            <div className="Main__Controls-Volume">
                                <Volume></Volume>
                            </div>
                        </div>
                        <div className="Main__Playlist">
                            <Playlist></Playlist>
                        </div>
                    </main>
                </div>
            </div>
        )
    }
}

// export default connect(mapStateToProps, mapDispatchToProps)(Streamer)
