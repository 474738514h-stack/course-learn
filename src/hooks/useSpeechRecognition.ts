import { useState, useEffect, useCallback, useRef } from 'react'
import type { TranscriptSegment } from '../types'
import { matchKnowledgePoints } from '../data/knowledgePoints'
import type { KnowledgePoint } from '../types'

interface UseSpeechRecognitionOptions {
  language?: string
  onSegment?: (segment: TranscriptSegment) => void
  knowledgePoints: KnowledgePoint[]
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

export function useSpeechRecognition({
  language = 'zh-CN',
  onSegment,
  knowledgePoints,
}: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const shouldRestartRef = useRef(false)
  const segmentIdRef = useRef(0)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript

        if (result.isFinal) {
          const matchedIds = matchKnowledgePoints(transcript, knowledgePoints)
          const segment: TranscriptSegment = {
            id: `seg-${++segmentIdRef.current}`,
            text: transcript,
            timestamp: Date.now(),
            isFinal: true,
            matchedKnowledgeIds: matchedIds,
          }
          onSegment?.(segment)
          setInterimText('')
        } else {
          interim += transcript
        }
      }
      if (interim) setInterimText(interim)
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('麦克风权限被拒绝，请在浏览器设置中允许访问')
        shouldRestartRef.current = false
      } else if (event.error !== 'aborted') {
        setError(`语音识别错误: ${event.error}`)
      }
    }

    recognition.onend = () => {
      if (shouldRestartRef.current) {
        try {
          recognition.start()
        } catch {
          setIsListening(false)
        }
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition

    return () => {
      shouldRestartRef.current = false
      recognition.abort()
    }
  }, [language, onSegment, knowledgePoints])

  const start = useCallback(() => {
    setError(null)
    shouldRestartRef.current = true
    try {
      recognitionRef.current?.start()
      setIsListening(true)
    } catch {
      /* already started */
    }
  }, [])

  const stop = useCallback(() => {
    shouldRestartRef.current = false
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterimText('')
  }, [])

  return { isListening, interimText, error, isSupported, start, stop }
}

export function useTabAudioCapture() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCapture = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })

      stream.getVideoTracks().forEach((track) => track.stop())

      const audioTracks = stream.getAudioTracks()
      if (audioTracks.length === 0) {
        setError('未检测到音频，请确保选择了包含音频的标签页')
        stream.getTracks().forEach((t) => t.stop())
        return null
      }

      streamRef.current = stream
      setIsCapturing(true)
      return stream
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('屏幕共享权限被拒绝')
      } else {
        setError('无法捕获标签页音频')
      }
      return null
    }
  }, [])

  const stopCapture = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setIsCapturing(false)
  }, [])

  const clearCaptureError = useCallback(() => setError(null), [])

  return {
    isCapturing,
    error,
    startCapture,
    stopCapture,
    clearCaptureError,
    streamRef,
  }
}
