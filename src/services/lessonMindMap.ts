import type { LessonHistoryLink, MindMapNode } from '../types'
import type { LessonSummaryContext } from './lessonSummaryContext'

const ORAL_META =
  /(这节课|本节课|第一单元|七年级|八年级|九年级|大家好|准备好|以往|新加|没有的内容|我们这一节|原来我们)/

const ORAL_PREFIX =
  /^(首先|其次|然后|所以|那么|就是说|其实|也就是说|大家|同学们?|我们)(要|需要|必须|应该|得)?/

function truncate(s: string, max: number): string {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

function splitSentences(transcript: string): string[] {
  return transcript
    .split(/[。！？；\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 10)
}

function splitParagraphs(transcript: string): string[] {
  return transcript
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12)
}

function knowledgeHitsInTranscript(
  ctx: LessonSummaryContext
): LessonSummaryContext['knowledgeHits'] {
  const t = ctx.transcript
  if (!t.trim()) return ctx.knowledgeHits
  return ctx.knowledgeHits.filter((h) => t.includes(h.term))
}

function scoreSentence(s: string, terms: string[]): number {
  let score = 0
  if (ORAL_META.test(s)) score -= 6
  if (/因为|因此|所以|本质|定义|分为|关键|推动|转变|标志着|根本原因|生产力|生产关系/.test(s))
    score += 4
  if (s.length >= 18 && s.length <= 90) score += 2
  if (s.length > 140) score -= 3
  for (const term of terms) {
    if (s.includes(term)) score += 5
  }
  return score
}

/** 口语转写 → 脑图/要点用的书面短句 */
export function phraseFromTranscriptLine(raw: string): string {
  let t = raw.trim().replace(ORAL_PREFIX, '')
  const defined = t.match(/(?:是指|就是|即|本质是|定义为)([^。；，]{4,48})/)
  if (defined) t = defined[1].trim()
  t = t
    .replace(/^(关于|对于|从|在).{0,8}(方面|角度|来说)/, '')
    .replace(/\s+/g, '')
  if (t.length > 52) {
    const cut = t.match(/^[^，,；;]{8,52}/)
    if (cut) t = cut[0]
  }
  return truncate(t, 48)
}

/** 结构化课堂结论（非转写原文拼接） */
export function structuredConclusionsFromTranscript(
  transcript: string,
  hits: LessonSummaryContext['knowledgeHits']
): string[] {
  const terms = hits.map((h) => h.term)
  const seen = new Set<string>()
  const ranked = splitSentences(transcript)
    .filter((s) => scoreSentence(s, terms) > -2)
    .sort((a, b) => scoreSentence(b, terms) - scoreSentence(a, terms))

  const out: string[] = []
  for (const s of ranked) {
    const phrase = phraseFromTranscriptLine(s)
    if (phrase.length < 8 || seen.has(phrase)) continue
    if (ORAL_META.test(phrase) && !terms.some((t) => phrase.includes(t))) continue
    seen.add(phrase)
    out.push(phrase)
    if (out.length >= 6) break
  }
  return out
}

/** 内容启发：偏方法、规律、记忆要点 */
export function structuredInspirationsFromTranscript(
  transcript: string,
  hits: LessonSummaryContext['knowledgeHits']
): string[] {
  const terms = hits.map((h) => h.term)
  const ranked = splitSentences(transcript)
    .filter((s) =>
      /记住|根本|关键|意义|启示|理解|推动|转变|标志|规律|方法|本质/.test(s)
    )
    .sort((a, b) => scoreSentence(b, terms) - scoreSentence(a, terms))

  const seen = new Set<string>()
  const out: string[] = []
  for (const s of ranked) {
    const phrase = phraseFromTranscriptLine(s)
    if (phrase.length < 8 || seen.has(phrase)) continue
    seen.add(phrase)
    out.push(phrase)
    if (out.length >= 5) break
  }
  return out
}

export function isLegacyFlatMindMap(root: MindMapNode): boolean {
  const top = root.children?.map((c) => c.label) ?? []
  const legacyLayout =
    (top.includes('要点') && top.includes('金句')) ||
    (top.includes('课堂结论') && top.includes('内容启发')) ||
    (top.includes('课堂主线') && top.includes('核心概念')) ||
    (top.includes('内容结构') && !top.some((l) => l.includes('知识点')))
  return legacyLayout
}

function sectionTitleFromParagraph(p: string, terms: string[]): string {
  for (const term of terms) {
    if (p.includes(term)) return term
  }
  const first = phraseFromTranscriptLine(p.slice(0, 80))
  return truncate(first, 12)
}

function transcriptPointsForTerm(
  transcript: string,
  term: string,
  allTerms: string[]
): string[] {
  const seen = new Set<string>()
  const ranked = splitSentences(transcript)
    .filter((s) => s.includes(term))
    .sort((a, b) => scoreSentence(b, allTerms) - scoreSentence(a, allTerms))

  const out: string[] = []
  for (const s of ranked) {
    const phrase = phraseFromTranscriptLine(s)
    if (phrase.length < 6 || seen.has(phrase)) continue
    if (looksLikeOralTranscriptLine(phrase) && !phrase.includes(term)) continue
    seen.add(phrase)
    out.push(truncate(phrase, 42))
    if (out.length >= 3) break
  }
  return out
}

/** 以课标知识点为主干，挂载转写提炼的讲解要点 */
function buildKnowledgePointBranch(
  hits: LessonSummaryContext['knowledgeHits'],
  transcript: string
): MindMapNode | null {
  if (hits.length === 0) return null
  const terms = hits.map((h) => h.term)
  const hasTranscript = transcript.trim().length > 0

  return {
    label: '知识点',
    children: hits.slice(0, 8).map((h) => {
      const lecture = hasTranscript
        ? transcriptPointsForTerm(transcript, h.term, terms)
        : []
      const childNodes: MindMapNode[] = [
        {
          label: '课标释义',
          children: [{ label: truncate(h.description, 44) }],
        },
      ]
      if (lecture.length > 0) {
        childNodes.push({
          label: '课堂讲解',
          children: lecture.map((label) => ({ label })),
        })
      }
      const countHint = h.count > 0 ? `（${h.count} 次）` : ''
      return {
        label: `${h.term}${countHint}`,
        children: childNodes,
      }
    }),
  }
}

function buildKnowledgeRelationBranch(
  hits: LessonSummaryContext['knowledgeHits'],
  mainline: string[]
): MindMapNode | null {
  if (hits.length < 2 && mainline.length < 2) return null
  const chain =
    hits.length >= 2
      ? hits.slice(0, 6).map((h) => h.term)
      : mainline.slice(0, 4).map((l) => truncate(l, 16))

  return {
    label: '知识脉络',
    children: [
      {
        label: '讲述顺序',
        children: chain.map((label, i) => ({
          label: i === 0 ? label : `→ ${label}`,
        })),
      },
      ...mainline
        .filter((l) => /推动|转变|因果|阶段|发展|联系|区别/.test(l))
        .slice(0, 3)
        .map((label) => ({ label: truncate(label, 42) })),
    ],
  }
}

function clusterContentStructure(
  transcript: string,
  hits: LessonSummaryContext['knowledgeHits']
): MindMapNode[] {
  const terms = hits.map((h) => h.term)
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

  return chunks.slice(0, 4).map((chunk) => {
    const points = structuredConclusionsFromTranscript(chunk, hits).slice(0, 3)
    return {
      label: sectionTitleFromParagraph(chunk, terms),
      children: (points.length ? points : [phraseFromTranscriptLine(chunk)]).map(
        (label) => ({ label: truncate(label, 40) })
      ),
    }
  })
}

export function centerLabelFromLessonTitle(lessonTitle: string): string {
  const t = lessonTitle
    .replace(/^第\d+课[：:\s]*/, '')
    .replace(/·\s*\d{1,2}月\d{1,2}日.*$/, '')
    .trim()
  return truncate(t || lessonTitle, 20)
}

export function buildStructuredMindMap(
  ctx: LessonSummaryContext,
  actionItems: string[],
  historyLinks: LessonHistoryLink[]
): MindMapNode {
  const hits = knowledgeHitsInTranscript(ctx)
  const hasTranscript = ctx.transcript.trim().length > 0
  const mainline = hasTranscript
    ? structuredConclusionsFromTranscript(ctx.transcript, hits)
    : []

  const children: MindMapNode[] = []

  const kpBranch = buildKnowledgePointBranch(hits, ctx.transcript)
  if (kpBranch) children.push(kpBranch)

  if (mainline.length > 0) {
    children.push({
      label: '转写摘要',
      children: mainline.slice(0, 5).map((label) => ({ label: truncate(label, 42) })),
    })
  }

  const relation = buildKnowledgeRelationBranch(hits, mainline)
  if (relation) children.push(relation)

  if (hasTranscript) {
    const structure = clusterContentStructure(ctx.transcript, hits)
    if (structure.length >= 2) {
      children.push({ label: '章节结构', children: structure })
    }
  }

  if (actionItems.length > 0) {
    children.push({
      label: '课后巩固',
      children: actionItems.slice(0, 3).map((a) => ({
        label: truncate(a.replace(/^【[^】]+】\s*/, ''), 44),
      })),
    })
  }

  if (historyLinks.length > 0) {
    children.push({
      label: '历史关联',
      children: historyLinks
        .slice(0, 5)
        .map((l) => ({ label: truncate(l.lessonTitle, 32) })),
    })
  }

  return {
    label: centerLabelFromLessonTitle(ctx.lessonTitle),
    children: children.length ? children : [{ label: '待补充转写后生成' }],
  }
}

/** LLM 返回的脑图是否像「转写摘句」而非提炼结构 */
export function looksLikeOralTranscriptLine(s: string): boolean {
  return (
    s.length > 72 ||
    ORAL_META.test(s) ||
    /所以说|我们这节|以往的时候|里面新加/.test(s)
  )
}

export function mindMapLooksLikeRawTranscript(root: MindMapNode): boolean {
  const labels: string[] = []
  const walk = (n: MindMapNode) => {
    labels.push(n.label)
    n.children?.forEach(walk)
  }
  walk(root)
  const oral = labels.filter(
    (l) =>
      l.length > 55 ||
      ORAL_META.test(l) ||
      /所以说|我们这节|以往的时候|里面新加/.test(l)
  )
  return oral.length >= 2
}

/** 思维导图应以「知识点」为主干 */
export function mindMapNeedsKnowledgeRestructure(root: MindMapNode): boolean {
  if (isLegacyFlatMindMap(root)) return true
  if (mindMapLooksLikeRawTranscript(root)) return true
  const top = root.children?.map((c) => c.label) ?? []
  return !top.some((l) => l === '知识点' || l.startsWith('知识点'))
}

export function mergeMindMapWithExtras(
  root: MindMapNode,
  actionItems: string[],
  historyLinks: LessonHistoryLink[]
): MindMapNode {
  const children = [...(root.children ?? [])]
  const has = (name: string) => children.some((c) => c.label === name)

  if (actionItems.length > 0 && !has('课后巩固') && !has('课后习题')) {
    children.push({
      label: '课后巩固',
      children: actionItems.slice(0, 4).map((a) => ({
        label: truncate(a.replace(/^【[^】]+】\s*/, ''), 44),
      })),
    })
  }

  if (historyLinks.length > 0 && !has('历史关联')) {
    children.push({
      label: '历史关联',
      children: historyLinks
        .slice(0, 5)
        .map((l) => ({ label: truncate(l.lessonTitle, 32) })),
    })
  }

  return { ...root, children }
}
