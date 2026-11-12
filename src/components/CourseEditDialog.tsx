import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Course } from '../types'
import {
  KNOWLEDGE_LIBRARIES,
  normalizeLibraryId,
} from '../data/knowledgeLibraries'

interface CourseEditDialogProps {
  course: Course | null
  onClose: () => void
  onSave: (
    courseId: string,
    data: { title: string; sourceUrl: string; knowledgeLibraryId: string }
  ) => void
}

export function CourseEditDialog({
  course,
  onClose,
  onSave,
}: CourseEditDialogProps) {
  const [title, setTitle] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [knowledgeLibraryId, setKnowledgeLibraryId] = useState('ai-pm')

  useEffect(() => {
    if (course) {
      setTitle(course.title)
      setSourceUrl(course.sourceUrl ?? '')
      setKnowledgeLibraryId(
        normalizeLibraryId(course.knowledgeLibraryId ?? 'ai-pm')
      )
    }
  }, [course])

  if (!course) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-course-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-notion-border bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-notion-border">
          <h2 id="edit-course-title" className="text-base font-semibold text-notion-text">
            编辑课程
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-notion-muted hover:bg-notion-sidebar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-notion-muted">课程名称</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-notion-border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-notion-muted">课程知识库</span>
            <select
              value={knowledgeLibraryId}
              onChange={(e) => setKnowledgeLibraryId(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-notion-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/25"
            >
              {KNOWLEDGE_LIBRARIES.map((lib) => (
                <option key={lib.id} value={lib.id}>
                  {lib.fullTitle}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-notion-muted mt-1.5 leading-snug">
              修改后，后续转写将按新库识别知识点；已有转写命中不会自动重算。
            </p>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-notion-muted">课程链接</span>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="网页课程链接（可选）"
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-notion-border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-notion-border bg-[#fafafa] rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-notion-muted hover:bg-notion-sidebar"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!title.trim()}
            onClick={() => {
              onSave(course.id, {
                title: title.trim(),
                sourceUrl: sourceUrl.trim(),
                knowledgeLibraryId,
              })
              onClose()
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

interface CourseDeleteDialogProps {
  course: Course | null
  onClose: () => void
  onConfirm: (courseId: string) => void
}

export function CourseDeleteDialog({
  course,
  onClose,
  onConfirm,
}: CourseDeleteDialogProps) {
  if (!course) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl border border-notion-border bg-white shadow-xl p-5">
        <h2 className="text-base font-semibold text-notion-text">删除课程？</h2>
        <p className="text-sm text-notion-muted mt-2 leading-relaxed">
          将删除「{course.title}」及其转写、笔记与总结，此操作无法撤销。
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
              onConfirm(course.id)
              onClose()
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  )
}
