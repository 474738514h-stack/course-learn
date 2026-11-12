import type { KnowledgeRelease } from '../types/admin'
import {
  getActiveKnowledgeRelease,
  loadKnowledgeReleases,
  saveKnowledgeReleases,
  setActiveKnowledgeRelease,
} from './adminStore'
import {
  getReleaseKnowledgePoints,
  normalizeUploadedPoint,
  parseKnowledgeUploadJson,
  saveReleaseSnapshot,
} from './knowledgeSnapshotStore'

export function importKnowledgeReleaseFromJson(
  raw: string,
  fileName?: string
): KnowledgeRelease {
  const payload = parseKnowledgeUploadJson(raw)
  const points = payload.points.map((p, i) => normalizeUploadedPoint(p, i))
  if (points.length === 0) throw new Error('词条列表为空')

  const id = `kb-upload-${Date.now().toString(36)}`
  const release: KnowledgeRelease = {
    id,
    versionLabel:
      payload.versionLabel ??
      `upload.${new Date().toISOString().slice(0, 10)}`,
    title: payload.title ?? (fileName ? `上传 · ${fileName}` : '上传资料'),
    libraryIds: payload.libraryIds?.length
      ? payload.libraryIds
      : inferLibraryIds(points),
    sourceRef: payload.sourceRef ?? `upload:${fileName ?? 'manual.json'}`,
    termCount: points.length,
    publishedAt: Date.now(),
    isActive: false,
    notes: '由运营后台上传 JSON 导入',
  }

  saveReleaseSnapshot(id, points)
  saveKnowledgeReleases([...loadKnowledgeReleases(), release])
  return release
}

function inferLibraryIds(points: { tags: string[] }[]): string[] {
  const libs = new Set<string>()
  for (const p of points) {
    if (p.tags.includes('AI产品经理知识库')) libs.add('ai-pm')
    if (p.tags.includes('AI工程落地知识库')) libs.add('ai-eng')
    if (p.tags.includes('AI商业化增长知识库')) libs.add('ai-growth')
  }
  return libs.size > 0 ? [...libs] : ['ai-pm', 'ai-eng', 'ai-growth']
}

export function exportActiveKnowledgeJson(): string {
  const active = getActiveKnowledgeRelease()
  const points = getReleaseKnowledgePoints()
  return JSON.stringify(
    {
      title: active?.title ?? '知识库导出',
      versionLabel: active?.versionLabel,
      libraryIds: active?.libraryIds,
      points,
    },
    null,
    2
  )
}

export function activateImportedRelease(releaseId: string): void {
  setActiveKnowledgeRelease(releaseId)
}
