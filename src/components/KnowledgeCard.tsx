import { X, Tag } from 'lucide-react'
import clsx from 'clsx'
import type { KnowledgePoint } from '../types'
import { sortKnowledgeByTextbookOrder } from '../utils/knowledgeTextbookOrder'
import {
  knowledgeCardProductFocus,
  knowledgeCardTermMapping,
  knowledgeCardTitle,
} from '../utils/knowledgeCardContent'

interface KnowledgeCardProps {
  knowledgePoint: KnowledgePoint
  hitCount: number
  onClose: () => void
  /** AI 对话区：紧凑卡片（术语映射 / 含义 / 产品里关注） */
  variant?: 'default' | 'chat'
}

export function KnowledgeCard({
  knowledgePoint: kp,
  hitCount,
  onClose,
  variant = 'default',
}: KnowledgeCardProps) {
  if (variant === 'chat') {
    const title = knowledgeCardTitle(kp)
    return (
      <ChatKnowledgeCard
        kp={kp}
        title={title}
        hitCount={hitCount}
        onClose={onClose}
      />
    )
  }

  return (
    <div className="bg-white rounded-xl border border-notion-border shadow-card overflow-hidden animate-in slide-in-from-right-4">
      <div className="p-4 border-b border-notion-border bg-gradient-to-r from-blue-50/50 to-violet-50/50">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={clsx(
                  'text-[10px] px-1.5 py-0.5 rounded font-medium',
                  kp.category === 'preset'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                )}
              >
                {kp.category === 'preset' ? '系统预设' : '自定义'}
              </span>
              {hitCount > 0 && (
                <span className="text-[10px] text-notion-muted">
                  本课命中 {hitCount} 次
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-notion-text">{kp.term}</h3>
            <p className="text-sm text-notion-muted mt-0.5">{kp.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-notion-hover text-notion-muted"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {kp.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-white/80 rounded text-notion-muted"
            >
              <Tag size={9} />
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 max-h-[300px] overflow-y-auto">
        <MarkdownDetail content={kp.detail} />
      </div>
    </div>
  )
}

function ChatKnowledgeCard({
  kp,
  title,
  hitCount,
  onClose,
}: {
  kp: KnowledgePoint
  title: string
  hitCount: number
  onClose: () => void
}) {
  const mapping = knowledgeCardTermMapping(kp)
  const productFocus = knowledgeCardProductFocus(kp)

  return (
    <div className="rounded-2xl border border-violet-200/70 bg-gradient-to-b from-violet-50/90 to-violet-50/40 p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <h3 className="flex-1 text-[17px] font-semibold text-notion-text leading-snug">
          {title}
        </h3>
        {hitCount > 0 && (
          <span className="shrink-0 text-[11px] font-medium text-violet-700 bg-violet-100/90 border border-violet-200/80 px-2 py-0.5 rounded-full">
            命中 x{hitCount}
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 rounded-md hover:bg-violet-100/80 text-notion-muted"
          aria-label="关闭"
        >
          <X size={15} />
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-notion-border/80 bg-white p-4 shadow-card/30">
        <p className="text-[13px] font-medium text-violet-600">术语映射</p>
        <p className="mt-1 text-[15px] font-semibold text-blue-700 leading-snug">
          {mapping}
        </p>

        <p className="mt-4 text-[13px] font-medium text-violet-600">含义</p>
        <p className="mt-1.5 text-[15px] font-medium text-notion-text leading-relaxed">
          {kp.description}
        </p>

        <div className="mt-4 pt-3 border-t border-notion-border/70">
          <p className="text-sm text-notion-text leading-relaxed">
            <span className="text-notion-muted">产品里关注：</span>
            {productFocus}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[12px] text-notion-muted leading-relaxed">
        可在下方继续追问这个知识点与本节课案例的关系。
      </p>
    </div>
  )
}

function MarkdownDetail({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-2 text-sm leading-relaxed text-notion-text">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.includes('**')) {
          const text = line.replace(/\*\*/g, '')
          if (text.endsWith(':') || text.endsWith('：')) {
            return (
              <h4 key={i} className="font-semibold text-notion-text mt-3 first:mt-0">
                {text}
              </h4>
            )
          }
        }
        if (line.match(/^\d+\.\s/)) {
          return (
            <div key={i} className="flex gap-2 ml-1">
              <span className="text-blue-500 font-mono text-xs mt-0.5">
                {line.match(/^(\d+)/)?.[1]}.
              </span>
              <span>{line.replace(/^\d+\.\s\*\*/, '').replace(/\*\*/g, '')}</span>
            </div>
          )
        }
        if (line.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 ml-1">
              <span className="text-notion-muted mt-1.5">•</span>
              <span>{line.slice(2).replace(/\*\*/g, '')}</span>
            </div>
          )
        }
        if (line.trim() === '') return null
        return <p key={i}>{line.replace(/\*\*/g, '')}</p>
      })}
    </div>
  )
}

interface KnowledgeListProps {
  knowledgePoints: KnowledgePoint[]
  hits: Record<string, number>
  selectedId: string | null
  onSelect: (id: string) => void
  title?: string
  emptyMessage?: string
}

export function KnowledgeList({
  knowledgePoints,
  hits,
  selectedId,
  onSelect,
  title = '知识点',
  emptyMessage = '暂无知识点',
}: KnowledgeListProps) {
  const sorted = sortKnowledgeByTextbookOrder(knowledgePoints)

  if (sorted.length === 0) {
    return (
      <p className="text-xs text-notion-muted px-1 py-6 text-center leading-relaxed">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {title ? (
        <h3 className="text-xs font-medium text-notion-muted uppercase tracking-wider px-1 mb-2">
          {title}
        </h3>
      ) : null}
      {sorted.map((kp) => {
        const hitCount = hits[kp.id] || 0
        return (
          <button
            key={kp.id}
            type="button"
            onClick={() => onSelect(kp.id)}
            className={clsx(
              'w-full text-left px-2 py-1.5 rounded-lg text-[13px] transition-all',
              selectedId === kp.id
                ? 'bg-notion-kp border border-blue-200'
                : 'hover:bg-notion-hover border border-transparent',
              hitCount > 0 && selectedId !== kp.id && 'bg-blue-50/30'
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={clsx(
                  'font-medium',
                  hitCount > 0 ? 'text-blue-700' : 'text-notion-text'
                )}
              >
                {kp.term}
              </span>
              {hitCount > 0 && (
                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                  {hitCount}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
