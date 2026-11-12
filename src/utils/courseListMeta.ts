import type { Course, Lesson } from '../types'

export function getCoursePrimaryLesson(course: Course): Lesson | undefined {
  return course.lessons[0]
}

export type TranscriptStatusLabel = '进行中' | '已结束' | '未转写'

export function getTranscriptStatus(
  course: Course,
  opts: { isListening: boolean; isActiveCourse: boolean }
): TranscriptStatusLabel {
  const lesson = getCoursePrimaryLesson(course)
  if (!lesson || lesson.transcriptSegments.length === 0) {
    return '未转写'
  }
  if (opts.isListening && opts.isActiveCourse) return '进行中'
  if (lesson.status === 'completed') return '已结束'
  if (lesson.status === 'in_progress') return '进行中'
  return '已结束'
}

export type SummaryStatusLabel = '待生成' | '已生成' | '—'

/** 用户点击「结束课程」后 lesson 为 completed，才支持总结 */
export function isCourseSummaryAvailable(course: Course): boolean {
  const lesson = getCoursePrimaryLesson(course)
  return Boolean(
    lesson &&
      lesson.status === 'completed' &&
      (lesson.transcriptSegments.length > 0 || lesson.summary)
  )
}

export function getSummaryStatus(course: Course): SummaryStatusLabel {
  if (!isCourseSummaryAvailable(course)) return '—'
  const lesson = getCoursePrimaryLesson(course)!
  return lesson.summary ? '已生成' : '待生成'
}

const TITLE_STAMP_RE =
  /^(.+?)[·•]\s*(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})\s*$/

/** 从「课程名·10月16日 15:23」解析名称与开课时间 */
export function parseCourseTitleParts(title: string): {
  name: string
  startedAt: Date | null
} {
  const m = title.trim().match(TITLE_STAMP_RE)
  if (!m) {
    return { name: displayCourseName(title), startedAt: null }
  }
  const name = m[1].trim()
  const year = new Date().getFullYear()
  const startedAt = new Date(
    year,
    parseInt(m[2], 10) - 1,
    parseInt(m[3], 10),
    parseInt(m[4], 10),
    parseInt(m[5], 10)
  )
  return { name: name || title, startedAt }
}

/** 列表展示用课程名（去掉 ·月日 时分 等后缀） */
export function displayCourseName(title: string): string {
  const parsed = title.trim().match(TITLE_STAMP_RE)
  if (parsed) return parsed[1].trim() || title
  const stripped = title
    .replace(/·\d{1,2}月\d{1,2}日\s*\d{1,2}:\d{2}\s*$/, '')
    .replace(/\s*·\s*\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}\s*$/, '')
    .trim()
  return stripped || title
}

export function formatCourseListStartedAt(course: Course): string {
  if (course.createdAt) {
    const d = new Date(course.createdAt)
    return `${d.getMonth() + 1}月${d.getDate()}日 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  }
  const fromTitle = parseCourseTitleParts(course.title).startedAt
  if (fromTitle) {
    const d = fromTitle
    return `${d.getMonth() + 1}月${d.getDate()}日 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  }
  return formatTranscriptStartShort(getCoursePrimaryLesson(course))
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatTranscriptStartLabel(lesson: Lesson | undefined): string {
  if (!lesson?.transcriptSegments.length) return '—'
  const d = new Date(lesson.transcriptSegments[0].timestamp)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** 列表卡片：10/14 20:01 */
export function formatTranscriptStartShort(lesson: Lesson | undefined): string {
  if (!lesson?.transcriptSegments.length) return '—'
  const d = new Date(lesson.transcriptSegments[0].timestamp)
  return `${d.getMonth() + 1}/${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function formatTranscriptDuration(lesson: Lesson | undefined): string {
  if (!lesson?.transcriptSegments.length) return '—'
  const segs = lesson.transcriptSegments
  const span = Math.max(0, segs[segs.length - 1].timestamp - segs[0].timestamp)
  const mins = Math.max(1, Math.round(span / 60_000))
  if (mins < 60) return `${mins} 分钟`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`
}

export function formatDurationSecCompact(totalSec: number): string {
  const sec = Math.max(0, Math.round(totalSec))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}`
  return `${m}:${pad2(s)}`
}

/** 列表卡片：优先媒体时长，其次转写跨度 */
export function formatCourseMediaDuration(
  course: Course,
  lesson: Lesson | undefined
): string {
  if (course.mediaDurationSec && course.mediaDurationSec > 0) {
    return formatDurationSecCompact(course.mediaDurationSec)
  }
  if (!lesson?.transcriptSegments.length) return '—'
  const segs = lesson.transcriptSegments
  const span = Math.max(0, segs[segs.length - 1].timestamp - segs[0].timestamp)
  const totalSec = Math.max(1, Math.round(span / 1000))
  return formatDurationSecCompact(totalSec)
}

/** @deprecated 使用 formatCourseMediaDuration */
export function formatTranscriptDurationCompact(
  lesson: Lesson | undefined
): string {
  if (!lesson?.transcriptSegments.length) return '—'
  const segs = lesson.transcriptSegments
  const span = Math.max(0, segs[segs.length - 1].timestamp - segs[0].timestamp)
  return formatDurationSecCompact(Math.max(1, Math.round(span / 1000)))
}

export type CourseKindLabel = '网课' | '线下课程'

export function getCourseKindLabel(course: Course): CourseKindLabel {
  if (course.sourceType === 'upload') return '线下课程'
  if (course.sourceType === 'web' || course.sourceUrl) return '网课'
  return '线下课程'
}

export function displayCourseTeacher(course: Course): string | null {
  const fromField = course.teacherName?.trim()
  if (fromField) return fromField
  if (course.sourceType === 'upload' && course.description) {
    const m = course.description.match(/^(.+?) · 本地音视频/)
    if (m?.[1]?.trim()) return m[1].trim()
  }
  return null
}

export function courseMatchesSearch(course: Course, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const teacher = displayCourseTeacher(course) ?? ''
  const hay = [
    course.title,
    course.description,
    course.sourceUrl ?? '',
    teacher,
    ...course.lessons.map((l) => l.title),
  ]
    .join(' ')
    .toLowerCase()
  return hay.includes(q)
}

/** 列表倒序：优先 createdAt，其次标题中的开课时间，再退化为最近转写时间 */
export function courseSortTimestamp(course: Course): number {
  if (course.createdAt) return course.createdAt
  const fromTitle = parseCourseTitleParts(course.title).startedAt
  if (fromTitle) return fromTitle.getTime()
  let latest = 0
  for (const lesson of course.lessons) {
    for (const seg of lesson.transcriptSegments) {
      if (seg.timestamp > latest) latest = seg.timestamp
    }
  }
  return latest
}
