import type { KnowledgePoint } from '../types'

/** 对话区卡片主标题：优先英文/缩写别名 */
export function knowledgeCardTitle(kp: KnowledgePoint): string {
  const en = kp.aliases.find(
    (a) =>
      /^[A-Za-z][A-Za-z0-9\s\-/&.+]*$/.test(a.trim()) && a.trim().length >= 2
  )
  return en?.trim() ?? kp.term
}

export function knowledgeCardTermMapping(kp: KnowledgePoint): string {
  const title = knowledgeCardTitle(kp)
  const zh =
    kp.aliases.find((a) => /[\u4e00-\u9fff]/.test(a)) ||
    (/[\u4e00-\u9fff]/.test(kp.term) ? kp.term : null)
  if (zh && title !== zh) return `${title} = ${zh}`
  if (kp.aliases[0] && kp.aliases[0] !== kp.term) {
    return `${kp.term} = ${kp.aliases[0]}`
  }
  return kp.term
}

export function knowledgeCardProductFocus(kp: KnowledgePoint): string {
  const detailPlain = kp.detail.replace(/\*\*/g, '')
  const labeled = detailPlain.match(/产品里关注[：:]\s*([^\n]+)/)?.[1]?.trim()
  if (labeled) return labeled

  const practice = detailPlain.match(/实践[：:]\s*([^\n]+)/)?.[1]?.trim()
  if (practice) return practice

  const first = kp.description.replace(/\*\*/g, '').trim()
  if (first.endsWith('。')) {
    return `与课堂讨论中的「${kp.term}」相关的体验、指标与落地取舍。`
  }
  return first
}
