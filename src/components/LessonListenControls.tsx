import { useState } from 'react'
import clsx from 'clsx'
import { CheckCircle2, Play } from 'lucide-react'

export type ListenSessionPhase = 'idle' | 'active' | 'paused' | 'finished'

interface LessonListenButtonsProps {
  phase: ListenSessionPhase
  isSupported: boolean
  onStartListen: () => void
  onPause: () => void
  onResume: () => void
  onEndCourse: () => void
  onWorkbench?: () => void
}

const btnOutline =
  'inline-flex items-center justify-center px-4 py-2 rounded-xl border border-notion-border bg-white text-sm font-medium text-notion-text hover:bg-[#fafafa] transition-colors shrink-0'
const btnPrimary =
  'inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-notion-text text-white text-sm font-semibold shadow-sm hover:bg-notion-text/90 disabled:opacity-40 disabled:pointer-events-none transition-colors shrink-0'

export function LessonSessionStatusBanner({
  phase,
}: {
  phase: 'active' | 'paused'
}) {
  const active = phase === 'active'
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium shrink-0 whitespace-nowrap',
        active
          ? 'bg-violet-50 text-violet-900 border border-violet-100'
          : 'bg-amber-50 text-amber-900 border border-amber-100'
      )}
    >
      <span
        className={clsx(
          'h-2 w-2 shrink-0 rounded-full',
          active ? 'bg-violet-500' : 'bg-amber-500'
        )}
      />
      {active ? (
        <span>学习中 · 可随时暂停或结束课程</span>
      ) : (
        <span>已暂停 · 点击「继续转写」</span>
      )}
    </div>
  )
}

export function EndCourseConfirmDialog({
  open,
  lessonTitle,
  onClose,
  onConfirm,
}: {
  open: boolean
  lessonTitle?: string
  onClose: () => void
  onConfirm: () => void
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="end-course-dialog-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-notion-border bg-white shadow-xl p-5">
        <h2
          id="end-course-dialog-title"
          className="text-base font-semibold text-notion-text"
        >
          结束本课？
        </h2>
        <p className="text-sm text-notion-muted mt-2 leading-relaxed">
          {lessonTitle ? (
            <>
              将停止「{lessonTitle}」的转写并标记本课已完成。
            </>
          ) : (
            <>将停止转写并标记本课已完成。</>
          )}
          结束后可查看「本课总结」，此操作不可撤销为「学习中」。
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-notion-muted hover:bg-notion-sidebar"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-notion-text text-white hover:bg-notion-text/90"
          >
            确认结束
          </button>
        </div>
      </div>
    </div>
  )
}

export function LessonListenButtons({
  phase,
  isSupported,
  onStartListen,
  onPause,
  onResume,
  onEndCourse,
  onWorkbench,
  lessonTitle,
}: LessonListenButtonsProps & { lessonTitle?: string }) {
  const [endConfirmOpen, setEndConfirmOpen] = useState(false)

  return (
    <>
      <EndCourseConfirmDialog
        open={endConfirmOpen}
        lessonTitle={lessonTitle}
        onClose={() => setEndConfirmOpen(false)}
        onConfirm={onEndCourse}
      />
      {phase === 'idle' && (
        <button
          type="button"
          disabled={!isSupported}
          onClick={onStartListen}
          className={btnPrimary}
        >
          <Play size={14} />
          开始听课
        </button>
      )}

      {phase === 'active' && (
        <>
          <button type="button" onClick={onPause} className={btnOutline}>
            暂停
          </button>
          <button
            type="button"
            onClick={() => setEndConfirmOpen(true)}
            className={btnOutline}
          >
            结束课程
          </button>
          {onWorkbench && (
            <button type="button" onClick={onWorkbench} className={btnOutline}>
              工作台
            </button>
          )}
        </>
      )}

      {phase === 'paused' && (
        <>
          <button
            type="button"
            disabled={!isSupported}
            onClick={onResume}
            className={btnPrimary}
          >
            继续转写
          </button>
          <button
            type="button"
            onClick={() => setEndConfirmOpen(true)}
            className={btnOutline}
          >
            结束课程
          </button>
          {onWorkbench && (
            <button type="button" onClick={onWorkbench} className={btnOutline}>
              工作台
            </button>
          )}
        </>
      )}

      {phase === 'finished' && (
        <button
          type="button"
          disabled
          className={clsx(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shrink-0',
            'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
          )}
        >
          <CheckCircle2 size={14} />
          课程结束
        </button>
      )}
    </>
  )
}
