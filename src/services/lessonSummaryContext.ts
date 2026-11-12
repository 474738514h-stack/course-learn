import type {
  Course,
  KnowledgePoint,
  Lesson,
  LessonEngagement,
} from '../types'

export interface LessonSummaryContext {
  courseTitle: string
  lessonTitle: string
  transcript: string
  knowledgeHits: { term: string; id: string; count: number; description: string }[]
  viewedKnowledge: KnowledgePoint[]
  addedKnowledge: KnowledgePoint[]
  explainRequests: { selectedText: string }[]
  notes: {
    content: string
    selectedText?: string
    fromExplain?: boolean
  }[]
}

const emptyEngagement = (): LessonEngagement => ({
  viewedKnowledgeIds: [],
  explainRequests: [],
  addedKnowledgeIds: [],
})

export function getLessonEngagement(lesson: Lesson): LessonEngagement {
  return lesson.engagement ?? emptyEngagement()
}

export function buildLessonSummaryContext(
  course: Course,
  lesson: Lesson,
  allKnowledgePoints: KnowledgePoint[]
): LessonSummaryContext {
  const kpById = new Map(allKnowledgePoints.map((k) => [k.id, k]))
  const engagement = getLessonEngagement(lesson)

  const knowledgeHits = Object.entries(lesson.knowledgePointHits)
    .map(([id, count]) => {
      const kp = kpById.get(id)
      if (!kp) return null
      return { id, term: kp.term, count, description: kp.description }
    })
    .filter(Boolean)
    .sort((a, b) => b!.count - a!.count) as LessonSummaryContext['knowledgeHits']

  const viewedKnowledge = engagement.viewedKnowledgeIds
    .map((id) => kpById.get(id))
    .filter(Boolean) as KnowledgePoint[]

  const addedKnowledge = engagement.addedKnowledgeIds
    .map((id) => kpById.get(id))
    .filter(Boolean) as KnowledgePoint[]

  return {
    courseTitle: course.title,
    lessonTitle: lesson.title,
    transcript: lesson.transcriptSegments.map((s) => s.text).join('\n'),
    knowledgeHits,
    viewedKnowledge,
    addedKnowledge,
    explainRequests: engagement.explainRequests.map((r) => ({
      selectedText: r.selectedText,
    })),
    notes: lesson.notes.map((n) => ({
      content: n.content,
      selectedText: n.selectedText,
      fromExplain: n.fromExplain,
    })),
  }
}
