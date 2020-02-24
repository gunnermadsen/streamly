import { environment } from "../environment/environment"
import { LoggerUtility } from "./logger"
import ss from 'socket.io-stream'
import socketClient from "socket.io-client"
import { ISong } from "../models/track.interface"
import { TextDecoder } from 'text-encoding'
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
    public gainNode: GainNode = null
    public socket: SocketIOClient.Socket = null
    private isStreamFinished: boolean = false
    private loggerUtility = new LoggerUtility()

    constructor() {
        this.loggerUtility.logEvent('**** AudioStreamerUtility constructor()')

        this.socket = socketClient(environment.socketUrl)

        this.watchForTrackStream()
        this.loggerUtility.logEvent('---> AudioStreamerUtility started')
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

    public watchForTrackStream(): void {
        this.loggerUtility.logEvent('**** watchForTrackStream()')

        ss(this.socket).on('stream', (stream, { stat, mode, meta }) => {

            this.loggerUtility.logEvent('---> socket stream received, waiting for binary stream')

            stream.on('data', data => {
                this.setAudioBuffer(data, stat)
            })

            stream.on('close', () => {
                this.loggerUtility.logEvent("---> 'close' event emitted from the server")
            })

            stream.on('end', () => {
                this.loggerUtility.logEvent("---> 'end' event emitted from the server")
                console.log("End event emitted, no more data to consume from the stream")
                this.isStreamFinished = true
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
        this.loggerUtility.logEvent('**** emitEvent()')

        if (this.startAt) {
            const inSec = (Date.now() - this.startAt) / 1000

            if (this.playWhileLoadingDuration && inSec >= this.playWhileLoadingDuration) {

                this.loggerUtility.logEvent('---> calling playWhileLoading() with duration')
                this.playWhileLoading(this.playWhileLoadingDuration)

                this.playWhileLoadingDuration = this.source.buffer.duration

            }
        } else if (this.source) {
            this.playWhileLoadingDuration = this.source.buffer.duration
            this.startAt = Date.now()

            this.loggerUtility.logEvent('---> calling playWhileLoading() without duration')
            this.playWhileLoading()
        }
    }

    private async setAudioBuffer(data: Uint8Array, stat: any): Promise<void> {
        this.loggerUtility.logEvent('**** setAudioBuffer()')

        let buffer: AudioBuffer
        const setWhileLoadingInterval = setInterval(this.setLoadingInterval.bind(this), 250)

        try {
            this.loggerUtility.logEvent('---> creating audio buffer chunks using frames from audio data chunks')
            const audioBufferChunk = await this.audioContext.decodeAudioData(this.withWaveHeader(data, 2, 44100)) //this.generateMp3Headers(data)

            if (this.source && this.source.buffer) {
                this.loggerUtility.logEvent('---> appending new buffer to existing buffer')
                buffer = this.appendBuffer(this.source.buffer, audioBufferChunk)
            }
            else {
                this.loggerUtility.logEvent('---> but the buffer and source are not set, so setting AudioBuffer to the buffer chunk')
                buffer = audioBufferChunk
            }

            this.loggerUtility.logEvent('---> creating audio buffer chunks using frames from audio data chunks')
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

            this.loggerUtility.logEvent(`-----> The current length of the source buffer is ${this.source.buffer.length}`)

            // if (this.source.buffer.length === )

        } catch (error) {
            this.loggerUtility.logError('---> but an error occured, so triggering reset')
            this.reset()
            throw error
        }
    }

    private appendBuffer(buffer1: any, buffer2: any): AudioBuffer {
        this.loggerUtility.logEvent('**** appendBuffer()')
        
        this.loggerUtility.logEvent('---> setting the number of channels using the provided buffers')
        const numberOfChannels = Math.min(buffer1.numberOfChannels, buffer2.numberOfChannels)
        this.loggerUtility.logEvent('---> creating a temporary buffer')
        const tmp = this.audioContext.createBuffer(numberOfChannels, (buffer1.length + buffer2.length), buffer1.sampleRate)

        this.loggerUtility.logEvent(`iterating over the numberOfChannels, channelCount is set to: ${numberOfChannels}`)
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

    private generateMp3Headers(buffer: Uint8Array) {

        const HEADER_SIZE = 10
        const dataview = new DataView(buffer, 0, HEADER_SIZE)

        let major = dataview.getUint8(3)
        let minor = dataview.getUint8(4)
        let version = `ID3.${major}.${minor}`

        console.log(version)

        let size = this.synchToInt(dataview.getUint32(6))

        let offset = HEADER_SIZE
        let id3Size = HEADER_SIZE + size

        while (offset < id3Size) {
            let frame = this.decodeFrame(buffer, offset, HEADER_SIZE)
            if (!frame) break
            console.log(`${frame.id}: ${frame.value.length > 200 ? '...' : frame.value}`);
            offset += frame.size
        }

    }

    /**
     * @param synch 
     * @description 
     * A synchsafe integer is essentially a 28-bit integer with a 0 added after every 7 bits. 
     * It’s pretty weird, but luckily we have low level boolean logic at our fingertips: we’ll 
     * just break up the synchsafe integer into 4 bytes, then combine them back with the 8th 
     * bit of each byte removed.
     */

    private synchToInt(synch: number): number {
        const mask = 0b01111111

        let b1 = synch & mask
        let b2 = (synch >> 8) & mask
        let b3 = (synch >> 16) & mask
        let b4 = (synch >> 24) & mask

        return b1 | (b2 << 7) | (b3 << 14) | (b4 << 21)
    }

    private decodeFrame(buffer: ArrayBuffer | SharedArrayBuffer, offset: number, HEADER_SIZE: number): any {

        const LANG_FRAMES = [ 'USLT', 'SYLT', 'COMM', 'USER' ];
        const ID3_ENCODINGS = [ 'ascii', 'utf-16', 'utf-16be', 'utf-8' ];

        const decode = (format: string, string: Uint8Array) => new TextDecoder(format).decode(string)

        let header = new DataView(buffer, offset, HEADER_SIZE + 1)

        if (header.getUint8(0) === 0) return

        let id = decode('ascii', new Uint8Array(buffer, offset, 4))
        let size = header.getUint32(4)
        let contentSize = size - 1
        let encoding = header.getUint8(HEADER_SIZE)
        let contentOffset = offset + HEADER_SIZE + 1
        let lang = ""

        if (LANG_FRAMES.includes(id)) {
            lang = decode('ascii', new Uint8Array(buffer, contentOffset, 3))
            contentOffset += 3
            contentSize -= 3
        }

        let value = decode(ID3_ENCODINGS[encoding], new Uint8Array(buffer, contentOffset, contentSize))

        return {
            id, 
            value, 
            lang,
            size: size + HEADER_SIZE
        }
    }

    private createBufferSource(buffer: AudioBuffer): void {
        this.source = this.audioContext.createBufferSource()

        // this.source.onended = () => this.source.start(0, this.duration)
        
        // this.source.context.onstatechange

        this.source.buffer = buffer

    }

    public setAudioContext(): void {
        this.loggerUtility.logEvent('**** setAudioContext()')

        this.audioContext = new AudioContext()
        this.gainNode = this.audioContext.createGain()
        this.analyser = this.audioContext.createAnalyser()

        // this.gainNode.gain.value = 0.4
        this.loggerUtility.logEvent('----> Audio context created')

    }
    
    public play(resumeTime: number = 0): void {
        this.loggerUtility.logEvent('**** play()')

        this.createBufferSource(this.audioBuffer)

        this.source.connect(this.audioContext.destination)

        this.source.connect(this.gainNode)

        this.gainNode.connect(this.audioContext.destination)

        this.loggerUtility.logEvent('---> connecting audiocontext destination to gain node')
        this.source.connect(this.analyser)
        this.source.start(0, resumeTime)
    }

    public stop(): void {
        this.loggerUtility.logEvent('**** stop()')
        this.source.stop(0)
    }

    public reset(): void {
        this.loggerUtility.logEvent('**** reset()')
        this.loggerUtility.logEvent('---> closing audiocontext and resetting properties')
        // await this.audioContext.close()
        this.source.disconnect()
        this.gainNode.disconnect()
        this.analyser.disconnect()

        // this.audioContext = null
        this.stop()
        // this.source = null
        // this.audioBuffer = null
        // this.rate = 0
        // this.startAt = 0

        this.emitEvent('cancel', {})
    }

    public setVolume(level: number): void {
        this.loggerUtility.logEvent('**** setVolume()')
        this.loggerUtility.logEvent('---> setting volume using gainNode and current time of audiocontext')

        this.gainNode.gain.setValueAtTime(level, this.audioContext.currentTime)
    }

    public playWhileLoading(duration = 0): void {
        this.loggerUtility.logEvent('**** playWhileLoading()')

        // if (!this.isStreamFinished) {
            try {

                this.duration = duration
    
                this.source.connect(this.audioContext.destination)
    
                this.source.connect(this.gainNode)
    
                this.source.connect(this.analyser)
    
                this.loggerUtility.logEvent('---> setting starting position and duration to AudioBufferSourceNode')
                this.source.start(0, duration)

                this.loggerUtility.logEvent('---> setting AudioBufferSourceNode to activeSource ')
                this.activeSource = this.source

            } catch (error) {
                this.loggerUtility.logError('---> but an error occured')
                this.reset()
                throw error
            }
        // }
        // drawFrequency()
        // drawSinewave()
    }
}
