import React, { useEffect, useState, Component } from 'react'
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { connect } from 'socket.io-client';
import './Uploader.scss'

const mapStateToProps = (state: any) => ({ songs: state.songs })

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        margin: {
            margin: theme.spacing(1),
        },
        extendedIcon: {
            marginRight: theme.spacing(1),
        },
    }),
);
class Uploader extends Component {

    private uploadRef = React.createRef()

    uploadFile(event) {
        console.log(event)
    }
    useStyles(): any {
        return makeStyles((theme: Theme) => createStyles({
            margin: {
                margin: theme.spacing(1),
            },
            extendedIcon: {
                marginRight: theme.spacing(1),
            },
        }));
    }

    render() {
        const classes = this.useStyles();

        return (
            <div>
                <IconButton aria-label="delete" className={classes.margin} onClick={event => this.uploadFile(event)} size="small">
                    <CloudUploadIcon fontSize="inherit" />
                </IconButton>
            </div>
        )
    }
    
}

// const Uploader = connect(mapStateToProps)(UploaderComponent)

export default Uploader

