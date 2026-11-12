import { BUNDLED_AI_KNOWLEDGE_POINTS } from '../data/aiKnowledgeBundle'
import type { KnowledgePoint } from '../types'
import { getActiveKnowledgeRelease } from './adminStore'
import { loadFromStorage, saveToStorage } from '../utils/storage'

const KEY_PREFIX = 'p0-knowledge-snapshot-'

export function loadReleaseSnapshot(releaseId: string): KnowledgePoint[] | null {
  return loadFromStorage<KnowledgePoint[] | null>(
    KEY_PREFIX + releaseId,
    null
  )
}

export function saveReleaseSnapshot(
  releaseId: string,
  points: KnowledgePoint[]
): void {
  saveToStorage(KEY_PREFIX + releaseId, points)
}

/** 当前线上 release 的词条；无上传快照时用打包三本 AI 知识库 */
export function getReleaseKnowledgePoints(): KnowledgePoint[] {
  const active = getActiveKnowledgeRelease()
  if (!active) return BUNDLED_AI_KNOWLEDGE_POINTS
  const snap = loadReleaseSnapshot(active.id)
  if (snap && snap.length > 0) return snap
  return BUNDLED_AI_KNOWLEDGE_POINTS
}

export type KnowledgeUploadPayload = {
  title?: string
  versionLabel?: string
  libraryIds?: string[]
  sourceRef?: string
  points: KnowledgePoint[]
}

export function parseKnowledgeUploadJson(raw: string): KnowledgeUploadPayload {
  const data = JSON.parse(raw) as KnowledgeUploadPayload | KnowledgePoint[]
  if (Array.isArray(data)) {
    return { points: data }
  }
  if (!data.points || !Array.isArray(data.points)) {
    throw new Error('JSON 须为词条数组，或含 points 字段的对象')
  }
  return data
}

export function normalizeUploadedPoint(
  p: KnowledgePoint,
  index: number
): KnowledgePoint {
  if (!p.term?.trim()) {
    throw new Error(`第 ${index + 1} 条缺少 term`)
  }
  return {
    id: p.id?.trim() || `upload-${Date.now()}-${index}`,
    term: p.term.trim(),
    aliases: Array.isArray(p.aliases) ? p.aliases : [],
    category: p.category === 'custom' ? 'custom' : 'preset',
    description: p.description?.trim() || p.term,
    detail: p.detail?.trim() || p.description?.trim() || '',
    relatedTerms: Array.isArray(p.relatedTerms) ? p.relatedTerms : [],
    tags: Array.isArray(p.tags) ? p.tags : ['AI产品经理知识库'],
  }
}
