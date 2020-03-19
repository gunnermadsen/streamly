import React, { Component } from 'react'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import { connect } from 'react-redux'
import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map'
import { IPlayerState } from '../../models/player.interface'
import { IPlayerProps } from '../../models/player-state.interface'
import { streamingUtility } from '../../store/effects/effects'

import './Playlist.scss'
import { ISong } from '../../models/track.interface'


@connect(mapStateToProps, mapDispatchToProps)
export default class Playlist extends Component<IPlayerState, IPlayerProps> {

    public selectedIndex: number = 0

    private formatPattern: RegExp = new RegExp('.(wav|mp3|m4a|ogg|flac)', 'gi') 

    private handleListItemClick(value: any, index: number, song: ISong) {

        this.selectedIndex = index

        if (!this.props.isPlaying) {
            this.props.setAudioContext(song)
        } else {
            streamingUtility.sourceNode.stop()
            
            // streamingUtility.frequencyData = null
        }
        
        this.props.setCurrentlyPlayingSong(song)        

    }
 
    public render() {
        // filter out files that are not the allowed file format e.g. wav, mp3, m4a, ogg, or flac
        const playlist = this.props.playlist.filter(track => this.formatPattern.test(track.name))
        return (
            <div className="Playlist__Container">
                <List component="nav" aria-label="main mailbox folders">
                    {
                        playlist.map((song, index) => {
                            return (
                                <ListItem 
                                    key={index} 
                                    className="streamer__list-item" 
                                    button 
                                    selected={this.selectedIndex === index}
                                    onClick={event => this.handleListItemClick(event, index, song)}>
                                    <ListItemText className="item__label" primary={song.name.replace(this.formatPattern, '')}/>
                                </ListItem>
                            )
                        })
                    }
                </List>
            </div>
        )
    }
    
}
