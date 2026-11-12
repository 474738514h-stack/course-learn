import type { Course } from '../types'

export function getTranscriptionCaptureLabel(
  course: Course | undefined,
  source: 'microphone' | 'tab'
): string {
  if (course?.sourceType === 'upload') {
    return '本地音视频'
  }
  return source === 'tab' ? '网页标签页' : '麦克风'
}
