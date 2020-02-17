import React, { useEffect, useState } from 'react'
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import { createStyles, makeStyles, Theme } from '@material-ui/core'
import PauseIcon from '@material-ui/icons/Pause'
import IconButton from '@material-ui/core/IconButton'

import { connect } from 'react-redux'

import { addAllSongs } from '../../store/actions/actions'

import './Controls.scss'

const mapStateToProps = (state: any) => ({ songs: state.songs })

const mapDispatchToProps = dispatch => {
    return {
        addAllSongs: songs => dispatch(addAllSongs(songs))
    };
}

function ControlsComponent() {

   
    const [selectedIndex, setSelectedIndex] = useState(0)

    const [playlist, setPlaylist] = useState([{ name: "loading..." }])


    // useEffect(() => ({}), [])

    return (
        <div className="Controls">
            <div className="Controls__Track">
                <div className="Controls__Track-Action">
                    <IconButton color="secondary" aria-label="add an alarm">
                        <SkipPreviousIcon />
                    </IconButton>
                    <IconButton color="secondary" aria-label="add an alarm">
                        <PauseIcon />
                    </IconButton>
                    <IconButton color="secondary" aria-label="add an alarm">
                        <SkipNextIcon />
                    </IconButton>
                </div>
            </div>
        </div>
    )

}

const Controls = connect(null, mapDispatchToProps)(ControlsComponent)

export default Controls