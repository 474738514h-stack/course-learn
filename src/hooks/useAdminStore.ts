import { useCallback, useState } from 'react'
import type { KnowledgePoint } from '../types'
import type {
  AITask,
  ModelRouteProfile,
  PromptTemplate,
  TaskRouteMapping,
  TermCorrection,
} from '../types/admin'
import {
  loadKnowledgeReleases,
  loadModelRoutes,
  loadPromptLibrary,
  loadTaskMappings,
  loadTermCorrections,
  resetP0Defaults,
  saveModelRoutes,
  savePromptLibrary,
  saveTaskMappings,
  saveTermCorrections,
  setActiveKnowledgeRelease,
} from '../services/adminStore'
import {
  publishPromptVersion,
  rollbackPromptScene,
  savePromptAsNewVersion,
} from '../services/promptLifecycle'
import { attachEvalToPrompt, runPromptEvaluation } from '../services/promptEval'

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`
}

export const TASK_LABELS: Record<AITask, string> = {
  explain: '划词解释',
  lesson_summary: '本课总结',
  lesson_qa: '课内问答',
  knowledge_detail: '知识点扩展',
}

export function useAdminStore() {
  const [prompts, setPrompts] = useState(loadPromptLibrary)
  const [routes, setRoutes] = useState(loadModelRoutes)
  const [mappings, setMappings] = useState(loadTaskMappings)
  const [releases, setReleases] = useState(loadKnowledgeReleases)
  const [corrections, setCorrections] = useState(loadTermCorrections)

  const refreshPrompts = useCallback(() => {
    setPrompts(loadPromptLibrary())
    setMappings(loadTaskMappings())
  }, [])

  const updateRoute = useCallback(
    (id: string, patch: Partial<ModelRouteProfile>) => {
      const next = routes.map((r) => (r.id === id ? { ...r, ...patch } : r))
      setRoutes(next)
      saveModelRoutes(next)
    },
    [routes]
  )

  const updateMapping = useCallback(
    (id: string, patch: Partial<TaskRouteMapping>) => {
      const next = mappings.map((m) => (m.id === id ? { ...m, ...patch } : m))
      setMappings(next)
      saveTaskMappings(next)
    },
    [mappings]
  )

  const refreshReleases = useCallback(() => {
    setReleases(loadKnowledgeReleases())
  }, [])

  const activateRelease = useCallback((id: string) => {
    setActiveKnowledgeRelease(id)
    setReleases(loadKnowledgeReleases())
  }, [])

  const updateCorrection = useCallback(
    (id: string, patch: Partial<TermCorrection>) => {
      const next = corrections.map((c) => (c.id === id ? { ...c, ...patch } : c))
      setCorrections(next)
      saveTermCorrections(next)
    },
    [corrections]
  )

  const addCorrection = useCallback(() => {
    const item: TermCorrection = {
      id: newId('tc'),
      wrong: '',
      correct: '',
      scope: 'global',
      enabled: true,
    }
    const next = [...corrections, item]
    setCorrections(next)
    saveTermCorrections(next)
  }, [corrections])

  const removeCorrection = useCallback(
    (id: string) => {
      const next = corrections.filter((c) => c.id !== id)
      setCorrections(next)
      saveTermCorrections(next)
    },
    [corrections]
  )

  const addPrompt = useCallback(
    (scene: PromptTemplate['scene']) => {
      const item: PromptTemplate = {
        id: newId('prompt'),
        name: scene === 'explain' ? '划词解释' : '本课总结',
        scene,
        versionLabel: '0.1.0',
        systemPrompt: '',
        status: 'draft',
        enabled: true,
        updatedAt: Date.now(),
      }
      const next = [...prompts, item]
      setPrompts(next)
      savePromptLibrary(next)
      return item.id
    },
    [prompts]
  )

  const removePrompt = useCallback(
    (id: string) => {
      const target = prompts.find((p) => p.id === id)
      if (!target || target.status === 'published') return
      const next = prompts.filter((p) => p.id !== id)
      setPrompts(next)
      savePromptLibrary(next)
    },
    [prompts]
  )

  const saveNewVersion = useCallback(
    async (
      base: PromptTemplate,
      draft: Pick<
        PromptTemplate,
        'name' | 'systemPrompt' | 'userPromptTemplate' | 'notes'
      >,
      knowledgePoints: KnowledgePoint[]
    ): Promise<PromptTemplate> => {
      const created = savePromptAsNewVersion(base, {
        ...draft,
        versionLabel: base.versionLabel,
      })
      refreshPrompts()
      const evalResult = await runPromptEvaluation(created, knowledgePoints)
      const withScore = attachEvalToPrompt(created.id, evalResult) ?? created
      refreshPrompts()
      return withScore
    },
    [refreshPrompts]
  )

  const publishVersion = useCallback(
    (promptId: string) => {
      const pub = publishPromptVersion(promptId)
      refreshPrompts()
      return pub
    },
    [refreshPrompts]
  )

  const rollbackScene = useCallback(
    (scene: PromptTemplate['scene']) => {
      const prev = rollbackPromptScene(scene)
      refreshPrompts()
      return prev
    },
    [refreshPrompts]
  )

  const resetDefaults = useCallback(() => {
    resetP0Defaults()
    setPrompts(loadPromptLibrary())
    setRoutes(loadModelRoutes())
    setMappings(loadTaskMappings())
    setReleases(loadKnowledgeReleases())
    setCorrections(loadTermCorrections())
  }, [])

  return {
    prompts,
    routes,
    mappings,
    releases,
    corrections,
    addPrompt,
    removePrompt,
    saveNewVersion,
    publishVersion,
    rollbackScene,
    updateRoute,
    updateMapping,
    activateRelease,
    refreshReleases,
    updateCorrection,
    addCorrection,
    removeCorrection,
    resetDefaults,
  }
}
