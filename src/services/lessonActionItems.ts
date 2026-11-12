import type { LessonSummaryContext } from './lessonSummaryContext'

function truncate(s: string, max: number): string {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

function splitSentences(transcript: string): string[] {
  return transcript
    .split(/[。！？；\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 8)
}

function knowledgeHitsInTranscript(
  ctx: LessonSummaryContext
): LessonSummaryContext['knowledgeHits'] {
  const t = ctx.transcript
  if (!t.trim()) return ctx.knowledgeHits
  return ctx.knowledgeHits.filter((h) => t.includes(h.term))
}

/** 无 LLM 时：从转写与知识点生成可动笔完成的习题/任务 */
export function buildExerciseActionItems(ctx: LessonSummaryContext): string[] {
  const hasTranscript = ctx.transcript.trim().length > 0
  const hits = hasTranscript
    ? knowledgeHitsInTranscript(ctx)
    : ctx.knowledgeHits
  const sentences = hasTranscript ? splitSentences(ctx.transcript) : []
  const items: string[] = []

  if (hits.length >= 1) {
    const a = hits[0]
    items.push(
      `【名词解释】用 40～80 字说明「${a.term}」在本课中的含义，须包含老师强调的一个要点。`
    )
  }

  if (hits.length >= 2) {
    items.push(
      `【对比表】制作两栏对照表，比较「${hits[0].term}」与「${hits[1].term}」：各写出至少 3 条不同点（可含时间、制度、生产方式等）。`
    )
  }

  if (sentences.length >= 1) {
    const quote = sentences.find((s) => s.length >= 16 && s.length <= 100) ?? sentences[0]
    items.push(
      `【材料题】依据课堂原话「${truncate(quote, 72)}」，回答：作者想说明什么？请分 2 点作答。`
    )
  }

  const chronologyTerms = hits.filter((h) =>
    /社会|朝代|世纪|时期|文明|战争|革命|王朝|时代|阶段/.test(`${h.term}${h.description}`)
  )
  if (chronologyTerms.length >= 2) {
    const names = chronologyTerms
      .slice(0, 4)
      .map((h) => h.term)
      .join('、')
    items.push(
      `【动手·时间轴】在纸上画出本课时间轴，按先后标出：${names}，并在每个节点下写 1 个关键词。`
    )
  } else if (hits.length >= 3) {
    items.push(
      `【排序】将下列概念按课堂讲述逻辑排序并说明理由：${hits
        .slice(0, 4)
        .map((h) => h.term)
        .join(' → ')}（可调整顺序）。`
    )
  }

  if (sentences.length >= 2) {
    const stem = truncate(sentences[1], 48)
    items.push(
      `【判断+依据】判断正误：「${stem}」。若错，写出正确表述；若对，用本课另一处内容作旁证。`
    )
  }

  const weak = hits.filter((h) => h.count <= 2)
  if (weak.length > 0) {
    items.push(
      `【选择·自测】关于「${weak[0].term}」，自拟 1 道四选一选择题（含 A～D 与标准答案），题干须扣本课转写。`
    )
  }

  for (const e of ctx.explainRequests.slice(0, 1)) {
    items.push(
      `【闭卷简答】不看笔记，回答你课上曾问过的：「${truncate(e.selectedText, 40)}」（80 字内）。`
    )
  }

  if (!hasTranscript && hits.length > 0) {
    items.push(
      `【填空】${hits
        .slice(0, 3)
        .map((h) => `________（${h.term}）`)
        .join('；')} — 根据课标知识库释义补全。`
    )
  }

  if (hasTranscript && hits.length > 0 && hits.length <= 8) {
    items.push(
      '【查漏补缺】打开侧边「知识库」查看本库「尚未命中」词条，任选 2 个写一句话说明其与本课主题的关系。'
    )
  }

  const deduped = items.filter(
    (item, idx) => items.findIndex((x) => x === item) === idx
  )
  return deduped.slice(0, 6)
}
