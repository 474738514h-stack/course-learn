import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { getMediaElementAudioStream } from '../utils/mediaAudioCapture'

interface UploadCourseMediaPlayerProps {
  mediaUrl: string
  mimeType: string
  fileName: string
  teacherName?: string
  autoStartTranscription: boolean
  onAutoStart: (stream: MediaStream | null) => void
  onAutoStartDone: () => void
  onMediaRef: (el: HTMLMediaElement | null) => void
  onEnded?: () => void
  onPlay?: () => void
  /** 与转写区左右分栏时，视频区占满左侧高度 */
  layout?: 'stacked' | 'split'
}

export function UploadCourseMediaPlayer({
  mediaUrl,
  mimeType,
  fileName,
  teacherName,
  autoStartTranscription,
  onAutoStart,
  onAutoStartDone,
  onMediaRef,
  onEnded,
  onPlay,
  layout = 'stacked',
}: UploadCourseMediaPlayerProps) {
  const startedRef = useRef(false)
  const mediaRef = useRef<HTMLMediaElement | null>(null)
  const isVideo = mimeType.startsWith('video/')

  useEffect(() => {
    startedRef.current = false
  }, [mediaUrl])

  useEffect(() => {
    if (!autoStartTranscription || startedRef.current) return
    const el = mediaRef.current
    if (!el) return
    startedRef.current = true
    void (async () => {
      await el.play().catch(() => undefined)
      if (el.paused) {
        onAutoStart(null)
        onAutoStartDone()
        return
      }
      await new Promise<void>((resolve) => {
        if (!el.paused && el.currentTime > 0) {
          resolve()
          return
        }
        const onPlaying = () => {
          el.removeEventListener('playing', onPlaying)
          resolve()
        }
        el.addEventListener('playing', onPlaying)
        window.setTimeout(() => {
          el.removeEventListener('playing', onPlaying)
          resolve()
        }, 800)
      })
      const capture = getMediaElementAudioStream(el)
      onAutoStart(capture)
      onAutoStartDone()
    })()
  }, [autoStartTranscription, mediaUrl, onAutoStart, onAutoStartDone])

  const bindRef = (el: HTMLMediaElement | null) => {
    mediaRef.current = el
    onMediaRef(el)
  }

  const mediaHandlers = {
    onEnded,
    onPlay,
  }

  const split = layout === 'split'

  return (
    <div
      className={clsx(
        'bg-[#fafafa] flex flex-col min-h-0',
        split
          ? 'flex-1 h-full p-4 gap-3'
          : 'shrink-0 border-b border-notion-border p-4'
      )}
    >
      <div className="flex items-center justify-between gap-2 shrink-0">
        <p className="text-xs font-medium text-notion-text truncate">{fileName}</p>
        {teacherName && (
          <span className="text-[11px] text-notion-muted shrink-0">
            授课：{teacherName}
          </span>
        )}
      </div>
      {isVideo ? (
        <video
          ref={bindRef}
          src={mediaUrl}
          controls
          playsInline
          {...mediaHandlers}
          className={clsx(
            'w-full rounded-lg bg-black object-contain',
            split ? 'flex-1 min-h-0 max-h-none' : 'max-h-[220px]'
          )}
        />
      ) : (
        <audio
          ref={bindRef}
          src={mediaUrl}
          controls
          {...mediaHandlers}
          className={clsx('w-full shrink-0', split && 'mt-auto mb-auto')}
        />
      )}
      {!split && (
        <p className="text-[11px] text-notion-muted shrink-0 leading-snug">
          边播放边转写：请保持播放，并使用「开始听课」或创建后自动转写。
        </p>
      )}
    </div>
  )
}
