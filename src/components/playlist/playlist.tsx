import React, { Component } from 'react'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import { connect } from 'react-redux'
import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map'
import { IPlayerState } from '../../models/player.interface'
import { IPlayerProps } from '../../models/player-state.interface'
import { streamingUtility } from '../../store/effects/effects'

import { Subject } from 'rxjs'


import './Playlist.scss'
import { environment as env } from '../../environment/environment'
import { ISong } from '../../models/track.interface'
import { takeUntil } from 'rxjs/operators'


@connect(mapStateToProps, mapDispatchToProps)
export default class Playlist extends Component<IPlayerState, IPlayerProps> {

    private destroy$: Subject<boolean> = new Subject<boolean>()
    public selectedIndex: number = 0

    constructor(props) {
        super(props)
        this.initializeSubscriptions()
    }

    private initializeSubscriptions(): void {
        
        streamingUtility.sourceNode$.pipe(takeUntil(this.destroy$))
            .subscribe(
                (sourceNode: AudioBufferSourceNode) =>
                    this.listenForSourceEvents(sourceNode)
            )
        
    }

    private listenForSourceEvents(sourceNode: AudioBufferSourceNode): void {

        streamingUtility.frequencyData = null
        
        console.log("Song has ended, playing next song")

    }

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
        return (
            <div className="Playlist__Container">
                <List component="nav" aria-label="main mailbox folders">
                    {
                        this.props.playlist.map((song, index) => {
                            return (
                                <ListItem 
                                    key={index} 
                                    className="streamer__list-item" 
                                    button 
                                    selected={this.selectedIndex === index}
                                    onClick={event => this.handleListItemClick(event, index, song)}>
                                    <ListItemText className="item__label" primary={song.name.replace(/.(wav|mp3|m4a|ogg|flac)/gi, '')}/>
                                </ListItem>
                            )
                        })
                    }
                </List>
            </div>
        )
    }

    componentWillUnmount() {
        this.destroy$.next(false)
        this.destroy$.unsubscribe()
    }
    
}
