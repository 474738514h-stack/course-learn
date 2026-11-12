/**
 * 依据 TapXWorld/ChinaTextbook 九上教材目录生成知识点词条。
 * 文案见 grade9KnowledgeData.mjs
 *
 * 运行：npm run generate:knowledge
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chinese, math, history } from './grade9KnowledgeData.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outFile = path.join(__dirname, '../src/data/grade9CurriculumKnowledge.ts')

const SOURCE = {
  repo: 'https://github.com/TapXWorld/ChinaTextbook',
  chinese:
    '初中/语文/统编版-人民教育出版社/九年级/义务教育教科书·语文九年级上册.pdf',
  math: '初中/数学/浙教版-浙江教育出版社/九年级/义务教育教科书·数学九年级上册.pdf',
  history:
    '初中/历史/统编版-人民教育出版社/九年级/义务教育教科书·世界历史九年级上册.pdf',
}

const header = `import type { KnowledgePoint } from '../types'

/** 九年级上册 · 教材目录知识点（来源：TapXWorld/ChinaTextbook） */
export const TEXTBOOK_KNOWLEDGE_SOURCE = ${JSON.stringify(SOURCE, null, 2)} as const

export const GRADE9_CHINESE_KNOWLEDGE: KnowledgePoint[] = `
const footer = `

export const GRADE9_MATH_KNOWLEDGE: KnowledgePoint[] = ${JSON.stringify(math, null, 2)}

export const GRADE9_HISTORY_KNOWLEDGE: KnowledgePoint[] = ${JSON.stringify(history, null, 2)}

export const GRADE9_KNOWLEDGE_POINTS: KnowledgePoint[] = [
  ...GRADE9_CHINESE_KNOWLEDGE,
  ...GRADE9_MATH_KNOWLEDGE,
  ...GRADE9_HISTORY_KNOWLEDGE,
]
`

fs.writeFileSync(
  outFile,
  header + JSON.stringify(chinese, null, 2) + footer,
  'utf8'
)
console.log(`Wrote ${chinese.length + math.length + history.length} knowledge points`)
