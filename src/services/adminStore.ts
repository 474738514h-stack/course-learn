import {
  DEFAULT_EVAL_CASES,
  DEFAULT_KNOWLEDGE_RELEASES,
  DEFAULT_MODEL_ROUTES,
  DEFAULT_PROMPT_LIBRARY,
  DEFAULT_TASK_MAPPINGS,
  DEFAULT_TERM_CORRECTIONS,
} from '../data/adminDefaults'
import type {
  AITask,
  EvalCase,
  KnowledgeRelease,
  ModelRouteProfile,
  PromptScene,
  PromptTemplate,
  TaskRouteMapping,
  TermCorrection,
} from '../types/admin'
import { loadFromStorage, saveToStorage } from '../utils/storage'

const KEY_PROMPTS = 'p0-prompt-library'
const KEY_ROUTES = 'p0-model-routes'
const KEY_MAPPINGS = 'p0-task-mappings'
const KEY_RELEASES = 'p0-knowledge-releases'
const KEY_CORRECTIONS = 'p0-term-corrections'
const KEY_EVALS = 'p0-eval-cases'

function normalizePrompts(items: PromptTemplate[]): PromptTemplate[] {
  return items.map((p) => ({
    ...p,
    versionLabel: p.versionLabel ?? '1.0.0',
    status: p.status ?? 'published',
    publishedAt: p.publishedAt ?? (p.status === 'published' ? p.updatedAt : undefined),
  }))
}

export function tasksForPromptScene(scene: PromptScene): AITask[] {
  if (scene === 'lesson_summary') return ['lesson_summary']
  return ['explain', 'lesson_qa', 'knowledge_detail']
}

export function loadEvalCases(): EvalCase[] {
  return loadFromStorage(KEY_EVALS, DEFAULT_EVAL_CASES)
}

export function saveEvalCases(items: EvalCase[]): void {
  saveToStorage(KEY_EVALS, items)
}

export function loadPromptLibrary(): PromptTemplate[] {
  return normalizePrompts(loadFromStorage(KEY_PROMPTS, DEFAULT_PROMPT_LIBRARY))
}

export function savePromptLibrary(items: PromptTemplate[]): void {
  saveToStorage(KEY_PROMPTS, normalizePrompts(items))
}

export function loadModelRoutes(): ModelRouteProfile[] {
  return loadFromStorage(KEY_ROUTES, DEFAULT_MODEL_ROUTES)
}

export function saveModelRoutes(items: ModelRouteProfile[]): void {
  saveToStorage(KEY_ROUTES, items)
}

export function loadTaskMappings(): TaskRouteMapping[] {
  return loadFromStorage(KEY_MAPPINGS, DEFAULT_TASK_MAPPINGS)
}

export function saveTaskMappings(items: TaskRouteMapping[]): void {
  saveToStorage(KEY_MAPPINGS, items)
}

export function loadKnowledgeReleases(): KnowledgeRelease[] {
  return loadFromStorage(KEY_RELEASES, DEFAULT_KNOWLEDGE_RELEASES)
}

export function saveKnowledgeReleases(items: KnowledgeRelease[]): void {
  saveToStorage(KEY_RELEASES, items)
}

export function getActiveKnowledgeRelease(): KnowledgeRelease | null {
  const all = loadKnowledgeReleases()
  return all.find((r) => r.isActive) ?? all[0] ?? null
}

export function setActiveKnowledgeRelease(releaseId: string): void {
  saveKnowledgeReleases(
    loadKnowledgeReleases().map((r) => ({
      ...r,
      isActive: r.id === releaseId,
    }))
  )
}

export function loadTermCorrections(): TermCorrection[] {
  return loadFromStorage(KEY_CORRECTIONS, DEFAULT_TERM_CORRECTIONS)
}

export function saveTermCorrections(items: TermCorrection[]): void {
  saveToStorage(KEY_CORRECTIONS, items)
}

export function resetP0Defaults(): void {
  savePromptLibrary(DEFAULT_PROMPT_LIBRARY)
  saveModelRoutes(DEFAULT_MODEL_ROUTES)
  saveTaskMappings(DEFAULT_TASK_MAPPINGS)
  saveKnowledgeReleases(DEFAULT_KNOWLEDGE_RELEASES)
  saveTermCorrections(DEFAULT_TERM_CORRECTIONS)
}

function resolvePromptForTask(task: AITask): PromptTemplate {
  const mapping = loadTaskMappings().find((m) => m.task === task && m.enabled)
  const prompts = loadPromptLibrary()
  const scene: PromptScene =
    task === 'lesson_summary' ? 'lesson_summary' : 'explain'

  if (mapping) {
    const linked = prompts.find(
      (p) => p.id === mapping.promptVersionId && p.status === 'published'
    )
    if (linked) return linked
  }
  return (
    prompts.find((p) => p.scene === scene && p.status === 'published') ??
    DEFAULT_PROMPT_LIBRARY.find((p) => p.scene === scene)!
  )
}

export function getSystemPromptForTask(task: AITask): string {
  return resolvePromptForTask(task).systemPrompt
}

export function formatExplainUserPrompt(
  text: string,
  context?: string
): string {
  const tpl = resolvePromptForTask('explain').userPromptTemplate
  const contextBlock = context
    ? `\n\n课程上下文：\n${context.slice(0, 1500)}`
    : ''
  if (tpl) {
    return tpl
      .replace(/\{\{text\}\}/g, text)
      .replace(/\{\{contextBlock\}\}/g, contextBlock)
      .replace(/\{\{context\}\}/g, context?.slice(0, 1500) ?? '')
  }
  return context
    ? `请解释术语或片段：「${text}」\n\n课程上下文：\n${context.slice(0, 1500)}`
    : `请解释术语或片段：「${text}」`
}
