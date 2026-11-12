import type { AITask } from '../types/admin'
import { loadModelRoutes, loadPromptLibrary, loadTaskMappings } from './adminStore'
import { getEnvLlmCredentials } from './llmEnv'

export interface ResolvedTaskConfig {
  task: AITask
  promptVersionId: string
  systemPrompt: string
  model: string
  temperature: number
  apiUrl: string
}

export function resolveTaskConfig(task: AITask): ResolvedTaskConfig {
  const prompts = loadPromptLibrary()
  const routes = loadModelRoutes()
  const mapping =
    loadTaskMappings().find((m) => m.task === task && m.enabled) ??
    loadTaskMappings().find((m) => m.task === task)

  const prompt =
    (mapping &&
      prompts.find((p) => p.id === mapping.promptVersionId && p.enabled)) ??
    prompts.find(
      (p) =>
        p.scene === (task === 'lesson_summary' ? 'lesson_summary' : 'explain') &&
        p.enabled
    ) ??
    prompts[0]

  const route =
    (mapping &&
      routes.find((r) => r.id === mapping.modelRouteId && r.enabled)) ??
    routes.find((r) => r.enabled) ??
    routes[0]

  const env = getEnvLlmCredentials()
  return {
    task,
    promptVersionId: prompt.id,
    systemPrompt: prompt.systemPrompt,
    model: route?.model ?? env.model,
    temperature: route?.temperature ?? (task === 'lesson_summary' ? 0.5 : 0.7),
    apiUrl: route?.apiUrlOverride?.trim() || env.apiUrl,
  }
}
