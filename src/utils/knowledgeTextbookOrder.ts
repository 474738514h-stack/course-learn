import { AI_PM_KNOWLEDGE_POINTS } from '../data/aiPmKnowledgePoints'
import { AI_ENG_KNOWLEDGE_POINTS } from '../data/aiEngKnowledgePoints'
import { AI_GROWTH_KNOWLEDGE_POINTS } from '../data/aiGrowthKnowledgePoints'
import type { KnowledgePoint } from '../types'

const ORDER_BY_ID = new Map<string, number>()
;[AI_PM_KNOWLEDGE_POINTS, AI_ENG_KNOWLEDGE_POINTS, AI_GROWTH_KNOWLEDGE_POINTS]
  .flat()
  .forEach((kp, index) => {
    ORDER_BY_ID.set(kp.id, index)
  })

function orderIndex(kp: KnowledgePoint): number {
  return ORDER_BY_ID.get(kp.id) ?? Number.MAX_SAFE_INTEGER
}

/** 三本 AI 知识库预设顺序；自定义词条排在最后按名称 */
export function compareKnowledgeTextbookOrder(
  a: KnowledgePoint,
  b: KnowledgePoint
): number {
  const ia = orderIndex(a)
  const ib = orderIndex(b)
  if (ia !== ib) return ia - ib
  return a.term.localeCompare(b.term, 'zh-CN')
}

export function sortKnowledgeByTextbookOrder(
  points: KnowledgePoint[]
): KnowledgePoint[] {
  return [...points].sort(compareKnowledgeTextbookOrder)
}
