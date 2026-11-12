import { loadFromStorage, saveToStorage } from '../utils/storage'

const STORAGE_KEY = 'teacherNamePresets'

const DEFAULT_TEACHERS = [
  '谢玉洁老师',
  '王老师',
  '李老师',
  '张老师',
]

export function getTeacherPresets(): string[] {
  const stored = loadFromStorage<string[]>(STORAGE_KEY, DEFAULT_TEACHERS)
  const merged = [...new Set([...DEFAULT_TEACHERS, ...stored])]
  return merged.slice(0, 20)
}

const LAST_TEACHER_KEY = 'lastTeacherName'

export function getDefaultTeacherName(): string {
  const last = loadFromStorage<string | null>(LAST_TEACHER_KEY, null)
  if (last?.trim()) return last.trim()
  return DEFAULT_TEACHERS[0] ?? ''
}

export function rememberTeacherName(name: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  saveToStorage(LAST_TEACHER_KEY, trimmed)
  const next = [trimmed, ...getTeacherPresets().filter((t) => t !== trimmed)].slice(
    0,
    20
  )
  saveToStorage(STORAGE_KEY, next)
}
