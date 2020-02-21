import React, { Component, ChangeEvent } from 'react';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import { connect } from 'react-redux'

import './Volume.scss'

import { IPlayerState, IPlayerProps } from '../../store/reducers/reducer';
import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map';

@connect(mapStateToProps, mapDispatchToProps)
export default class Volume extends Component<IPlayerState, IPlayerProps> {

    public handleChange(event: ChangeEvent<any>, newValue: number | number[]): void {
        const volume = newValue as number
        this.props.setVolume(volume)
    }

    public render(): JSX.Element {
        return (
            <Grid container spacing={2}>
                <Grid item>
                    <VolumeDown />
                </Grid>
                <Grid item xs>
                    <Slider
                        value={this.props.volume}
                        min={0}
                        max={100}
                        onChange={(event, value) => this.handleChange(event, value)}
                        aria-labelledby="continuous-slider" />
                </Grid>
                <Grid item>
                    <VolumeUp />
                </Grid>
            </Grid>
        )
    }
}

// export default connect(mapStateToProps, mapDispatchToProps)(Volume)
