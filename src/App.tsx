import React, { Component } from 'react'
import Streamer from './components/Streamer/Streamer'
import './App.scss'


export default class App extends Component {
  
  public render(): JSX.Element {
    return (
      <div className="App">
        <Streamer />
      </div>
    )
  }
}

