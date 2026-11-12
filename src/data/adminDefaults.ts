import {
  BUNDLED_AI_KNOWLEDGE_POINTS,
  TEXTBOOK_KNOWLEDGE_SOURCE,
} from './aiKnowledgeBundle'
import type {
  EvalCase,
  KnowledgeRelease,
  ModelRouteProfile,
  PromptTemplate,
  TaskRouteMapping,
  TermCorrection,
} from '../types/admin'

export const DEFAULT_MODEL_ROUTES: ModelRouteProfile[] = [
  {
    id: 'route-general',
    name: '通用对话',
    provider: 'deepseek',
    model: 'deepseek-chat',
    temperature: 0.7,
    enabled: true,
  },
  {
    id: 'route-structured',
    name: '结构化 JSON',
    provider: 'deepseek',
    model: 'deepseek-chat',
    temperature: 0.5,
    enabled: true,
  },
]

export const DEFAULT_TASK_MAPPINGS: TaskRouteMapping[] = [
  {
    id: 'map-explain',
    task: 'explain',
    promptVersionId: 'prompt-explain',
    modelRouteId: 'route-general',
    enabled: true,
  },
  {
    id: 'map-summary',
    task: 'lesson_summary',
    promptVersionId: 'prompt-summary',
    modelRouteId: 'route-structured',
    enabled: true,
  },
  {
    id: 'map-qa',
    task: 'lesson_qa',
    promptVersionId: 'prompt-explain',
    modelRouteId: 'route-general',
    enabled: true,
  },
  {
    id: 'map-kp',
    task: 'knowledge_detail',
    promptVersionId: 'prompt-explain',
    modelRouteId: 'route-general',
    enabled: true,
  },
]

export const DEFAULT_KNOWLEDGE_RELEASES: KnowledgeRelease[] = [
  {
    id: 'kb-ai-2026',
    versionLabel: '2026.11.1',
    title: 'AI 三联知识库（产品 / 工程 / 增长）',
    libraryIds: ['ai-pm', 'ai-eng', 'ai-growth'],
    sourceRef: JSON.stringify(TEXTBOOK_KNOWLEDGE_SOURCE),
    termCount: BUNDLED_AI_KNOWLEDGE_POINTS.length,
    publishedAt: Date.now(),
    isActive: true,
    notes: '与 aiKnowledgeBundle.ts 打包快照一致',
  },
]

export const DEFAULT_PROMPT_LIBRARY: PromptTemplate[] = [
  {
    id: 'prompt-explain',
    name: '划词解释',
    scene: 'explain',
    versionLabel: '2026.10.1',
    status: 'published',
    publishedAt: Date.now(),
    enabled: true,
    updatedAt: Date.now(),
    systemPrompt: `你是「AI学霸」学习助手，面向 AI 产品经理、工程与增长方向的课堂。
划词解释必须「说得懂、用得上」：
1. 先解释该词在【本课转写语境】里指什么（可引用一句原文要点）
2. 再给通用定义（中英术语可写「术语映射」）
3. 用 1～2 句说明在 AI 产品/Agent 设计里为什么要关注
禁止：只说「结合教材自己归纳」「常与前后概念出现」等空话。
结构可用 Markdown 小标题：含义、本课语境、产品里关注。`,
    userPromptTemplate:
      '请解释术语或片段：「{{text}}」{{contextBlock}}\n\n若无转写上下文，也须给出该词的通用定义与产品关注点。',
  },
  {
    id: 'prompt-summary',
    name: '本课总结',
    scene: 'lesson_summary',
    versionLabel: '2026.10.1',
    status: 'published',
    publishedAt: Date.now(),
    enabled: true,
    updatedAt: Date.now(),
    systemPrompt: `你是「AI学霸」学习助手，面向教师、家长与学生。根据本课转写、笔记与互动行为，生成结构化学习总结。
要求：中文、信息密度高、突出学员主动关注的内容；金句需来自转写或笔记原文的提炼（可略作压缩，勿虚构演讲者没说过的话）。
「actionItems」必须是本课配套习题与动手任务：每条须可直接动笔完成，扣住转写中的史实/概念/方法；禁止空泛动作（如「重读转写」「写收获」「划词提问」「概括主线」）。
必须只输出一个 JSON 对象，不要 Markdown 代码块，不要其它说明。`,
  },
]

export const DEFAULT_TERM_CORRECTIONS: TermCorrection[] = [
  { id: 'tc-1', wrong: '阿皮测试', correct: 'A/B 测试', scope: 'ai-growth', enabled: true },
  { id: 'tc-2', wrong: '凤凰营销', correct: 'Freemium', scope: 'ai-growth', enabled: true },
  { id: 'tc-3', wrong: '拉格', correct: 'RAG', scope: 'ai-eng', enabled: true },
  { id: 'tc-4', wrong: 'M C P', correct: 'MCP', scope: 'ai-eng', enabled: true },
  { id: 'tc-5', wrong: '芝图', correct: 'Agent', scope: 'ai-pm', enabled: true },
  { id: 'tc-6', wrong: '工作刘', correct: '工作流', scope: 'ai-pm', enabled: true },
  { id: 'tc-7', wrong: 'Vibe Codding', correct: 'Vibe Coding', scope: 'ai-pm', enabled: true },
]

/** Prompt 保存后自动测评（与场景相关 subset） */
export const DEFAULT_EVAL_CASES: EvalCase[] = [
  {
    id: 'eval-tc-01',
    name: 'ASR·RAG',
    type: 'term_correction',
    input: '本课讲拉格检索',
    expectedContains: ['RAG'],
    enabled: true,
  },
  {
    id: 'eval-kp-01',
    name: '命中·工作流',
    type: 'knowledge_hit',
    input: '今天聊 workflow 编排',
    expectedTerm: '工作流',
    enabled: true,
  },
  {
    id: 'eval-llm-explain',
    name: '划词·幻觉',
    type: 'llm_output',
    promptScene: 'explain',
    selectedText: '幻觉',
    mustContain: ['模型', '错误'],
    enabled: true,
  },
  {
    id: 'eval-llm-summary',
    name: '总结·JSON 结构',
    type: 'llm_output',
    promptScene: 'lesson_summary',
    selectedText: '本课要点',
    mustContain: ['{', 'coreSummary'],
    enabled: true,
  },
]
