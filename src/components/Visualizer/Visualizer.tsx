import React, { Component } from 'react'
import { connect } from "react-redux"
import { mapStateToProps, mapDispatchToProps } from "../../shared/state.map"
import { IPlayerState } from "../../models/player.interface"
import { IPlayerProps } from "../../models/player-state.interface"

import './Visualizer.scss'
import { streamingUtility } from '../../store/effects/effects'
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs'

import * as d3 from 'd3'

@connect(mapStateToProps, mapDispatchToProps)
export default class Visualizer extends Component<IPlayerState, IPlayerProps> {
    public windowWidth: number = window.innerWidth - 10
    public windowHeight: number = window.innerHeight - 100
    private frequencyData: Uint8Array = null
    private colorScale: any
    private circleX: any
    private svg
    private customSvg
    private canvas
    private canvasContext
    private readonly frequencyBinCount = 12
    private readonly maxStdAmplitude = 16
    private xScaler = d3.scaleLinear().domain([0, this.frequencyBinCount - 1]).range([0, 150])
    private yScaler = d3.scaleLinear().domain([0, this.maxStdAmplitude]).range([32, 0])
    private destroy$: Subject<boolean> = new Subject<boolean>()
 
    constructor(props) { 
        super(props)
        this.initializeSubscriptions()
    }

    public componentDidMount() {
        this.initializeChart()
    }

    private initializeSubscriptions(): void {

        // the streamer utility exposes observables as part of its interface, 
        // lets subscribe to them!

        streamingUtility.frequencyData$.pipe(takeUntil(this.destroy$))
            .subscribe(
                (frequencyData: Uint8Array) =>
                    this.graphAudioData(frequencyData)
            )
        
        // note, we may not need this subscription, or the method that it calls
        streamingUtility.sourceNode$.pipe(takeUntil(this.destroy$))
            .subscribe(
                (sourceNode: AudioBufferSourceNode) =>
                    this.listenForSourceEvents(sourceNode)
            )
    }

    private listenForSourceEvents(sourceNode: AudioBufferSourceNode): void {

        if (this.props.isPlaying) {
            this.svg.selectAll('*').remove()
        }

        streamingUtility.frequencyData = null

        console.log("Source event triggered")

    }

    private initializeChart(): void {

        let data = []
        let value = 256

        // append an svg element to the dom with the dimensions
        this.svg = d3.select("#visualizer")
            .append('svg')
            .classed('item__graph', true)
            .classed('led-border', true)
                .attr('width', this.windowWidth / 2)
                .attr('height', 115)

            // .call(
            //     d3.axisLeft(this.yScaler).ticks(30).tickSize(-this.windowWidth / 1.1)
            //         .tickFormat(
            //             d3.format("" as any)
            //         )
            // )

        d3.range(value).forEach((el: any) => data.push({ value: el }))

        // create a color scale function to define a range of colors used in the visualizer
        // this.colorScale = d3.scaleLinear().domain([0, 150]).range((["pink", "red"]) as any)
        this.colorScale = d3.scaleSequential(d3.interpolateViridis).domain(d3.extent(data, (d: any) => d.value))

    }

    private graphAudioData(data: Uint8Array): void {
        if (!data || !this.svg) return

        const w = this.xScaler(1) - this.xScaler(0)
        const rx = w * 0.1
        // lets draw rectangles to the svg using the byte array data from the streamer utility observable
        let rects = this.svg.selectAll('rect')
            .data(data).enter().append('rect')
            .style('fill', (datum: any, index: any) => this.colorScale(datum))
            .attr('width', () => w) // this.windowWidth / data.length + .3
            .attr('rx', rx)
            .attr('x', (datum: any, index: any) => this.xScaler(index))
            .attr('y', (datum: any, index: any) => this.yScaler(datum))
            .attr('height', (datum: any) => (this.yScaler(0) - this.yScaler(datum))) //
            .attr('opacity', 0)
                .transition()
                    .duration(0)
                        .ease(d3.easeLinear)
            .attr('opacity', 0.6)


        // create a function to recursively re render the chart
        const drawChart = () => 
        {
            // repaint the DOM using this drawChart() function
            requestAnimationFrame(drawChart)

            // set the byte frequency data for the audio context analyser node 
            streamingUtility.byteFrequencyData = data

            // redraw the rectangles in the visualization
            this.svg.selectAll('rect')
                .data(data)
                    .transition()
                        .duration(5)
                            .ease(d3.easeLinear)
                .style('fill', (datum: any, index: any) => this.colorScale(datum))

                .attr('y', (datum: any, index: any) => this.windowHeight / 4 - datum)
                .attr('height', (datum: any, index: any) => (this.yScaler(0) - this.yScaler(datum)))
        }

        drawChart()
    }

    public render(): JSX.Element {
        return (
            <div className="Visualizer__Container" id="visualizer"></div>
        )
    }

    componentWillUnmount() {
        this.destroy$.next(false)
        this.destroy$.unsubscribe()
    }
}