import type { PromptScene, PromptTemplate } from '../types/admin'
import {
  loadPromptLibrary,
  loadTaskMappings,
  savePromptLibrary,
  saveTaskMappings,
  tasksForPromptScene,
} from './adminStore'

export function bumpVersionLabel(current: string): string {
  const dotted = current.match(/^(.+\.)(\d+)$/)
  if (dotted) return `${dotted[1]}${Number(dotted[2]) + 1}`
  return `${current}.${Date.now().toString(36).slice(-4)}`
}

export function savePromptAsNewVersion(
  base: PromptTemplate,
  draft: Pick<
    PromptTemplate,
    'name' | 'versionLabel' | 'systemPrompt' | 'userPromptTemplate' | 'notes'
  >
): PromptTemplate {
  const now = Date.now()
  const created: PromptTemplate = {
    ...base,
    ...draft,
    id: `prompt-${now.toString(36)}`,
    versionLabel: bumpVersionLabel(base.versionLabel),
    status: 'draft',
    basedOnId: base.id,
    updatedAt: now,
    publishedAt: undefined,
    testScore: undefined,
    testPassCount: undefined,
    testTotalCount: undefined,
    testRunAt: undefined,
    testMessage: undefined,
  }
  const library = [...loadPromptLibrary(), created]
  savePromptLibrary(library)
  return created
}

export function publishPromptVersion(promptId: string): PromptTemplate | null {
  const library = loadPromptLibrary()
  const target = library.find((p) => p.id === promptId)
  if (!target || target.status !== 'draft') return null

  const now = Date.now()
  const nextLibrary = library.map((p) => {
    if (p.id === promptId) {
      return { ...p, status: 'published' as const, publishedAt: now, updatedAt: now }
    }
    if (p.scene === target.scene && p.status === 'published') {
      return { ...p, status: 'archived' as const }
    }
    return p
  })
  savePromptLibrary(nextLibrary)

  const taskIds = new Set(tasksForPromptScene(target.scene))
  const mappings = loadTaskMappings().map((m) =>
    taskIds.has(m.task) ? { ...m, promptVersionId: promptId } : m
  )
  saveTaskMappings(mappings)
  return nextLibrary.find((p) => p.id === promptId) ?? null
}

export function rollbackPromptScene(scene: PromptScene): PromptTemplate | null {
  const library = loadPromptLibrary()
  const published = library.find(
    (p) => p.scene === scene && p.status === 'published'
  )
  if (!published) return null

  const previous = library
    .filter((p) => p.scene === scene && p.status === 'archived')
    .sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0))[0]
  if (!previous) return null

  const now = Date.now()
  const nextLibrary = library.map((p) => {
    if (p.id === published.id) {
      return { ...p, status: 'archived' as const }
    }
    if (p.id === previous.id) {
      return {
        ...p,
        status: 'published' as const,
        publishedAt: now,
        updatedAt: now,
      }
    }
    return p
  })
  savePromptLibrary(nextLibrary)

  const taskIds = new Set(tasksForPromptScene(scene))
  const mappings = loadTaskMappings().map((m) =>
    taskIds.has(m.task) ? { ...m, promptVersionId: previous.id } : m
  )
  saveTaskMappings(mappings)
  return nextLibrary.find((p) => p.id === previous.id) ?? null
}

export function getPublishedPromptForScene(
  scene: PromptScene
): PromptTemplate | undefined {
  return loadPromptLibrary().find(
    (p) => p.scene === scene && p.status === 'published'
  )
}
