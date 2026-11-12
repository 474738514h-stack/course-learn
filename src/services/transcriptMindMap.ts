import type { MindMapNode } from '../types'
import {
  centerLabelFromLessonTitle,
  structuredConclusionsFromTranscript,
  structuredInspirationsFromTranscript,
} from './lessonMindMap'

function truncate(s: string, max: number): string {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

function splitParagraphs(transcript: string): string[] {
  return transcript
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12)
}

function splitSentences(transcript: string): string[] {
  return transcript
    .split(/[。！？；\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 10)
}

function sectionTitleFromChunk(chunk: string): string {
  const head = chunk.slice(0, 60).match(/^[^，,。；;]{4,14}/)
  if (head) return truncate(head[0], 14)
  return truncate(chunk, 12)
}

/** 按转写自然段 / 句群划分讲授模块 */
function buildLectureStructureBranches(transcript: string): MindMapNode[] {
  const paragraphs = splitParagraphs(transcript)
  const chunks =
    paragraphs.length >= 2
      ? paragraphs
      : (() => {
          const sents = splitSentences(transcript)
          const groups: string[] = []
          for (let i = 0; i < sents.length; i += 4) {
            groups.push(sents.slice(i, i + 4).join('。'))
          }
          return groups.filter((g) => g.length >= 12)
        })()

  const noHits: { id: string; term: string; count: number; description: string }[] =
    []

  return chunks.slice(0, 6).map((chunk) => {
    const points = structuredConclusionsFromTranscript(chunk, noHits).slice(0, 4)
    return {
      label: sectionTitleFromChunk(chunk),
      children: (points.length ? points : [truncate(chunk, 40)]).map((label) => ({
        label: truncate(label, 44),
      })),
    }
  })
}

/**
 * 仅依据视频/音频转写提炼思维导图。
 * 不读取课标库、笔记、行动项、历史关联或 LLM 课程总结结果。
 */
export function buildVideoTranscriptMindMap(
  transcript: string,
  lessonTitle: string
): MindMapNode {
  const trimmed = transcript.trim()
  const center = centerLabelFromLessonTitle(lessonTitle)

  if (!trimmed) {
    return { label: center, children: [{ label: '暂无转写内容' }] }
  }

  const noHits: { id: string; term: string; count: number; description: string }[] =
    []
  const mainPoints = structuredConclusionsFromTranscript(trimmed, noHits)
  const keyTakeaways = structuredInspirationsFromTranscript(trimmed, noHits)
  const structure = buildLectureStructureBranches(trimmed)

  const children: MindMapNode[] = []

  if (structure.length >= 1) {
    children.push({ label: '讲授结构', children: structure })
  }
  if (mainPoints.length > 0) {
    children.push({
      label: '讲授要点',
      children: mainPoints.slice(0, 6).map((label) => ({ label: truncate(label, 44) })),
    })
  }
  if (keyTakeaways.length > 0) {
    children.push({
      label: '关键结论',
      children: keyTakeaways.slice(0, 5).map((label) => ({ label: truncate(label, 44) })),
    })
  }

  return {
    label: center,
    children: children.length ? children : [{ label: '转写过短，暂无法提炼' }],
  }
}
