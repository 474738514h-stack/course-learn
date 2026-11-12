import type { KnowledgePoint } from '../types'
import { LIBRARY_TAG, type AiLibraryId } from './aiKnowledgeBundle'

export type LibraryTier = 'free' | 'unlocked'

export interface KnowledgeLibrary {
  id: AiLibraryId
  title: string
  fullTitle: string
  cardDescription: string
  detailDescription: string
  audience: string
  tier: LibraryTier
  validUntilLabel?: string
}

export const KNOWLEDGE_LIBRARIES: KnowledgeLibrary[] = [
  {
    id: 'ai-pm',
    title: 'AI产品经理知识库',
    fullTitle: 'AI产品经理知识库',
    cardDescription:
      '130+ 基础名词：RAG、Agent、MCP、向量库、PMF 与合规等，含查漏补缺词条。',
    detailDescription:
      '面向 AI PM 的需求、体验与协作术语，课堂转写与划词解释可自动命中。',
    audience: 'AI 产品经理、产品运营',
    tier: 'free',
  },
  {
    id: 'ai-eng',
    title: 'AI工程落地知识库',
    fullTitle: 'AI工程落地知识库',
    cardDescription:
      '50 个工程名词：RAG、MCP、微调、可观测性、灰度发布等。',
    detailDescription:
      '覆盖模型链路、数据、评测与上线运维，供研发与产品对齐概念。',
    audience: 'AI 工程师、全栈、平台团队',
    tier: 'free',
  },
  {
    id: 'ai-growth',
    title: 'AI商业化增长知识库',
    fullTitle: 'AI商业化增长知识库',
    cardDescription:
      '50 个商业名词：GTM、PLG、定价、留存、企业销售等。',
    detailDescription:
      '从获客、变现到续费的增长与商业化术语，支撑业务与产品讨论。',
    audience: '增长、商业化、创始人',
    tier: 'free',
  },
]

/** 兼容旧课程绑定的语数史 / core 等 id */
export function normalizeLibraryId(id: string): string {
  if (id === 'core' || id === 'chinese') return 'ai-pm'
  if (id === 'science' || id === 'math') return 'ai-eng'
  if (id === 'humanities' || id === 'history') return 'ai-growth'
  if (id in LIBRARY_TAG) return id
  return id
}

export function filterPointsByLibrary(
  points: KnowledgePoint[],
  libraryId: string
): KnowledgePoint[] {
  const lib = normalizeLibraryId(libraryId) as AiLibraryId
  const tag = LIBRARY_TAG[lib]
  if (tag) {
    return points.filter((kp) => kp.tags.includes(tag))
  }
  return points.filter((kp) => kp.category === 'custom')
}

export function getLibraryById(id: string): KnowledgeLibrary | undefined {
  const lib = normalizeLibraryId(id) as AiLibraryId
  return KNOWLEDGE_LIBRARIES.find((l) => l.id === lib)
}

/** 当前课程绑定的识别词条（保留用户自定义词条） */
export function knowledgePointsForCourse(
  allPoints: KnowledgePoint[],
  libraryId?: string
): KnowledgePoint[] {
  if (!libraryId) return allPoints
  const libSet = new Set(
    filterPointsByLibrary(allPoints, libraryId).map((p) => p.id)
  )
  return allPoints.filter(
    (p) => p.category === 'custom' || libSet.has(p.id)
  )
}
