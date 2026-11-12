import { matchKnowledgePoints } from '../data/knowledgePoints'
import type { KnowledgePoint } from '../types'
import type { EvalCase, EvalCaseResult, PromptTemplate } from '../types/admin'
import { loadEvalCases, loadPromptLibrary, savePromptLibrary } from './adminStore'
import { chatForTaskWithPrompt } from './llmChat'
import { applyTermCorrections } from './termCorrection'

function casesForPrompt(prompt: PromptTemplate, all: EvalCase[]): EvalCase[] {
  return all.filter((c) => {
    if (!c.enabled) return false
    if (c.type === 'term_correction' || c.type === 'knowledge_hit') return true
    if (c.type === 'llm_output') return c.promptScene === prompt.scene
    return false
  })
}

async function runCase(
  testCase: EvalCase,
  prompt: PromptTemplate,
  knowledgePoints: KnowledgePoint[]
): Promise<EvalCaseResult> {
  const start = performance.now()
  try {
    if (testCase.type === 'term_correction') {
      const output = applyTermCorrections(testCase.input ?? '')
      const must = testCase.expectedContains ?? []
      const pass = must.every((s) => output.includes(s))
      return {
        caseId: testCase.id,
        caseName: testCase.name,
        pass,
        message: pass ? '通过' : `缺少 ${must.filter((s) => !output.includes(s)).join('、')}`,
        durationMs: Math.round(performance.now() - start),
      }
    }
    if (testCase.type === 'knowledge_hit') {
      const text = applyTermCorrections(testCase.input ?? '')
      const term = testCase.expectedTerm ?? ''
      const kp = knowledgePoints.find(
        (k) => k.term === term || k.term.includes(term)
      )
      const ids = matchKnowledgePoints(text, knowledgePoints)
      const pass = Boolean(kp && ids.includes(kp.id))
      return {
        caseId: testCase.id,
        caseName: testCase.name,
        pass,
        message: pass ? '命中' : '未命中',
        durationMs: Math.round(performance.now() - start),
      }
    }
    const text = testCase.selectedText ?? ''
    const task = prompt.scene === 'lesson_summary' ? 'lesson_summary' : 'explain'
    const userContent =
      task === 'lesson_summary'
        ? `请按 JSON schema 输出本课总结（含 coreSummary 字段）。课节：${text}`
        : `请解释：「${text}」`
    const output = await chatForTaskWithPrompt(
      task,
      prompt,
      [{ role: 'user', content: userContent }],
      task === 'lesson_summary' ? { responseFormatJson: true } : undefined
    )
    const must = testCase.mustContain ?? []
    const missing = must.filter((s) => !output.includes(s))
    const pass = missing.length === 0
    return {
      caseId: testCase.id,
      caseName: testCase.name,
      pass,
      message: pass ? '通过' : `缺少 ${missing.join('、')}`,
      durationMs: Math.round(performance.now() - start),
    }
  } catch (e) {
    return {
      caseId: testCase.id,
      caseName: testCase.name,
      pass: false,
      message: e instanceof Error ? e.message : '失败',
      durationMs: Math.round(performance.now() - start),
    }
  }
}

export async function runPromptEvaluation(
  prompt: PromptTemplate,
  knowledgePoints: KnowledgePoint[]
): Promise<{
  score: number
  passCount: number
  totalCount: number
  message: string
  results: EvalCaseResult[]
}> {
  const cases = casesForPrompt(prompt, loadEvalCases())
  if (cases.length === 0) {
    return {
      score: 100,
      passCount: 0,
      totalCount: 0,
      message: '无对应用例',
      results: [],
    }
  }
  const results: EvalCaseResult[] = []
  for (const c of cases) {
    results.push(await runCase(c, prompt, knowledgePoints))
  }
  const passCount = results.filter((r) => r.pass).length
  const totalCount = results.length
  const score = Math.round((passCount / totalCount) * 100)
  return {
    score,
    passCount,
    totalCount,
    message: `通过 ${passCount}/${totalCount}`,
    results,
  }
}

export function attachEvalToPrompt(
  promptId: string,
  evalResult: Awaited<ReturnType<typeof runPromptEvaluation>>
): PromptTemplate | null {
  const library = loadPromptLibrary()
  const idx = library.findIndex((p) => p.id === promptId)
  if (idx < 0) return null
  const updated: PromptTemplate = {
    ...library[idx],
    testScore: evalResult.score,
    testPassCount: evalResult.passCount,
    testTotalCount: evalResult.totalCount,
    testRunAt: Date.now(),
    testMessage: evalResult.message,
  }
  const next = [...library]
  next[idx] = updated
  savePromptLibrary(next)
  return updated
}
