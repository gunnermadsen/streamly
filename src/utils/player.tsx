/* eslint-disable no-extra-bind */
import ss from 'socket.io-stream'
import { withWaveHeader, appendBuffer } from './wave'
import socketClient from "socket.io-client"
import { environment } from '../environment/environment'


export default class AudioStreamerUtility {

    public source: AudioBufferSourceNode = null
    public audioBuffer: AudioBuffer = null
    public activeSource: AudioBufferSourceNode = null
    public startAt: number = 0
    public rate: number = 0
    public playWhileLoadingDuration: number = 0
    public audioContext: AudioContext = null
    public analyser: AnalyserNode = null
    public gainNode: GainNode = null
    public socket: SocketIOClient.Socket = null

    private isStreamFinished: boolean = false

    constructor() {
        this.socket = socketClient(environment.socketUrl)
        this.watchForTrackStream()
    }

    public watchForTrackStream(): void {

        ss(this.socket).on('track-stream', (stream, { stat, mode }) => {
            console.log(mode)
            stream.on('data', data => {
                this.setAudioBuffer(data, stat)
            })

            stream.on('close', () => {
                console.log("Done event emitted from server")
            })

            stream.on('end', () => {
                console.log("End event emitted, no more data to consume from the stream")
                this.isStreamFinished = true
                // await this.audioContext.close()
            })

            stream.on('error', (error) => {
                console.log("an error occured while streaming data")
                this.reset()
            })

        })

        this.socket.on('error', data => {
            console.log("an error occured. stopping stream", data)
            this.reset()
        })
    }

    public emitEvent(event: string, data: any): void {
        this.socket.emit(event, data)
    }

    public setLoadingInterval(): void {
        if (this.startAt) {
            const inSec = (Date.now() - this.startAt) / 1000
            if (this.playWhileLoadingDuration && inSec >= this.playWhileLoadingDuration) {
                this.playWhileLoading(this.playWhileLoadingDuration)
                this.playWhileLoadingDuration = this.source.buffer.duration
            }
        } else if (this.source) {
            this.playWhileLoadingDuration = this.source.buffer.duration
            this.startAt = Date.now()
            this.playWhileLoading()
        }
    }

    private async setAudioBuffer(data: Uint8Array, stat: any): Promise<void> {
        
        let buffer: AudioBuffer

        const setWhileLoadingInterval = setInterval(this.setLoadingInterval.bind(this), 500)

        try {

            const audioBufferChunk = await this.audioContext.decodeAudioData(withWaveHeader(data, 2, 44100))

            if (this.source && this.source.buffer) {
                buffer = appendBuffer(this.source.buffer, audioBufferChunk, this.audioContext)
            }
            else {
                buffer = audioBufferChunk
            }

            this.createBufferSource(buffer)
            
            this.source.onended = () => console.log("Song has stopped playing")
            
            const loadRate = (data.length * 100) / stat.size

            this.rate = this.rate + loadRate

            if (this.rate >= 100) {

                clearInterval(setWhileLoadingInterval)

                this.audioBuffer = this.source.buffer
                const inSec = (Date.now() - this.startAt) / 1000
                this.activeSource.stop()
                this.play(inSec)
            }

        } catch (error) {
            console.log(error)
            this.reset()
        }
    }

    public loadFile(): void {
        
    }

    private createBufferSource(buffer): void {
        this.source = this.audioContext.createBufferSource()
        this.source.buffer = buffer
    }

    public setAudioContext(): void {
        this.audioContext = new AudioContext()
        this.gainNode = this.audioContext.createGain()

        this.analyser = this.audioContext.createAnalyser()
    }

    public play(resumeTime = 0): void {
        this.createBufferSource(this.audioBuffer)
        this.source.connect(this.audioContext.destination)
        this.source.connect(this.gainNode)
        this.gainNode.connect(this.audioContext.destination)

        this.source.connect(this.analyser)
        this.source.start(0, resumeTime)
    }

    public stop(): void {
        // return this.source && 
        this.source.stop(0)
    }

    public async reset(): Promise<void> {

        await this.audioContext.close()

        this.audioContext = null
        this.stop()
        this.source = null
        this.audioBuffer = null
        this.rate = 0
        this.startAt = 0
    }

    public setVolume(level: number): void {
        this.gainNode.gain.setValueAtTime(level, this.audioContext.currentTime)
    }

    public playWhileLoading(duration = 0): void {
        if (!this.isStreamFinished) {
            this.source.connect(this.audioContext.destination)
            this.source.connect(this.gainNode)
            this.source.connect(this.analyser)
            this.source.start(0, duration)
            this.activeSource = this.source
        }
        // drawFrequency()
        // drawSinewave()
    }
}


