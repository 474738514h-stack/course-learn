import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import clsx from 'clsx'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { TranscriptSegment, KnowledgePoint } from '../types'
import {
  highlightText,
  stripKnowledgeHighlightMarkup,
} from '../data/knowledgePoints'

const SCROLL_BOTTOM_THRESHOLD = 72

function formatSegmentElapsed(timestamp: number, anchorMs: number): string {
  const totalSec = Math.max(0, Math.floor((timestamp - anchorMs) / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

interface TranscriptPanelProps {
  segments: TranscriptSegment[]
  interimText: string
  isListening?: boolean
  /** 顶栏已进入学习态但首句尚未返回时也视为转写中 */
  transcriptionActive?: boolean
  knowledgePoints: KnowledgePoint[]
  onKnowledgeClick: (id: string) => void
  onTextSelect: (text: string, x: number, y: number) => void
  onUpdateSegment?: (segmentId: string, text: string) => void
  onDeleteSegment?: (segmentId: string) => void
  /** 窄栏（如上传课右侧 1/4 转写区） */
  compact?: boolean
}

export function TranscriptPanel({
  segments,
  interimText,
  isListening = false,
  transcriptionActive = false,
  knowledgePoints,
  onKnowledgeClick,
  onTextSelect,
  onUpdateSegment,
  onDeleteSegment,
  compact = false,
}: TranscriptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pinnedToBottomRef = useRef(true)
  const listenStartRef = useRef<number | null>(null)
  const [showJumpToLatest, setShowJumpToLatest] = useState(false)

  useEffect(() => {
    if (isListening && listenStartRef.current === null) {
      listenStartRef.current = Date.now()
    }
    if (!isListening) {
      listenStartRef.current = null
      pinnedToBottomRef.current = true
      setShowJumpToLatest(false)
    }
  }, [isListening])

  const timeAnchorMs = useMemo(() => {
    if (segments.length > 0) return segments[0].timestamp
    return listenStartRef.current ?? Date.now()
  }, [segments])

  const checkPinned = useCallback(() => {
    const el = containerRef.current
    if (!el) return true
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_BOTTOM_THRESHOLD
    pinnedToBottomRef.current = atBottom
    setShowJumpToLatest(isListening && !atBottom)
    return atBottom
  }, [isListening])

  const scrollToLatest = useCallback(() => {
    pinnedToBottomRef.current = true
    setShowJumpToLatest(false)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!pinnedToBottomRef.current) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [segments, interimText])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      checkPinned()
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [checkPinned])

  const resolveMarkFromEvent = (node: EventTarget | null) => {
    if (!node || !(node instanceof Node)) return null
    const el = node instanceof Element ? node : node.parentElement
    return el?.closest?.('[data-kp-id]') as HTMLElement | null
  }

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
    if (resolveMarkFromEvent(e.target)) return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const text = selection.toString().trim()
    if (text.length < 2) return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    onTextSelect(text, rect.left + rect.width / 2, rect.top)
  },
    [onTextSelect]
  )

  const openKnowledgeFromMark = useCallback(
    (e: React.MouseEvent) => {
      const mark = resolveMarkFromEvent(e.target)
      const kpId = mark?.getAttribute('data-kp-id')?.trim()
      if (!kpId) return
      e.preventDefault()
      e.stopPropagation()
      window.getSelection()?.removeAllRanges()
      onKnowledgeClick(kpId)
    },
    [onKnowledgeClick]
  )

  return (
    <div className="flex-1 min-h-0 relative flex flex-col">
      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        onClick={openKnowledgeFromMark}
        className={clsx(
          'flex-1 overflow-y-auto select-text',
          compact ? 'p-4' : 'p-6'
        )}
      >
        {segments.length === 0 && !interimText && !isListening && !transcriptionActive && (
          <EmptyTranscript compact={compact} />
        )}
        {segments.length === 0 &&
          !interimText &&
          (isListening || transcriptionActive) && (
            <TranscriptionWaiting compact={compact} />
          )}

        <div className={clsx('space-y-3', compact ? 'max-w-none' : 'max-w-2xl mx-auto')}>
          {segments.map((seg) => (
            <TranscriptBlock
              key={seg.id}
              segment={seg}
              timeLabel={formatSegmentElapsed(seg.timestamp, timeAnchorMs)}
              knowledgePoints={knowledgePoints}
              onUpdate={onUpdateSegment}
              onDelete={onDeleteSegment}
            />
          ))}

          {interimText && (
            <div className="flex items-start gap-3 rounded-xl border border-dashed border-notion-border bg-[#fafafa] px-3 py-2.5">
              <p className="shrink-0 w-9 pt-0.5 text-[11px] font-mono text-notion-muted tabular-nums">
                {formatSegmentElapsed(Date.now(), timeAnchorMs)}
              </p>
              <p className="flex-1 min-w-0 text-notion-text text-[15px] leading-[1.75]">
                {interimText}
                <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse align-text-bottom" />
              </p>
            </div>
          )}
        </div>

        <div ref={bottomRef} />
      </div>

      {showJumpToLatest && (
        <button
          type="button"
          onClick={scrollToLatest}
          className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-notion-border bg-white px-5 py-2.5 text-sm font-medium text-notion-text shadow-card hover:bg-notion-sidebar/50 transition-colors"
        >
          回到最新转写
        </button>
      )}
    </div>
  )
}

function TranscriptBlock({
  segment,
  timeLabel,
  knowledgePoints,
  onUpdate,
  onDelete,
}: {
  segment: TranscriptSegment
  timeLabel: string
  knowledgePoints: KnowledgePoint[]
  onUpdate?: (segmentId: string, text: string) => void
  onDelete?: (segmentId: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(segment.text)
  const canEdit = Boolean(onUpdate)
  const canDelete = Boolean(onDelete)

  useEffect(() => {
    if (!editing) setDraft(segment.text)
  }, [segment.text, editing])

  const { html } = highlightText(segment.text, knowledgePoints)

  const saveEdit = () => {
    const trimmed = stripKnowledgeHighlightMarkup(draft.trim())
    if (!trimmed) return
    onUpdate?.(segment.id, trimmed)
    setEditing(false)
  }

  const cancelEdit = () => {
    setDraft(segment.text)
    setEditing(false)
  }

  return (
    <div className="group relative rounded-xl border border-notion-border/80 bg-white px-3 py-2.5">
      {(canEdit || canDelete) && !editing && (
        <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-[1]">
          {canEdit && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-notion-muted hover:text-notion-text hover:bg-notion-hover"
              aria-label="编辑转写"
            >
              <Pencil size={14} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onDelete?.(segment.id)}
              className="p-1.5 rounded-lg text-notion-muted hover:text-red-600 hover:bg-red-50"
              aria-label="删除转写"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}

      <div className="flex items-start gap-3 pr-8">
        <p className="shrink-0 w-9 pt-0.5 text-[11px] font-mono text-notion-muted tabular-nums">
          {timeLabel}
        </p>

        {editing ? (
          <div className="flex-1 min-w-0 space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              className="w-full text-[15px] leading-relaxed border border-notion-border rounded-lg px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-violet-500/15"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-notion-border text-notion-muted hover:bg-notion-hover"
              >
                <X size={12} />
                取消
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={!draft.trim()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-notion-text text-white disabled:opacity-40 hover:bg-notion-text/90"
              >
                <Check size={12} />
                保存
              </button>
            </div>
          </div>
        ) : (
          <p
            className="flex-1 min-w-0 text-[15px] leading-[1.75] text-notion-text"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  )
}

function TranscriptionWaiting({ compact }: { compact?: boolean }) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center mb-4',
        compact ? 'min-h-0 py-6' : 'min-h-[280px] mb-8'
      )}
    >
      <div
        className={clsx(
          'rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-2',
          compact ? 'w-9 h-9' : 'w-12 h-12 mb-3'
        )}
      >
        <span className="text-violet-600 text-lg animate-pulse">···</span>
      </div>
      <h3 className={clsx('text-notion-text font-medium mb-1', compact && 'text-sm')}>
        转写连接中
      </h3>
      <p
        className={clsx(
          'text-notion-muted leading-relaxed',
          compact ? 'text-[11px] px-1' : 'text-sm max-w-sm'
        )}
      >
        请保持音视频播放；首句识别结果将很快出现在下方。
      </p>
    </div>
  )
}

function EmptyTranscript({ compact }: { compact?: boolean }) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center h-full text-center',
        compact ? 'min-h-0 py-6' : 'min-h-[400px]'
      )}
    >
      <div
        className={clsx(
          'rounded-2xl bg-notion-sidebar border border-notion-border flex items-center justify-center mb-3',
          compact ? 'w-11 h-11 text-xl' : 'w-16 h-16 mb-4 text-2xl'
        )}
      >
        <span>🎙</span>
      </div>
      <h3 className={clsx('text-notion-text font-medium mb-1', compact && 'text-sm')}>
        等待语音输入
      </h3>
      <p
        className={clsx(
          'text-notion-muted leading-relaxed',
          compact ? 'text-[11px] px-1' : 'text-sm max-w-xs'
        )}
      >
        上传课请先选「通义听悟」，保持播放器播放，再点「开始听课」或「继续转写」
      </p>
      {!compact && (
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-[11px] text-notion-muted">
          <span className="px-2 py-1 bg-notion-sidebar rounded border border-notion-border">
            支持中文识别
          </span>
          <span className="px-2 py-1 bg-notion-sidebar rounded border border-notion-border">
            知识点自动高亮
          </span>
          <span className="px-2 py-1 bg-notion-sidebar rounded border border-notion-border">
            划词智能解释
          </span>
        </div>
      )}
    </div>
  )
}
