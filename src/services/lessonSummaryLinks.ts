import type { Course, KnowledgePoint, Lesson, LessonHistoryLink } from '../types'

export function buildHistoricalLessonLinks(
  courses: Course[],
  currentCourseId: string,
  currentLessonId: string,
  hitIds: string[],
  knowledgePoints: KnowledgePoint[]
): LessonHistoryLink[] {
  if (hitIds.length === 0) return []

  const termById = new Map(knowledgePoints.map((k) => [k.id, k.term]))
  const links: LessonHistoryLink[] = []

  for (const course of courses) {
    for (const lesson of course.lessons) {
      if (course.id === currentCourseId && lesson.id === currentLessonId) {
        continue
      }

      const sharedTerms: string[] = []
      let totalSharedHits = 0

      for (const id of hitIds) {
        const count = lesson.knowledgePointHits[id] || 0
        if (count > 0) {
          totalSharedHits += count
          const term = termById.get(id)
          if (term && !sharedTerms.includes(term)) {
            sharedTerms.push(term)
          }
        }
      }

      if (totalSharedHits > 0) {
        links.push({
          courseId: course.id,
          courseTitle: course.title,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          sharedTerms,
          totalSharedHits,
        })
      }
    }
  }

  return links.sort((a, b) => b.totalSharedHits - a.totalSharedHits)
}

export function getSortedLessonHits(
  lesson: Lesson,
  knowledgePoints: KnowledgePoint[]
) {
  const byId = new Map(knowledgePoints.map((k) => [k.id, k]))
  return Object.entries(lesson.knowledgePointHits)
    .map(([id, count]) => {
      const kp = byId.get(id)
      if (!kp) return null
      return { id, term: kp.term, count, description: kp.description }
    })
    .filter(Boolean)
    .sort((a, b) => b!.count - a!.count) as {
    id: string
    term: string
    count: number
    description: string
  }[]
}
