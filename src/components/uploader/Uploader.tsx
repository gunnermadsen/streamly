import './Uploader.scss'
import React, { Component, createRef, RefObject } from 'react'
import { connect } from 'react-redux'

import { mapStateToProps, mapDispatchToProps } from '../../shared/state.map'
import { IPlayerProps } from '../../models/player-state.interface'
import { IPlayerState } from '../../models/player.interface'
import Button from '@material-ui/core/Button'

@connect(mapStateToProps, mapDispatchToProps)
export default class Uploader extends Component<IPlayerState, IPlayerProps> {

    private uploadRef: RefObject<HTMLInputElement>

    public uploadFile() {
        this.uploadRef.current.click()

        // this.uploadRef.current.onchange = (event: any) => {
        //     return this.props.uploadFile(event.target.files)
        // }
    }

    public componentDidMount() {
        this.uploadRef = createRef()
    }

    public render() {
        return (
            <div className="Uploader">
                {/* <IconButton aria-label="delete" className="Uploader__Main" onClick={event => this.uploadFile(event)} size="small">
                    <CloudUploadIcon fontSize="inherit" />
                </IconButton> */}
                <Button onClick={() => this.uploadFile()} variant="contained" color="primary">Upload</Button>
                <input hidden multiple type="file" ref={this.uploadRef} />
            </div>
        )
    }
    
}
