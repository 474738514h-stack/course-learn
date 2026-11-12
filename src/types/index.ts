export interface KnowledgePoint {
  id: string
  term: string
  aliases: string[]
  category: 'preset' | 'custom'
  description: string
  detail: string
  relatedTerms: string[]
  tags: string[]
}

export interface TranscriptSegment {
  id: string
  text: string
  timestamp: number
  isFinal: boolean
  matchedKnowledgeIds: string[]
}

export interface Note {
  id: string
  lessonId: string
  content: string
  selectedText?: string
  knowledgePointId?: string
  /** 来自 AI 解释的笔记 */
  fromExplain?: boolean
  createdAt: number
  updatedAt: number
}

export interface LessonExplainRequest {
  selectedText: string
  createdAt: number
}

/** 本课用户主动行为（点击、解释、新增知识点等） */
export interface LessonEngagement {
  viewedKnowledgeIds: string[]
  explainRequests: LessonExplainRequest[]
  addedKnowledgeIds: string[]
}

export interface MindMapNode {
  label: string
  children?: MindMapNode[]
}

export interface LessonFocusStructured {
  conclusions: string[]
  inspirations: string[]
  knowledgeClues: { term: string; count?: number; detail: string }[]
}

export interface LessonSummary {
  generatedAt: number
  /** 课程核心 + 完整摘要 */
  coreSummary?: string
  /** 课程重点：课堂结论与启发（Markdown） */
  lessonFocus?: string
  /** 课程重点结构化（优先于 Markdown 展示） */
  lessonFocusStructured?: LessonFocusStructured
  /** 课堂笔记阅读版 */
  notesReading?: string
  /** 可执行的查漏补缺动作 */
  actionItems?: string[]
  keyPoints: string[]
  goldenQuotes: string[]
  knowledgeMarkdown: string
  userFocusMarkdown: string
  notesMarkdown: string
  mindMap: MindMapNode
  fullMarkdown: string
  /** 复盘 Markdown 导入，无转写时不应被「重新生成」覆盖 */
  importedFromKeban?: boolean
}

export interface LessonHistoryLink {
  courseId: string
  courseTitle: string
  lessonId: string
  lessonTitle: string
  sharedTerms: string[]
  totalSharedHits: number
}

export interface Lesson {
  id: string
  title: string
  courseId: string
  duration?: string
  status: 'not_started' | 'in_progress' | 'completed'
  /** 本课重点知识点（可选；未配置时用 knowledgePointHits 键） */
  focusKnowledgeIds?: string[]
  knowledgePointHits: Record<string, number>
  transcriptSegments: TranscriptSegment[]
  notes: Note[]
  engagement?: LessonEngagement
  summary?: LessonSummary
}

export interface Course {
  id: string
  title: string
  description: string
  /** 创建/开课时间（列表第二行展示） */
  createdAt?: number
  /** 音视频总时长（秒），来自文件元数据或网页解析 */
  mediaDurationSec?: number
  lessons: Lesson[]
  /** 上传课程绑定的知识库 */
  knowledgeLibraryId?: string
  /** 网页课程来源链接 */
  sourceUrl?: string
  sourceType?: 'web' | 'upload'
  uploadFileName?: string
  /** 上传音视频 · 授课教师 */
  teacherName?: string
}

/** 某知识点在单门课程内的命中统计（含课节明细） */
export interface KnowledgePointHitTimeline {
  courseId: string
  courseTitle: string
  hits: number
  notes: Note[]
  lessons: { lessonId: string; lessonTitle: string; hits: number }[]
}

export interface SelectionAction {
  type: 'explain' | 'note' | 'knowledge'
  selectedText: string
  position: { x: number; y: number }
}

export interface LLMResponse {
  content: string
  loading: boolean
  error?: string
}

export interface AppState {
  courses: Course[]
  activeCourseId: string
  activeLessonId: string
  customKnowledgePoints: KnowledgePoint[]
  isListening: boolean
  audioSource: 'microphone' | 'tab'
  transcriptionEngine: 'browser' | 'tingwu'
  sidebarNav: 'stats' | 'courses' | 'knowledge'
}
