import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  Course,
  KnowledgePoint,
  KnowledgePointHitTimeline,
  Lesson,
  LessonSummary,
  Note,
  TranscriptSegment,
  SelectionAction,
} from '../types'
import {
  INITIAL_COURSES,
  computeKnowledgeHitsFromSegments,
  getAllKnowledgePoints,
  matchKnowledgePoints,
  rematchLessonKnowledge,
} from '../data/knowledgePoints'
import { knowledgePointsForCourse } from '../data/knowledgeLibraries'
import { getLessonEngagement } from '../services/lessonSummaryContext'
import { loadFromStorage, saveToStorage } from '../utils/storage'
import { deleteUploadMedia } from '../utils/uploadMediaStore'
import { parseCourseTitleParts } from '../utils/courseListMeta'
import { applyTermCorrections } from '../services/termCorrection'
import { parseKebanReviewMarkdown } from '../services/kebanReviewImport'

/** 有真实转写时不再保留占位总结（示例/旧假数据） */
function clearPlaceholderSummariesWhenTranscriptExists(
  stored: Course[]
): Course[] {
  return stored.map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson) => {
      if (lesson.transcriptSegments.length > 0 && lesson.summary) {
        return { ...lesson, summary: undefined }
      }
      return lesson
    }),
  }))
}

function migrateCoursesToGrade9(stored: Course[]): Course[] {
  const outdated =
    stored.length === 0 ||
    stored.some((c) => c.id === 'grade9-2026' || c.id === 'ai-app-dev')
  if (outdated) {
    return JSON.parse(JSON.stringify(INITIAL_COURSES)) as Course[]
  }
  return stored
}

/** 已有转写时按全文重算命中；无转写则剔除已不在当前知识库中的词条 id */
function syncKnowledgeHitsFromTranscript(stored: Course[]): Course[] {
  const allKp = getAllKnowledgePoints([])
  return stored.map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson) => {
      const points = knowledgePointsForCourse(allKp, course.knowledgeLibraryId)
      const valid = new Set(points.map((p) => p.id))
      if (lesson.transcriptSegments.length === 0) {
        const hits = Object.fromEntries(
          Object.entries(lesson.knowledgePointHits).filter(([id]) => valid.has(id))
        )
        return Object.keys(hits).length === Object.keys(lesson.knowledgePointHits).length
          ? lesson
          : { ...lesson, knowledgePointHits: hits }
      }
      const transcriptSegments = lesson.transcriptSegments.map((seg) => ({
        ...seg,
        matchedKnowledgeIds: matchKnowledgePoints(seg.text, points),
      }))
      return {
        ...lesson,
        transcriptSegments,
        knowledgePointHits: computeKnowledgeHitsFromSegments(
          transcriptSegments,
          points
        ),
      }
    }),
  }))
}

function mergeInitialHitsIfEmpty(stored: Course[]): Course[] {
  let total = 0
  for (const course of stored) {
    for (const lesson of course.lessons) {
      for (const n of Object.values(lesson.knowledgePointHits)) total += n
    }
  }
  if (total > 0) return stored

  const hitsByLessonId = new Map<string, Record<string, number>>()
  for (const course of INITIAL_COURSES) {
    for (const lesson of course.lessons) {
      hitsByLessonId.set(lesson.id, lesson.knowledgePointHits)
    }
  }

  return stored.map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson) => {
      const seed = hitsByLessonId.get(lesson.id)
      if (!seed || Object.keys(seed).length === 0) return lesson
      return { ...lesson, knowledgePointHits: { ...seed } }
    }),
  }))
}

export function useAppState() {
  const [courses, setCourses] = useState<Course[]>(() =>
    clearPlaceholderSummariesWhenTranscriptExists(
      syncKnowledgeHitsFromTranscript(
        mergeInitialHitsIfEmpty(
          migrateCoursesToGrade9(loadFromStorage('courses', INITIAL_COURSES))
        )
      )
    )
  )
  const [activeCourseId, setActiveCourseId] = useState(() => {
    const id = loadFromStorage<string>('activeCourseId', 'ai-product-2026')
    if (id === 'grade9-2026' || id === 'ai-app-dev') return 'ai-product-2026'
    return id
  })
  const [activeLessonId, setActiveLessonId] = useState(() =>
    loadFromStorage('activeLessonId', 'lesson-1')
  )
  const [customKnowledgePoints, setCustomKnowledgePoints] = useState<
    KnowledgePoint[]
  >(() => loadFromStorage('customKnowledgePoints', []))
  const [audioSource, setAudioSource] = useState<'microphone' | 'tab'>(() =>
    loadFromStorage('audioSource', 'microphone' as 'microphone' | 'tab')
  )
  const [transcriptionEngine, setTranscriptionEngine] = useState<
    'browser' | 'tingwu'
  >(() =>
    loadFromStorage('transcriptionEngine', 'tingwu' as 'browser' | 'tingwu')
  )
  const [sidebarNav, setSidebarNav] = useState<
    import('../types/sidebar').SidebarNav
  >(() => {
    const stored = loadFromStorage(
      'sidebarNav',
      'stats' as import('../types/sidebar').SidebarNav
    )
    return stored
  })
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string | null>(
    null
  )
  const [selectionAction, setSelectionAction] =
    useState<SelectionAction | null>(null)
  const [knowledgeLibraryEpoch, setKnowledgeLibraryEpoch] = useState(0)

  const allKnowledgePoints = useMemo(
    () => getAllKnowledgePoints(customKnowledgePoints),
    [customKnowledgePoints, knowledgeLibraryEpoch]
  )

  const refreshKnowledgeLibrary = useCallback(() => {
    setKnowledgeLibraryEpoch((n) => n + 1)
  }, [])

  useEffect(() => {
    saveToStorage('courses', courses)
  }, [courses])

  useEffect(() => {
    saveToStorage('activeCourseId', activeCourseId)
  }, [activeCourseId])

  useEffect(() => {
    saveToStorage('activeLessonId', activeLessonId)
  }, [activeLessonId])

  useEffect(() => {
    saveToStorage('customKnowledgePoints', customKnowledgePoints)
  }, [customKnowledgePoints])

  useEffect(() => {
    saveToStorage('audioSource', audioSource)
  }, [audioSource])

  useEffect(() => {
    saveToStorage('transcriptionEngine', transcriptionEngine)
  }, [transcriptionEngine])

  useEffect(() => {
    saveToStorage('sidebarNav', sidebarNav)
  }, [sidebarNav])

  const getGlobalKnowledgeHits = useCallback(() => {
    const valid = new Set(allKnowledgePoints.map((p) => p.id))
    const hits: Record<string, number> = {}
    for (const course of courses) {
      for (const lesson of course.lessons) {
        for (const [kpId, count] of Object.entries(lesson.knowledgePointHits)) {
          if (!valid.has(kpId) || count <= 0) continue
          hits[kpId] = (hits[kpId] || 0) + count
        }
      }
    }
    return hits
  }, [courses, allKnowledgePoints])

  const activeCourse = courses.find((c) => c.id === activeCourseId)
  const activeLesson = activeCourse?.lessons.find(
    (l) => l.id === activeLessonId
  )

  const recomputeTranscriptHits = useCallback(
    (segments: TranscriptSegment[], libraryId?: string) => {
      const points = knowledgePointsForCourse(
        allKnowledgePoints,
        libraryId
      )
      return computeKnowledgeHitsFromSegments(segments, points)
    },
    [allKnowledgePoints]
  )

  const addTranscriptSegment = useCallback(
    (segment: TranscriptSegment) => {
      setCourses((prev) =>
        prev.map((course) =>
          course.id !== activeCourseId
            ? course
            : {
                ...course,
                lessons: course.lessons.map((lesson) => {
                  if (lesson.id !== activeLessonId) return lesson
                  const corrected = applyTermCorrections(
                    segment.text,
                    course.knowledgeLibraryId
                  )
                  const text =
                    corrected !== segment.text ? corrected : segment.text
                  const points = knowledgePointsForCourse(
                    allKnowledgePoints,
                    course.knowledgeLibraryId
                  )
                  const nextSegment: TranscriptSegment = {
                    ...segment,
                    text,
                    matchedKnowledgeIds: matchKnowledgePoints(text, points),
                  }
                  const transcriptSegments = [
                    ...lesson.transcriptSegments,
                    nextSegment,
                  ]
                  return {
                    ...lesson,
                    status: 'in_progress' as const,
                    transcriptSegments,
                    knowledgePointHits: recomputeTranscriptHits(
                      transcriptSegments,
                      course.knowledgeLibraryId
                    ),
                    summary: undefined,
                  }
                }),
              }
        )
      )
    },
    [activeCourseId, activeLessonId, recomputeTranscriptHits]
  )

  const updateTranscriptSegment = useCallback(
    (segmentId: string, text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      setCourses((prev) =>
        prev.map((course) =>
          course.id !== activeCourseId
            ? course
            : {
                ...course,
                lessons: course.lessons.map((lesson) => {
                  if (lesson.id !== activeLessonId) return lesson
                  const points = knowledgePointsForCourse(
                    allKnowledgePoints,
                    course.knowledgeLibraryId
                  )
                  const transcriptSegments = lesson.transcriptSegments.map(
                    (seg) => {
                      if (seg.id !== segmentId) return seg
                      const matchedKnowledgeIds = matchKnowledgePoints(
                        trimmed,
                        points
                      )
                      return {
                        ...seg,
                        text: trimmed,
                        matchedKnowledgeIds,
                      }
                    }
                  )
                  return {
                    ...lesson,
                    transcriptSegments,
                    knowledgePointHits: recomputeTranscriptHits(
                      transcriptSegments,
                      course.knowledgeLibraryId
                    ),
                    summary: undefined,
                  }
                }),
              }
        )
      )
    },
    [activeCourseId, activeLessonId, allKnowledgePoints, recomputeTranscriptHits]
  )

  const deleteTranscriptSegment = useCallback(
    (segmentId: string) => {
      setCourses((prev) =>
        prev.map((course) =>
          course.id !== activeCourseId
            ? course
            : {
                ...course,
                lessons: course.lessons.map((lesson) => {
                  if (lesson.id !== activeLessonId) return lesson
                  const transcriptSegments = lesson.transcriptSegments.filter(
                    (seg) => seg.id !== segmentId
                  )
                  const knowledgePointHits =
                    transcriptSegments.length > 0
                      ? recomputeTranscriptHits(
                          transcriptSegments,
                          course.knowledgeLibraryId
                        )
                      : {}
                  return {
                    ...lesson,
                    transcriptSegments,
                    knowledgePointHits,
                    summary: undefined,
                  }
                }),
              }
        )
      )
    },
    [activeCourseId, activeLessonId, recomputeTranscriptHits]
  )

  const recordKnowledgeView = useCallback(
    (knowledgeId: string) => {
      setCourses((prev) =>
        prev.map((course) =>
          course.id !== activeCourseId
            ? course
            : {
                ...course,
                lessons: course.lessons.map((lesson) => {
                  if (lesson.id !== activeLessonId) return lesson
                  const engagement = getLessonEngagement(lesson)
                  if (engagement.viewedKnowledgeIds.includes(knowledgeId)) {
                    return lesson
                  }
                  return {
                    ...lesson,
                    engagement: {
                      ...engagement,
                      viewedKnowledgeIds: [
                        ...engagement.viewedKnowledgeIds,
                        knowledgeId,
                      ],
                    },
                  }
                }),
              }
        )
      )
    },
    [activeCourseId, activeLessonId]
  )

  const recordExplainRequest = useCallback(
    (selectedText: string) => {
      setCourses((prev) =>
        prev.map((course) =>
          course.id !== activeCourseId
            ? course
            : {
                ...course,
                lessons: course.lessons.map((lesson) => {
                  if (lesson.id !== activeLessonId) return lesson
                  const engagement = getLessonEngagement(lesson)
                  return {
                    ...lesson,
                    engagement: {
                      ...engagement,
                      explainRequests: [
                        ...engagement.explainRequests,
                        { selectedText, createdAt: Date.now() },
                      ],
                    },
                  }
                }),
              }
        )
      )
    },
    [activeCourseId, activeLessonId]
  )

  const addNote = useCallback(
    (
      content: string,
      selectedText?: string,
      knowledgePointId?: string,
      fromExplain?: boolean
    ) => {
      const note: Note = {
        id: `note-${Date.now()}`,
        lessonId: activeLessonId,
        content,
        selectedText,
        knowledgePointId,
        fromExplain,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      setCourses((prev) =>
        prev.map((course) =>
          course.id !== activeCourseId
            ? course
            : {
                ...course,
                lessons: course.lessons.map((lesson) =>
                  lesson.id !== activeLessonId
                    ? lesson
                    : { ...lesson, notes: [...lesson.notes, note] }
                ),
              }
        )
      )
    },
    [activeCourseId, activeLessonId]
  )

  const addCustomKnowledgePoint = useCallback(
    (term: string, description: string) => {
      const kp: KnowledgePoint = {
        id: `custom-${Date.now()}`,
        term,
        aliases: [],
        category: 'custom',
        description,
        detail: description,
        relatedTerms: [],
        tags: ['自定义'],
      }
      setCustomKnowledgePoints((prev) => [...prev, kp])
      setCourses((prev) =>
        prev.map((course) =>
          course.id !== activeCourseId
            ? course
            : {
                ...course,
                lessons: course.lessons.map((lesson) => {
                  if (lesson.id !== activeLessonId) return lesson
                  const engagement = getLessonEngagement(lesson)
                  return {
                    ...lesson,
                    engagement: {
                      ...engagement,
                      addedKnowledgeIds: [
                        ...engagement.addedKnowledgeIds,
                        kp.id,
                      ],
                    },
                  }
                }),
              }
        )
      )
      return kp
    },
    [activeCourseId, activeLessonId]
  )

  const updateCourse = useCallback(
    (
      courseId: string,
      patch: {
        title?: string
        sourceUrl?: string
        knowledgeLibraryId?: string
      }
    ) => {
      setCourses((prev) =>
        prev.map((course) => {
          if (course.id !== courseId) return course
          const title = patch.title?.trim() ?? course.title
          const nextLibraryId =
            patch.knowledgeLibraryId !== undefined
              ? patch.knowledgeLibraryId
              : course.knowledgeLibraryId
          const libraryChanged =
            patch.knowledgeLibraryId !== undefined &&
            patch.knowledgeLibraryId !== course.knowledgeLibraryId
          const coursePoints = knowledgePointsForCourse(
            allKnowledgePoints,
            nextLibraryId
          )
          let lessons = course.lessons.map((lesson, index) => {
            let next = lesson
            if (libraryChanged) {
              next = {
                ...rematchLessonKnowledge(next, coursePoints),
                summary: undefined,
              }
            }
            if (index === 0 && patch.title) {
              next = { ...next, title: `第1课：${title}` }
            }
            return next
          })
          return {
            ...course,
            title,
            sourceUrl:
              patch.sourceUrl !== undefined
                ? patch.sourceUrl.trim() || undefined
                : course.sourceUrl,
            knowledgeLibraryId: nextLibraryId,
            lessons,
          }
        })
      )
    },
    [allKnowledgePoints]
  )

  const deleteCourse = useCallback(
    (courseId: string) => {
      void deleteUploadMedia(courseId)
      setCourses((prev) => {
        const next = prev.filter((c) => c.id !== courseId)
        if (next.length === 0) return prev
        if (activeCourseId === courseId) {
          const fallback = next[0]
          queueMicrotask(() => {
            setActiveCourseId(fallback.id)
            setActiveLessonId(fallback.lessons[0]?.id ?? activeLessonId)
          })
        }
        return next
      })
    },
    [activeCourseId, activeLessonId]
  )

  const markActiveLessonTranscriptionStarted = useCallback(() => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id !== activeCourseId
          ? course
          : {
              ...course,
              lessons: course.lessons.map((lesson) =>
                lesson.id !== activeLessonId
                  ? lesson
                  : { ...lesson, status: 'in_progress' as const }
              ),
            }
      )
    )
  }, [activeCourseId, activeLessonId])

  const markActiveLessonTranscriptionEnded = useCallback(
    (opts?: { completeRegardless?: boolean }) => {
      setCourses((prev) =>
        prev.map((course) =>
          course.id !== activeCourseId
            ? course
            : {
                ...course,
                lessons: course.lessons.map((lesson) =>
                  lesson.id !== activeLessonId
                    ? lesson
                    : opts?.completeRegardless ||
                        lesson.transcriptSegments.length > 0
                      ? { ...lesson, status: 'completed' as const }
                      : lesson
                ),
              }
        )
      )
    },
    [activeCourseId, activeLessonId]
  )

  const openCourse = useCallback(
    (courseId: string) => {
      setActiveCourseId(courseId)
      const course = courses.find((c) => c.id === courseId)
      const lessonId = course?.lessons[0]?.id
      if (lessonId) setActiveLessonId(lessonId)
    },
    [courses]
  )

  const patchCourse = useCallback(
    (courseId: string, patch: Partial<Course>) => {
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, ...patch } : c))
      )
    },
    []
  )

  const importKebanReviewCourse = useCallback(
    (markdown: string, fileName?: string) => {
      const { course, unmatchedHitLabels, transcriptSegmentCount } =
        parseKebanReviewMarkdown(markdown, allKnowledgePoints, fileName)
      setCourses((prev) => [...prev, course])
      setActiveCourseId(course.id)
      setActiveLessonId(course.lessons[0]?.id ?? '')
      return {
        courseId: course.id,
        unmatchedHitLabels,
        transcriptSegmentCount,
        hitCount: Object.keys(course.lessons[0]?.knowledgePointHits ?? {})
          .length,
      }
    },
    [allKnowledgePoints]
  )

  const createCourse = useCallback(
    (input: {
      title: string
      description?: string
      knowledgeLibraryId?: string
      sourceUrl?: string
      sourceType?: 'web' | 'upload'
      uploadFileName?: string
      teacherName?: string
      createdAt?: number
      mediaDurationSec?: number
    }) => {
      const courseId = `course-${Date.now().toString(36)}`
      const lessonId = `lesson-${Date.now().toString(36)}`
      const { name: displayTitle, startedAt } = parseCourseTitleParts(
        input.title
      )
      const lesson: Lesson = {
        id: lessonId,
        title: `第1课：${displayTitle}`,
        courseId,
        status: 'in_progress',
        knowledgePointHits: {},
        transcriptSegments: [],
        notes: [],
      }
      const course: Course = {
        id: courseId,
        title: displayTitle,
        createdAt:
          input.createdAt ?? startedAt?.getTime() ?? Date.now(),
        mediaDurationSec: input.mediaDurationSec,
        description:
          input.description ??
          (input.sourceType === 'web'
            ? '网页课程 · 实时标签页转写'
            : `${input.teacherName?.trim() || '授课教师'} · 本地音视频`),
        lessons: [lesson],
        knowledgeLibraryId: input.knowledgeLibraryId,
        sourceUrl: input.sourceUrl,
        sourceType: input.sourceType,
        uploadFileName: input.uploadFileName,
        teacherName: input.teacherName?.trim() || undefined,
      }
      setCourses((prev) => [...prev, course])
      setActiveCourseId(courseId)
      setActiveLessonId(lessonId)
      return { courseId, lessonId }
    },
    []
  )

  const clearLessonSummary = useCallback(() => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id !== activeCourseId
          ? course
          : {
              ...course,
              lessons: course.lessons.map((lesson) =>
                lesson.id !== activeLessonId
                  ? lesson
                  : { ...lesson, summary: undefined }
              ),
            }
      )
    )
  }, [activeCourseId, activeLessonId])

  const saveLessonSummary = useCallback(
    (
      summary: LessonSummary,
      patch?: { knowledgePointHits?: Record<string, number> }
    ) => {
      setCourses((prev) =>
        prev.map((course) =>
          course.id !== activeCourseId
            ? course
            : {
                ...course,
                lessons: course.lessons.map((lesson) =>
                  lesson.id !== activeLessonId
                    ? lesson
                    : {
                        ...lesson,
                        summary,
                        ...(patch?.knowledgePointHits
                          ? {
                              knowledgePointHits: {
                                ...lesson.knowledgePointHits,
                                ...patch.knowledgePointHits,
                              },
                            }
                          : {}),
                      }
                ),
              }
        )
      )
    },
    [activeCourseId, activeLessonId]
  )

  const getKnowledgeTimeline = useCallback(
    (knowledgeId: string): KnowledgePointHitTimeline[] => {
      const timeline: KnowledgePointHitTimeline[] = []

      for (const course of courses) {
        const lessonRows: KnowledgePointHitTimeline['lessons'] = []
        let courseHits = 0
        const courseNotes: Note[] = []

        for (const lesson of course.lessons) {
          const lessonHits = lesson.knowledgePointHits[knowledgeId] || 0
          const relatedNotes = lesson.notes.filter(
            (n) => n.knowledgePointId === knowledgeId
          )
          if (lessonHits > 0) {
            lessonRows.push({
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              hits: lessonHits,
            })
            courseHits += lessonHits
          }
          if (relatedNotes.length > 0) {
            courseNotes.push(...relatedNotes)
          }
        }

        if (courseHits > 0 || courseNotes.length > 0) {
          timeline.push({
            courseId: course.id,
            courseTitle: course.title,
            hits: courseHits,
            notes: courseNotes,
            lessons: lessonRows.sort((a, b) => b.hits - a.hits),
          })
        }
      }

      return timeline.sort((a, b) => b.hits - a.hits)
    },
    [courses]
  )

  return {
    courses,
    activeCourse,
    activeLesson,
    activeCourseId,
    activeLessonId,
    setActiveCourseId,
    setActiveLessonId,
    allKnowledgePoints,
    refreshKnowledgeLibrary,
    customKnowledgePoints,
    audioSource,
    setAudioSource,
    transcriptionEngine,
    setTranscriptionEngine,
    sidebarNav,
    setSidebarNav,
    getGlobalKnowledgeHits,
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
    recordKnowledgeView,
    recordExplainRequest,
    saveLessonSummary,
    clearLessonSummary,
    createCourse,
    importKebanReviewCourse,
    patchCourse,
    updateCourse,
    deleteCourse,
    openCourse,
    markActiveLessonTranscriptionEnded,
    markActiveLessonTranscriptionStarted,
  }
}
