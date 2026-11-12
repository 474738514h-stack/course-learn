const TARGET_SAMPLE_RATE = 16000

function downsampleTo16k(
  input: Float32Array,
  inputSampleRate: number
): Float32Array {
  if (inputSampleRate === TARGET_SAMPLE_RATE) return input
  const ratio = inputSampleRate / TARGET_SAMPLE_RATE
  const length = Math.floor(input.length / ratio)
  const result = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    result[i] = input[Math.floor(i * ratio)]
  }
  return result
}

function floatTo16BitPCM(samples: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(samples.length * 2)
  const view = new DataView(buffer)
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return buffer
}

export class PcmRecorder {
  private ctx: AudioContext | null = null
  private processor: ScriptProcessorNode | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private mute: GainNode | null = null
  private pending: Float32Array[] = []
  private intervalId: ReturnType<typeof setInterval> | null = null
  private onChunk: (pcm: ArrayBuffer) => void

  constructor(onChunk: (pcm: ArrayBuffer) => void) {
    this.onChunk = onChunk
  }

  async start(stream: MediaStream): Promise<void> {
    this.stop()
    this.ctx = new AudioContext()
    await this.ctx.resume()

    this.source = this.ctx.createMediaStreamSource(stream)
    this.processor = this.ctx.createScriptProcessor(4096, 1, 1)
    this.mute = this.ctx.createGain()
    this.mute.gain.value = 0

    this.processor.onaudioprocess = (event) => {
      const channel = event.inputBuffer.getChannelData(0)
      this.pending.push(new Float32Array(channel))
    }

    this.source.connect(this.processor)
    this.processor.connect(this.mute)
    this.mute.connect(this.ctx.destination)

    this.intervalId = setInterval(() => this.flush(), 100)
  }

  private flush() {
    if (!this.ctx || this.pending.length === 0) return

    let total = 0
    for (const p of this.pending) total += p.length
    const merged = new Float32Array(total)
    let offset = 0
    for (const p of this.pending) {
      merged.set(p, offset)
      offset += p.length
    }
    this.pending = []

    const down = downsampleTo16k(merged, this.ctx.sampleRate)
    if (down.length === 0) return
    this.onChunk(floatTo16BitPCM(down))
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.processor?.disconnect()
    this.source?.disconnect()
    this.mute?.disconnect()
    void this.ctx?.close()
    this.processor = null
    this.source = null
    this.mute = null
    this.ctx = null
    this.pending = []
  }
}

export function sendPcmInChunks(ws: WebSocket, buffer: ArrayBuffer) {
  const arr = new Int8Array(buffer)
  const chunkSize = 1024
  for (let i = 0; i < arr.byteLength; i += chunkSize) {
    ws.send(arr.subarray(i, i + chunkSize))
  }
}
