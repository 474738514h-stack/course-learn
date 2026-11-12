import { useMemo, useState } from 'react'
import {
  Search,
  Pencil,
  Trash2,
  FileText,
  ArrowRight,
  CalendarDays,
  Plus,
} from 'lucide-react'
import clsx from 'clsx'
import type { Course } from '../types'
import { getLibraryById } from '../data/knowledgeLibraries'
import {
  courseMatchesSearch,
  courseSortTimestamp,
  displayCourseName,
  formatCourseListStartedAt,
  formatCourseMediaDuration,
  displayCourseTeacher,
  getCourseKindLabel,
  getCoursePrimaryLesson,
  getSummaryStatus,
  isCourseSummaryAvailable,
  getTranscriptStatus,
} from '../utils/courseListMeta'

interface CourseListViewProps {
  courses: Course[]
  activeCourseId: string
  isListening: boolean
  onNewCourse: () => void
  onOpenCourse: (courseId: string) => void
  onOpenSummary: (courseId: string) => void
  onEditCourse: (courseId: string) => void
  onDeleteCourse: (courseId: string) => void
}

export function CourseListView({
  courses,
  activeCourseId,
  isListening,
  onNewCourse,
  onOpenCourse,
  onOpenSummary,
  onEditCourse,
  onDeleteCourse,
}: CourseListViewProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const list = courses.filter((c) => courseMatchesSearch(c, search))
    return [...list].sort(
      (a, b) => courseSortTimestamp(b) - courseSortTimestamp(a)
    )
  }, [courses, search])

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f7f6f3] overflow-hidden">
      <div className="shrink-0 px-8 pt-8 pb-4">
        <div className="rounded-2xl border border-notion-border bg-white px-8 py-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-semibold text-notion-text tracking-tight">
                全部课程
              </h1>
              <p className="text-sm text-notion-muted mt-2">
                搜索并管理课程，打开后进入听课转写
              </p>
              <div className="relative mt-5 max-w-xl">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-notion-muted"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索课程名称、教师、链接…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-notion-border bg-[#fafafa] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                type="button"
                onClick={onNewCourse}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-notion-text text-white text-sm font-medium hover:bg-notion-text/90 transition-colors"
              >
                <Plus size={16} />
                新建课程
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-8 pb-8">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-notion-border bg-white shadow-card py-16 text-center">
            <p className="text-sm text-notion-muted leading-relaxed px-4">
              {search.trim() ? '没有匹配的课程' : '暂无课程，点击右上角「新建课程」'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((course) => (
              <CourseListItem
                key={course.id}
                course={course}
                active={course.id === activeCourseId}
                isListening={isListening && course.id === activeCourseId}
                onOpen={() => onOpenCourse(course.id)}
                onSummary={() => onOpenSummary(course.id)}
                onEdit={() => onEditCourse(course.id)}
                onDelete={() => onDeleteCourse(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CourseListItem({
  course,
  active,
  isListening,
  onOpen,
  onSummary,
  onEdit,
  onDelete,
}: {
  course: Course
  active: boolean
  isListening: boolean
  onOpen: () => void
  onSummary: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const lesson = getCoursePrimaryLesson(course)
  const transcriptStatus = getTranscriptStatus(course, {
    isListening,
    isActiveCourse: active,
  })
  const summaryStatus = getSummaryStatus(course)
  const canSummary = isCourseSummaryAvailable(course)
  const kind = getCourseKindLabel(course)
  const libraryMeta = getLibraryById(course.knowledgeLibraryId ?? 'ai-pm')
  const libraryFull = libraryMeta?.fullTitle ?? '2026 课标 · 语文知识库'
  const titleText = displayCourseName(course.title)
  const teacherLabel = displayCourseTeacher(course)

  return (
    <div
      className={clsx(
        'rounded-2xl border bg-white shadow-card px-5 py-4 transition-colors flex flex-col md:flex-row md:items-center gap-4 md:gap-6',
        active
          ? 'border-violet-300 ring-1 ring-violet-200/80'
          : 'border-notion-border hover:border-notion-border/90'
      )}
    >
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center min-w-0 gap-1.5 overflow-hidden">
          <h2
            title={course.title}
            className="min-w-0 shrink text-[15px] font-semibold text-notion-text truncate whitespace-nowrap"
          >
            {titleText}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <StatusBadge
            label={transcriptStatus}
            variant={
              transcriptStatus === '进行中'
                ? 'live'
                : transcriptStatus === '已结束'
                  ? 'done'
                  : 'muted'
            }
          />
          <KindBadge kind={kind} />
          {summaryStatus !== '—' && (
            <StatusBadge
              label={summaryStatus === '已生成' ? '总结已生成' : '总结待生成'}
              variant={summaryStatus === '已生成' ? 'summary' : 'pending'}
            />
          )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-notion-muted pt-0.5">
          <span className="inline-flex items-center gap-1 shrink-0">
            <CalendarDays size={13} className="text-notion-muted/80" />
            {formatCourseListStartedAt(course)}
          </span>
          <span>时长 {formatCourseMediaDuration(course, lesson)}</span>
          <span>
            授课 {teacherLabel ?? '—'}
          </span>
          <span className="truncate max-w-full">知识库 {libraryFull}</span>
          {course.sourceUrl && (
            <a
              href={course.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              来源链接
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-3 shrink-0 md:border-l md:border-notion-border md:pl-5">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-notion-border bg-white text-sm font-medium text-notion-text hover:bg-[#fafafa] transition-colors"
        >
          打开
          <ArrowRight size={14} />
        </button>
        <button
          type="button"
          onClick={() => {
            if (!canSummary) {
              window.alert(
                '暂无法打开总结：请先完成转写或等待本课总结生成后再试。'
              )
              return
            }
            onSummary()
          }}
          className={clsx(
            'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-notion-border bg-white text-sm font-medium text-notion-text hover:bg-[#fafafa] transition-colors',
            !canSummary && 'opacity-40'
          )}
        >
          <FileText size={14} />
          总结
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 px-2 py-2 rounded-lg text-sm font-medium text-notion-text hover:bg-notion-sidebar transition-colors"
        >
          <Pencil size={14} />
          编辑
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 px-2 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
          删除
        </button>
      </div>
    </div>
  )
}

function KindBadge({ kind }: { kind: '网课' | '线下课程' }) {
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-notion-sidebar text-notion-muted">
      {kind}
    </span>
  )
}

function StatusBadge({
  label,
  variant,
}: {
  label: string
  variant: 'live' | 'done' | 'muted' | 'summary' | 'pending'
}) {
  return (
    <span
      className={clsx(
        'text-[10px] px-2 py-0.5 rounded-full font-medium',
        variant === 'live' && 'bg-red-50 text-red-600',
        variant === 'done' && 'bg-emerald-50 text-emerald-700',
        variant === 'muted' && 'bg-notion-sidebar text-notion-muted',
        variant === 'summary' && 'bg-violet-100 text-violet-700',
        variant === 'pending' && 'bg-amber-50 text-amber-700'
      )}
    >
      {label}
    </span>
  )
}
