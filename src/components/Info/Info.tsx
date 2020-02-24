import React, { Component } from 'react'
import { connect } from 'react-redux'

import './Info.scss'
import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map'
import { IPlayerState } from '../../models/player.interface'
import { IPlayerProps } from '../../models/player-state.interface'


@connect(mapStateToProps, mapDispatchToProps)
export default class Info extends Component<IPlayerState, IPlayerProps> {

    public render() {
        return (
            <div className="Info">
                <div className="Info__Enclosure">
                    {
                        this.props.isSongSet
                            ? <h5 className="Info__Enclosure-Banner">{this.props.song.name}</h5>
                            : <h5 className="Info__Enclosure-Default">{this.props.song.name}</h5>
                    }
                </div>
            </div>
        )
    }
}


// export default connect(mapStateToProps, mapDispatchToProps, null)(Info)