import React, { Component } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { connect } from 'react-redux'

// import AudioStreamerUtility from '../../utils/player'

import { IPlayerState, IPlayerProps } from '../../store/reducers/reducer'
import './Playlist.scss'
import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map'
// const audioStreamer = new AudioStreamerUtility()


@connect(mapStateToProps, mapDispatchToProps)
export default class Playlist extends Component<IPlayerState, IPlayerProps> {

    public selectedIndex: number = 0

    private handleListItemClick (value: any, index: number, song: any) {
        
        this.props.setCurrentlyPlayingSong(song)

    }

    public render() {
        return (
            <div className="Playlist__Container">
                <List component="nav" aria-label="main mailbox folders">
                    {
                        this.props.playlist.map((song, index) => {
                            return (
                                <ListItem 
                                    key={index.toString()} 
                                    className="streamer__list-item" 
                                    button 
                                    selected={this.selectedIndex === index} 
                                    onClick={event => this.handleListItemClick(event, index, song)}>
                                    <ListItemText primary={song.name} />
                                </ListItem>
                            )
                        })
                    }
                </List>
            </div>
        )
    }
    
}

// export default connect(mapStateToProps, mapDispatchToProps, null)(Playlist)