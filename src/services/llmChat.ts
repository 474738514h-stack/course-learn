import type { AITask, PromptTemplate } from '../types/admin'
import { resolveTaskConfig } from './configCenter'
import { getEnvLlmCredentials } from './llmEnv'

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

async function postChat(
  apiUrl: string,
  apiKey: string,
  model: string,
  temperature: number,
  messages: ChatMessage[],
  options?: { responseFormatJson?: boolean }
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
    stream: false,
  }
  if (options?.responseFormatJson) {
    body.response_format = { type: 'json_object' }
  }

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
    error?: { message?: string }
  }
  if (!res.ok) {
    throw new Error(data.error?.message || `请求失败 (${res.status})`)
  }
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('模型返回为空')
  return content
}

export async function chatForTask(
  task: AITask,
  messages: ChatMessage[],
  options?: { responseFormatJson?: boolean }
): Promise<string> {
  const resolved = resolveTaskConfig(task)
  const { apiKey } = getEnvLlmCredentials()
  if (!apiKey || !resolved.apiUrl) {
    throw new Error('未配置 API Key')
  }
  return postChat(
    resolved.apiUrl,
    apiKey,
    resolved.model,
    resolved.temperature,
    messages,
    options
  )
}

/** 测评草稿 Prompt，不影响线上发布版本 */
export async function chatForTaskWithPrompt(
  task: AITask,
  prompt: Pick<PromptTemplate, 'systemPrompt' | 'scene'>,
  messages: ChatMessage[],
  options?: { responseFormatJson?: boolean }
): Promise<string> {
  const resolved = resolveTaskConfig(task)
  const { apiKey } = getEnvLlmCredentials()
  if (!apiKey || !resolved.apiUrl) {
    throw new Error('未配置 API Key')
  }
  const withSystem: ChatMessage[] = [
    { role: 'system', content: prompt.systemPrompt },
    ...messages,
  ]
  return postChat(
    resolved.apiUrl,
    apiKey,
    resolved.model,
    resolved.temperature,
    withSystem,
    options
  )
}
