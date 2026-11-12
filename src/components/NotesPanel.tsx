import { StickyNote } from 'lucide-react'
import type { Note, KnowledgePoint } from '../types'
import { KnowledgeCard, KnowledgeList } from './KnowledgeCard'

interface NotesPanelProps {
  notes: Note[]
  knowledgePoints: KnowledgePoint[]
  showHeader?: boolean
}

export function NotesPanel({
  notes,
  knowledgePoints,
  showHeader = true,
}: NotesPanelProps) {
  const sorted = [...notes].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div>
      {showHeader ? (
        <h3 className="text-xs font-medium text-notion-muted uppercase tracking-wider px-1 mb-2 flex items-center gap-1.5">
          <StickyNote size={12} />
          笔记 ({notes.length})
        </h3>
      ) : null}

      {sorted.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-notion-muted leading-relaxed">
            划词选中文本后<br />可添加笔记或智能解释
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              knowledgePoints={knowledgePoints}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NoteItem({
  note,
  knowledgePoints,
}: {
  note: Note
  knowledgePoints: KnowledgePoint[]
}) {
  const linkedKp = note.knowledgePointId
    ? knowledgePoints.find((kp) => kp.id === note.knowledgePointId)
    : null

  const time = new Date(note.createdAt).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="p-3 rounded-lg border border-notion-border bg-white hover:shadow-sm transition-shadow">
      {note.selectedText && (
        <div className="text-[11px] text-notion-muted bg-notion-sidebar rounded px-2 py-1 mb-2 line-clamp-1">
          「{note.selectedText}」
        </div>
      )}
      <p className="text-sm text-notion-text leading-relaxed line-clamp-4">
        {note.content}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-notion-muted">{time}</span>
        {linkedKp && (
          <span className="text-[10px] bg-notion-kp text-blue-600 px-1.5 py-0.5 rounded">
            {linkedKp.term}
          </span>
        )}
      </div>
    </div>
  )
}

interface RightPanelProps {
  notes: Note[]
  knowledgePoints: KnowledgePoint[]
  hits: Record<string, number>
  selectedKnowledgeId: string | null
  onSelectKnowledge: (id: string) => void
  onCloseKnowledge: () => void
  variant?: 'sidebar' | 'card'
}

export function RightPanel({
  notes,
  knowledgePoints,
  hits,
  selectedKnowledgeId,
  onSelectKnowledge,
  onCloseKnowledge,
  variant = 'sidebar',
}: RightPanelProps) {
  const selectedKp = selectedKnowledgeId
    ? knowledgePoints.find((kp) => kp.id === selectedKnowledgeId)
    : null

  return (
    <aside
      className={
        variant === 'card'
          ? 'flex flex-col h-full min-h-0 overflow-hidden bg-white'
          : 'w-80 shrink-0 border-l border-notion-border bg-notion-sidebar/30 flex flex-col h-full overflow-hidden'
      }
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {selectedKp ? (
          <KnowledgeCard
            knowledgePoint={selectedKp}
            hitCount={hits[selectedKp.id] || 0}
            onClose={onCloseKnowledge}
          />
        ) : (
          <KnowledgeList
            knowledgePoints={knowledgePoints}
            hits={hits}
            selectedId={selectedKnowledgeId}
            onSelect={onSelectKnowledge}
          />
        )}

        <div className="border-t border-notion-border pt-4">
          <NotesPanel notes={notes} knowledgePoints={knowledgePoints} />
        </div>
      </div>
    </aside>
  )
}
