import React, { Component } from 'react'
import { connect } from 'react-redux'

// import AudioStreamerUtility from '../../utils/player'

import { IPlayerState, IPlayerProps } from '../../store/reducers/reducer'

import './Info.scss'
import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map'

// const audioStreamer = new AudioStreamerUtility()

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