const tapCache = new WeakMap<
  HTMLMediaElement,
  { stream: MediaStream; audioContext: AudioContext }
>()

/** 从正在播放的 audio/video 获取可送入听悟的音频流 */
export function getMediaElementAudioStream(
  el: HTMLMediaElement
): MediaStream | null {
  const cached = tapCache.get(el)
  if (cached?.stream.getAudioTracks().some((t) => t.readyState === 'live')) {
    return cached.stream
  }

  const capture = (
    el as HTMLMediaElement & { captureStream?: () => MediaStream }
  ).captureStream?.()
  if (capture?.getAudioTracks().length) {
    return capture
  }

  try {
    const audioContext = new AudioContext()
    void audioContext.resume().catch(() => undefined)
    const source = audioContext.createMediaElementSource(el)
    const dest = audioContext.createMediaStreamDestination()
    source.connect(dest)
    source.connect(audioContext.destination)
    tapCache.set(el, { stream: dest.stream, audioContext })
    return dest.stream
  } catch {
    return null
  }
}

export function mediaElementAudioStreamUsable(stream: MediaStream | null): boolean {
  return Boolean(stream?.getAudioTracks().length)
}
