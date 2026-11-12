import { useState, useCallback, useRef } from 'react'
import type { TranscriptSegment, KnowledgePoint } from '../types'
import { matchKnowledgePoints } from '../data/knowledgePoints'
import {
  startTingwuSession,
  stopTingwuSession,
  parseTingwuMessage,
  extractInterimText,
  extractFinalText,
} from '../services/tingwu'
import { PcmRecorder, sendPcmInChunks } from '../utils/pcmRecorder'

interface Options {
  onSegment?: (segment: TranscriptSegment) => void
  knowledgePoints: KnowledgePoint[]
}

export function useTingwuTranscription({ onSegment, knowledgePoints }: Options) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported] = useState(true)

  const wsRef = useRef<WebSocket | null>(null)
  const recorderRef = useRef<PcmRecorder | null>(null)
  const taskIdRef = useRef<string | null>(null)
  const segmentIdRef = useRef(0)
  const streamRef = useRef<MediaStream | null>(null)

  const cleanup = useCallback(async () => {
    recorderRef.current?.stop()
    recorderRef.current = null

    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          header: { name: 'StopTranscription', namespace: 'SpeechTranscriber' },
          payload: {},
        })
      )
      ws.close()
    }
    wsRef.current = null

    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null

    const taskId = taskIdRef.current
    taskIdRef.current = null
    if (taskId) {
      try {
        await stopTingwuSession(taskId)
      } catch {
        /* ignore stop errors on cleanup */
      }
    }

    setInterimText('')
    setIsListening(false)
  }, [])

  const start = useCallback(
    async (stream?: MediaStream | null): Promise<boolean> => {
      setError(null)
      try {
        let mediaStream: MediaStream
        if (stream === null) {
          throw new Error('无可用音频流，请确认音视频正在播放')
        }
        if (stream === undefined) {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          })
        } else if (!stream.getAudioTracks().length) {
          throw new Error('未检测到音轨：共享标签页时请勾选「分享标签页音频」')
        } else {
          mediaStream = stream
        }
        streamRef.current = mediaStream

        const session = await startTingwuSession()
        taskIdRef.current = session.taskId

        const ws = new WebSocket(session.meetingJoinUrl)
        ws.binaryType = 'arraybuffer'
        wsRef.current = ws

        await new Promise<void>((resolve, reject) => {
          ws.onopen = () => resolve()
          ws.onerror = () => reject(new Error('听悟 WebSocket 连接失败'))
        })

        ws.send(
          JSON.stringify({
            header: { name: 'StartTranscription', namespace: 'SpeechTranscriber' },
            payload: { format: 'pcm' },
          })
        )

        ws.onmessage = (event) => {
          if (typeof event.data !== 'string') return
          const msg = parseTingwuMessage(event.data)
          if (!msg) return

          const interim = extractInterimText(msg)
          if (interim !== null) {
            setInterimText(interim)
            return
          }

          const finalText = extractFinalText(msg)
          if (finalText) {
            setInterimText('')
            const matchedIds = matchKnowledgePoints(finalText, knowledgePoints)
            onSegment?.({
              id: `tingwu-${++segmentIdRef.current}`,
              text: finalText,
              timestamp: Date.now(),
              isFinal: true,
              matchedKnowledgeIds: matchedIds,
            })
          }
        }

        ws.onerror = () => {
          setError('听悟推流连接异常')
          void cleanup()
        }

        ws.onclose = () => {
          if (wsRef.current === ws) {
            void cleanup()
          }
        }

        const recorder = new PcmRecorder((pcm) => {
          if (ws.readyState === WebSocket.OPEN) {
            sendPcmInChunks(ws, pcm)
          }
        })
        recorderRef.current = recorder
        await recorder.start(mediaStream)

        setIsListening(true)
        return true
      } catch (err) {
        await cleanup()
        const message =
          err instanceof Error ? err.message : '通义听悟启动失败'
        setError(message)
        return false
      }
    },
    [cleanup, knowledgePoints, onSegment]
  )

  const stop = useCallback(async () => {
    await cleanup()
  }, [cleanup])

  return {
    isListening,
    interimText,
    error,
    isSupported,
    start,
    stop,
  }
}
