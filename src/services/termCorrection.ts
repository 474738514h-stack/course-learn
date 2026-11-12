import type { TermCorrection } from '../types/admin'
import { loadTermCorrections } from './adminStore'
import { normalizeLibraryId } from '../data/knowledgeLibraries'
import type { AiLibraryId } from '../data/aiKnowledgeBundle'

function scopeFromLibrary(
  libraryId?: string
): TermCorrection['scope'] | 'global' {
  if (!libraryId) return 'global'
  const lib = normalizeLibraryId(libraryId)
  if (lib === 'ai-pm' || lib === 'ai-eng' || lib === 'ai-growth') return lib
  return 'global'
}

export function applyTermCorrections(text: string, libraryId?: string): string {
  const list = loadTermCorrections().filter((t) => t.enabled)
  const scope = scopeFromLibrary(libraryId)
  let out = text
  for (const row of list) {
    if (row.scope !== 'global' && row.scope !== scope) continue
    out = out.split(row.wrong).join(row.correct)
  }
  return out
}

/** 供运营配置展示 */
export function libraryIdForScope(scope: TermCorrection['scope']): AiLibraryId | null {
  if (scope === 'global') return null
  return scope
}
