import type { KnowledgePoint, Lesson } from '../types'
import { getLessonFocusKnowledgePoints } from '../data/knowledgePoints'
import { KnowledgeList } from './KnowledgeCard'

interface LessonFocusKnowledgePanelProps {
  lesson: Lesson | undefined
  knowledgePoints: KnowledgePoint[]
  hits: Record<string, number>
  selectedId: string | null
  onSelect: (id: string) => void
}

export function LessonFocusKnowledgePanel({
  lesson,
  knowledgePoints,
  hits,
  selectedId,
  onSelect,
}: LessonFocusKnowledgePanelProps) {
  const focusPoints = getLessonFocusKnowledgePoints(
    lesson,
    knowledgePoints,
    hits
  )

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="shrink-0 px-3 py-3 border-b border-notion-border">
        <h2 className="text-sm font-semibold text-notion-text leading-snug">
          本课重点知识
        </h2>
        <p className="text-[10px] text-notion-muted mt-1 leading-snug">
          转写命中累计
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <KnowledgeList
          knowledgePoints={focusPoints}
          hits={hits}
          selectedId={selectedId}
          onSelect={onSelect}
          title=""
          emptyMessage="开始转写后，命中的课标知识点会在这里逐渐增加"
        />
      </div>
    </div>
  )
}
