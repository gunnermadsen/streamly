import React, { useEffect, useState } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import IconButton from '@material-ui/core/IconButton'
import { createStyles, makeStyles, Theme } from '@material-ui/core'
import PauseIcon from '@material-ui/icons/Pause'

import { connect } from 'react-redux'

import { addAllSongs } from '../../store/actions/actions'
import AudioStreamer from '../../utils/player'
import { environment } from '../../environment/environment'

import './playlist.scss'

const audioStreamer = new AudioStreamer()

const mapStateToProps = (state: any) => ({ songs: state.songs })

const mapDispatchToProps = dispatch => {
    return {
        addAllSongs: songs => dispatch(addAllSongs(songs))
    };
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
        // width: '100%',
        // maxWidth: 500,
        // maxHeight: 500,
        borderRadius: 20,
        backgroundColor: theme.palette.background.paper,
        color: 'rgb(40,44, 52)',
        overflowY: 'scroll'
    }
}))


// const emitMessage = (event: string, data: any) => socket.emit(event, data)

const handleAudioAction = async (event: React.MouseEvent<any, MouseEvent>, index: number, mode: string, song: any) => {
    
    audioStreamer.setAudioContext()

    audioStreamer.emitEvent('track', { ...song, id: "5d2f818f81808747b77a8d17" })

    // audioStreamer.play()
    // socket.on('done', () => console.log("The stream has completed"))
}


function PlaylistElement() {

    const classes = useStyles()
    const [selectedIndex, setSelectedIndex] = useState(0)

    const [playlist, setPlaylist] = useState([{ name: "loading..." }])

    const handleListItemClick = (_, index: number) => setSelectedIndex(index)

    useEffect(() => {
        const getPlaylist = async () => {
            try {
                const response = await fetch(`${environment.apiUrl}/api/playlist?id=5d2f818f81808747b77a8d17`, { method: 'GET' })

                const playlist = await response.json()

                setPlaylist(playlist)

            } catch (error) {
                setPlaylist([]) //{ name: "Unable to load playlist. Check your internet connection", isPlaying: null }
            }
        }
        getPlaylist()
    }, [])

    return (
        <div className="Playlist__Container">
            <List component="nav" aria-label="main mailbox folders">
                {
                    playlist.map((value, index) => {
                        return (
                            <ListItem key={index.toString()} className="streamer__list-item" button selected={selectedIndex === index} onClick={event => handleListItemClick(event, index)}>
                                <ListItemText primary={value.name} />
                                
                            </ListItem>
                        )
                    })
                }
            </List>
        </div>
    )

}

const Playlist = connect(null, mapDispatchToProps)(PlaylistElement)

export default Playlist