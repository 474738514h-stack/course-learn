import type {
  KnowledgePoint,
  Course,
  Lesson,
  TranscriptSegment,
} from '../types'
import { BUNDLED_AI_KNOWLEDGE_POINTS } from './aiKnowledgeBundle'
import { getReleaseKnowledgePoints } from '../services/knowledgeSnapshotStore'

/** 三本 AI 知识库预设词条（PM 130+ 条，工程/增长各 50 条） */
export const PRESET_KNOWLEDGE_POINTS: KnowledgePoint[] = [
  ...BUNDLED_AI_KNOWLEDGE_POINTS,
]

export const INITIAL_COURSES: Course[] = [
  {
    id: 'ai-product-2026',
    title: 'AI 产品 · 三联知识库精讲',
    description:
      'AI产品经理 130+ 词 · 工程/增长各 50 个高频名词',
    knowledgeLibraryId: 'ai-pm',
    lessons: [
      {
        id: 'lesson-1',
        title: '第1讲：AI 产品经理基础',
        courseId: 'ai-product-2026',
        duration: '45 min',
        status: 'in_progress',
        knowledgePointHits: {
          'pm-ai-pm-role': 28,
          'pm-ai-prd': 22,
          'pm-hallucination': 15,
          'pm-workflow': 12,
          'pm-vibe-coding': 8,
        },
        transcriptSegments: [],
        notes: [],
      },
      {
        id: 'lesson-2',
        title: '第2讲：工程落地与 RAG',
        courseId: 'ai-product-2026',
        duration: '45 min',
        status: 'not_started',
        knowledgePointHits: {
          'eng-rag': 30,
          'eng-mcp': 18,
          'eng-function-calling': 14,
          'eng-workflow': 11,
        },
        transcriptSegments: [],
        notes: [],
      },
      {
        id: 'lesson-3',
        title: '第3讲：商业化与增长',
        courseId: 'ai-product-2026',
        duration: '40 min',
        status: 'not_started',
        knowledgePointHits: {
          'gro-gtm': 25,
          'gro-plg': 20,
          'gro-ai-pricing': 16,
          'gro-growth-loop': 10,
        },
        transcriptSegments: [],
        notes: [],
      },
    ],
  },
]

export function getAllKnowledgePoints(custom: KnowledgePoint[]): KnowledgePoint[] {
  const preset = getReleaseKnowledgePoints()
  const presetIds = new Set(preset.map((p) => p.id))
  const extraCustom = custom.filter((p) => !presetIds.has(p.id))
  return [...preset, ...extraCustom]
}

/** 左侧「本课重点」：仅展示转写中已命中的知识点（无命中则不占位展示） */
export function computeKnowledgeHitsFromSegments(
  segments: TranscriptSegment[],
  knowledgePoints: KnowledgePoint[]
): Record<string, number> {
  const hits: Record<string, number> = {}
  for (const seg of segments) {
    const plain = stripKnowledgeHighlightMarkup(seg.text)
    const ids = matchKnowledgePoints(plain, knowledgePoints)
    for (const id of ids) {
      const kp = knowledgePoints.find((k) => k.id === id)
      if (!kp) continue
      const lower = plain.toLowerCase()
      let n = 0
      for (const term of [kp.term, ...kp.aliases]) {
        const t = term.toLowerCase().trim()
        if (!t) continue
        let idx = 0
        while ((idx = lower.indexOf(t, idx)) !== -1) {
          n++
          idx += Math.max(t.length, 1)
        }
      }
      hits[id] = (hits[id] || 0) + (n > 0 ? n : 1)
    }
  }
  return hits
}

/** 按当前课程知识库重算转写命中与左侧计数 */
export function rematchLessonKnowledge(
  lesson: Lesson,
  knowledgePoints: KnowledgePoint[]
): Lesson {
  const transcriptSegments = lesson.transcriptSegments.map((seg) => ({
    ...seg,
    matchedKnowledgeIds: matchKnowledgePoints(seg.text, knowledgePoints),
  }))
  return {
    ...lesson,
    transcriptSegments,
    knowledgePointHits: computeKnowledgeHitsFromSegments(
      transcriptSegments,
      knowledgePoints
    ),
  }
}

export function getLessonFocusKnowledgeIds(lesson: Lesson | undefined): string[] {
  if (!lesson) return []
  if (lesson.transcriptSegments.length === 0) return []
  return Object.entries(lesson.knowledgePointHits)
    .filter(([, count]) => count > 0)
    .map(([id]) => id)
}

export function getLessonFocusKnowledgePoints(
  _lesson: Lesson | undefined,
  coursePoints: KnowledgePoint[],
  hits: Record<string, number>
): KnowledgePoint[] {
  const allowed = new Set(coursePoints.map((kp) => kp.id))
  const ids = Object.entries(hits)
    .filter(([, count]) => count > 0)
    .map(([id]) => id)
    .filter((id) => allowed.has(id))
  const byId = new Map(coursePoints.map((kp) => [kp.id, kp]))
  return [...ids]
    .map((id) => byId.get(id))
    .filter((kp): kp is KnowledgePoint => Boolean(kp))
    .sort((a, b) => (hits[b.id] || 0) - (hits[a.id] || 0))
}

export function filterHitsForCourse(
  hits: Record<string, number>,
  coursePoints: KnowledgePoint[]
): Record<string, number> {
  const allowed = new Set(coursePoints.map((kp) => kp.id))
  const out: Record<string, number> = {}
  for (const [id, count] of Object.entries(hits)) {
    if (allowed.has(id) && count > 0) out[id] = count
  }
  return out
}

export function matchKnowledgePoints(
  text: string,
  knowledgePoints: KnowledgePoint[]
): string[] {
  const lowerText = text.toLowerCase()
  const matched: string[] = []

  for (const kp of knowledgePoints) {
    const terms = [kp.term, ...kp.aliases]
    for (const term of terms) {
      if (lowerText.includes(term.toLowerCase())) {
        matched.push(kp.id)
        break
      }
    }
  }

  return matched
}

/** 展示前还原为纯文本，并清理历史错误高亮残留 */
export function stripKnowledgeHighlightMarkup(text: string): string {
  let t = text
  t = t.replace(/<mark\b[^>]*>([\s\S]*?)<\/mark>/gi, '$1')
  t = t.replace(/<mark\b[^>]*>/gi, '')
  t = t.replace(/<\/mark>/gi, '')
  // 旧版在 HTML 属性内二次匹配 workflow 产生的残留
  t = t.replace(
    /([^\s"<>]+)" title="[^"]*">\s*\1/gi,
    '$1'
  )
  t = t.replace(/" title="[^"]*">/g, '')
  return t
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/"/g, '&quot;')
}

export function highlightText(
  text: string,
  knowledgePoints: KnowledgePoint[],
  onKnowledgeClick?: (id: string) => void
): { html: string; matches: string[] } {
  const plain = stripKnowledgeHighlightMarkup(text)
  const matches = matchKnowledgePoints(plain, knowledgePoints)
  if (matches.length === 0) {
    return { html: escapeHtml(plain), matches: [] }
  }

  type Span = {
    start: number
    end: number
    id: string
    description: string
  }

  const spans: Span[] = []
  const sortedKps = knowledgePoints
    .filter((kp) => matches.includes(kp.id))
    .sort((a, b) => b.term.length - a.term.length)

  for (const kp of sortedKps) {
    const terms = [kp.term, ...kp.aliases].filter(Boolean)
    const seenStarts = new Set<number>()
    for (const term of terms) {
      const regex = new RegExp(escapeRegex(term), 'gi')
      let m: RegExpExecArray | null
      while ((m = regex.exec(plain)) !== null) {
        const start = m.index
        const end = start + m[0].length
        if (seenStarts.has(start)) continue
        seenStarts.add(start)
        spans.push({ start, end, id: kp.id, description: kp.description })
      }
    }
  }

  spans.sort((a, b) => a.start - b.start || b.end - a.end - (a.end - a.start))
  const merged: Span[] = []
  for (const s of spans) {
    const overlaps = merged.some((o) => s.start < o.end && s.end > o.start)
    if (!overlaps) merged.push(s)
  }

  let html = ''
  let cursor = 0
  for (const s of merged) {
    html += escapeHtml(plain.slice(cursor, s.start))
    const chunk = plain.slice(s.start, s.end)
    html += `<mark class="kp-highlight" data-kp-id="${escapeAttr(s.id)}" title="${escapeAttr(s.description)}">${escapeHtml(chunk)}</mark>`
    cursor = s.end
  }
  html += escapeHtml(plain.slice(cursor))

  void onKnowledgeClick
  return { html, matches }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
