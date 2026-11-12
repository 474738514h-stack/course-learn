import type { KnowledgePoint } from '../types'

/** 课堂英文/缩写高频词（未命中知识库时） */
const EN_TERM_GLOSSARY: Record<
  string,
  { map: string; meaning: string; product: string }
> = {
  risk: {
    map: 'Risk（风险）',
    meaning:
      '指行动或决策可能带来的负面后果；在 AI 语境下常包括幻觉误导、合规事故、成本失控、品牌与隐私伤害等。',
    product:
      '产品设计时要按风险分级（高/中/低）决定是否让模型自动执行、仅给建议，还是必须人工确认。',
  },
  skill: {
    map: 'Skill（技能模块）',
    meaning:
      '在 Agent / 应用框架里，把一类可复用能力封装成独立技能，供模型按场景调用。',
    product: '关注技能边界、输入输出契约、失败降级，以及与主对话的权限隔离。',
  },
  workflow: {
    map: 'Workflow（工作流）',
    meaning: '把多步任务编排成固定或半固定的执行链路，由人或 Agent 按序完成。',
    product: '用于可控交付：明确每步责任方、可观测节点与人工介入点。',
  },
  agent: {
    map: 'Agent（智能体）',
    meaning: '能感知环境、调用工具并多步推理以完成目标的 AI 系统，而非单轮问答。',
    product: '重点评估任务完成率、工具调用安全、成本与可解释性。',
  },
  rag: {
    map: 'RAG（检索增强生成）',
    meaning: '先检索知识库再生成答案，用外部事实约束模型，减轻幻觉。',
    product: '关注召回质量、引用展示、更新频率与权限内的数据范围。',
  },
  mcp: {
    map: 'MCP（Model Context Protocol）',
    meaning: '标准化模型与外部工具/数据源连接的开放协议，便于 Agent 扩展能力。',
    product: '用于统一工具接入、降低集成成本，并明确鉴权与审计。',
  },
  llm: {
    map: 'LLM（大语言模型）',
    meaning: '超大规模预训练的语言模型，是多类 AI 应用的自然语言推理底座。',
    product: '关注能力边界、延迟成本、安全策略与何时需要专用小模型。',
  },
  api: {
    map: 'API（应用程序接口）',
    meaning: '系统之间按约定格式交换能力的接口层。',
    product: 'Function Calling / 工具调用本质是让模型通过 API 触发业务动作。',
  },
  prompt: {
    map: 'Prompt（提示词）',
    meaning: '给模型的指令与上下文，用来约束输出格式、语气与任务目标。',
    product: '需要版本管理、评测与场景化模板，避免「一句咒语走天下」。',
  },
}

function normalizeKey(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractSnippet(context: string | undefined, needle: string): string {
  if (!context?.trim()) return ''
  const plain = context.replace(/\s+/g, ' ').trim()
  const re = new RegExp(escapeRegExp(needle.trim()), 'i')
  const idx = plain.search(re)
  if (idx < 0) {
    return plain.length > 320 ? plain.slice(0, 320) + '…' : plain
  }
  const radius = 140
  const start = Math.max(0, idx - radius)
  const end = Math.min(plain.length, idx + needle.length + radius)
  let snippet = plain.slice(start, end)
  if (start > 0) snippet = '…' + snippet
  if (end < plain.length) snippet = snippet + '…'
  return snippet
}

function findKnowledgePoint(
  text: string,
  knowledgePoints: KnowledgePoint[]
): KnowledgePoint | undefined {
  const q = normalizeKey(text)
  if (!q) return undefined

  const exact = knowledgePoints.find((kp) => {
    const terms = [kp.term, ...kp.aliases]
    return terms.some((t) => normalizeKey(t) === q)
  })
  if (exact) return exact

  const contains = knowledgePoints.find((kp) => {
    const terms = [kp.term, ...kp.aliases]
    return terms.some((t) => {
      const tn = normalizeKey(t)
      return tn.length >= 2 && (q.includes(tn) || tn.includes(q))
    })
  })
  if (contains) return contains

  if (/^[a-z][a-z0-9\- ]{0,24}$/i.test(text.trim())) {
    const word = q
    return knowledgePoints.find((kp) => {
      const terms = [kp.term, ...kp.aliases]
      return terms.some((t) => normalizeKey(t) === word)
    })
  }

  return undefined
}

function firstDetailParagraph(detail: string): string {
  const lines = detail
    .split('\n')
    .map((l) => l.replace(/\*\*/g, '').trim())
    .filter(Boolean)
  return lines.slice(0, 3).join(' ') || detail.replace(/\*\*/g, '').slice(0, 200)
}

function inferContextualMeaning(
  term: string,
  snippet: string
): string | undefined {
  const key = normalizeKey(term)
  if (!snippet) return undefined

  if (key === 'risk' || key.includes('risk')) {
    if (/高\s*risk|high[\s-]*risk|高风险的?/i.test(snippet)) {
      return '本句话在对比 **高风险的决策/动作** 与低风险任务：讲师强调 AI（或 Agent）不应擅自承担「高 risk」后果的事，更适合自动做可控、低风险的环节；这与产品里的 **人机分工** 与 **权限分级** 一致。'
    }
    if (/低\s*risk|low[\s-]*risk/i.test(snippet)) {
      return '这里强调 **低风险任务** 更适合交给 AI 自动处理（如检索、初稿、分类），以降低人力成本并保持可控。'
    }
  }

  if (key === 'skill' && /skill|技能/i.test(snippet)) {
    return '结合上下文，「skill」更像在讲 **可插拔的能力模块**：把一类任务做成独立技能，由 Agent 在合适场景调用，而不是把一切塞进一个巨型 Prompt。'
  }

  return undefined
}

function glossaryEntry(term: string) {
  const key = normalizeKey(term).replace(/\s+/g, '')
  return (
    EN_TERM_GLOSSARY[key] ??
    EN_TERM_GLOSSARY[normalizeKey(term).split(/\s+/)[0]]
  )
}

/**
 * 未配置 LLM 时的划词解释：知识库 + 转写语境 + 常用词表，避免空话。
 */
export function buildLocalExplain(
  text: string,
  context: string | undefined,
  knowledgePoints: KnowledgePoint[]
): string {
  const snippet = extractSnippet(context, text)
  const kp = findKnowledgePoint(text, knowledgePoints)
  const contextual = inferContextualMeaning(text, snippet)
  const glossary = glossaryEntry(text)

  const lines: string[] = [`**「${text.trim()}」**`, '']

  if (kp) {
    lines.push(`**术语映射**`, `${kp.term}${kp.aliases[0] ? `（亦作：${kp.aliases.slice(0, 2).join('、')}）` : ''}`, '')
    lines.push(`**含义**`, kp.description, '')
    const body = firstDetailParagraph(kp.detail)
    if (body && body !== kp.description) {
      lines.push(body, '')
    }
    lines.push(`**产品里关注**`, firstDetailParagraph(kp.detail).split('。')[0] + '。')
  } else if (glossary) {
    lines.push(`**术语映射**`, `${text.trim()} = ${glossary.map}`, '')
    lines.push(`**含义**`, glossary.meaning, '')
    lines.push(`**产品里关注**`, glossary.product)
  } else {
    lines.push(
      `**含义**`,
      `「${text.trim()}」在本课转写中出现，需结合前后句理解；下方是原文语境节选，便于你对照讲师在讨论什么结论。`
    )
  }

  if (contextual) {
    lines.push('', `**本课语境**`, contextual)
  }

  if (snippet) {
    lines.push('', `**原文附近**`, `> ${snippet}`)
    if (!kp && !glossary && !contextual) {
      lines.push(
        '',
        `**怎么读这段**`,
        `- 先看讲师在对比或下什么判断（因果、转折词「但」「所以」「明白吗」）。`,
        `- 若词是英文缩写，对照是否为行业通用说法（如 risk = 风险分级）。`,
        `- 仍不确定时，可把本段保存为笔记，课后与知识库词条对照。`
      )
    }
  } else if (!context?.trim()) {
    lines.push(
      '',
      `**提示**`,
      `当前课节尚无转写正文。开始听课或导入转写后，解释会带上「原文附近」语境。`
    )
  }

  return lines.join('\n')
}
