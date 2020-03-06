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
    private readonly frequencyBinCount = 128
    private readonly maxStdAmplitude = 16
    private xScaler = d3.scaleLinear().domain([0, this.frequencyBinCount - 1]).range([0, 200])
    private yScaler = d3.scaleLinear().domain([0, this.maxStdAmplitude]).range([185, 0])
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

        let data = []
        let value = 256
        // var width = 750,
        //     height = 400

        this.svg = d3.select("#visualizer")
            .append('svg')
            .classed('item__graph', true)
            .classed('led-border', true)
                .attr('width', this.windowWidth / 2)
                .attr('height', 115)
                // .attr('stroke-width', 0.2)
                // .attr('stroke', 'white')

            .call(
                d3.axisLeft(this.yScaler)
                    .ticks(30)
                    .tickSize(-this.windowWidth / 1.1)
                    
                    .tickFormat(
                        d3.format("" as any)
                    )
            )

        // this.canvasContext = this.canvas.node().getContext('2d')

        // const customBase = document.createElement('custom')
        // this.customSvg = d3.select(customBase)

        d3.range(value).forEach((el: any) => data.push({ value: el }))

        // this.colorScale = d3.scaleLinear().domain([0, 150]).range((["purple", "red", "green"]) as any)
        this.colorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain(d3.extent(data, (d: any) => d.value))

        // var nextCol = 1

        // const genColor = () => {
        //     var ret = []
        //     // via http://stackoverflow.com/a/15804183
        //     if (nextCol < 16777215) {
        //         ret.push((nextCol & 0xff)) // R
        //         ret.push((nextCol & 0xff00) >> 8) // G 
        //         ret.push((nextCol & 0xff0000) >> 16) // B

        //         nextCol += 1
        //     }
        //     var col = "rgb(" + ret.join(',') + ")"
        //     return col
        // }

        // var colourToNode = {} // map to track the colour of nodes

        // const join = this.customSvg.selectAll('custom.rect').data(data)
        // var groupSpacing = 4
        // var cellSpacing = 2
        // var cellSize = Math.floor((width - 11 * groupSpacing) / 100) - cellSpacing

        // const dataBind = (data) => {
        //     var enterSel = join.enter()
        //         .append('custom')
        //         .attr('class', 'rect')
        //         .attr('x', function (d, i) {
        //             var x0 = Math.floor(i / 100) % 10, x1 = Math.floor(i % 10)
        //             return groupSpacing * x0 + (cellSpacing + cellSize) * (x1 + x0 * 10)
        //         })
        //         .attr('y', function (d, i) {
        //             var y0 = Math.floor(i / 1000), y1 = Math.floor(i % 100 / 10)
        //             return groupSpacing * y0 + (cellSpacing + cellSize) * (y1 + y0 * 10)
        //         })
        //         .attr('width', 0)
        //         .attr('height', 0)

        //     join
        //         .merge(enterSel)
        //         .transition()
        //         .attr('width', cellSize)
        //         .attr('height', cellSize)
        //         .attr('fillStyle', function (d) { return this.colorScale(d.value) })

        //         // new -----------------------------------------------------

        //         .attr('fillStyleHidden', function (d) {
        //             if (!d.hiddenCol) {

        //                 d.hiddenCol = genColor()
        //                 colourToNode[d.hiddenCol] = d

        //             } // here we (1) add a unique colour as property to each element and (2) map the colour to the node in the colourToNode-dictionary 

        //             return d.hiddenCol

        //         })
        // }
        
        

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

        // const color = d3.scaleSequential((index) => index).domain([0, this.frequencyBinCount]).interpolator(d3.interpolateRainbow)

        const w = this.xScaler(1) - this.xScaler(0)
        const rx = w * 0.1
        // logic for rectangles
        let rects = this.svg.selectAll('rect')
            .data(data).enter().append('rect')
            .style('fill', (datum: any, index: any) => this.colorScale(datum))
            // .style('transition-timing-function', 'linear')
            // .style('transition-duration', '5ms')
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