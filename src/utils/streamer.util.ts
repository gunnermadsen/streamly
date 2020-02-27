import { environment } from "../environment/environment"
import { LoggerUtility } from "./logger"
import ss from 'socket.io-stream'
import socketClient from "socket.io-client"
import { ISong } from "../models/track.interface"

import { Observable, BehaviorSubject } from 'rxjs'
import { Action } from "@redux-saga/core/node_modules/redux"

export class PlaylistNetworkUtility {

    public source: AudioBufferSourceNode = null
    public audioBuffer: AudioBuffer = null
    public activeSource: AudioBufferSourceNode = null
    public startAt: number = 0
    public rate: number = 0
    private duration: number = 0
    public playWhileLoadingDuration: number = 0
    public audioContext: AudioContext = null
    public analyser: AnalyserNode = null
    private _gainNode: GainNode = null
    public socket: SocketIOClient.Socket = null
    private isStreamFinished: boolean = false
    private loggerUtility = new LoggerUtility()
    private frequencyData$: BehaviorSubject<Uint8Array> = new BehaviorSubject<Uint8Array>(null)

    public set gainNode(value: number) {

        this._gainNode.gain.value = value

    }


    constructor() {

        this.socket = socketClient(environment.socketUrl)

        this.watchForTrackStream()
    }
    
    public async fetchPlaylist(): Promise<ISong[]>  {
        try {
            const response = await fetch(`${environment.apiUrl}/api/playlist?id=5d2f818f81808747b77a8d17`, { method: 'GET' })

            const playlist = await response.json()

            return playlist

        } catch (error) {
            throw error
        }
    }

    public getAnalyserData$(): Observable<Uint8Array> {
        return this.frequencyData$
    }

    public watchForTrackStream(): void {

        ss(this.socket).on('stream', (stream, payload: { stat: any, meta: any, mode: string }) => {

            stream.on('data', data => {
                this.setAudioBuffer(data, payload.stat)
            })

            stream.on('cancel', () => {
                this.loggerUtility.logEvent("---> 'cancel' event emitted from the server")
                this.stop()
            })

            stream.on('complete', () => {
                this.loggerUtility.logEvent("---> 'complete' event emitted from the server")
                this.isStreamFinished = true
                this.stop()
            })

            stream.on('error', (error) => {
                console.log("an error occured while streaming data")
                this.loggerUtility.logObject('---> An error occured', error)
                this.reset()
            })

        })

        this.socket.on('cancel', (error) => {
            this.loggerUtility.logEvent('---> socket emitted cancel event')
        })

        this.socket.on('error', (error) => {
            this.loggerUtility.logObject('---> an error occured', error)
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
        const setWhileLoadingInterval = setInterval(this.setLoadingInterval.bind(this), 250)

        try {
            const audioBufferChunk = await this.audioContext.decodeAudioData(this.withWaveHeader(data, 2, 44100)) //this.generateMp3Headers(data)

            if (this.source && this.source.buffer) {
                buffer = this.appendBuffer(this.source.buffer, audioBufferChunk)
            }
            else {
                buffer = audioBufferChunk
            }

            this.createBufferSource(buffer)

            const analyserData = new Uint8Array(this.analyser.frequencyBinCount)

            this.setByteFrequencyData(analyserData)
            
            this.frequencyData$.next(analyserData)

            // this.source.onended = () => console.log("Song has stopped playing")
            const loadRate = (data.length * 100) / stat.size

            this.rate = this.rate + loadRate

            if (this.rate >= 100) {

                clearInterval(setWhileLoadingInterval)

                this.audioBuffer = this.source.buffer

                const inSec = (Date.now() - this.startAt) / 1000

                this.activeSource.stop()

                this.play(inSec)
            }

            // this.loggerUtility.logEvent(`-----> The current length of the source buffer is: ${this.source.buffer.length}`)
            // this.loggerUtility.logObject(`-----> The file metadata is `, stat)

            // if (this.source.buffer.length === )

        } catch (error) {
            this.loggerUtility.logError('---> but an error occured, so triggering reset')
            this.reset()
            throw error
        }
    }

    public setByteFrequencyData(data: Uint8Array) {
        this.analyser.getByteFrequencyData(data)
    }

    private appendBuffer(buffer1: any, buffer2: any): AudioBuffer {
        
        const numberOfChannels = Math.min(buffer1.numberOfChannels, buffer2.numberOfChannels)
        const tmp = this.audioContext.createBuffer(numberOfChannels, (buffer1.length + buffer2.length), buffer1.sampleRate)

        for (let i = 0; i < numberOfChannels; i++) {
            const channel = tmp.getChannelData(i)
            channel.set(buffer1.getChannelData(i), 0)
            channel.set(buffer2.getChannelData(i), buffer1.length)
        }
        return tmp
    }

    /**
     * @link for mp3 file frames, please see https://www.codeproject.com/Articles/8295/MPEG-Audio-Frame-Header
     * @link for wav file frames, please see http://soundfile.sapp.org/doc/WaveFormat/
     * 
     * The ID3v2 tag header, which should be the first information in the file, is 10 octets
     *   long and laid out as `IIIVVFSSSS`, where
     * 
     * `III.......`: id, always "ID3" (0x49/73, 0x44/68, 0x33/51)
     * `...VV.....`: version (major version + revision number)
     * `.....F....`: flags: abc00000. a:unsynchronisation, b:extended header, c:experimental
     * `......SSSS`: tag's size as a synchsafe integer
     * @param {*} data
     * @param {*} numberOfChannels
     * @param {*} sampleRate
     */
    private withWaveHeader(data: Uint8Array, channelCount: number, sampleRate: number) {
        const header = new ArrayBuffer(44)

        const dataview = new DataView(header)

        // Chunk id
        dataview.setUint8(0, "R".charCodeAt(0))
        dataview.setUint8(1, "I".charCodeAt(0))
        dataview.setUint8(2, "F".charCodeAt(0))
        dataview.setUint8(3, "F".charCodeAt(0))

        // Chunk length
        dataview.setUint32(4, data.byteLength / 2 + 44, true)

        // Format
        dataview.setUint8(8, "W".charCodeAt(0))
        dataview.setUint8(9, "A".charCodeAt(0))
        dataview.setUint8(10, "V".charCodeAt(0))
        dataview.setUint8(11, "E".charCodeAt(0))

        // Sub Chunk 1 ID
        dataview.setUint8(12, "f".charCodeAt(0))
        dataview.setUint8(13, "m".charCodeAt(0))
        dataview.setUint8(14, "t".charCodeAt(0))
        dataview.setUint8(15, " ".charCodeAt(0))

        // Sub chunk 1 size
        dataview.setUint32(16, 16, true)

        // Audio format
        dataview.setUint16(20, 1, true)

        // Number of channels
        dataview.setUint16(22, channelCount, true)

        // Sample rate
        dataview.setUint32(24, sampleRate, true)

        // ByteRate rate
        dataview.setUint32(28, sampleRate * 1 * 2)

        // Block Align
        dataview.setUint16(32, channelCount * 2)

        // Blocks per sample
        dataview.setUint16(34, 16, true)

        // Sub chunk 2 ID
        dataview.setUint8(36, "d".charCodeAt(0))
        dataview.setUint8(37, "a".charCodeAt(0))
        dataview.setUint8(38, "t".charCodeAt(0))
        dataview.setUint8(39, "a".charCodeAt(0))

        // Sub Chunk 2 Size
        dataview.setUint32(40, data.byteLength, true)

        const tmp = new Uint8Array(header.byteLength + data.byteLength)

        tmp.set(new Uint8Array(header), 0)
        tmp.set(new Uint8Array(data), header.byteLength)

        return tmp.buffer
    }

    private createBufferSource(buffer: AudioBuffer): void {
        this.source = this.audioContext.createBufferSource()

        // this.source.onended = () => this.source.start(0, this.duration)
        
        // this.source.context.onstatechange

        this.source.buffer = buffer

    }

    public setAudioContext(): void {

        this.audioContext = new AudioContext()
        this._gainNode = this.audioContext.createGain()
        this.analyser = this.audioContext.createAnalyser()

        this._gainNode.gain.value = 0.4

    }
    
    public play(resumeTime: number = 0): void {

        this.createBufferSource(this.audioBuffer)

        this.source.connect(this.audioContext.destination)

        this.source.connect(this._gainNode)

        this._gainNode.connect(this.audioContext.destination)

        this.source.connect(this.analyser)

        this.source.start(0, resumeTime)

    }

    public stop(): void {
        this.source.stop(0)
    }

    public reset(): void {
        // await this.audioContext.close()
        this.source.disconnect()
        this._gainNode.disconnect()
        this.analyser.disconnect()

        // this.audioContext = null
        this.stop()
        // this.source = null
        // this.audioBuffer = null
        // this.rate = 0
        // this.startAt = 0

        this.emitEvent('cancel', {})
    }

    public setVolume(action: { type: string, volume: number }): void {

        this.gainNode = action.volume
        this._gainNode.gain.setValueAtTime(action.volume, this.audioContext.currentTime)
    }


    public playWhileLoading(duration = 0): void {

        // if (!this.isStreamFinished) {
            try {

                this.duration = duration
    
                this.source.connect(this.audioContext.destination)
    
                this.source.connect(this._gainNode)
    
                this.source.connect(this.analyser)
    
                this.source.start(0, duration)

                this.activeSource = this.source

            } catch (error) {
                this.reset()
                throw error
            }
        // }
    }
}
