export type AppHistoryRoute =
  | { v: 1; page: 'courses' }
  | { v: 1; page: 'course'; courseId: string }
  | { v: 1; page: 'summary'; courseId: string }

export function pathForAppRoute(route: AppHistoryRoute): string {
  if (route.page === 'courses') return '#/courses'
  if (route.page === 'course') return `#/course/${route.courseId}`
  return `#/course/${route.courseId}/summary`
}

export function parseAppRouteFromLocation(): AppHistoryRoute {
  const hash = window.location.hash.replace(/^#/, '') || '/courses'
  const summaryMatch = hash.match(/^\/course\/([^/]+)\/summary\/?$/)
  if (summaryMatch) {
    return { v: 1, page: 'summary', courseId: decodeURIComponent(summaryMatch[1]) }
  }
  const courseMatch = hash.match(/^\/course\/([^/]+)\/?$/)
  if (courseMatch) {
    return { v: 1, page: 'course', courseId: decodeURIComponent(courseMatch[1]) }
  }
  return { v: 1, page: 'courses' }
}

export function isAppHistoryRoute(state: unknown): state is AppHistoryRoute {
  return (
    typeof state === 'object' &&
    state !== null &&
    'v' in state &&
    (state as AppHistoryRoute).v === 1 &&
    'page' in state
  )
}
