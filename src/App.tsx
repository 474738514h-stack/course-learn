import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { saveUploadMedia } from './utils/uploadMediaStore'
import { rememberTeacherName } from './data/teacherPresets'
import { getTranscriptionCaptureLabel } from './utils/courseTranscriptionMode'
import { formatTranscriptionError } from './utils/transcriptionErrors'
import {
  isCourseSummaryAvailable,
  parseCourseTitleParts,
} from './utils/courseListMeta'
import {
  fetchWebVideoDurationSec,
  probeLocalMediaDurationSec,
} from './utils/webVideoDuration'
import {
  getMediaElementAudioStream,
  mediaElementAudioStreamUsable,
} from './utils/mediaAudioCapture'
import type { ListenSessionPhase } from './components/LessonListenControls'
import { useAppState } from './hooks/useAppState'
import { useSpeechRecognition, useTabAudioCapture } from './hooks/useSpeechRecognition'
import { useTingwuTranscription } from './hooks/useTingwuTranscription'
import { Sidebar } from './components/Sidebar'
import { fetchTingwuStatus } from './services/tingwu'
import { SelectionPopup } from './components/SelectionPopup'
import { KnowledgeBaseView } from './components/KnowledgeBaseView'
import { AdminP0View } from './components/admin/AdminP0View'
import { LearningStatsView } from './components/LearningStatsView'
import { CourseLearnView } from './components/CourseLearnView'
import { CourseListView } from './components/CourseListView'
import { LessonSummaryPanel } from './components/LessonSummaryPanel'
import { NewCourseView } from './components/NewCourseView'
import { knowledgePointsForCourse } from './data/knowledgeLibraries'
import {
  CourseDeleteDialog,
  CourseEditDialog,
} from './components/CourseEditDialog'
import {
  isAppHistoryRoute,
  parseAppRouteFromLocation,
  pathForAppRoute,
  type AppHistoryRoute,
} from './navigation/appRoute'

export default function App() {
  const {
    courses,
    activeCourse,
    activeLesson,
    allKnowledgePoints,
    setActiveCourseId,
    setActiveLessonId,
    audioSource,
    setAudioSource,
    transcriptionEngine,
    setTranscriptionEngine,
    selectedKnowledgeId,
    setSelectedKnowledgeId,
    selectionAction,
    setSelectionAction,
    addTranscriptSegment,
    updateTranscriptSegment,
    deleteTranscriptSegment,
    addNote,
    addCustomKnowledgePoint,
    getKnowledgeTimeline,
    sidebarNav,
    setSidebarNav,
    getGlobalKnowledgeHits,
    recordKnowledgeView,
    recordExplainRequest,
    saveLessonSummary,
    clearLessonSummary,
    createCourse,
    patchCourse,
    updateCourse,
    deleteCourse,
    openCourse,
    markActiveLessonTranscriptionEnded,
    markActiveLessonTranscriptionStarted,
    activeCourseId,
    activeLessonId,
    refreshKnowledgeLibrary,
  } = useAppState()

  const [summaryOpen, setSummaryOpen] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null)
  const [courseDetailOpen, setCourseDetailOpen] = useState(false)
  const [newCourseOpen, setNewCourseOpen] = useState(false)
  const [webCreateLoading, setWebCreateLoading] = useState(false)
  const [uploadCreateLoading, setUploadCreateLoading] = useState(false)
  const [activeLibraryId, setActiveLibraryId] = useState('ai-pm')

  type PendingListen = { kind: 'tab'; stream?: MediaStream }
  const [pendingListen, setPendingListen] = useState<PendingListen | null>(null)

  const [uploadSession, setUploadSession] = useState<{
    courseId: string
    objectUrl: string
    mimeType: string
    fileName: string
  } | null>(null)
  const [uploadAutoStart, setUploadAutoStart] = useState(false)
  const [listenSessionPhase, setListenSessionPhase] =
    useState<ListenSessionPhase>('idle')
  const [sessionError, setSessionError] = useState<string | null>(null)
  /** 上传课：仅点击「结束课程」后为 true，才显示「本课总结」 */
  const [uploadSummaryUnlocked, setUploadSummaryUnlocked] = useState(false)
  const uploadMediaRef = useRef<HTMLMediaElement | null>(null)
  const listenPhaseInitKeyRef = useRef<string | null>(null)
  /** 本课 AI 对话区知识点卡片队列（按点击顺序保留，不关单卡不清空） */
  const [lessonChatKnowledgeIds, setLessonChatKnowledgeIds] = useState<
    Record<string, string[]>
  >({})

  const activeLessonChatKnowledgeIds = useMemo(() => {
    if (!activeLessonId) return []
    return lessonChatKnowledgeIds[activeLessonId] ?? []
  }, [activeLessonId, lessonChatKnowledgeIds])

  const pushLessonChatKnowledge = useCallback(
    (id: string) => {
      if (!activeLessonId) return
      setLessonChatKnowledgeIds((prev) => {
        const cur = prev[activeLessonId] ?? []
        if (cur.includes(id)) return prev
        return { ...prev, [activeLessonId]: [...cur, id] }
      })
      setSelectedKnowledgeId(id)
    },
    [activeLessonId, setSelectedKnowledgeId]
  )

  const dismissLessonChatKnowledge = useCallback(
    (id: string) => {
      if (!activeLessonId) return
      setLessonChatKnowledgeIds((prev) => {
        const cur = prev[activeLessonId] ?? []
        const next = cur.filter((x) => x !== id)
        return { ...prev, [activeLessonId]: next }
      })
      setSelectedKnowledgeId((current) =>
        current === id ? null : current
      )
    },
    [activeLessonId, setSelectedKnowledgeId]
  )

  const globalKnowledgeHits = getGlobalKnowledgeHits()
  const inStatsView = sidebarNav === 'stats'
  const inCourseView = sidebarNav === 'courses'
  const inKnowledgeView = sidebarNav === 'knowledge'
  const inAdminView = sidebarNav === 'admin'

  const activeKnowledgePoints = useMemo(
    () =>
      knowledgePointsForCourse(
        allKnowledgePoints,
        activeCourse?.knowledgeLibraryId
      ),
    [allKnowledgePoints, activeCourse?.knowledgeLibraryId]
  )

  const handleSegment = useCallback(
    (segment: Parameters<typeof addTranscriptSegment>[0]) => {
      addTranscriptSegment(segment)
    },
    [addTranscriptSegment]
  )

  const [tingwuReady, setTingwuReady] = useState<boolean | null>(null)

  useEffect(() => {
    fetchTingwuStatus().then((s) => setTingwuReady(s.configured))
  }, [])

  const browserAsr = useSpeechRecognition({
    onSegment: handleSegment,
    knowledgePoints: activeKnowledgePoints,
  })

  const tingwuAsr = useTingwuTranscription({
    onSegment: handleSegment,
    knowledgePoints: activeKnowledgePoints,
  })

  const {
    isCapturing,
    error: tabError,
    startCapture,
    stopCapture,
    clearCaptureError,
  } = useTabAudioCapture()

  const useTingwu = transcriptionEngine === 'tingwu'
  const isListening = useTingwu ? tingwuAsr.isListening : browserAsr.isListening
  const interimText = useTingwu ? tingwuAsr.interimText : browserAsr.interimText
  const speechError = useTingwu ? tingwuAsr.error : browserAsr.error
  const displaySpeechError = useMemo(() => {
    if (isListening) {
      if (sessionError) return sessionError
      if (speechError) return formatTranscriptionError(speechError)
      return null
    }
    if (sessionError) return sessionError
    if (speechError) return formatTranscriptionError(speechError)
    if (audioSource === 'tab' && tabError) return tabError
    return null
  }, [
    isListening,
    sessionError,
    speechError,
    tabError,
    audioSource,
  ])
  const isSupported = useTingwu
    ? tingwuReady !== false
    : browserAsr.isSupported

  const startTranscriptionFromStream = useCallback(
    async (stream?: MediaStream | null): Promise<boolean> => {
      if (useTingwu) {
        if (stream === null) {
          setSessionError('无可用音频流，请确认音视频正在播放')
          return false
        }
        return tingwuAsr.start(stream)
      }
      if (activeCourse?.sourceType === 'upload') {
        setSessionError(
          '上传课程请切换为「通义听悟」；浏览器转写无法识别本地音视频。'
        )
        return false
      }
      browserAsr.start()
      return true
    },
    [useTingwu, tingwuAsr, browserAsr, activeCourse?.sourceType]
  )

  const runTranscriptionSession = useCallback(async (): Promise<boolean> => {
    if (activeCourse?.sourceType === 'upload') {
      const el = uploadMediaRef.current
      if (!el) {
        setSessionError(
          '播放器未就绪，请稍候再点「开始听课」或「继续转写」。'
        )
        return false
      }
      await el.play().catch(() => undefined)
      const capture = getMediaElementAudioStream(el)
      if (!mediaElementAudioStreamUsable(capture)) {
        setSessionError(
          '无法从当前播放器采集音频。请使用 Chrome，并确保音视频正在播放。'
        )
        return false
      }
      setSessionError(null)
      return startTranscriptionFromStream(capture)
    }

    if (useTingwu) {
      if (audioSource === 'tab') {
        const stream = await startCapture()
        if (!stream) {
          setSessionError(
            tabError ||
              '未捕获到标签页音频。请选正在播放课程的视频标签，并勾选「分享标签页音频」。'
          )
          return false
        }
        setSessionError(null)
        return await tingwuAsr.start(stream)
      }
      return await tingwuAsr.start()
    }

    if (audioSource === 'tab') {
      const stream = await startCapture()
      if (!stream) {
        setSessionError(
          tabError ||
            '未捕获标签页音频。请选择正在播放课程的视频标签，并勾选「分享标签页音频」；或改选「麦克风」收听环境声。'
        )
        return false
      }
      setSessionError(null)
      clearCaptureError()
      browserAsr.start()
      return true
    }

    browserAsr.start()
    return true
  }, [
    activeCourse?.sourceType,
    useTingwu,
    audioSource,
    startCapture,
    startTranscriptionFromStream,
    tingwuAsr,
    browserAsr,
    tabError,
    clearCaptureError,
  ])

  const handleStartListen = useCallback(async () => {
    if (listenSessionPhase === 'finished') return
    setSessionError(null)
    const ok = await runTranscriptionSession()
    if (!ok) {
      setListenSessionPhase('idle')
      return
    }
    markActiveLessonTranscriptionStarted()
    setListenSessionPhase('active')
  }, [listenSessionPhase, markActiveLessonTranscriptionStarted, runTranscriptionSession])

  const handlePauseTranscription = useCallback(async () => {
    if (useTingwu) await tingwuAsr.stop()
    else browserAsr.stop()
    stopCapture()
    uploadMediaRef.current?.pause()
    setListenSessionPhase('paused')
  }, [useTingwu, tingwuAsr, browserAsr, stopCapture])

  const handleResumeTranscription = useCallback(async () => {
    if (listenSessionPhase === 'finished') return
    setSessionError(null)
    const ok = await runTranscriptionSession()
    if (!ok) {
      setListenSessionPhase('paused')
      return
    }
    setListenSessionPhase('active')
  }, [listenSessionPhase, runTranscriptionSession])

  const handleEndCourseSession = useCallback(async () => {
    if (isListening || isCapturing) {
      if (useTingwu) await tingwuAsr.stop()
      else browserAsr.stop()
      stopCapture()
    }
    uploadMediaRef.current?.pause()
    markActiveLessonTranscriptionEnded({ completeRegardless: true })
    if (activeCourse?.sourceType === 'upload') {
      setUploadSummaryUnlocked(true)
    }
    setListenSessionPhase('finished')
  }, [
    isListening,
    isCapturing,
    useTingwu,
    tingwuAsr,
    browserAsr,
    stopCapture,
    activeCourse?.sourceType,
    markActiveLessonTranscriptionEnded,
  ])

  const handleUploadAutoStart = useCallback(
    async (stream: MediaStream | null) => {
      if (!mediaElementAudioStreamUsable(stream)) {
        setSessionError(
          '无法采集播放器音频。请先点击播放，再点「开始听课」或「继续转写」。'
        )
        setListenSessionPhase('idle')
        return
      }
      const ok = await startTranscriptionFromStream(stream)
      if (!ok) {
        setListenSessionPhase('idle')
        return
      }
      markActiveLessonTranscriptionStarted()
      setListenSessionPhase('active')
    },
    [markActiveLessonTranscriptionStarted, startTranscriptionFromStream]
  )

  const handleUploadMediaEnded = useCallback(async () => {
    if (isListening) {
      if (useTingwu) await tingwuAsr.stop()
      else browserAsr.stop()
    }
    stopCapture()
    setListenSessionPhase('paused')
  }, [
    isListening,
    useTingwu,
    tingwuAsr,
    browserAsr,
    stopCapture,
  ])

  const handleUploadMediaPlay = useCallback(() => {
    setListenSessionPhase((prev) => {
      if (prev !== 'finished') return prev
      return activeLesson && activeLesson.transcriptSegments.length > 0
        ? 'paused'
        : 'idle'
    })
  }, [activeLesson])

  useEffect(() => {
    if (!courseDetailOpen) {
      listenPhaseInitKeyRef.current = null
      return
    }
    if (!activeCourse || !activeLesson) return

    const initKey = `${activeCourseId}:${activeLessonId}`
    if (listenPhaseInitKeyRef.current === initKey) return
    listenPhaseInitKeyRef.current = initKey

    if (
      activeCourse.sourceType === 'upload' &&
      activeLesson.status === 'completed'
    ) {
      setUploadSummaryUnlocked(true)
      setListenSessionPhase('finished')
      return
    }
    if (activeCourse.sourceType === 'upload') {
      setUploadSummaryUnlocked(false)
    }
    if (
      activeLesson.status === 'in_progress' &&
      activeLesson.transcriptSegments.length > 0
    ) {
      setListenSessionPhase('paused')
      return
    }
    setListenSessionPhase('idle')
  }, [
    courseDetailOpen,
    activeCourseId,
    activeLessonId,
    activeCourse,
    activeLesson,
  ])

  useEffect(() => {
    if (isListening) {
      clearCaptureError()
      setSessionError(null)
    }
  }, [isListening, clearCaptureError])

  useEffect(() => {
    if (audioSource === 'microphone') {
      clearCaptureError()
    }
  }, [audioSource, clearCaptureError])

  useEffect(() => {
    if (!displaySpeechError) return
    if (
      listenSessionPhase === 'active' &&
      !isListening &&
      !isCapturing
    ) {
      setListenSessionPhase('idle')
    }
  }, [displaySpeechError, listenSessionPhase, isListening, isCapturing])

  useEffect(() => {
    if (listenSessionPhase !== 'active') return
    if (isListening) return
    if (activeCourse?.sourceType === 'upload') {
      setListenSessionPhase('paused')
      return
    }
    if (audioSource === 'tab' && !isCapturing) {
      setListenSessionPhase('paused')
    }
  }, [
    listenSessionPhase,
    isListening,
    isCapturing,
    activeCourse?.sourceType,
    audioSource,
  ])

  useEffect(() => {
    if (!uploadSession || activeCourseId !== uploadSession.courseId) return
    return () => {
      URL.revokeObjectURL(uploadSession.objectUrl)
    }
  }, [uploadSession, activeCourseId])

  const handleTextSelect = (text: string, x: number, y: number) => {
    setSelectionAction({
      type: 'explain',
      selectedText: text,
      position: { x, y },
    })
  }

  const timeline = selectedKnowledgeId
    ? getKnowledgeTimeline(selectedKnowledgeId)
    : []

  const fullScreenSummary =
    summaryOpen &&
    inCourseView &&
    courseDetailOpen &&
    activeCourse &&
    activeLesson

  const fullScreenCourseDetail =
    courseDetailOpen && inCourseView && !fullScreenSummary && !newCourseOpen

  const fullScreenOverlay =
    fullScreenSummary || newCourseOpen || fullScreenCourseDetail

  const editingCourse = editingCourseId
    ? courses.find((c) => c.id === editingCourseId) ?? null
    : null
  const deletingCourse = deletingCourseId
    ? courses.find((c) => c.id === deletingCourseId) ?? null
    : null

  const applyAppRoute = useCallback(
    (route: AppHistoryRoute) => {
      if (route.page === 'courses') {
        setCourseDetailOpen(false)
        setSummaryOpen(false)
        setSelectedKnowledgeId(null)
        setSidebarNav('courses')
        return
      }
      openCourse(route.courseId)
      setSidebarNav('courses')
      setSelectedKnowledgeId(null)
      setCourseDetailOpen(true)
      setSummaryOpen(route.page === 'summary')
    },
    [openCourse, setSidebarNav, setSelectedKnowledgeId]
  )

  const pushAppRoute = useCallback(
    (route: AppHistoryRoute) => {
      window.history.pushState(route, '', pathForAppRoute(route))
      applyAppRoute(route)
    },
    [applyAppRoute]
  )

  const handleAppBack = useCallback(() => {
    window.history.back()
  }, [])

  useEffect(() => {
    if (window.location.hash === '#admin') {
      setSidebarNav('admin')
    }
  }, [setSidebarNav])

  useEffect(() => {
    const initial = parseAppRouteFromLocation()
    if (!isAppHistoryRoute(window.history.state)) {
      window.history.replaceState(initial, '', pathForAppRoute(initial))
    }
    applyAppRoute(isAppHistoryRoute(window.history.state) ? window.history.state : initial)

    const onPopState = (event: PopStateEvent) => {
      const route = isAppHistoryRoute(event.state)
        ? event.state
        : parseAppRouteFromLocation()
      applyAppRoute(route)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [applyAppRoute])

  const handleOpenCourseFromList = useCallback(
    (courseId: string) => {
      pushAppRoute({ v: 1, page: 'course', courseId })
    },
    [pushAppRoute]
  )

  const handleOpenCourseSummaryFromList = useCallback(
    (courseId: string) => {
      const course = courses.find((c) => c.id === courseId)
      if (!course || !isCourseSummaryAvailable(course)) return
      clearLessonSummary()
      pushAppRoute({ v: 1, page: 'summary', courseId })
    },
    [courses, clearLessonSummary, pushAppRoute]
  )

  const handleBackToCourseList = useCallback(() => {
    handleAppBack()
  }, [handleAppBack])

  useEffect(() => {
    if (!pendingListen || !inCourseView || !activeLesson) return

    let cancelled = false

    void (async () => {
      try {
        let ok = false
        if (audioSource === 'tab') {
          const stream =
            pendingListen.stream ?? (await startCapture())
          if (!stream || cancelled) {
            if (!cancelled) {
              setSessionError(
                '请选择正在播放课程的视频标签并勾选「分享标签页音频」，然后点「开始听课」。若只转写你的讲解，可改选「麦克风」。'
              )
            }
            return
          }
          setSessionError(null)
          clearCaptureError()
          ok = await startTranscriptionFromStream(stream)
        } else {
          setSessionError(null)
          clearCaptureError()
          ok = await startTranscriptionFromStream()
        }
        if (!ok) {
          setListenSessionPhase('idle')
        } else {
          markActiveLessonTranscriptionStarted()
          setListenSessionPhase('active')
        }
      } finally {
        if (!cancelled) setPendingListen(null)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    pendingListen,
    inCourseView,
    activeLesson,
    startCapture,
    audioSource,
    markActiveLessonTranscriptionStarted,
    startTranscriptionFromStream,
    clearCaptureError,
  ])

  return (
    <div className="h-screen flex bg-notion-bg text-notion-text overflow-hidden">
      {!fullScreenOverlay && (
        <Sidebar
          nav={sidebarNav}
          onNavChange={(n) => {
            setSidebarNav(n)
            if (n === 'courses') {
              window.history.pushState(
                { v: 1, page: 'courses' } satisfies AppHistoryRoute,
                '',
                pathForAppRoute({ v: 1, page: 'courses' })
              )
              applyAppRoute({ v: 1, page: 'courses' })
            }
            if (n === 'knowledge' || n === 'stats' || n === 'admin') {
              setSelectedKnowledgeId(null)
              setSummaryOpen(false)
              setCourseDetailOpen(false)
            }
            if (n === 'admin') {
              window.history.replaceState(null, '', '#admin')
            } else if (window.location.hash === '#admin') {
              window.history.replaceState(
                null,
                '',
                window.location.pathname + window.location.search
              )
            }
          }}
        />
      )}

      <main
        className={
          fullScreenOverlay
            ? 'flex-1 w-full min-w-0 flex flex-col'
            : 'flex-1 flex flex-col min-w-0'
        }
      >
        {newCourseOpen ? (
          <NewCourseView
            webCreateLoading={webCreateLoading}
            uploadCreateLoading={uploadCreateLoading}
            onClose={() => setNewCourseOpen(false)}
            onCreateWebCourse={async (payload) => {
              setWebCreateLoading(true)
              setSessionError(null)
              try {
                const { name, startedAt } = parseCourseTitleParts(
                  payload.courseTitle
                )
                const { courseId } = createCourse({
                  title: name,
                  createdAt: startedAt?.getTime(),
                  description: `${payload.platform} · 网页课程`,
                  sourceUrl: payload.sourceUrl,
                  sourceType: 'web',
                  knowledgeLibraryId: payload.knowledgeLibraryId,
                })
                void fetchWebVideoDurationSec(payload.sourceUrl).then((sec) => {
                  if (sec != null) patchCourse(courseId, { mediaDurationSec: sec })
                })
                setSelectedKnowledgeId(null)
                setSummaryOpen(false)
                setNewCourseOpen(false)
                pushAppRoute({ v: 1, page: 'course', courseId })
                setPendingListen({ kind: 'tab' })
              } catch (e) {
                window.alert(
                  e instanceof Error ? e.message : '创建课程失败，请重试'
                )
              } finally {
                setWebCreateLoading(false)
              }
            }}
            onCreateUploadCourse={async (payload) => {
              setUploadCreateLoading(true)
              setSessionError(null)
              try {
                rememberTeacherName(payload.teacherName)
                const { name, startedAt } = parseCourseTitleParts(
                  payload.courseTitle
                )
                const mediaDurationSec =
                  (await probeLocalMediaDurationSec(payload.file)) ?? undefined
                const { courseId } = createCourse({
                  title: name,
                  createdAt: startedAt?.getTime(),
                  mediaDurationSec,
                  knowledgeLibraryId: payload.knowledgeLibraryId,
                  sourceType: 'upload',
                  uploadFileName: payload.file.name,
                  teacherName: payload.teacherName,
                })
                await saveUploadMedia(courseId, payload.file)
                const objectUrl = URL.createObjectURL(payload.file)
                setUploadSession({
                  courseId,
                  objectUrl,
                  mimeType: payload.file.type || 'audio/mpeg',
                  fileName: payload.file.name,
                })
                setUploadAutoStart(true)
                setSelectedKnowledgeId(null)
                setSummaryOpen(false)
                setNewCourseOpen(false)
                pushAppRoute({ v: 1, page: 'course', courseId })
              } catch (e) {
                window.alert(
                  e instanceof Error ? e.message : '创建课程失败，请重试'
                )
              } finally {
                setUploadCreateLoading(false)
              }
            }}
          />
        ) : inStatsView ? (
          <LearningStatsView
            knowledgePoints={allKnowledgePoints}
            hits={globalKnowledgeHits}
            timeline={timeline}
            selectedId={selectedKnowledgeId}
            onSelect={setSelectedKnowledgeId}
            onStartCourse={() => {
              setSelectedKnowledgeId(null)
              setNewCourseOpen(true)
            }}
          />
        ) : inCourseView ? (
          fullScreenSummary ? (
            <LessonSummaryPanel
              course={activeCourse}
              lesson={activeLesson}
              courses={courses}
              knowledgePoints={allKnowledgePoints}
              onClose={handleAppBack}
              onSaveSummary={saveLessonSummary}
              onNavigateToLesson={(courseId, lessonId) => {
                setActiveCourseId(courseId)
                setActiveLessonId(lessonId)
                pushAppRoute({ v: 1, page: 'course', courseId })
              }}
            />
          ) : fullScreenCourseDetail ? (
            <CourseLearnView
              activeCourse={activeCourse}
              activeLesson={activeLesson}
              courseKnowledgePoints={activeKnowledgePoints}
              interimText={interimText}
              isListening={isListening}
              useTingwu={useTingwu}
              tingwuReady={tingwuReady}
              isSupported={isSupported}
              speechError={displaySpeechError}
              tabError={tabError}
              browserAsrSupported={browserAsr.isSupported}
              transcriptionCaptureLabel={getTranscriptionCaptureLabel(
                activeCourse,
                audioSource
              )}
              transcriptionEngine={transcriptionEngine}
              onTranscriptionEngineChange={setTranscriptionEngine}
              audioSource={audioSource}
              onAudioSourceChange={setAudioSource}
              listenSessionPhase={listenSessionPhase}
              onStartListen={() => void handleStartListen()}
              onPauseTranscription={() => void handlePauseTranscription()}
              onResumeTranscription={() => void handleResumeTranscription()}
              onEndCourseSession={() => void handleEndCourseSession()}
              showCourseSummaryButton={
                activeLesson?.status === 'completed' &&
                activeLesson.transcriptSegments.length > 0 &&
                (activeCourse?.sourceType !== 'upload' || uploadSummaryUnlocked)
              }
              onBack={handleBackToCourseList}
              onOpenSummary={() => {
                if (!activeCourseId) return
                clearLessonSummary()
                pushAppRoute({ v: 1, page: 'summary', courseId: activeCourseId })
              }}
              onTranscriptSegment={addTranscriptSegment}
              onUpdateTranscriptSegment={updateTranscriptSegment}
              onDeleteTranscriptSegment={deleteTranscriptSegment}
              onKnowledgeClick={(id) => {
                setSelectionAction(null)
                recordKnowledgeView(id)
                pushLessonChatKnowledge(id)
              }}
              onTextSelect={handleTextSelect}
              chatKnowledgeIds={activeLessonChatKnowledgeIds}
              selectedKnowledgeId={selectedKnowledgeId}
              onSelectKnowledge={(id) => {
                recordKnowledgeView(id)
                pushLessonChatKnowledge(id)
              }}
              onDismissChatKnowledge={dismissLessonChatKnowledge}
              uploadMedia={
                uploadSession && activeCourse?.id === uploadSession.courseId
                  ? {
                      url: uploadSession.objectUrl,
                      mimeType: uploadSession.mimeType,
                      fileName: uploadSession.fileName,
                    }
                  : null
              }
              uploadAutoStartTranscription={
                uploadAutoStart &&
                Boolean(
                  uploadSession &&
                    activeCourse?.id === uploadSession.courseId
                )
              }
              onUploadAutoStart={handleUploadAutoStart}
              onUploadAutoStartDone={() => setUploadAutoStart(false)}
              onUploadMediaRef={(el) => {
                uploadMediaRef.current = el
              }}
              onUploadMediaEnded={() => void handleUploadMediaEnded()}
              onUploadMediaPlay={handleUploadMediaPlay}
            />
          ) : (
            <CourseListView
              courses={courses}
              activeCourseId={activeCourseId}
              isListening={isListening}
              onNewCourse={() => {
                setSelectedKnowledgeId(null)
                setNewCourseOpen(true)
              }}
              onOpenCourse={handleOpenCourseFromList}
              onOpenSummary={handleOpenCourseSummaryFromList}
              onEditCourse={setEditingCourseId}
              onDeleteCourse={setDeletingCourseId}
            />
          )
        ) : inKnowledgeView ? (
          <KnowledgeBaseView
            knowledgePoints={allKnowledgePoints}
            selectedId={selectedKnowledgeId}
            globalHits={globalKnowledgeHits}
            timeline={timeline}
            activeLibraryId={activeLibraryId}
            onLibraryChange={(id) => {
              setActiveLibraryId(id)
              setSelectedKnowledgeId(null)
            }}
            onSelectKnowledge={setSelectedKnowledgeId}
            onCloseDetail={() => setSelectedKnowledgeId(null)}
          />
        ) : inAdminView ? (
          <AdminP0View
            knowledgePoints={allKnowledgePoints}
            onKnowledgeUpdated={refreshKnowledgeLibrary}
          />
        ) : null}
      </main>

      <CourseEditDialog
        course={editingCourse}
        onClose={() => setEditingCourseId(null)}
        onSave={(courseId, data) => updateCourse(courseId, data)}
      />
      <CourseDeleteDialog
        course={deletingCourse}
        onClose={() => setDeletingCourseId(null)}
        onConfirm={(courseId) => {
          const wasActive = courseId === activeCourseId
          deleteCourse(courseId)
          if (wasActive) setSummaryOpen(false)
        }}
      />

      {selectionAction && (
        <SelectionPopup
          action={selectionAction}
          transcriptContext={
            activeLesson?.transcriptSegments.map((s) => s.text).join('\n') ||
            undefined
          }
          knowledgePoints={activeKnowledgePoints}
          onClose={() => setSelectionAction(null)}
          onAddNote={(content, selectedText, options) =>
            addNote(content, selectedText, undefined, options?.fromExplain)
          }
          onAddKnowledge={addCustomKnowledgePoint}
          onExplainRequest={recordExplainRequest}
        />
      )}

    </div>
  )
}
