import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ArrowLeft, Sparkles } from 'lucide-react'
import { UploadCourseMediaPlayer } from './UploadCourseMediaPlayer'
import { loadUploadMedia } from '../utils/uploadMediaStore'
import { stripVendorNameFromCopy } from '../utils/importedCourseCopy'
import type { Course, KnowledgePoint, Lesson, TranscriptSegment } from '../types'
import { TranscriptPanel } from './TranscriptPanel'
import { LessonFocusKnowledgePanel } from './LessonFocusKnowledgePanel'
import { LessonInteractionPanel } from './LessonInteractionPanel'
import {
  LessonListenButtons,
  LessonSessionStatusBanner,
  type ListenSessionPhase,
} from './LessonListenControls'
import {
  AudioSourceToggle,
  TranscriptionEngineToggle,
} from './Sidebar'
import {
  computeKnowledgeHitsFromSegments,
  filterHitsForCourse,
  matchKnowledgePoints,
} from '../data/knowledgePoints'

interface CourseLearnViewProps {
  activeCourse: Course | undefined
  activeLesson: Lesson | undefined
  /** 当前课程绑定的识别词条（含自定义） */
  courseKnowledgePoints: KnowledgePoint[]
  interimText: string
  isListening: boolean
  useTingwu: boolean
  tingwuReady: boolean | null
  isSupported: boolean
  speechError: string | null
  tabError: string | null
  browserAsrSupported: boolean
  transcriptionCaptureLabel: string
  transcriptionEngine: 'browser' | 'tingwu'
  onTranscriptionEngineChange: (engine: 'browser' | 'tingwu') => void
  audioSource: 'microphone' | 'tab'
  onAudioSourceChange: (source: 'microphone' | 'tab') => void
  listenSessionPhase: ListenSessionPhase
  onStartListen: () => void
  onPauseTranscription: () => void
  onResumeTranscription: () => void
  onEndCourseSession: () => void
  showCourseSummaryButton?: boolean
  onOpenSummary: () => void
  onBack?: () => void
  onTranscriptSegment: (seg: TranscriptSegment) => void
  onUpdateTranscriptSegment: (segmentId: string, text: string) => void
  onDeleteTranscriptSegment: (segmentId: string) => void
  onKnowledgeClick: (id: string) => void
  onTextSelect: (text: string, x: number, y: number) => void
  chatKnowledgeIds: string[]
  selectedKnowledgeId: string | null
  onSelectKnowledge: (id: string) => void
  onDismissChatKnowledge: (id: string) => void
  uploadMedia?: {
    url: string
    mimeType: string
    fileName: string
  } | null
  uploadAutoStartTranscription?: boolean
  onUploadAutoStart: (stream: MediaStream | null) => void
  onUploadAutoStartDone: () => void
  onUploadMediaRef: (el: HTMLMediaElement | null) => void
  onUploadMediaEnded: () => void
  onUploadMediaPlay?: () => void
}

export function CourseLearnView({
  activeCourse,
  activeLesson,
  courseKnowledgePoints,
  interimText,
  isListening,
  useTingwu,
  tingwuReady,
  isSupported,
  speechError,
  tabError,
  browserAsrSupported,
  transcriptionCaptureLabel,
  transcriptionEngine,
  onTranscriptionEngineChange,
  audioSource,
  onAudioSourceChange,
  listenSessionPhase,
  onStartListen,
  onPauseTranscription,
  onResumeTranscription,
  onEndCourseSession,
  showCourseSummaryButton = true,
  onOpenSummary,
  onBack,
  onTranscriptSegment,
  onUpdateTranscriptSegment,
  onDeleteTranscriptSegment,
  onKnowledgeClick,
  onTextSelect,
  chatKnowledgeIds,
  selectedKnowledgeId,
  onSelectKnowledge,
  onDismissChatKnowledge,
  uploadMedia,
  uploadAutoStartTranscription = false,
  onUploadAutoStart,
  onUploadAutoStartDone,
  onUploadMediaRef,
  onUploadMediaEnded,
  onUploadMediaPlay,
}: CourseLearnViewProps) {
  const error = speechError || tabError
  const isUploadCourse = activeCourse?.sourceType === 'upload'
  const [loadedMedia, setLoadedMedia] = useState<{
    url: string
    mimeType: string
    fileName: string
  } | null>(null)

  useEffect(() => {
    if (!isUploadCourse || !activeCourse?.id) {
      setLoadedMedia(null)
      return
    }
    if (uploadMedia) {
      setLoadedMedia(null)
      return
    }
    let revoked: string | null = null
    let cancelled = false
    void loadUploadMedia(activeCourse.id).then((m) => {
      if (cancelled) {
        if (m?.url) URL.revokeObjectURL(m.url)
        return
      }
      if (m) {
        revoked = m.url
        setLoadedMedia(m)
      }
    })
    return () => {
      cancelled = true
      if (revoked) URL.revokeObjectURL(revoked)
    }
  }, [isUploadCourse, activeCourse?.id, uploadMedia])

  const displayMedia = uploadMedia ?? loadedMedia
  const mediaFileName =
    displayMedia?.fileName ?? activeCourse?.uploadFileName ?? '本地音视频'

  const liveLessonHits = useMemo(() => {
    const segments = activeLesson?.transcriptSegments ?? []
    if (segments.length === 0) return {}
    return filterHitsForCourse(
      computeKnowledgeHitsFromSegments(segments, courseKnowledgePoints),
      courseKnowledgePoints
    )
  }, [activeLesson?.transcriptSegments, courseKnowledgePoints])

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f7f6f3]">
      {onBack && (
        <div className="shrink-0 h-[52px] border-b border-notion-border/80 bg-[#f7f6f3]/95 px-6 flex items-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[13px] text-notion-muted hover:text-notion-text transition-colors"
          >
            <ArrowLeft size={15} />
            返回课程列表
          </button>
        </div>
      )}
      {error && (
        <div className="shrink-0 mx-6 mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-2 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {!useTingwu && !browserAsrSupported && (
        <div className="shrink-0 mx-6 mt-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-2 flex items-center gap-2 text-sm text-amber-700">
          <AlertCircle size={14} />
          当前浏览器不支持 Web Speech API，请使用 Chrome 或切换为「通义听悟」
        </div>
      )}

      {useTingwu && tingwuReady === false && (
        <div className="shrink-0 mx-6 mt-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-2 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} />
            通义听悟未配置：请在 `.env` 填写 AccessKey 与 TINGWU_APP_KEY 后重启 dev。
          </div>
        </div>
      )}

      <div className="shrink-0 px-6 pt-6 pb-5">
        <div className="rounded-2xl border border-notion-border bg-white p-5 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <h1 className="text-2xl font-semibold text-notion-text tracking-tight truncate">
                {activeLesson?.title || '选择课程'}
              </h1>
              <p className="text-sm text-notion-muted flex flex-wrap items-center gap-2">
                <span>
                  {stripVendorNameFromCopy(activeCourse?.description)}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-notion-sidebar border border-notion-border text-[10px] font-medium">
                  转写 · {useTingwu ? '通义听悟' : '浏览器'} ·{' '}
                  {transcriptionCaptureLabel}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <TranscriptionEngineToggle
                  engine={transcriptionEngine}
                  onChange={onTranscriptionEngineChange}
                />
                {!isUploadCourse && (
                  <AudioSourceToggle
                    source={audioSource}
                    onChange={onAudioSourceChange}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 lg:justify-end lg:max-w-[58%]">
              {(listenSessionPhase === 'active' ||
                listenSessionPhase === 'paused') && (
                <LessonSessionStatusBanner phase={listenSessionPhase} />
              )}
              <LessonListenButtons
                phase={listenSessionPhase}
                isSupported={isSupported}
                lessonTitle={activeLesson?.title}
                onStartListen={onStartListen}
                onPause={onPauseTranscription}
                onResume={onResumeTranscription}
                onEndCourse={onEndCourseSession}
                onWorkbench={onBack}
              />
              {showCourseSummaryButton && (
                <button
                  type="button"
                  onClick={onOpenSummary}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100 transition-colors shrink-0"
                >
                  <Sparkles size={15} />
                  本课总结
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 px-6 pb-6 gap-4">
        <div className="w-[11.5rem] shrink-0 rounded-2xl border border-notion-border bg-white shadow-card overflow-hidden flex flex-col min-h-0">
          <LessonFocusKnowledgePanel
            lesson={activeLesson}
            knowledgePoints={courseKnowledgePoints}
            hits={liveLessonHits}
            selectedId={selectedKnowledgeId}
            onSelect={onSelectKnowledge}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0 rounded-2xl border border-notion-border bg-white shadow-card overflow-hidden">
          {isUploadCourse && displayMedia ? (
            <div className="flex-1 flex min-h-0 p-4 gap-4">
              <div className="flex-[3] min-w-0 flex flex-col min-h-0 rounded-xl bg-[#fafafa] overflow-hidden">
                <UploadCourseMediaPlayer
                  layout="split"
                  mediaUrl={displayMedia.url}
                  mimeType={displayMedia.mimeType}
                  fileName={mediaFileName}
                  teacherName={activeCourse?.teacherName}
                  autoStartTranscription={uploadAutoStartTranscription}
                  onAutoStart={onUploadAutoStart}
                  onAutoStartDone={onUploadAutoStartDone}
                  onMediaRef={onUploadMediaRef}
                  onEnded={onUploadMediaEnded}
                  onPlay={onUploadMediaPlay}
                />
              </div>
              <div className="flex-[1] min-w-[11rem] flex flex-col min-h-0 rounded-xl border border-notion-border bg-white overflow-hidden">
                <div className="shrink-0 p-4 border-b border-notion-border">
                  <h2 className="text-sm font-semibold text-notion-text">
                    实时转写
                  </h2>
                  <p className="text-[11px] text-notion-muted mt-1 leading-snug">
                    划词解释 · 知识点高亮
                  </p>
                </div>
                <TranscriptPanel
                  compact
                  segments={activeLesson?.transcriptSegments || []}
                  interimText={interimText}
                  isListening={isListening}
                  transcriptionActive={
                    listenSessionPhase === 'active' ||
                    (listenSessionPhase === 'paused' && isListening)
                  }
                  knowledgePoints={courseKnowledgePoints}
                  onKnowledgeClick={onKnowledgeClick}
                  onTextSelect={onTextSelect}
                  onUpdateSegment={onUpdateTranscriptSegment}
                  onDeleteSegment={onDeleteTranscriptSegment}
                />
              </div>
            </div>
          ) : (
            <>
              {isUploadCourse && !displayMedia && (
                <div className="shrink-0 p-4 border-b border-notion-border bg-amber-50/80 text-xs text-amber-800">
                  未找到本地文件（可能已在其他浏览器清除缓存）。请重新上传或从本机选择文件。
                </div>
              )}
              <div className="shrink-0 p-4 border-b border-notion-border">
                <h2 className="text-lg font-semibold text-notion-text">
                  实时转写
                </h2>
                <p className="text-xs text-notion-muted mt-0.5">
                  划词可解释或记笔记 · 知识点自动高亮
                </p>
              </div>
              <TranscriptPanel
                segments={activeLesson?.transcriptSegments || []}
                interimText={interimText}
                isListening={isListening}
                transcriptionActive={
                  listenSessionPhase === 'active' ||
                  (listenSessionPhase === 'paused' && isListening)
                }
                knowledgePoints={courseKnowledgePoints}
                onKnowledgeClick={onKnowledgeClick}
                onTextSelect={onTextSelect}
                onUpdateSegment={onUpdateTranscriptSegment}
                onDeleteSegment={onDeleteTranscriptSegment}
              />
              {(activeLesson?.transcriptSegments.length ?? 0) === 0 &&
                !isListening &&
                !isUploadCourse && (
                  <div className="shrink-0 border-t border-notion-border px-6 py-3 bg-notion-sidebar/30">
                    <DemoTranscript
                      knowledgePoints={courseKnowledgePoints}
                      onInsert={onTranscriptSegment}
                    />
                  </div>
                )}
            </>
          )}
        </div>

        <div className="w-[22rem] shrink-0 rounded-2xl border border-notion-border bg-white shadow-card overflow-hidden flex flex-col min-h-0">
          <LessonInteractionPanel
            lessonTitle={activeLesson?.title}
            transcriptText={
              activeLesson?.transcriptSegments.map((s) => s.text).join('\n') ||
              ''
            }
            notes={activeLesson?.notes || []}
            knowledgePoints={courseKnowledgePoints}
            hits={liveLessonHits}
            chatKnowledgeIds={chatKnowledgeIds}
            selectedKnowledgeId={selectedKnowledgeId}
            onDismissChatKnowledge={onDismissChatKnowledge}
            showKnowledgeCard
          />
        </div>
      </div>
    </div>
  )
}

function DemoTranscript({
  knowledgePoints,
  onInsert,
}: {
  knowledgePoints: KnowledgePoint[]
  onInsert: (seg: TranscriptSegment) => void
}) {
  const demoLines = [
    '同学们，今天学习一元二次方程。只含一个未知数，并且未知数的最高次数是 2 的方程，就是我们的一元二次方程。',
    '解一元二次方程可以用配方法、公式法，还有因式分解法。大家要把方程先化成 ax²+bx+c=0 的标准形式。',
    '判别式 Δ 等于 b 平方减 4ac。当 Δ 大于 0 时，方程有两个不相等的实数根。',
    '韦达定理告诉我们，两根之和等于负的 b 比 a，两根之积等于 c 比 a，做题时经常用到。',
    '最后看一道应用题：面积问题设未知数列方程，解完后要检验根是否符合实际意义。',
  ]

  const insertDemo = () => {
    let i = 0
    const interval = setInterval(() => {
      if (i >= demoLines.length) {
        clearInterval(interval)
        return
      }
      const text = demoLines[i]
      onInsert({
        id: `demo-${Date.now()}-${i}`,
        text,
        timestamp: Date.now(),
        isFinal: true,
        matchedKnowledgeIds: matchKnowledgePoints(text, knowledgePoints),
      })
      i++
    }, 1500)
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-notion-muted">
        没有麦克风？试试演示模式，模拟课程语音转写效果
      </p>
      <button
        onClick={insertDemo}
        className="text-xs px-3 py-1.5 bg-white border border-notion-border rounded-lg hover:bg-notion-hover transition-colors text-notion-muted font-medium"
      >
        播放演示
      </button>
    </div>
  )
}
