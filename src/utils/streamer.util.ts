import { Observable, BehaviorSubject } from 'rxjs'
import { ISong } from '../models/track.interface'
import { HttpPlayerUtility } from './player.http.util'
import { environment as env } from '../environment/environment'

interface IUpload {
    loaded: number
    total: number
}

export class PlaylistNetworkUtility {

    /**
     * The AudioContext Behavior Subject. Provides an Observable for the AudioContext API
     */
    private audioContextSubject$ = new BehaviorSubject<AudioContext>(null)
    public get audioContext(): AudioContext { 
        return this.audioContextSubject$.value
    }


    /**
     * The AnalyserNode Behavior Subject. Provides an Observable for the AnalyserNode API
     */
    private analyserSubject$ = new BehaviorSubject<AnalyserNode>(null)
    public get analyser(): AnalyserNode {
        return this.analyserSubject$.value
    }
    public set analyser(value: AnalyserNode) {
        this.analyserSubject$.next(value)
    }
    public get analyser$(): Observable<AnalyserNode> {
        return this.analyserSubject$.asObservable()
    }


    /**
     * The Uint8Array Behavior Subject for Frequency Data. Provides an Observable for the Frequency data obtained from the AnalyserNode API
     */ 
    private frequencyDataSubject$ = new BehaviorSubject<Uint8Array>(null)
    public get frequencyData$(): Observable<Uint8Array> {
        return this.frequencyDataSubject$.asObservable()
    }
    public set frequencyData(value: Uint8Array) {
        this.frequencyDataSubject$.next(value)
    }


    /**
     * The GainNode Behavior Subject. Provides an Observable for the GainNode API
     */
    private gainNodeSubject$ = new BehaviorSubject<GainNode>(null)
    public get gainNode(): GainNode {
        return this.gainNodeSubject$.value
    }
    public set gainNode(value: GainNode) {
        this.gainNodeSubject$.next(value)
    }

    
    /**
     * The GainNode Behavior Subject. Provides an Observable for the GainNode API
     */ 
    private sourceNodeSubject$ = new BehaviorSubject<AudioBufferSourceNode>(null)
    public get sourceNode(): AudioBufferSourceNode {
        return this.source
    }
    public get sourceNode$(): Observable<AudioBufferSourceNode> {
        return this.sourceNodeSubject$.asObservable()
    }
    public set sourceNode(value: AudioBufferSourceNode | null) {
        this.sourceNodeSubject$.next(value)
    }


    /**
     * The GainNode Behavior Subject. Provides an Observable for the GainNode API
     */
    private fileUploadProgressSubject$ = new BehaviorSubject<IUpload>({ loaded: 0, total: 0})
    public get fileUploadProgress$(): Observable<IUpload> {
        return this.fileUploadProgressSubject$.asObservable()
    }
    public set fileUploadProgressSubject(value: IUpload) {
        this.fileUploadProgressSubject$.next(value)
    }

    private audioElement: HTMLMediaElement = null 
    private source: AudioBufferSourceNode = null
    private startedAt = 0
    private pausedAt = 0


    // note: May not need this accessor. 
    // test for reference to htmlmediaelement in initializeAudioContext method below
    public get audioElementRef(): HTMLMediaElement {
        return this.audioElement
    }
    public set audioElementRef(value: HTMLMediaElement) {
        this.audioElement = value
        // this.mediaStream = value.captureStream()
    }
    public setByteFrequencyData(data: Uint8Array) {
        this.analyser.getByteFrequencyData(data)
    }

    public async fetchPlaylist(): Promise<ISong[]> {
        return await HttpPlayerUtility.fetchPlaylist()
    }

    
    public async uploadFile(action: any): Promise<void> {
        
        const url = `${env.apiUrl}/api/upload`
        const request = new XMLHttpRequest()
        const uploadForm = new FormData()
        uploadForm.append('id', env.userId)
        
        let counter = 0

        for (let file in action.files) {
            uploadForm.append(counter.toString(), file)
            counter++
        }

        request.open('POST', url, true)
        request.responseType = 'json'
        request.onprogress = (event: ProgressEvent) => {
            this.fileUploadProgressSubject = { loaded: event.loaded, total: event.total }
        }

        request.send(uploadForm)
        
    }

    public fetchAudioData(action: any): void {
        const url = this.generateUrl(action.song)
        const request = new XMLHttpRequest()

        request.open('GET', url, true)
        request.responseType = 'arraybuffer'
        request.onload = this.decodeAudioData.bind(this, request)
        request.send()
    }

    private async decodeAudioData(request: XMLHttpRequest): Promise<void> {
        try {
            const data = request.response
            const buffer = await this.audioContext.decodeAudioData(data)

            this.play(buffer)
            this.configureAnalyser()

        }
        catch (error) {
            console.log(error)
            throw error
        }
    }

    
    private play(buffer: AudioBuffer): void {

        let offset = this.pausedAt

        this.source = this.audioContext.createBufferSource()
        this.source.buffer = buffer
        this.source.onended = () => console.log("song has ended")
        this.source.connect(this.audioContext.destination)
        this.source.connect(this.analyser)
        this.source.connect(this.gainNode)
        this.source.start(0, offset)

        this.startedAt = this.audioContext.currentTime - offset
    }

    private configureAnalyser(): void {
        const analyserData = new Uint8Array(this.analyser.frequencyBinCount)

        this.analyser.getByteFrequencyData(analyserData)

        this.frequencyData = analyserData
    }
    
    public initializeAudioContext(action: any): void {

        let context = new AudioContext()
        
        const analyser = context.createAnalyser()
        const gainNode = context.createGain()

        // analyser.connect(context.destination)
        // gainNode.connect(context.destination)

        this.audioContextSubject$.next(context)
        this.analyser = analyser
        this.gainNodeSubject$.next(gainNode)

    }

    public setPlayingState(action: any): void {

        try {

            if (action.isPlaying) {
                // await this.audioElement.play()
                this.play(this.source.buffer)
            }
            else if (!action.isPlaying) {
                let elapsed = this.audioContext.currentTime - this.startedAt

                this.pausedAt = elapsed
                // this.audioElement.pause()
                this.source.disconnect()
                this.source.stop(0)
            }

        } catch (error) {
            throw error
        }

    }

    private generateUrl(song: ISong): string {
        return `${env.apiUrl}/repository/${env.userId}/${song.name.replace(/ /g, '%20')}`
    }
    

    public setPreviousTrack(action: any): void {
        this.source = null
        this.analyser = null
        this.gainNode = null
        this.frequencyData = null

        this.fetchAudioData(action)
        this.audioElementRef.src = `${env.apiUrl}/repository/${env.userId}/${action.song.name}`
    }

    public setNextTrack(action: any): void {
        this.audioElementRef.src = `${env.apiUrl}/repository/${env.userId}/${action.song.name}`
    }
    
    public setVolume(action: { type: string, volume: number }): void {

        this.gainNodeSubject$.next(null)

    }

}
