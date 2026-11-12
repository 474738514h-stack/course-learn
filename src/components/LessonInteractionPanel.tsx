import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { Loader2, Send, Sparkles } from 'lucide-react'
import type { KnowledgePoint, Note } from '../types'
import { KnowledgeCard } from './KnowledgeCard'
import { NotesPanel } from './NotesPanel'
import { askLessonQuestion } from '../services/llm'

type TabId = 'chat' | 'notes'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  error?: boolean
}

interface LessonInteractionPanelProps {
  lessonTitle?: string
  transcriptText: string
  notes: Note[]
  knowledgePoints: KnowledgePoint[]
  hits: Record<string, number>
  chatKnowledgeIds: string[]
  selectedKnowledgeId: string | null
  onDismissChatKnowledge: (id: string) => void
  showKnowledgeCard?: boolean
}

export function LessonInteractionPanel({
  lessonTitle,
  transcriptText,
  notes,
  knowledgePoints,
  hits,
  chatKnowledgeIds,
  selectedKnowledgeId,
  onDismissChatKnowledge,
  showKnowledgeCard = true,
}: LessonInteractionPanelProps) {
  const [tab, setTab] = useState<TabId>('chat')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const lastCardRef = useRef<HTMLDivElement>(null)

  const queuedKnowledge = chatKnowledgeIds
    .map((id) => knowledgePoints.find((kp) => kp.id === id))
    .filter((kp): kp is KnowledgePoint => Boolean(kp))

  useEffect(() => {
    if (tab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, tab])

  useEffect(() => {
    if (chatKnowledgeIds.length === 0) return
    setTab('chat')
    requestAnimationFrame(() => {
      lastCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    })
  }, [
    chatKnowledgeIds.length,
    chatKnowledgeIds[chatKnowledgeIds.length - 1],
    selectedKnowledgeId,
  ])

  const sendQuestion = async () => {
    const q = input.trim()
    if (!q || sending) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    const result = await askLessonQuestion(q, {
      lessonTitle,
      transcript: transcriptText,
    })

    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: result.error
          ? result.error
          : result.content || '暂无回复',
        error: Boolean(result.error),
      },
    ])
    setSending(false)
  }

  const showChatPlaceholder =
    messages.length === 0 && queuedKnowledge.length === 0

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#fafafa]">
      <div className="shrink-0 p-3">
        <div className="flex rounded-xl bg-[#ececea] p-1 gap-1">
          <button
            type="button"
            onClick={() => setTab('chat')}
            className={clsx(
              'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
              tab === 'chat'
                ? 'bg-white text-notion-text shadow-sm'
                : 'text-notion-muted hover:text-notion-text'
            )}
          >
            AI 对话
            {queuedKnowledge.length > 0 ? ` · ${queuedKnowledge.length}` : ''}
          </button>
          <button
            type="button"
            onClick={() => setTab('notes')}
            className={clsx(
              'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
              tab === 'notes'
                ? 'bg-white text-notion-text shadow-sm'
                : 'text-notion-muted hover:text-notion-text'
            )}
          >
            笔记{notes.length ? ` (${notes.length})` : ''}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden mx-3 mb-3 rounded-xl border border-notion-border bg-white">
        {tab === 'chat' ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {showKnowledgeCard && queuedKnowledge.length > 0 && (
                <div className="space-y-4 mb-4">
                  {queuedKnowledge.map((kp, index) => {
                    const isLast = index === queuedKnowledge.length - 1
                    const isActive = selectedKnowledgeId === kp.id
                    return (
                      <div
                        key={kp.id}
                        ref={isLast ? lastCardRef : undefined}
                        className={clsx(
                          'animate-in fade-in slide-in-from-bottom-2',
                          isActive && 'ring-2 ring-violet-200/80 rounded-xl'
                        )}
                      >
                        <KnowledgeCard
                          variant="chat"
                          knowledgePoint={kp}
                          hitCount={hits[kp.id] || 0}
                          onClose={() => onDismissChatKnowledge(kp.id)}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
              {showChatPlaceholder ? (
                <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center px-2">
                  <div className="rounded-2xl border border-dashed border-notion-border/90 bg-[#fafafa] w-full py-10 px-5">
                    <div className="w-11 h-11 mx-auto rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                      <Sparkles size={22} />
                    </div>
                    <h3 className="text-base font-semibold text-notion-text">
                      AI 对话
                    </h3>
                    <p className="text-[13px] text-notion-muted mt-2 leading-relaxed max-w-[240px] mx-auto">
                      点击转写高亮词会依次在本区排队展示，卡片关闭前不会消失。
                    </p>
                  </div>
                </div>
              ) : null}
              {messages.length > 0 && (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={clsx(
                        'rounded-xl px-3 py-2.5 text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'ml-4 bg-notion-text text-white'
                          : msg.error
                            ? 'mr-1 bg-red-50 text-red-700 border border-red-100'
                            : 'mr-1 bg-[#f7f6f3] border border-notion-border text-notion-text'
                      )}
                    >
                      <ChatMarkdown content={msg.content} />
                    </div>
                  ))}
                  {sending && (
                    <p className="text-xs text-notion-muted">正在思考…</p>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
              {messages.length === 0 && queuedKnowledge.length > 0 && (
                <div ref={chatEndRef} />
              )}
            </div>

            <div className="shrink-0 border-t border-notion-border p-3 bg-[#fafafa] rounded-b-xl">
              <div className="flex items-center gap-1.5 text-xs font-medium text-violet-700 mb-2">
                <Sparkles size={14} />
                问 AI
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void sendQuestion()
                    }
                  }}
                  placeholder="问具体问题，或基于上文继续问…"
                  className="flex-1 min-w-0 h-10 text-sm rounded-xl border border-notion-border bg-white px-3 focus:outline-none focus:ring-2 focus:ring-violet-500/15 focus:border-violet-400 placeholder:text-notion-muted/70"
                />
                <button
                  type="button"
                  onClick={() => void sendQuestion()}
                  disabled={!input.trim() || sending}
                  className={clsx(
                    'shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-medium transition-colors',
                    !input.trim() || sending
                      ? 'bg-notion-border text-notion-muted cursor-not-allowed'
                      : 'bg-notion-text text-white hover:bg-notion-text/90'
                  )}
                >
                  {sending ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  发送
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <NotesPanel
              notes={notes}
              knowledgePoints={knowledgePoints}
              showHeader={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ChatMarkdown({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-1 whitespace-pre-wrap break-words">
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g)
        return (
          <p key={i} className={line ? undefined : 'h-2'}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j}>{part.slice(2, -2)}</strong>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </p>
        )
      })}
    </div>
  )
}
