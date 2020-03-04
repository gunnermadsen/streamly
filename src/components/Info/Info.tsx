import React, { Component } from 'react'
import { connect } from 'react-redux'

import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map'
import { IPlayerState } from '../../models/player.interface'
import { IPlayerProps } from '../../models/player-state.interface'

import './Info.scss'
import '../../assets/default.png'

@connect(mapStateToProps, mapDispatchToProps)
export default class Info extends Component<IPlayerState, IPlayerProps> {

    private configureView(): JSX.Element {
        if (this.props.isSongSet) {
            return (
                <div className="Info__Enclosure">
                    <div className="Info__Enclosure-Artwork">
                        <img className="Artwork" src="/default.png" alt="Album Artwork" />
                    </div>
                    <div className="Info__Enclosure-Title"> 
                        <h5 className="Ellipse__Temp">{this.props.song.name}</h5> {/* Info__Enclosure-Banner */}
                    </div> 
                    <div className="Info__Enclosure-Scrubber">
                        
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
