import { Observable, BehaviorSubject, Subject } from 'rxjs'
import { ISong } from '../models/track.interface'
import { HttpPlayerUtility } from './player.http.util'
import { environment as env } from '../environment/environment'
import { LoggerUtility } from './logger.util'
import { parseBlob, IAudioMetadata } from 'music-metadata-browser'


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

    /**
     * The track metadata subject. Provides metadata for the track that is currently playing
     */
    private trackMetadataSubject$ = new Subject<IAudioMetadata>()
    public get trackMetadata$(): Observable<IAudioMetadata> {
        return this.trackMetadataSubject$.asObservable()
    }
    public set trackMetadata(value: IAudioMetadata) {
        this.trackMetadataSubject$.next(value)
    }

    private source: AudioBufferSourceNode = null
    private startedAt = 0
    private pausedAt = 0

    private playerStateSubject$ = new Subject<string>()
    public get playerState$(): Observable<string> {
        return this.playerStateSubject$.asObservable()
    }

    private destroy$ = new Subject<boolean>()
    // note: May not need this accessor. 
    // test for reference to htmlmediaelement in initializeAudioContext method below
    
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
        request.onloadend = (event: ProgressEvent) => LoggerUtility.logEvent("On Load End Event Triggered")
        request.send()
    }

    private async decodeAudioData(request: XMLHttpRequest): Promise<void> {
        LoggerUtility.logEvent("Decoding Audio Data")
        try {
            const data = request.response as ArrayBuffer
            // const trackMetadata = await this.getTrackMetadata(data)

            // this.trackMetadata = trackMetadata

            const buffer = await this.audioContext.decodeAudioData(data)

            this.play(buffer)
            this.configureAnalyser()

            // console.log(trackMetadata)
        }
        catch (error) {
            LoggerUtility.logError(error.message ?? "An error occured")
            throw error
        }
    }

    private async getTrackMetadata(data: ArrayBuffer): Promise<IAudioMetadata> {

        try {
            const blob = new Blob([data])
            const metadata = await parseBlob(blob)

            return metadata
        } 
        catch (error) {
            LoggerUtility.logError(error.message ?? "An error occured while fetching the metadata")
        }

    }

    private play(buffer: AudioBuffer): void {

        this.source = this.audioContext.createBufferSource()
        this.source.buffer = buffer
        this.source.onended = this.handleSourceStateChange.bind(this)
        this.source.context.onstatechange = (event: Event) => LoggerUtility.logEvent("Context state has changed")
        this.source.connect(this.audioContext.destination)
        this.source.connect(this.analyser)
        this.source.connect(this.gainNode)
        this.source.start(0, this.pausedAt)

        this.startedAt = this.audioContext.currentTime - this.pausedAt
    }
    private async handleSourceStateChange(event: Event): Promise<void> {

        if (this.sourceNode.buffer.duration <= this.audioContext.currentTime) {
            // await this.audioContext.close()
            LoggerUtility.logEvent("Emitting NEXTTRACK custom event to subscriptions")
            this.playerStateSubject$.next("NEXTTRACK")
        }
        // LoggerUtility.logObject("Souce onended event emitted", event)
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
                this.play(this.source.buffer)
            }
            else if (!action.isPlaying) {
                let elapsed = this.audioContext.currentTime - this.startedAt

                this.pausedAt = elapsed
                this.source.disconnect()
                this.source.stop(0)
            }

        } catch (error) {
            LoggerUtility.logError(error.message ?? "An error occured")
            throw error
        }

    }

    private generateUrl(song: ISong): string {
        return `${env.apiUrl}/repository/${env.userId}/${song.name.replace(/ /g, '%20')}`
    }
    

    public setTrack(action: any): void {
        try {
            this.source.disconnect()
            this.source.stop(0)
            this.pausedAt = 0
            this.startedAt = 0
            this.frequencyData = null        
        } catch (error) {
            LoggerUtility.logError(error.message ?? "An error occured")
            throw error
        }
    }

 
    public setVolume(action: { type: string, volume: number }): void {

        this.gainNode.gain.value = action.volume

    }

    public unsubscribeAll(): void {
        LoggerUtility.logEvent("Unsubscription method triggered via Streamer component")
    }

}
