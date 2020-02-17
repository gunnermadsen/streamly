import React, { Component } from 'react'
import './App.scss';

import Playlist from './components/playlist/playlist'
import Uploader from './components/uploader/Uploader'
import Controls from './components/Controls/Controls';

export default class App extends Component {
  
  public render(): JSX.Element {
    return (
      <div className="App">
        <div className="App__Enclosure">
          <header className="App__Enclosure-Header">
            <h3>Streamily</h3>
          </header>
          <main className="App__Enclosure-Main">
            <div className="Main__Controls">
              <Controls></Controls>              
            </div>
            <div className="Main__Playlist">
              <Playlist></Playlist>
            </div>
          </main>
        </div>
      </div>
    )
  }

}
