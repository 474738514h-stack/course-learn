export type AITask =
  | 'explain'
  | 'lesson_summary'
  | 'lesson_qa'
  | 'knowledge_detail'

export type PromptScene = 'explain' | 'lesson_summary'

export type PromptPublishStatus = 'draft' | 'published' | 'archived'

export interface PromptTemplate {
  id: string
  name: string
  scene: PromptScene
  versionLabel: string
  systemPrompt: string
  userPromptTemplate?: string
  enabled: boolean
  updatedAt: number
  notes?: string
  status: PromptPublishStatus
  publishedAt?: number
  basedOnId?: string
  /** 最近一次保存后自动测评得分 0–100 */
  testScore?: number
  testPassCount?: number
  testTotalCount?: number
  testRunAt?: number
  testMessage?: string
}

export interface ModelRouteProfile {
  id: string
  name: string
  provider: string
  model: string
  temperature: number
  apiUrlOverride?: string
  enabled: boolean
}

export interface TaskRouteMapping {
  id: string
  task: AITask
  promptVersionId: string
  modelRouteId: string
  enabled: boolean
}

export interface KnowledgeRelease {
  id: string
  versionLabel: string
  title: string
  libraryIds: string[]
  sourceRef: string
  termCount: number
  publishedAt: number
  isActive: boolean
  notes?: string
}

export interface TermCorrection {
  id: string
  wrong: string
  correct: string
  scope: 'global' | 'ai-pm' | 'ai-eng' | 'ai-growth'
  enabled: boolean
  notes?: string
}

export type EvalCaseType =
  | 'term_correction'
  | 'knowledge_hit'
  | 'llm_output'

export interface EvalCase {
  id: string
  name: string
  type: EvalCaseType
  enabled: boolean
  input?: string
  expectedTerm?: string
  expectedContains?: string[]
  selectedText?: string
  mustContain?: string[]
  promptScene?: PromptScene
}

export interface EvalCaseResult {
  caseId: string
  caseName: string
  pass: boolean
  message: string
  durationMs?: number
}
