
export class LoggerUtility {

    public static logEvent(text: string): void {
        const time = new Date()
        const cowboy = String.fromCodePoint(0x1F920)
        console.log(`%c [${time.toLocaleTimeString()}] ${text} ${cowboy}`, 'color: green;')
    }

    public static logObject(text: string, object: any): void {
        const time = new Date()
        console.log(`[${time.toLocaleTimeString()}] ${text}:`, object)
    }

    public static logError(text: any): void {
        const time = new Date()
        const fire = String.fromCodePoint(0x1F525)
        console.error(`%c [${time.toLocaleTimeString()}] ${text} ${fire}`)
    }

    public static reportError(message: Error) {
        this.logError(`Error ${message.name}: ${message.message}`)
    }
    
}