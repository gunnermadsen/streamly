const worker = new Worker('./utils/streamer.util.ts')

worker.postMessage({ state: 'start' })

worker.onmessage = (event) => console.log(event)

worker.addEventListener('message', (event) => console.log(event))

export default worker