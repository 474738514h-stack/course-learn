import type { KnowledgePoint } from '../types'
import { LIBRARY_TAG } from './aiKnowledgeBundle'
import { sortKnowledgeByTextbookOrder } from '../utils/knowledgeTextbookOrder'

export type KnowledgeCategoryId = 'math' | 'science' | 'language' | 'society'

export const KNOWLEDGE_CATEGORIES: {
  id: KnowledgeCategoryId
  title: string
  color: string
  dotClass: string
}[] = [
  {
    id: 'math',
    title: 'AI 产品',
    color: 'from-violet-500 to-indigo-600',
    dotClass: 'bg-violet-500',
  },
  {
    id: 'science',
    title: 'AI 工程',
    color: 'from-emerald-500 to-teal-600',
    dotClass: 'bg-emerald-500',
  },
  {
    id: 'language',
    title: 'AI 增长',
    color: 'from-blue-500 to-cyan-500',
    dotClass: 'bg-blue-500',
  },
  {
    id: 'society',
    title: '其他',
    color: 'from-amber-500 to-orange-500',
    dotClass: 'bg-amber-500',
  },
]

export function categorizeKnowledgePoint(kp: KnowledgePoint): KnowledgeCategoryId {
  if (kp.tags.includes(LIBRARY_TAG['ai-pm'])) return 'math'
  if (kp.tags.includes(LIBRARY_TAG['ai-eng'])) return 'science'
  if (kp.tags.includes(LIBRARY_TAG['ai-growth'])) return 'language'
  return 'society'
}

export function groupKnowledgePoints(points: KnowledgePoint[]) {
  const groups: Record<KnowledgeCategoryId, KnowledgePoint[]> = {
    math: [],
    science: [],
    language: [],
    society: [],
  }
  for (const kp of points) {
    groups[categorizeKnowledgePoint(kp)].push(kp)
  }
  return {
    math: sortKnowledgeByTextbookOrder(groups.math),
    science: sortKnowledgeByTextbookOrder(groups.science),
    language: sortKnowledgeByTextbookOrder(groups.language),
    society: sortKnowledgeByTextbookOrder(groups.society),
  }
}
