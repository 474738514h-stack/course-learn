import { useMemo } from 'react'
import { BookMarked } from 'lucide-react'
import clsx from 'clsx'
import type { KnowledgePoint, KnowledgePointHitTimeline } from '../types'
import {
  KNOWLEDGE_LIBRARIES,
  filterPointsByLibrary,
} from '../data/knowledgeLibraries'
import { sortKnowledgeByTextbookOrder } from '../utils/knowledgeTextbookOrder'
interface KnowledgeBaseViewProps {
  knowledgePoints: KnowledgePoint[]
  selectedId: string | null
  globalHits: Record<string, number>
  timeline: KnowledgePointHitTimeline[]
  activeLibraryId: string
  onLibraryChange: (id: string) => void
  onSelectKnowledge: (id: string) => void
  onCloseDetail: () => void
}

export function KnowledgeBaseView({
  knowledgePoints,
  globalHits,
  activeLibraryId,
  onLibraryChange,
  onSelectKnowledge,
}: KnowledgeBaseViewProps) {
  const library =
    KNOWLEDGE_LIBRARIES.find((l) => l.id === activeLibraryId) ??
    KNOWLEDGE_LIBRARIES[0]

  const libraryPoints = useMemo(
    () => filterPointsByLibrary(knowledgePoints, library.id),
    [knowledgePoints, library.id]
  )

  const sortedPoints = useMemo(
    () => sortKnowledgeByTextbookOrder(libraryPoints),
    [libraryPoints]
  )

  const hitCountInLib = useMemo(
    () => libraryPoints.filter((kp) => (globalHits[kp.id] || 0) > 0).length,
    [libraryPoints, globalHits]
  )

  const hitPoints = useMemo(
    () =>
      sortedPoints.filter((kp) => (globalHits[kp.id] || 0) > 0),
    [sortedPoints, globalHits]
  )

  const gapPoints = useMemo(
    () =>
      sortedPoints.filter((kp) => !(globalHits[kp.id] || 0)),
    [sortedPoints, globalHits]
  )

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f7f6f3]">
      <div className="shrink-0 px-8 pt-8 pb-4">
        <div className="rounded-2xl border border-notion-border bg-white px-8 py-7 shadow-card">
          <h1 className="text-3xl font-semibold text-notion-text tracking-tight">
            知识库
          </h1>
          <p className="text-sm text-notion-muted mt-2 max-w-2xl leading-relaxed">
            按 AI 产品 / 工程 / 增长三本知识库浏览词条，课堂转写自动识别命中，可扩展自定义词条。
          </p>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 px-8 pb-8 gap-4">
        <div className="w-[280px] shrink-0 flex flex-col rounded-2xl border border-notion-border bg-white shadow-card overflow-hidden">
          <div className="shrink-0 px-5 py-4 border-b border-notion-border">
            <h2 className="text-sm font-semibold text-notion-text">知识库列表</h2>
            <p className="text-[11px] text-notion-muted mt-0.5">选择要浏览的知识库</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-notion-sidebar/20">
            {KNOWLEDGE_LIBRARIES.map((lib) => (
              <LibraryCard
                key={lib.id}
                lib={lib}
                active={library.id === lib.id}
                onSelect={() => onLibraryChange(lib.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 rounded-2xl border border-notion-border bg-white shadow-card overflow-hidden">
          <header className="shrink-0 px-6 py-5 border-b border-notion-border">
            <h2 className="text-xl font-semibold text-notion-text">
              {library.fullTitle}
            </h2>
            <p className="text-xs text-notion-muted mt-1 leading-relaxed max-w-3xl">
              {library.detailDescription} · 词条按预设顺序排列
            </p>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <section className="mb-8">
              <h3 className="text-base font-semibold text-notion-text">
                已解锁知识点
              </h3>
              <p className="text-xs text-notion-muted mt-1 mb-4 max-w-2xl leading-relaxed">
                以下词条可在课程中转写识别、划词解释与统计命中；你已在本库命中{' '}
                <span className="font-medium text-violet-700">{hitCountInLib}</span>{' '}
                / {libraryPoints.length} 个概念。
              </p>

              {sortedPoints.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-28 rounded-xl border border-dashed border-notion-border bg-notion-sidebar/30"
                    />
                  ))}
                </div>
              ) : (
                <>
                  {hitPoints.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      {hitPoints.map((kp) => (
                        <KnowledgePointLibraryCard
                          key={kp.id}
                          kp={kp}
                          hitCount={globalHits[kp.id]}
                          onSelect={() => onSelectKnowledge(kp.id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>

            {gapPoints.length > 0 && (
              <section>
                <h3 className="text-base font-semibold text-notion-text">
                  查漏补缺
                </h3>
                <p className="text-xs text-notion-muted mt-1 mb-4 max-w-2xl leading-relaxed">
                  以下词条在本库中尚未在任何课堂转写里命中，可作为补课与预习清单。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gapPoints.map((kp) => (
                    <KnowledgePointLibraryCard
                      key={kp.id}
                      kp={kp}
                      variant="gap"
                      onSelect={() => onSelectKnowledge(kp.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LibraryCard({
  lib,
  active,
  onSelect,
}: {
  lib: (typeof KNOWLEDGE_LIBRARIES)[0]
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'w-full text-left rounded-xl border px-4 py-4 transition-all bg-white',
        active
          ? 'border-violet-300 shadow-md ring-1 ring-violet-100'
          : 'border-notion-border hover:border-slate-300 hover:shadow-sm'
      )}
    >
      <span className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
        <BookMarked size={18} />
      </span>
      <h4 className="text-sm font-semibold text-notion-text leading-snug mb-1.5">
        {lib.fullTitle}
      </h4>
      <p className="text-[11px] text-notion-muted line-clamp-3 leading-relaxed">
        {lib.cardDescription}
      </p>
    </button>
  )
}

function KnowledgePointLibraryCard({
  kp,
  hitCount,
  variant = 'default',
  onSelect,
}: {
  kp: KnowledgePoint
  hitCount?: number
  variant?: 'default' | 'gap'
  onSelect?: () => void
}) {
  const aliasLine =
    kp.aliases.length > 0 ? kp.aliases.slice(0, 2).join(' · ') : null

  const Wrapper = onSelect ? 'button' : 'div'
  return (
    <Wrapper
      type={onSelect ? 'button' : undefined}
      onClick={onSelect}
      className={clsx(
        'text-left rounded-xl border px-5 py-4 min-h-[7.5rem] flex flex-col w-full transition-colors',
        variant === 'gap'
          ? 'border-dashed border-amber-200/90 bg-amber-50/30 hover:bg-amber-50/60'
          : 'border-notion-border bg-white hover:border-violet-200 hover:shadow-sm',
        onSelect && 'cursor-pointer'
      )}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-base font-semibold text-notion-text">{kp.term}</span>
        {hitCount != null && hitCount > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
            命中 {hitCount}
          </span>
        )}
        {variant === 'gap' && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
            待命中
          </span>
        )}
        {aliasLine && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 max-w-full truncate">
            又称 {aliasLine}
          </span>
        )}
      </div>
      <p className="text-sm text-notion-text leading-relaxed line-clamp-2">
        {kp.description}
      </p>
      {kp.detail && kp.detail !== kp.description && (
        <p className="text-xs text-notion-muted leading-relaxed line-clamp-3 mt-2 pt-2 border-t border-notion-border/60">
          {kp.detail}
        </p>
      )}
    </Wrapper>
  )
}
