import type { LessonHistoryLink, LessonSummary, MindMapNode } from '../types'

function truncate(label: string, max = 36): string {
  const t = label.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

export function buildReviewMindMap(
  centerLabel: string,
  summary: LessonSummary,
  hitRows: { term: string; count: number }[],
  historyLinks: LessonHistoryLink[],
  actionItems: string[]
): MindMapNode {
  const structured = summary.lessonFocusStructured
  const conclusions =
    structured?.conclusions.length
      ? structured.conclusions
      : summary.keyPoints
  const inspirations =
    structured?.inspirations.length
      ? structured.inspirations
      : summary.goldenQuotes

  const clueLabels =
    structured?.knowledgeClues.map((c) =>
      c.count != null ? `${c.term}（${c.count}）` : c.term
    ) ??
    hitRows.slice(0, 8).map((h) => `${h.term}（${h.count}）`)

  const actionLabels = actionItems.slice(0, 5).map((a) => truncate(a, 40))
  const historyLabels =
    historyLinks.length > 0
      ? historyLinks.slice(0, 5).map((l) => truncate(l.lessonTitle, 32))
      : ['暂无跨课关联']

  return {
    label: truncate(centerLabel, 28),
    children: [
      {
        label: '课堂结论',
        children: (conclusions.length ? conclusions : ['待生成']).map((t) => ({
          label: truncate(t, 40),
        })),
      },
      {
        label: '内容启发',
        children: (inspirations.length ? inspirations : ['待生成']).map((t) => ({
          label: truncate(t, 40),
        })),
      },
      {
        label: '知识点线索',
        children: (clueLabels.length ? clueLabels : ['暂无命中']).map((t) => ({
          label: truncate(t, 32),
        })),
      },
      {
        label: '课后习题',
        children: (actionLabels.length ? actionLabels : ['待生成习题']).map(
          (t) => ({ label: t })
        ),
      },
      {
        label: '历史关联',
        children: historyLabels.map((t) => ({ label: t })),
      },
    ],
  }
}
