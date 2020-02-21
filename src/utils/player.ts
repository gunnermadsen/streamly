/* eslint-disable no-extra-bind */
import ss from 'socket.io-stream'
import socketClient from "socket.io-client"
import { environment } from '../environment/environment'

import { LoggerUtility } from './logger' 

export default class AudioStreamerUtility extends LoggerUtility {

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
        super()
        this.logEvent('**** AudioStreamerUtility constructor()')
        this.socket = socketClient(environment.socketUrl)
        this.watchForTrackStream()
        this.logEvent('---> AudioStreamerUtility started')
    }

    public watchForTrackStream(): void {
        this.logEvent('**** watchForTrackStream()')

        ss(this.socket).on('stream', (stream, { stat, mode, meta }) => {
            this.logEvent('---> socket stream received, awaiting binary stream')
            stream.on('data', data => {
                this.logEvent("---> 'data' event received, calling 'setAudioBuffer()'")
                this.setAudioBuffer(data, stat)
            })

            stream.on('close', () => {
                this.logEvent("---> 'close' event emitted from the server")
            })

            stream.on('end', () => {
                this.logEvent("---> 'end' event emitted from the server")
                console.log("End event emitted, no more data to consume from the stream")
                this.isStreamFinished = true
            })

            stream.on('error', (error) => {
                console.log("an error occured while streaming data")
                this.logObject('An error occured', error)
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

            const audioBufferChunk = await this.audioContext.decodeAudioData(this.withWaveHeader(data, 2, 44100))

            if (this.source && this.source.buffer) {
                buffer = this.appendBuffer(this.source.buffer, audioBufferChunk)
            }
            else {
                buffer = audioBufferChunk
            }

            this.createBufferSource(buffer)
            
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

        } catch (error) {
            console.log(error)
            this.reset()
        }
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
     * @link please see https://www.codeproject.com/Articles/8295/MPEG-Audio-Frame-Header for mp3 header information
     * @param {*} data
     * @param {*} numberOfChannels
     * @param {*} sampleRate
     */
    private withWaveHeader(data, channelCount: number, sampleRate: number): any {
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


