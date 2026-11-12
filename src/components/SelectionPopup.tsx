import { useState } from 'react'
import {
  Sparkles,
  StickyNote,
  Lightbulb,
  X,
  Loader2,
} from 'lucide-react'
import clsx from 'clsx'
import type { KnowledgePoint, SelectionAction } from '../types'
import { explainText } from '../services/llm'

interface SelectionPopupProps {
  action: SelectionAction
  transcriptContext?: string
  knowledgePoints?: KnowledgePoint[]
  onClose: () => void
  onAddNote: (
    content: string,
    selectedText: string,
    options?: { fromExplain?: boolean }
  ) => void
  onAddKnowledge: (term: string, description: string) => void
  onExplainRequest?: (selectedText: string) => void
}

export function SelectionPopup({
  action,
  transcriptContext,
  knowledgePoints,
  onClose,
  onAddNote,
  onAddKnowledge,
  onExplainRequest,
}: SelectionPopupProps) {
  const [mode, setMode] = useState<'menu' | 'explain' | 'note' | 'knowledge'>(
    'menu'
  )
  const [explainContent, setExplainContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [kpDescription, setKpDescription] = useState('')

  const handleExplain = async () => {
    onExplainRequest?.(action.selectedText)
    setMode('explain')
    setLoading(true)
    setExplainContent('')
    const result = await explainText(
      action.selectedText,
      transcriptContext,
      knowledgePoints
    )
    setExplainContent(
      result.error && !result.content?.trim()
        ? `**暂时无法生成解释**\n\n${result.error}\n\n请稍后重试或继续听课。`
        : result.content +
            (result.error
              ? `\n\n---\n*模型暂时不可用，已使用知识库与转写语境生成离线解释。*`
              : '')
    )
    setLoading(false)
  }

  const handleSaveNote = () => {
    onAddNote(noteContent || action.selectedText, action.selectedText)
    onClose()
  }

  const handleSaveKnowledge = () => {
    onAddKnowledge(action.selectedText, kpDescription || `关于「${action.selectedText}」的自定义知识点`)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-white rounded-xl shadow-popup border border-notion-border w-80 animate-in fade-in slide-in-from-bottom-2"
        style={{
          left: Math.min(action.position.x - 160, window.innerWidth - 340),
          top: Math.max(action.position.y - 10, 10),
          transform: 'translateY(-100%)',
        }}
      >
        {mode === 'menu' && (
          <div className="p-1.5">
            <div className="px-3 py-2 border-b border-notion-border mb-1">
              <p className="text-xs text-notion-muted truncate">
                「{action.selectedText}」
              </p>
            </div>
            <MenuButton
              icon={<Sparkles size={15} />}
              label="智能解释"
              desc="生成本课语境下的详细解释"
              onClick={handleExplain}
            />
            <MenuButton
              icon={<StickyNote size={15} />}
              label="加入笔记"
              desc="保存到本课笔记"
              onClick={() => setMode('note')}
            />
            <MenuButton
              icon={<Lightbulb size={15} />}
              label="标记为知识点"
              desc="创建自定义知识点"
              onClick={() => setMode('knowledge')}
            />
          </div>
        )}

        {mode === 'explain' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Sparkles size={14} className="text-violet-500" />
                智能解释
              </h4>
              <button onClick={onClose} className="text-notion-muted hover:text-notion-text">
                <X size={14} />
              </button>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-notion-muted py-8 justify-center">
                <Loader2 size={16} className="animate-spin" />
                正在生成解释...
              </div>
            ) : (
              <div className="text-sm text-notion-text leading-relaxed max-h-60 overflow-y-auto prose-sm">
                <MarkdownLite content={explainContent} />
              </div>
            )}
            {!loading && (
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onAddNote(explainContent, action.selectedText, {
                      fromExplain: true,
                    })
                    onClose()
                  }}
                  className="w-full text-xs py-2.5 bg-notion-sidebar rounded-lg hover:bg-notion-hover transition-colors text-notion-muted"
                >
                  保存为笔记
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setKpDescription(plainTextFromExplain(explainContent))
                    setMode('knowledge')
                  }}
                  className="w-full text-xs py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  标记为知识点
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'note' && (
          <div className="p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-1.5">
              <StickyNote size={14} className="text-amber-500" />
              添加笔记
            </h4>
            <textarea
              autoFocus
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder={`关于「${action.selectedText}」的笔记...`}
              className="w-full h-24 text-sm border border-notion-border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveNote}
                className="flex-1 text-xs py-2 bg-notion-text text-white rounded-lg hover:bg-notion-text/90 transition-colors"
              >
                保存
              </button>
              <button
                onClick={onClose}
                className="px-4 text-xs py-2 text-notion-muted hover:bg-notion-hover rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {mode === 'knowledge' && (
          <div className="p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-1.5">
              <Lightbulb size={14} className="text-yellow-500" />
              标记为知识点
            </h4>
            <div className="text-sm font-medium text-notion-text mb-2">
              {action.selectedText}
            </div>
            <textarea
              autoFocus
              value={kpDescription}
              onChange={(e) => setKpDescription(e.target.value)}
              placeholder="简要描述这个知识点..."
              className="w-full h-20 text-sm border border-notion-border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveKnowledge}
                className="flex-1 text-xs py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                创建并追踪
              </button>
              <button
                onClick={onClose}
                className="px-4 text-xs py-2 text-notion-muted hover:bg-notion-hover rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function MenuButton({
  icon,
  label,
  desc,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-notion-hover transition-colors text-left"
    >
      <span className="text-notion-muted">{icon}</span>
      <div>
        <div className="text-sm font-medium text-notion-text">{label}</div>
        <div className="text-[11px] text-notion-muted">{desc}</div>
      </div>
    </button>
  )
}

function plainTextFromExplain(content: string): string {
  return content
    .replace(/\*\*/g, '')
    .replace(/^>\s?/gm, '')
    .replace(/^-\s/gm, '')
    .trim()
}

function MarkdownLite({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={i} className="font-semibold">
              {line.replace(/\*\*/g, '')}
            </p>
          )
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-blue-200 pl-3 text-notion-muted italic"
            >
              {line.slice(2)}
            </blockquote>
          )
        }
        if (line.startsWith('- ')) {
          return (
            <li key={i} className="ml-4 list-disc text-notion-muted">
              {line.slice(2).replace(/\*\*/g, '')}
            </li>
          )
        }
        if (line.trim() === '') return <br key={i} />
        return (
          <p key={i} className={clsx(line.includes('**') && 'font-medium')}>
            {line.replace(/\*\*/g, '')}
          </p>
        )
      })}
    </div>
  )
}
