import { Observable, BehaviorSubject, Subject, interval } from 'rxjs'
import { ISong } from '../models/track.interface'
import { HttpPlayerUtility } from './player.http.util'
import { environment as env } from '../environment/environment'
import { LoggerUtility } from './logger.util'
import { parseBlob, IAudioMetadata } from 'music-metadata-browser'
import { map, takeUntil, tap } from 'rxjs/operators'


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
     * The Duration Behavior Subject. Provides an Observable for the Duration of the audio track
     */
    private durationSubject$ = new BehaviorSubject<number>(0)
    public get duration$(): Observable<number> {
        return this.durationSubject$.asObservable()
    }
    public set duration(value: number) {
        this.durationSubject$.next(value)
    }

    /**
     * The Current Time Behavior Subject. Provides an Observable for the current time of the audio track. 
     * This subject will be updated in one second intervals.
     */
    private currentTimeSubject$ = new BehaviorSubject<number>(0)
    public get currentTime$(): Observable<number> {
        return this.currentTimeSubject$.asObservable()
    }
    public set currentTime(value: number) {
        this.currentTimeSubject$.next(value)
    }

    /**
     * The File Upload Behavior Subject. Provides an Observable for the File Upload API
     */
    private fileUploadProgressSubject$ = new BehaviorSubject<IUpload>({ loaded: 0, total: 0 })
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
    
    public set byteFrequencyData(data: Uint8Array) {
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
        request.onload = () => this.decodeAudioData(request)
        request.onloadend = (event: ProgressEvent) => LoggerUtility.logEvent("On Load End Event Triggered")
        request.send()
    }


    private async decodeAudioData(request: XMLHttpRequest): Promise<void> {
        LoggerUtility.logEvent("Decoding Audio Data")
        try {

            if (this.audioContext.state === "closed") {
                this.initializeAudioContext()
            }

            const data = request.response as ArrayBuffer
            // const trackMetadata = await this.getTrackMetadata(data)
            // this.trackMetadata = trackMetadata
            
            const buffer = await this.audioContext.decodeAudioData(data)
            
            this.duration = buffer.duration
            
            this.play(buffer)
            this.configureAnalyser()
            this.initiateTrackTimer()

        }
        catch (error) {
            LoggerUtility.logError(error.message ?? "An error occured")
            throw error
        }
    }

    private initiateTrackTimer(): void {
        interval(1000).pipe(
            // tap(() => LoggerUtility.logEvent("Context state has changed")),
            map(() => {
                this.currentTime = this.audioContext.currentTime
            }),
            takeUntil(this.destroy$)
        ).subscribe()

        this.destroy$.subscribe(value => {
            console.log("event emitted for destroy$ observable")
        })
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

        this.source.onended = (event: Event) => this.handleSourceStateChange(event)
        // this.source.context.onstatechange = (event: Event) => 
        this.source.connect(this.audioContext.destination)
        this.source.connect(this.analyser)
        this.source.connect(this.gainNode)
        this.source.start(0, this.pausedAt)

        this.startedAt = this.audioContext.currentTime - this.pausedAt
    }


    private async handleSourceStateChange(event: Event): Promise<void> {

        // this method is where we reset the environment for the currently playing track.
        // and is called when the AudioBufferSourceNode (this.source) onended event is firedd
        // we need a specific condition to be satisfied to reset the environment 

        // the 'ended' type on the event object could work, lets see its other states when the track ends

        if (event.type === 'ended') { // this.sourceNode.buffer.duration <= this.audioContext.currentTime
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

    
    public initializeAudioContext(): void {

        let context = new AudioContext()
        
        const analyser = context.createAnalyser()
        const gainNode = context.createGain()

        // analyser.connect(context.destination)
        // gainNode.connect(context.destination)

        this.audioContextSubject$.next(context)
        this.analyser = analyser
        this.gainNodeSubject$.next(gainNode)

    }


    public async setPlayingState(action: any): Promise<void> {

        try {

            if (action.isPlaying) {
                this.initiateTrackTimer()

                await this.audioContext.resume()

                this.play(this.source.buffer)
            }
            else if (!action.isPlaying) {
                let elapsed = this.audioContext.currentTime - this.startedAt

                this.pausedAt = elapsed
                this.source.disconnect()
                this.source.stop(0)

                await this.audioContext.suspend()

                this.destroy$.next(true)
            }

        } catch (error) {
            LoggerUtility.logError(error.message ?? "An error occured")
            throw error
        }

    }


    private generateUrl(song: ISong): string {
        return `${env.apiUrl}/repository/${env.userId}/${song.name.replace(/ /g, '%20')}`
    }
    

    public async setTrack(action: any): Promise<void> {
        try {
            // lets try suspending the audiocontext when we change tracks

            // note, we need to see if this resets the currentTime
            await this.audioContext.close()

            // reset the source 
            this.source.disconnect()
            this.source.stop(0)

            // reset the timing values for the currently playing track
            this.pausedAt = 0
            this.startedAt = 0

            // reset the frequency data behaviorsubject
            this.frequencyData = null

            // reset the duration and playback values that are used for the track time line in the UI
            this.duration = 0
            this.currentTime = 0

            // stop the interval observable from emitting the current time of the track
            this.destroy$.next(true)
                        
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
