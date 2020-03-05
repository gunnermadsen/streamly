import React, { Component } from 'react'
import { connect } from "react-redux";
import { mapStateToProps, mapDispatchToProps } from "../../shared/state.map";
import { IPlayerState } from "../../models/player.interface";
import { IPlayerProps } from "../../models/player-state.interface";

import './Visualizer.scss'
import { streamingUtility } from '../../store/effects/effects'
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import * as d3 from 'd3'

@connect(mapStateToProps, mapDispatchToProps)
export default class Visualizer extends Component<IPlayerState, IPlayerProps> {
    public windowWidth: number = window.innerWidth - 10
    public windowHeight: number = window.innerHeight - 100
    private frequencyData: Uint8Array = null
    private colorScale: any
    private circleX: any
    private svg: any
    private readonly frequencyBinCount = 174
    private readonly maxStdAmplitude = 16
    private xScaler: any = d3.scaleLinear().domain([0, this.frequencyBinCount - 1]).range([0, 200])
    private yScaler: any = d3.scaleLinear().domain([0, this.maxStdAmplitude]).range([100, 0])
    private readonly COLOR_SCALE_ARRAY = [
        d3.interpolateRdYlGn,
        d3.interpolateYlGnBu,
        d3.interpolateSpectral,
        d3.interpolateRainbow,
        d3.interpolateWarm,
        d3.interpolateCool
    ]
    private destroy$: Subject<boolean> = new Subject<boolean>()
 
    constructor(props) { 
        super(props)
        this.initializeSubscriptions()
    }

    public componentDidMount() {
        this.initializeChart()
    }

    private initializeSubscriptions(): void {

        streamingUtility.frequencyData$.pipe(takeUntil(this.destroy$))
            .subscribe(
                (frequencyData: Uint8Array) =>
                    this.graphAudioData(frequencyData)
            )
        
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

        // const id = `#list-elem-${index}`

        this.svg = d3.select("#visualizer").append('svg')
            .classed('item__graph', true)
            .attr('width', this.windowWidth / 2)
            .attr('height', 115)
            .classed('led-border', true)
        // .call(d3.axisLeft(this.yScaler).ticks(30).tickSize(-this.windowWidth / 1.1).tickFormat(d3.format(",.0f")))

        this.colorScale = d3.scaleLinear()
            .domain([0, 150])
            .range((["purple", "red", "green"]) as any)
    }

    private graphAudioData(data: Uint8Array): void {
        if (!data || !this.svg) return
        

        // logic for circles

        // this.circleX = d3.scaleLinear()
        //     .domain([0, data.length])
        //     .range([0, this.windowWidth])

        // let dots = this.svg.selectAll('circle')
        //     .data(data).enter().append('circle')
        //     .attr('r', (d: any) => this.windowWidth / data.length + .3)
        //     .attr('cx', (d: any, i: any) => this.circleX(i))
        //     .attr('cy', (d: any) => this.windowHeight / 2 - d)
        //     .attr('fill', (d: any, i: any) => this.colorScale(d))

        const color = d3.scaleSequential((index) => index).domain([0, this.frequencyBinCount]).interpolator(d3.interpolateRainbow)

        const w = this.xScaler(1) - this.xScaler(0)
        const rx = w * 0.1
        // logic for rectangles
        let rects = this.svg.selectAll('rect')
            .data(data).enter().append('rect')
            .style('fill', (datum: any, index: any) => color)
            .style('transition-timing-function', 'linear')
            .style('transition-duration', '5ms')
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


        const drawChart = () => {
            requestAnimationFrame(drawChart)
            streamingUtility.setByteFrequencyData(data)
            // logic for circles
            // this.svg
            //     .selectAll('circle').data(data)
            //     .attr('cy', (d: any) => this.windowHeight / 2 - d)
            //     .attr('fill', (d: any, i: any) => this.colorScale(d))
            this.svg.selectAll('rect')
                .data(data)
                    .transition()
                        .duration(5)
                            .ease(d3.easeLinear)
                .style('fill', (datum: any, index: any) => color)

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