import type { KnowledgePoint } from '../types'
import { AI_PM_KNOWLEDGE_POINTS } from './aiPmKnowledgePoints'
import { AI_ENG_KNOWLEDGE_POINTS } from './aiEngKnowledgePoints'
import { AI_GROWTH_KNOWLEDGE_POINTS } from './aiGrowthKnowledgePoints'

export const LIBRARY_TAG = {
  'ai-pm': 'AI产品经理知识库',
  'ai-eng': 'AI工程落地知识库',
  'ai-growth': 'AI商业化增长知识库',
} as const

export type AiLibraryId = keyof typeof LIBRARY_TAG

export const BUNDLED_AI_KNOWLEDGE_POINTS: KnowledgePoint[] = [
  ...AI_PM_KNOWLEDGE_POINTS,
  ...AI_ENG_KNOWLEDGE_POINTS,
  ...AI_GROWTH_KNOWLEDGE_POINTS,
]

export const TEXTBOOK_KNOWLEDGE_SOURCE = {
  id: 'ai-triple-knowledge-2026',
  title: 'AI 产品经理 / 工程落地 / 商业化增长',
  libraries: Object.values(LIBRARY_TAG),
  termCount: BUNDLED_AI_KNOWLEDGE_POINTS.length,
}
