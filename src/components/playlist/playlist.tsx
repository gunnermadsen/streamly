import React, { Component } from 'react'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import { connect } from 'react-redux'
import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map'
import { IPlayerState } from '../../models/player.interface'
import { IPlayerProps } from '../../models/player-state.interface'
import {streamingUtility} from '../../store/effects/effects'

import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs'


import * as d3 from 'd3'
import './Playlist.scss'


@connect(mapStateToProps, mapDispatchToProps)
export default class Playlist extends Component<IPlayerState, IPlayerProps> {

    private destroy$: Subject<boolean> = new Subject<boolean>()
    public selectedIndex: number = 0
    public windowWidth: number = window.innerWidth - 10
    public windowHeight: number = window.innerHeight - 100
    private frequencyData: Uint8Array = null
    private colorScale: any
    private circleX: any
    private svg: any

    private handleListItemClick (value: any, index: number, song: any) {

        this.selectedIndex = index

        this.props.setAudioContext()
        
        this.props.setCurrentlyPlayingSong(song)

        // this.initializeChart(index)

        streamingUtility.getAnalyserData$().pipe(takeUntil(this.destroy$)).subscribe(
            (frequencyData: Uint8Array) => this.graphAudioData(frequencyData)
        )

    }

    private initializeChart(index: number): void {
        const id = `#list-elem-${index}`

        this.svg = d3.select(id).append('svg')
            .classed('item__graph', true)
            .attr('width', this.windowWidth / 3)
            .attr('height', 90)

        this.colorScale = d3.scaleLinear()
            .domain([0, 150])
            .range((["purple", "red", "green"]) as any)
    }

    private graphAudioData(data: Uint8Array): void {
        if (!data) return

        this.circleX = d3.scaleLinear()
            .domain([0, data.length])
            .range([0, this.windowWidth])

        let dots = this.svg.selectAll('circle')
            .data(data).enter().append('circle')
            .attr('r', (d: any) => this.windowWidth / data.length / 2 + .3)
            .attr('cx', (d: any, i: any) => this.circleX(i))
            .attr('cy', (d: any) => this.windowHeight / 2 - d)
            .attr('fill', (d: any, i: any) => this.colorScale(d))

        const drawChart = () => {

            requestAnimationFrame(drawChart)

            streamingUtility.setByteFrequencyData(data)

            this.svg
                .selectAll('circle').data(data)
                .attr('cy', (d: any) => this.windowHeight / 2 - d)
                .attr('fill', (d: any, i: any) => this.colorScale(d))
        }

        drawChart()
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
                                    id={`list-elem-${index}`}
                                    onClick={event => this.handleListItemClick(event, index, song)}>
                                    <ListItemText primary={song.name}/>
                                </ListItem>

                                // <svg className="item__graph"> 
                                //     <text x="20" y="45" className="item__title">{song.name}</text>
                                // </svg>
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
