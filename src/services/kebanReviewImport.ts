import type {
  Course,
  KnowledgePoint,
  Lesson,
  LessonFocusStructured,
  LessonSummary,
  MindMapNode,
} from '../types'
import { matchKnowledgePoints } from '../data/knowledgePoints'

export type KebanReviewImport = {
  course: Course
  unmatchedHitLabels: string[]
  transcriptSegmentCount: number
}

const LIBRARY_BY_HINT: { pattern: RegExp; id: string }[] = [
  { pattern: /增长|商业化|GTM|留存|ROI|AARRR/i, id: 'ai-growth' },
  { pattern: /工程|RAG|MCP|落地/i, id: 'ai-eng' },
  { pattern: /产品|产品经理|PM/i, id: 'ai-pm' },
]

/** 复盘导出标签 → 知识库词条近似名 */
const KEBAN_HIT_ALIASES: Record<string, string[]> = {
  Agent: ['Agent 产品化', 'Agent 框架', '智能体'],
  Token: ['Token 成本', 'AI 定价'],
  '增长转化指标': ['转化率', '增长漏斗', 'AI ROI'],
  '定价策略': ['AI 定价', '定价实验', '定价模型'],
  'ChatGPT / GPT 系列': ['大模型', 'GPT', '对话产品'],
  ROI: ['AI ROI'],
  免费增值: ['Freemium'],
}

function inferLibraryId(text: string): string {
  if (/增长|商业化/i.test(text)) return 'ai-growth'
  for (const row of LIBRARY_BY_HINT) {
    if (row.pattern.test(text)) return row.id
  }
  return 'ai-growth'
}

function parseDurationSec(text: string): number | undefined {
  const m = text.match(/(\d+):(\d{2}):(\d{2})/)
  if (!m) return undefined
  return (
    parseInt(m[1], 10) * 3600 +
    parseInt(m[2], 10) * 60 +
    parseInt(m[3], 10)
  )
}

function sectionBody(md: string, heading: string): string {
  const re = new RegExp(`## ${heading}[\\s\\S]*?(?=\\n## |$)`, 'm')
  const block = md.match(re)?.[0] ?? ''
  return block.replace(new RegExp(`^## ${heading}\\s*`, 'm'), '').trim()
}

function parseHitLines(section: string): { label: string; count: number; desc: string }[] {
  const out: { label: string; count: number; desc: string }[] = []
  for (const line of section.split('\n')) {
    const m = line.match(/^-\s*(.+?)\s*×(\d+)\s*[：:]\s*(.*)$/)
    if (m) {
      out.push({
        label: m[1].trim(),
        count: parseInt(m[2], 10),
        desc: m[3].trim(),
      })
    }
  }
  return out
}

function resolveHitId(
  label: string,
  points: KnowledgePoint[]
): string | null {
  const q = label.trim().toLowerCase()
  const exact = points.find(
    (kp) =>
      kp.term.toLowerCase() === q ||
      kp.aliases.some((a) => a.toLowerCase() === q)
  )
  if (exact) return exact.id

  const aliasHints = KEBAN_HIT_ALIASES[label] ?? []
  for (const hint of aliasHints) {
    const id = resolveHitId(hint, points)
    if (id) return id
  }

  const partial = points.find((kp) => {
    const t = kp.term.toLowerCase()
    if (t.startsWith(q) || q.startsWith(t)) return true
    return kp.aliases.some((a) => {
      const al = a.toLowerCase()
      return al.includes(q) || q.includes(al)
    })
  })
  if (partial) return partial.id

  const matched = matchKnowledgePoints(label, points)
  return matched[0] ?? null
}

function parseActionItems(section: string): string[] {
  const items: string[] = []
  for (const line of section.split('\n')) {
    const m = line.match(/^-\s*\*\*行动\*\*[：:]\s*(.+)$/)
    if (m?.[1]?.trim()) items.push(m[1].trim())
  }
  return items
}

function parseGoldenQuotes(section: string): string[] {
  const quotes: string[] = []
  const re = /^>\s*\*\*高光\s*\d+\*\*\s*(.+)$/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(section))) {
    quotes.push(m[1].trim())
  }
  return quotes
}

function parseCourseFocus(focusMd: string): {
  conclusions: string[]
  inspirations: string[]
} {
  const conclusions: string[] = []
  const inspirations: string[] = []
  const blocks = focusMd.split(/(?=\n### \d+\. )/).filter((b) => b.trim())
  for (const block of blocks) {
    const titleM = block.match(/^### \d+\.\s*(.+?)\s*$/m)
    if (titleM) conclusions.push(titleM[1].trim())
    for (const line of block.split('\n')) {
      const insp = line.match(/^-\s*产品启发[：:]\s*(.+)$/)
      if (insp) inspirations.push(insp[1].trim())
    }
  }
  return { conclusions, inspirations }
}

function parseCoreSummary(coreBlock: string): string {
  const lines = coreBlock
    .split('\n')
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !l.startsWith('>') &&
        !/^先看/.test(l) &&
        !/已过滤/.test(l) &&
        !/时间分布不足/.test(l)
    )
  const tagline = lines.find((l) => l.length < 120 && !l.includes('本课围绕'))
  const body =
    lines.find((l) => l.length >= 80 || l.includes('本课围绕')) ?? ''
  return [tagline, body].filter(Boolean).join('\n\n')
}

function buildMindMapFromFocus(
  title: string,
  conclusions: string[]
): MindMapNode {
  return {
    label: title.slice(0, 32),
    children: conclusions.map((c) => ({
      label: c.length > 36 ? `${c.slice(0, 34)}…` : c,
    })),
  }
}

function libraryTag(libraryId: string): string {
  if (libraryId === 'ai-eng') return 'AI工程落地知识库'
  if (libraryId === 'ai-pm') return 'AI产品经理知识库'
  return 'AI商业化增长知识库'
}

function buildLessonFocusStructured(
  focusMd: string,
  hitRows: { label: string; count: number; desc: string }[]
): LessonFocusStructured {
  const { conclusions, inspirations } = parseCourseFocus(focusMd)
  return {
    conclusions,
    inspirations,
    knowledgeClues: hitRows.map((r) => ({
      term: r.label,
      count: r.count,
      detail: r.desc,
    })),
  }
}

function recomputeKebanHits(
  raw: string,
  knowledgePoints: KnowledgePoint[]
): Record<string, number> {
  const libraryId = inferLibraryId(raw)
  const hitsSection = sectionBody(raw, '命中知识点')
  const hitRows = parseHitLines(hitsSection)
  const pointsInLib = knowledgePoints.filter((kp) =>
    kp.tags.includes(libraryTag(libraryId))
  )
  const resolvePool =
    pointsInLib.length > 0 ? [...pointsInLib, ...knowledgePoints] : knowledgePoints
  const knowledgePointHits: Record<string, number> = {}
  for (const row of hitRows) {
    const id = resolveHitId(row.label, resolvePool)
    if (id) {
      knowledgePointHits[id] = (knowledgePointHits[id] || 0) + row.count
    }
  }
  return knowledgePointHits
}

/** 从已保存的 fullMarkdown 补全复盘导入总结（兼容旧导入记录） */
export function enrichKebanSummaryFromMarkdown(
  summary: LessonSummary,
  knowledgePoints: KnowledgePoint[]
): { summary: LessonSummary; knowledgePointHits: Record<string, number> } {
  const raw = summary.fullMarkdown?.trim() ?? ''
  if (!raw.includes('## 课程重点')) {
    return { summary, knowledgePointHits: {} }
  }
  if (
    summary.importedFromKeban &&
    summary.lessonFocusStructured &&
    summary.lessonFocusStructured.conclusions.length > 0
  ) {
    return {
      summary,
      knowledgePointHits: recomputeKebanHits(raw, knowledgePoints),
    }
  }

  const coreBlock = sectionBody(raw, '核心定调')
  const focusMd = sectionBody(raw, '课程重点')
  const notesMd = sectionBody(raw, '课堂笔记')
  const highlightsMd = sectionBody(raw, '高光片段')
  const hitsSection = sectionBody(raw, '命中知识点')
  const actionsSection = sectionBody(raw, '课程行动建议')

  const hitRows = parseHitLines(hitsSection)
  const knowledgePointHits = recomputeKebanHits(raw, knowledgePoints)

  const { conclusions } = parseCourseFocus(focusMd)
  const goldenQuotes = parseGoldenQuotes(highlightsMd)
  const actionItems = parseActionItems(actionsSection)
  const titleMatch = raw.match(/^#\s+(.+)$/m)
  const title = titleMatch?.[1]?.trim() ?? '复盘导入'

  return {
    summary: {
      ...summary,
      importedFromKeban: true,
      coreSummary: parseCoreSummary(coreBlock) || summary.coreSummary,
      lessonFocus: focusMd || summary.lessonFocus,
      lessonFocusStructured: buildLessonFocusStructured(focusMd, hitRows),
      notesReading: notesMd || summary.notesReading,
      actionItems: actionItems.length > 0 ? actionItems : summary.actionItems,
      keyPoints: conclusions.length > 0 ? conclusions : summary.keyPoints,
      goldenQuotes:
        goldenQuotes.length > 0 ? goldenQuotes : summary.goldenQuotes,
      knowledgeMarkdown: hitsSection || summary.knowledgeMarkdown,
      mindMap:
        conclusions.length > 0
          ? buildMindMapFromFocus(title, conclusions)
          : summary.mindMap,
      generatedAt: summary.generatedAt || Date.now(),
    },
    knowledgePointHits,
  }
}

/**
 * 解析「课程复盘」.md（无全文转写，含总结与命中统计）
 */
export function parseKebanReviewMarkdown(
  raw: string,
  knowledgePoints: KnowledgePoint[],
  fileName?: string
): KebanReviewImport {
  const lines = raw.split('\n')
  const titleMatch = raw.match(/^#\s+(.+)$/m)
  const title =
    titleMatch?.[1]?.trim() ??
    fileName?.replace(/-课程复盘\.md$/i, '').replace(/\.md$/i, '') ??
    '复盘导入课程'

  const metaLines = lines.filter(
    (l) => l.startsWith('- ') && !l.startsWith('- **')
  )
  const libraryId = inferLibraryId(`${title}\n${metaLines.join('\n')}\n${raw}`)
  const durationSec =
    parseDurationSec(metaLines.join('\n') + raw) ??
    parseDurationSec(raw)

  let transcriptSegmentCount = 0
  const segMeta = raw.match(/(\d+)\s*段转写/)
  if (segMeta) transcriptSegmentCount = parseInt(segMeta[1], 10)

  const coreBlock = sectionBody(raw, '核心定调')
  const focusMd = sectionBody(raw, '课程重点')
  const notesMd = sectionBody(raw, '课堂笔记')
  const highlightsMd = sectionBody(raw, '高光片段')
  const hitsSection = sectionBody(raw, '命中知识点')
  const actionsSection = sectionBody(raw, '课程行动建议')

  const hitRows = parseHitLines(hitsSection)
  const knowledgePointHits: Record<string, number> = {}
  const unmatchedHitLabels: string[] = []
  const pointsInLib = knowledgePoints.filter((kp) =>
    kp.tags.includes(libraryTag(libraryId))
  )
  const resolvePool =
    pointsInLib.length > 0 ? [...pointsInLib, ...knowledgePoints] : knowledgePoints

  for (const row of hitRows) {
    const id = resolveHitId(row.label, resolvePool)
    if (id) {
      knowledgePointHits[id] =
        (knowledgePointHits[id] || 0) + row.count
    } else {
      unmatchedHitLabels.push(row.label)
    }
  }

  const { conclusions } = parseCourseFocus(focusMd)
  const goldenQuotes = parseGoldenQuotes(highlightsMd)
  const actionItems = parseActionItems(actionsSection)
  const lessonFocusStructured = buildLessonFocusStructured(focusMd, hitRows)

  const generatedAt = Date.now()
  const summary: LessonSummary = {
    generatedAt,
    importedFromKeban: true,
    coreSummary: parseCoreSummary(coreBlock) || title,
    lessonFocus: focusMd,
    lessonFocusStructured,
    notesReading: notesMd,
    actionItems,
    keyPoints: conclusions,
    goldenQuotes,
    knowledgeMarkdown: hitsSection,
    userFocusMarkdown: '',
    notesMarkdown: sectionBody(raw, '我的课堂笔记'),
    mindMap: buildMindMapFromFocus(title, conclusions),
    fullMarkdown: raw,
  }

  const courseId = `keban-${Date.now().toString(36)}`
  const lessonId = `lesson-${Date.now().toString(36)}`
  const lesson: Lesson = {
    id: lessonId,
    title: `第1课：${title}`,
    courseId,
    duration: durationSec
      ? `${Math.floor(durationSec / 3600)}:${String(Math.floor((durationSec % 3600) / 60)).padStart(2, '0')}:${String(durationSec % 60).padStart(2, '0')}`
      : undefined,
    status: 'completed',
    knowledgePointHits,
    transcriptSegments: [],
    notes: [],
    summary,
  }

  const course: Course = {
    id: courseId,
    title,
    createdAt: generatedAt,
    mediaDurationSec: durationSec,
    description: `复盘导入 · ${transcriptSegmentCount || 0} 段转写未包含在导出文件中`,
    lessons: [lesson],
    knowledgeLibraryId: libraryId,
    sourceType: 'web',
    sourceUrl: 'https://keban.zuoxue.com/dashboard',
    teacherName: '课程复盘',
  }

  return {
    course,
    unmatchedHitLabels,
    transcriptSegmentCount,
  }
}
