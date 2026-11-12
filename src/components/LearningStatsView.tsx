import { useMemo, useState } from 'react'
import { Play, Search, ChevronLeft, ChevronRight, Network, LayoutGrid } from 'lucide-react'
import { KnowledgeGraphForce } from './KnowledgeGraphForce'
import clsx from 'clsx'
import type { KnowledgePoint, KnowledgePointHitTimeline } from '../types'
import {
  KNOWLEDGE_CATEGORIES,
  groupKnowledgePoints,
  type KnowledgeCategoryId,
} from '../data/knowledgeCategories'

type FilterId = 'all' | 'hit' | 'miss' | 'hot'
type ViewMode = 'heatmap' | 'graph'

interface LearningStatsViewProps {
  knowledgePoints: KnowledgePoint[]
  hits: Record<string, number>
  timeline: KnowledgePointHitTimeline[]
  onStartCourse: () => void
  selectedId: string | null
  onSelect: (id: string | null) => void
}

const PAGE_SIZE = 24

export function LearningStatsView({
  knowledgePoints,
  hits,
  timeline,
  onStartCourse,
  selectedId,
  onSelect,
}: LearningStatsViewProps) {
  const [filter, setFilter] = useState<FilterId>('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('graph')
  const [categoryPages, setCategoryPages] = useState<
    Record<KnowledgeCategoryId, number>
  >({ math: 0, science: 0, language: 0, society: 0 })

  const grouped = useMemo(
    () => groupKnowledgePoints(knowledgePoints),
    [knowledgePoints]
  )

  const kpIdSet = useMemo(
    () => new Set(knowledgePoints.map((p) => p.id)),
    [knowledgePoints]
  )

  const scopedHits = useMemo(() => {
    const out: Record<string, number> = {}
    for (const [id, count] of Object.entries(hits)) {
      if (kpIdSet.has(id) && count > 0) out[id] = count
    }
    return out
  }, [hits, kpIdSet])

  const hotThreshold = useMemo(() => {
    const values = Object.values(scopedHits)
    if (values.length === 0) return 3
    return Math.max(3, ...values.sort((a, b) => b - a).slice(0, 5))
  }, [scopedHits])

  const filteredPoints = useMemo(() => {
    const q = search.trim().toLowerCase()
    return knowledgePoints.filter((kp) => {
      const hit = scopedHits[kp.id] || 0
      if (filter === 'hit' && hit === 0) return false
      if (filter === 'miss' && hit > 0) return false
      if (filter === 'hot' && hit < hotThreshold) return false
      if (!q) return true
      const hay = [kp.term, ...kp.aliases, kp.description].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [knowledgePoints, scopedHits, filter, search, hotThreshold])

  const filteredGrouped = useMemo(() => {
    const ids = new Set(filteredPoints.map((p) => p.id))
    return {
      math: grouped.math.filter((p) => ids.has(p.id)),
      science: grouped.science.filter((p) => ids.has(p.id)),
      language: grouped.language.filter((p) => ids.has(p.id)),
      society: grouped.society.filter((p) => ids.has(p.id)),
    }
  }, [grouped, filteredPoints])

  const selected = selectedId
    ? knowledgePoints.find((k) => k.id === selectedId)
    : null

  const totalHit = Object.values(scopedHits).reduce((a, b) => a + b, 0)
  const hitConcepts = Object.keys(scopedHits).length

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f7f6f3]">
      <div className="shrink-0 px-8 pt-8 pb-4">
        <div className="rounded-2xl border border-notion-border bg-white px-8 py-7 flex items-center justify-between shadow-card">
          <div>
            <h1 className="text-3xl font-semibold text-notion-text tracking-tight">
              欢迎回来
            </h1>
          </div>
          <button
            onClick={onStartCourse}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-notion-text text-white text-sm font-medium hover:bg-notion-text/90 transition-colors shrink-0"
          >
            <Play size={16} />
            新建课堂
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 px-8 pb-8 gap-4">
        <div className="flex-1 flex flex-col min-w-0 rounded-2xl border border-notion-border bg-white shadow-card overflow-hidden">
          <div className="shrink-0 px-6 py-5 border-b border-notion-border">
            <h2 className="text-xl font-semibold text-notion-text">
              知识点学习地图
            </h2>
            <p className="text-xs text-notion-muted mt-1">
              AI 三联知识库 · 热度来自课堂转写命中（已命中{' '}
              {hitConcepts} 个概念 · 共 {totalHit} 次）
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              {(
                [
                  ['all', '全部'],
                  ['hit', '已命中'],
                  ['miss', '未命中'],
                  ['hot', '高频'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    filter === id
                      ? 'bg-notion-text text-white border-notion-text'
                      : 'bg-white text-notion-muted border-notion-border hover:bg-notion-hover'
                  )}
                >
                  {label}
                </button>
              ))}
              <span className="text-[11px] text-notion-muted ml-1">
                当前显示 {filteredPoints.length} / {knowledgePoints.length}
              </span>

              <div className="flex-1 min-w-[120px]" />

              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-notion-muted"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索知识点或别名"
                  className="pl-8 pr-3 py-1.5 text-xs border border-notion-border rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex rounded-lg border border-notion-border p-0.5 bg-notion-sidebar">
                <button
                  onClick={() => setViewMode('heatmap')}
                  className={clsx(
                    'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium',
                    viewMode === 'heatmap'
                      ? 'bg-white shadow-sm text-notion-text'
                      : 'text-notion-muted'
                  )}
                >
                  <LayoutGrid size={13} />
                  热力图
                </button>
                <button
                  onClick={() => setViewMode('graph')}
                  className={clsx(
                    'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium',
                    viewMode === 'graph'
                      ? 'bg-white shadow-sm text-notion-text'
                      : 'text-notion-muted'
                  )}
                >
                  <Network size={13} />
                  关系图谱
                </button>
              </div>
            </div>

            {viewMode === 'heatmap' && (
              <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-notion-muted">
                {KNOWLEDGE_CATEGORIES.map((c) => (
                  <span key={c.id} className="flex items-center gap-1.5">
                    <span className={clsx('w-2 h-2 rounded-full', c.dotClass)} />
                    {c.title}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div
            className={clsx(
              'flex-1 min-h-0',
              viewMode === 'graph'
                ? 'overflow-hidden flex flex-col'
                : 'overflow-y-auto p-6'
            )}
          >
            {viewMode === 'heatmap' ? (
              <div className="space-y-8">
                {KNOWLEDGE_CATEGORIES.map((cat) => (
                  <CategoryHeatmapRow
                    key={cat.id}
                    category={cat}
                    points={filteredGrouped[cat.id]}
                    hits={scopedHits}
                    page={categoryPages[cat.id]}
                    onPageChange={(p) =>
                      setCategoryPages((prev) => ({ ...prev, [cat.id]: p }))
                    }
                    selectedId={selectedId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            ) : (
              <KnowledgeGraphForce
                points={filteredPoints}
                hits={scopedHits}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            )}
          </div>

          <p className="shrink-0 text-[11px] text-notion-muted px-6 py-3 border-t border-notion-border bg-notion-sidebar/30">
            {viewMode === 'graph'
              ? '滚轮缩放，拖动画布，点击节点查看详情；高亮点表示已在历史课程中命中。'
              : '点击知识点卡片查看详情；颜色越深表示命中次数越多。'}
          </p>
        </div>

        {selected && (
          <aside className="w-80 shrink-0 rounded-2xl border border-notion-border bg-white shadow-card overflow-y-auto">
            <StatsDetailPanel
              kp={selected}
              hitCount={scopedHits[selected.id] || 0}
              timeline={timeline}
              onClose={() => onSelect(null)}
            />
          </aside>
        )}
      </div>
    </div>
  )
}

function CategoryHeatmapRow({
  category,
  points,
  hits,
  page,
  onPageChange,
  selectedId,
  onSelect,
}: {
  category: (typeof KNOWLEDGE_CATEGORIES)[0]
  points: KnowledgePoint[]
  hits: Record<string, number>
  page: number
  onPageChange: (p: number) => void
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const totalPages = Math.max(1, Math.ceil(points.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const slice = points.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const hitInCat = points.filter((p) => (hits[p.id] || 0) > 0).length

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={clsx('w-2.5 h-2.5 rounded-full', category.dotClass)} />
          <h3 className="text-sm font-semibold text-notion-text">
            {category.title}
          </h3>
          <span className="text-[11px] text-notion-muted">
            命中 {hitInCat} / {points.length}
          </span>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              disabled={safePage === 0}
              onClick={() => onPageChange(safePage - 1)}
              className="p-1 rounded hover:bg-notion-hover disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] text-notion-muted tabular-nums">
              {safePage + 1}/{totalPages}
            </span>
            <button
              disabled={safePage >= totalPages - 1}
              onClick={() => onPageChange(safePage + 1)}
              className="p-1 rounded hover:bg-notion-hover disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {slice.map((kp) => {
          const hit = hits[kp.id] || 0
          const active = selectedId === kp.id
          return (
            <button
              key={kp.id}
              onClick={() => onSelect(kp.id)}
              className={clsx(
                'px-3 py-2 rounded-xl text-xs font-medium border transition-all max-w-[140px] truncate',
                active
                  ? 'bg-violet-600 text-white border-violet-600 shadow-md scale-[1.02]'
                  : hit > 0
                    ? 'bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              )}
              title={kp.description}
            >
              {kp.term}
              {hit > 0 && (
                <span className="ml-1 opacity-70">({hit})</span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function StatsDetailPanel({
  kp,
  hitCount,
  timeline,
  onClose,
}: {
  kp: KnowledgePoint
  hitCount: number
  timeline: KnowledgePointHitTimeline[]
  onClose: () => void
}) {
  const aliasLine = kp.aliases.slice(0, 3).join(' / ')

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-[11px] text-notion-muted mb-1 truncate">
            {kp.term}
            {aliasLine ? ` · ${aliasLine}` : ''}
          </p>
          <h3 className="text-lg font-semibold text-notion-text">{kp.term}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-notion-muted hover:text-notion-text shrink-0"
        >
          关闭
        </button>
      </div>

      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 mb-3">
        命中 {hitCount} 次
      </span>

      <p className="text-sm text-notion-muted leading-relaxed mb-4">
        {kp.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {kp.tags.map((t) => (
          <span
            key={t}
            className="text-[10px] px-2 py-0.5 rounded-full bg-notion-sidebar border border-notion-border"
          >
            {t}
          </span>
        ))}
      </div>

      <div>
        <h4 className="text-xs font-medium text-notion-muted mb-2">
          最近命中课程
        </h4>
        {timeline.length === 0 ? (
          <p className="text-xs text-notion-muted leading-relaxed">
            暂无历史命中。开始听课并完成转写后，将在此按课程汇总命中次数。
          </p>
        ) : (
          <ul className="space-y-3">
            {timeline.map((course) => (
              <li
                key={course.courseId}
                className="rounded-xl border border-notion-border bg-notion-sidebar/40 px-3 py-2.5"
              >
                <div className="flex justify-between gap-2 text-sm font-medium text-notion-text">
                  <span className="truncate">{course.courseTitle}</span>
                  <span className="text-violet-700 shrink-0 tabular-nums">
                    {course.hits} 次
                  </span>
                </div>
                {course.lessons.length > 0 && (
                  <ul className="mt-2 space-y-1 border-t border-notion-border/80 pt-2">
                    {course.lessons.map((lesson) => (
                      <li key={lesson.lessonId}>
                        <button
                          type="button"
                          className="group w-full flex items-center justify-between gap-2 text-left text-[11px] rounded-lg px-2.5 py-2 text-notion-muted border border-transparent bg-transparent hover:bg-white hover:border-notion-border hover:text-notion-text hover:shadow-sm active:bg-notion-sidebar transition-all cursor-pointer"
                          onClick={() => {
                            /* 后续：跳转课程 / 课节详情 */
                          }}
                        >
                          <span className="truncate font-medium group-hover:text-notion-text">
                            {lesson.lessonTitle}
                          </span>
                          <span className="shrink-0 tabular-nums text-notion-muted group-hover:text-violet-700">
                            {lesson.hits} 次
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
