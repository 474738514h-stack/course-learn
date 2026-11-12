import type { KnowledgePoint, LLMResponse } from '../types'
import { getAllKnowledgePoints } from '../data/knowledgePoints'
import {
  formatExplainUserPrompt,
  getSystemPromptForTask,
} from './adminStore'
import { buildLocalExplain } from './explainFallback'
import { chatForTask } from './llmChat'
import { isLlmConfigured } from './llmEnv'

export { isLlmConfigured, llmProviderLabelInternal as llmProviderLabel } from './llmEnv'

export async function explainText(
  text: string,
  context?: string,
  knowledgePoints?: KnowledgePoint[]
): Promise<LLMResponse> {
  const points =
    knowledgePoints && knowledgePoints.length > 0
      ? knowledgePoints
      : getAllKnowledgePoints([])

  if (isLlmConfigured()) {
    try {
      const userContent = formatExplainUserPrompt(text, context)
      const contextTail = context?.trim()
        ? `\n\n【务必遵守】结合转写原文解释「${text}」在本句中的含义；写清通用定义；给出 AI 产品语境下的关注点。禁止空洞套话（如仅让用户自己翻教材）。`
        : ''
      const content = await chatForTask('explain', [
        { role: 'system', content: getSystemPromptForTask('explain') },
        {
          role: 'user',
          content: userContent + contextTail,
        },
      ])
      return { content, loading: false }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '解释服务暂时不可用'
      return {
        content: buildLocalExplain(text, context, points),
        loading: false,
        error: message,
      }
    }
  }

  await delay(400)
  return {
    content: buildLocalExplain(text, context, points),
    loading: false,
  }
}

export async function generateKnowledgeDetail(term: string): Promise<string> {
  if (isLlmConfigured()) {
    try {
      return await chatForTask('knowledge_detail', [
        { role: 'system', content: getSystemPromptForTask('knowledge_detail') },
        {
          role: 'user',
          content: `为知识点「${term}」写一段扩展说明，包含：定义、教材中的典型用法、易错点。使用 Markdown，对齐 AI 产品与课堂讨论语境。`,
        },
      ])
    } catch {
      /* mock */
    }
  }

  await delay(600)
  return `**${term}**

请结合课本目录与课堂笔记补充该词条的要点与例题。`
}

export async function askLessonQuestion(
  question: string,
  context: { lessonTitle?: string; transcript?: string }
): Promise<LLMResponse> {
  const transcript = context.transcript?.trim() || '（尚无转写内容）'
  const lessonTitle = context.lessonTitle || '当前课节'

  if (isLlmConfigured()) {
    try {
      const content = await chatForTask('lesson_qa', [
        { role: 'system', content: getSystemPromptForTask('lesson_qa') },
        {
          role: 'user',
          content: `学员正在学习「${lessonTitle}」，基于以下本课转写内容回答问题。若转写未覆盖，可结合 AI 知识库词条简要说明，并提示学员继续听课。

【本课转写摘录】
${transcript.slice(0, 3500)}

【学员提问】
${question}`,
        },
      ])
      return { content, loading: false }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '问答服务暂时不可用'
      return { content: '', loading: false, error: message }
    }
  }

  await delay(700)
  return {
    content: `关于「${question}」：请结合本课转写与教材自行归纳要点。当前转写约 ${transcript.length} 字，可继续听课后再次提问。`,
    loading: false,
  }
}

export async function summarizeLesson(
  transcript: string,
  knowledgeHits: string[]
): Promise<string> {
  if (isLlmConfigured()) {
    try {
      return await chatForTask('lesson_summary', [
        { role: 'system', content: getSystemPromptForTask('lesson_summary') },
        {
          role: 'user',
          content: `根据以下课程转写生成简短摘要（Markdown），并列出复习建议。涉及的知识点 ID：${knowledgeHits.join(', ') || '无'}\n\n转写：\n${transcript.slice(0, 4000)}`,
        },
      ])
    } catch {
      /* mock */
    }
  }

  await delay(1000)
  return `## 课程摘要

本节课共识别 **${knowledgeHits.length}** 个知识点。

**主要内容：**
${transcript.slice(0, 200)}...`
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
