import React, { Component } from 'react'
import './Playback.scss'
import '../../assets/default.png'

import { streamingUtility } from '../../store/effects/effects'

import { Tooltip, Slider } from '@material-ui/core'
import { Subject } from 'rxjs'
import { takeUntil, tap, distinctUntilChanged } from 'rxjs/operators'

interface Props {
    children: React.ReactElement;
    open: boolean;
    value: number;
}

interface IPlayback { 
    duration?: number
    timeElapsed?: number
}


// @connect(mapStateToProps, mapDispatchToProps)
export default class Playback extends Component<IPlayback> {

    private destroy$: Subject<boolean> = new Subject<boolean>()
    private timeElapsed = 0
    private duration = 0

    public state = {
        timeElapsed: 0,
        duration: 0
    }

    
    constructor(props) {
        super(props)
        this.initializeSubscriptions()
    }


    private initializeSubscriptions(): void {

        streamingUtility.duration$.pipe(
            tap((duration: number) => {
                if (duration === 0) {
                    this.resetPlaybackState()
                }
            }),
            takeUntil(this.destroy$)
        )
        .subscribe(
            duration => 
                this.handleDuration(duration)
        )

        streamingUtility.currentTime$.pipe(
            tap((currentTime: number) => {
                if (currentTime === 0) {
                    this.resetPlaybackState()
                }
            }),
            // distinctUntilChanged(),
            takeUntil(this.destroy$)
        )
        .subscribe(
            currentTime => 
                this.handleCurrentTimeUpdates(currentTime)
        )
        
    }


    private resetPlaybackState(): void {
        this.setState({ duration: 0, currentTime: 0 })
    }


    private handleDuration(duration: number): void {
        // using the unary plus operator to convert string to number
        let total = +duration.toFixed(2)

        this.setState({ duration: total })

        if (duration === 0) {
            console.log("Updated the time elapsed value with: ", this.state.duration)
        }
    }


    private handleCurrentTimeUpdates(currentTime: number): void {
        let update = Math.round(currentTime)

        this.setState({ 
            timeElapsed: update, 
            duration: this.state.duration - 1
        })
        if (currentTime === 0) {
            console.log("Updated the time elapsed value with: ", this.state.timeElapsed)
        }
    }


    public render(): JSX.Element {
        return (
            <div className="Playback__Enclosure">
                <div className="Playback__Enclosure-Start">
                    {this.createTimeString(this.state.timeElapsed)}
                </div>
                <div className="Playback__Enclosure-Slider">
                    <Slider
                        ValueLabelComponent={ValueLabelComponent}
                        aria-label="custom thumb label"
                        value={this.createPercentageOfTimeElapse()}
                        min={0}
                        max={100}
                    />
                </div>
                <div className="Playback__Enclosure-End">
                    {this.createTimeString(this.state.duration)}
                </div>
            </div>
        )
    }


    private createPercentageOfTimeElapse(): number {
        const loaded = Math.floor((this.state.timeElapsed / this.state.duration) * 100)
        return loaded
    }


    private createTimeString(value: number): string {
        const result = new Date(value * 1000).toISOString().substr(11, 8)
        return result
    }


}


function ValueLabelComponent(props: Props) {
    const { children, open, value } = props;

    return (
        <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
            {children}
        </Tooltip>
    );
}