import type { Course, LessonSummary } from '../types'

const LESSON_1_SAMPLE: LessonSummary = {
  generatedAt: new Date('2026-04-11T23:43:08').getTime(),
  coreSummary: `本课围绕 **一元二次方程** 展开，落实 2026 课标九年级代数要求：理解概念、掌握解法并用于简单实际问题。

主线包括：用配方法、公式法、因式分解法解方程；用 **判别式** 判断根的情况；运用 **根与系数关系** 解决求值问题。`,
  lessonFocusStructured: {
    conclusions: [
      '一元二次方程是九年级代数的核心模型，解法需根据方程结构灵活选择。',
      '判别式 Δ=b²−4ac 决定实根个数，应在解题前先判断或检验。',
      '根与系数关系可在不解方程的情况下求对称式、参数范围。',
    ],
    inspirations: [
      '增长率、面积等问题先设元再列方程，体现数学建模思想。',
      '配方与公式法联系紧密，理解推导有助于避免机械套公式。',
      '与二次函数、不等式联系复习，形成「方程—函数—图像」整体观。',
    ],
    knowledgeClues: [
      { term: '一元二次方程', count: 42, detail: '本课核心概念与各类解法。' },
      { term: '判别式', count: 28, detail: '判断根的情况，常与参数讨论结合。' },
      { term: '根与系数关系', count: 15, detail: '韦达定理及其变形应用。' },
      { term: '二次函数', count: 8, detail: '与方程的根、图像交点相联系。' },
    ],
  },
  lessonFocus: '',
  notesReading: `课堂笔记（阅读版）：老师强调先整理为标准形式 ax²+bx+c=0，再选方法。配方法适用于 a=1 且 b 为偶数时较简便；公式法通用但需化简。

关于判别式，笔记记录：Δ>0 两不等实根，Δ=0 两相等实根，Δ<0 无实根。作业中要注意单位与检验根是否符合实际情境。`,
  actionItems: [
    '完成 5 道一元二次方程（配方法、公式法、因式分解法各至少 1 道）。',
    '用判别式讨论含参数 m 的方程根的情况，写出 3 步推理过程。',
    '预习「二次函数图像与性质」，列出与方程实根的联系。',
    '将本课错题整理进错题本，标注错误类型（计算/概念/建模）。',
  ],
  keyPoints: ['一元二次方程解法', '判别式', '根与系数关系'],
  goldenQuotes: ['先化标准形，再选方法。', '实际问题要检验根是否合理。'],
  knowledgeMarkdown: '',
  userFocusMarkdown: '',
  notesMarkdown: '',
  mindMap: {
    label: '一元二次方程',
    children: [
      { label: '课堂结论', children: [{ label: '解法选择' }] },
      { label: '内容启发', children: [{ label: '建模思想' }] },
      { label: '知识点线索', children: [{ label: '判别式' }, { label: '韦达' }] },
      { label: '行动建议', children: [{ label: '错题整理' }] },
      { label: '历史关联', children: [{ label: '第2课 物理' }] },
    ],
  },
  fullMarkdown: '',
}

LESSON_1_SAMPLE.fullMarkdown = `# 数学 · 一元二次方程 · 学习总结\n\n${LESSON_1_SAMPLE.coreSummary}`

const SAMPLES: Record<string, LessonSummary> = {
  'lesson-1': LESSON_1_SAMPLE,
}

export function getSampleLessonSummary(lessonId: string): LessonSummary | undefined {
  const sample = SAMPLES[lessonId]
  if (!sample) return undefined
  return { ...sample, generatedAt: sample.generatedAt }
}

export function mergeSampleSummaries(stored: Course[]): Course[] {
  return stored.map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson) => {
      const sample = getSampleLessonSummary(lesson.id)
      if (!sample) return lesson
      const needsSample =
        !lesson.summary ||
        !lesson.summary.coreSummary?.trim() ||
        !lesson.summary.lessonFocusStructured
      if (!needsSample) return lesson
      return { ...lesson, summary: { ...sample } }
    }),
  }))
}
