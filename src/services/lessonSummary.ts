import type { LessonSummary, MindMapNode } from '../types'
import { getSystemPromptForTask } from './adminStore'
import { chatForTask } from './llmChat'
import { isLlmConfigured } from './llmEnv'
import type { LessonSummaryContext } from './lessonSummaryContext'
import { buildExerciseActionItems } from './lessonActionItems'
import {
  centerLabelFromLessonTitle,
  looksLikeOralTranscriptLine,
  structuredConclusionsFromTranscript,
  structuredInspirationsFromTranscript,
} from './lessonMindMap'

function summaryUserPrompt(ctx: LessonSummaryContext): string {
  const hits = ctx.knowledgeHits
    .map((h) => `- ${h.term}（命中 ${h.count} 次）：${h.description}`)
    .join('\n')
  const viewed = ctx.viewedKnowledge.map((k) => `- ${k.term}`).join('\n') || '无'
  const added = ctx.addedKnowledge.map((k) => `- ${k.term}：${k.description}`).join('\n') || '无'
  const explains =
    ctx.explainRequests.map((e) => `- 「${e.selectedText}」`).join('\n') || '无'
  const notes =
    ctx.notes
      .map(
        (n, i) =>
          `${i + 1}. ${n.fromExplain ? '[AI解释笔记] ' : ''}${n.selectedText ? `划词「${n.selectedText}」：` : ''}${n.content.slice(0, 400)}`
      )
      .join('\n') || '无'

  return `课程：${ctx.courseTitle}
课节：${ctx.lessonTitle}

【转写全文】
${ctx.transcript.slice(0, 6000) || '（暂无转写）'}

【转写命中知识点】
${hits || '无'}

【学员点击过的知识点】
${viewed}

【学员本课新增的知识点】
${added}

【学员请求 AI 解释的片段】
${explains}

【学员笔记】
${notes}

JSON schema：
{
  "coreSummary": "2-4 段 Markdown：本课核心主题 + 完整摘要（覆盖转写主线，可读性强）",
  "lessonFocus": "Markdown：课程重点——课堂结论、内容启发；以命中/讨论的知识点为线索串联，不要只罗列词条",
  "notesReading": "Markdown：将学员笔记与 AI 解释笔记改写成连贯阅读版（分段叙述，非 bullet 堆叠）",
  "actionItems": ["4-6 条课后习题/动手任务。每条以【题型】开头，如【填空】【选择】【简答】【对比表】【材料题】【判断+依据】【时间轴/排序】【闭卷自测】；题干含必要情境或引文，选择/判断题须给出选项或判断对象；简答须标明字数或要点个数"],
  "keyPoints": ["3-6 条短要点，供内部使用"],
  "goldenQuotes": ["2-5 条金句"],
  "knowledgeMarkdown": "Markdown：知识点联系",
  "userFocusMarkdown": "Markdown：学员主动关注",
  "notesMarkdown": "Markdown：结构化笔记原文"
}`
}

async function chatJson(messages: { role: string; content: string }[]): Promise<string> {
  return chatForTask(
    'lesson_summary',
    messages as { role: 'system' | 'user' | 'assistant'; content: string }[],
    { responseFormatJson: true }
  )
}

function parseSummaryJson(raw: string): Omit<LessonSummary, 'generatedAt' | 'fullMarkdown'> {
  const cleaned = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/, '')
  const data = JSON.parse(cleaned) as {
    coreSummary?: string
    lessonFocus?: string
    notesReading?: string
    actionItems?: string[]
    keyPoints?: string[]
    goldenQuotes?: string[]
    knowledgeMarkdown?: string
    userFocusMarkdown?: string
    notesMarkdown?: string
    mindMap?: MindMapNode
  }
  return {
    coreSummary: data.coreSummary ?? '',
    lessonFocus: data.lessonFocus ?? '',
    notesReading: data.notesReading ?? '',
    actionItems: data.actionItems ?? [],
    keyPoints: data.keyPoints ?? [],
    goldenQuotes: data.goldenQuotes ?? [],
    knowledgeMarkdown: data.knowledgeMarkdown ?? '',
    userFocusMarkdown: data.userFocusMarkdown ?? '',
    notesMarkdown: data.notesMarkdown ?? '',
    mindMap: { label: '本课总结', children: [] },
  }
}

function splitTranscriptSentences(transcript: string): string[] {
  return transcript
    .split(/[。！？；\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 6)
}

function splitTranscriptParagraphs(transcript: string): string[] {
  return transcript
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 6)
}

/** 演示模式 / 无 LLM 时，从转写提取结构化要点与启发 */
export function transcriptSummaryHighlights(
  transcript: string,
  hits: { term: string; description?: string }[] = []
): {
  keyPoints: string[]
  goldenQuotes: string[]
} {
  const hitRows = hits.map((h) => ({
    id: '',
    term: h.term,
    count: 0,
    description: h.description ?? '',
  }))
  const structured = structuredConclusionsFromTranscript(transcript, hitRows)
  const inspirations = structuredInspirationsFromTranscript(transcript, hitRows)
  if (structured.length > 0 || inspirations.length > 0) {
    return {
      keyPoints: structured.length ? structured : keyPointsFromTranscript(transcript),
      goldenQuotes: inspirations.length
        ? inspirations
        : goldenQuotesFromTranscript(transcript),
    }
  }
  return {
    keyPoints: keyPointsFromTranscript(transcript),
    goldenQuotes: goldenQuotesFromTranscript(transcript),
  }
}

/** 有转写时：结论/要点来自转写，而非预置课标命中 */
function keyPointsFromTranscript(transcript: string): string[] {
  const trimmed = transcript.trim()
  if (!trimmed) return []
  const paragraphs = splitTranscriptParagraphs(trimmed)
  if (paragraphs.length >= 1) {
    return paragraphs.slice(0, 6).map((p) =>
      p.length > 160 ? `${p.slice(0, 157)}…` : p
    )
  }
  return splitTranscriptSentences(trimmed)
    .filter((s) => s.length >= 12)
    .slice(0, 6)
}

function goldenQuotesFromTranscript(transcript: string): string[] {
  return splitTranscriptSentences(transcript)
    .filter((s) => s.length >= 10 && s.length <= 120)
    .slice(0, 5)
}

function knowledgeHitsInTranscript(
  ctx: LessonSummaryContext
): LessonSummaryContext['knowledgeHits'] {
  const t = ctx.transcript
  if (!t.trim()) return ctx.knowledgeHits
  return ctx.knowledgeHits.filter((h) => t.includes(h.term))
}

function buildFullMarkdown(
  ctx: LessonSummaryContext,
  partial: Omit<LessonSummary, 'generatedAt' | 'fullMarkdown'>
): string {
  const sections = [
    `# ${ctx.lessonTitle} · 学习总结`,
    '',
    '## 课程核心与摘要',
    partial.coreSummary || partial.keyPoints.map((p) => `- ${p}`).join('\n'),
    '',
    '## 课程重点',
    partial.lessonFocus || '',
    '',
    '## 课堂笔记',
    partial.notesReading || partial.notesMarkdown,
    '',
    '## 课程行动',
    ...(partial.actionItems ?? []).map((a) => `- ${a}`),
  ]
  return sections.join('\n')
}

function buildFallbackSummary(ctx: LessonSummaryContext): LessonSummary {
  const hasTranscript = ctx.transcript.trim().length > 0
  const hitsForSummary = hasTranscript
    ? knowledgeHitsInTranscript(ctx)
    : ctx.knowledgeHits

  const keyPoints = hasTranscript
    ? structuredConclusionsFromTranscript(ctx.transcript, hitsForSummary)
    : ctx.knowledgeHits.length > 0
      ? ctx.knowledgeHits
          .slice(0, 5)
          .map((h) => `${h.term}：${h.description}`)
      : []

  const goldenQuotes = hasTranscript
    ? structuredInspirationsFromTranscript(ctx.transcript, hitsForSummary)
    : []

  const knowledgeMarkdown =
    hitsForSummary.length > 0
      ? hitsForSummary
          .map((h) => `- **${h.term}**（${h.count} 次）：${h.description}`)
          .join('\n')
      : hasTranscript
        ? '_本段转写未命中预置课标词条，课程重点以上述转写内容为准。_'
        : '_暂无转写与知识点命中，请先开始聆听或播放演示转写。_'

  const focusLines: string[] = []
  if (ctx.viewedKnowledge.length) {
    focusLines.push(
      '**点击过的知识点**',
      ...ctx.viewedKnowledge.map((k) => `- ${k.term}`)
    )
  }
  if (ctx.addedKnowledge.length) {
    focusLines.push(
      '**本课新增知识点**',
      ...ctx.addedKnowledge.map((k) => `- ${k.term}：${k.description}`)
    )
  }
  if (ctx.explainRequests.length) {
    focusLines.push(
      '**请求解释的片段**',
      ...ctx.explainRequests.map((e) => `- 「${e.selectedText}」`)
    )
  }
  const userFocusMarkdown =
    focusLines.length > 0 ? focusLines.join('\n') : '_本课暂无点击、新增或求解释记录。_'

  const notesMarkdown =
    ctx.notes.length > 0
      ? ctx.notes.map((n) => `- ${n.content.slice(0, 200)}`).join('\n')
      : '_暂无笔记。_'

  const actionItems = buildExerciseActionItems(ctx)

  const mindMap = {
    label: centerLabelFromLessonTitle(ctx.lessonTitle),
    children: [] as MindMapNode['children'],
  }

  const coreSummary =
    ctx.transcript.trim().length > 0
      ? `本课围绕 **${ctx.lessonTitle}** 展开。${ctx.transcript.slice(0, 280).trim()}${ctx.transcript.length > 280 ? '…' : ''}\n\n${keyPoints.length > 0 ? `主线包括：${keyPoints.slice(0, 3).join('；')}。` : ''}`
      : `本课 **${ctx.lessonTitle}** 暂无完整转写，摘要主要依据你的笔记与互动记录。`

  const lessonFocusParts: string[] = []
  if (keyPoints.length) {
    lessonFocusParts.push(
      '### 课堂结论',
      ...keyPoints.map((p) => `- ${p}`)
    )
  }
  if (goldenQuotes.length) {
    lessonFocusParts.push(
      '',
      '### 内容启发',
      ...goldenQuotes.map((q) => `- ${q}`)
    )
  }
  if (hitsForSummary.length) {
    lessonFocusParts.push(
      '',
      '### 知识点线索',
      ...hitsForSummary
        .slice(0, 6)
        .map((h) => `- **${h.term}**（${h.count} 次）— ${h.description}`)
    )
  }
  const lessonFocus =
    lessonFocusParts.join('\n') || '_建议完成转写后重新生成，以获得更完整的课堂重点。_'

  const notesReading =
    ctx.notes.length > 0
      ? ctx.notes
          .map((n, i) => {
            const lead = n.selectedText
              ? `关于「${n.selectedText}」：`
              : `笔记 ${i + 1}：`
            return `${lead}${n.content}`
          })
          .join('\n\n')
      : notesMarkdown.replace(/^- /gm, '').replace(/\n/g, '\n\n')

  const lessonFocusStructured = {
    conclusions: keyPoints,
    inspirations: goldenQuotes,
    knowledgeClues: hitsForSummary.slice(0, 8).map((h) => ({
      term: h.term,
      count: h.count,
      detail: h.description,
    })),
  }

  const partial = {
    coreSummary,
    lessonFocus,
    lessonFocusStructured,
    notesReading,
    actionItems: actionItems.slice(0, 6),
    keyPoints,
    goldenQuotes,
    knowledgeMarkdown,
    userFocusMarkdown,
    notesMarkdown,
    mindMap,
  }

  return {
    ...partial,
    generatedAt: Date.now(),
    fullMarkdown: buildFullMarkdown(ctx, partial),
  }
}

export async function generateLessonSummary(
  ctx: LessonSummaryContext
): Promise<LessonSummary> {
  if (isLlmConfigured() && ctx.transcript.trim().length > 0) {
    try {
      const raw = await chatJson([
        { role: 'system', content: getSystemPromptForTask('lesson_summary') },
        { role: 'user', content: summaryUserPrompt(ctx) },
      ])
      const partial = parseSummaryJson(raw)
      const hits = knowledgeHitsInTranscript(ctx)
      const actionItems =
        (partial.actionItems?.length ?? 0) > 0
          ? partial.actionItems!
          : buildExerciseActionItems(ctx)
      const keyPoints =
        partial.keyPoints.some((p) => p.length > 72) && ctx.transcript.trim()
          ? structuredConclusionsFromTranscript(ctx.transcript, hits)
          : partial.keyPoints
      const goldenQuotes =
        partial.goldenQuotes.some((q) => looksLikeOralTranscriptLine(q)) &&
        ctx.transcript.trim()
          ? structuredInspirationsFromTranscript(ctx.transcript, hits)
          : partial.goldenQuotes

      const merged = {
        ...partial,
        actionItems,
        keyPoints,
        goldenQuotes,
        mindMap: {
          label: centerLabelFromLessonTitle(ctx.lessonTitle),
          children: [],
        },
        lessonFocusStructured: {
          conclusions: keyPoints,
          inspirations: goldenQuotes,
          knowledgeClues: hits.map((h) => ({
            term: h.term,
            count: h.count,
            detail: h.description,
          })),
        },
      }
      return {
        ...merged,
        generatedAt: Date.now(),
        fullMarkdown: buildFullMarkdown(ctx, merged),
      }
    } catch {
      /* fallback */
    }
  }

  await new Promise((r) => setTimeout(r, 600))
  return buildFallbackSummary(ctx)
}
