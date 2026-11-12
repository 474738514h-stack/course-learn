import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import type { KnowledgePoint } from '../types'
import {
  KNOWLEDGE_CATEGORIES,
  categorizeKnowledgePoint,
  type KnowledgeCategoryId,
} from '../data/knowledgeCategories'

const CANVAS_W = 1180
const CANVAS_H = 720

const CAT_X: Record<KnowledgeCategoryId, number> = {
  math: CANVAS_W * 0.26,
  science: CANVAS_W * 0.42,
  language: CANVAS_W * 0.58,
  society: CANVAS_W * 0.74,
}

const CAT_FILL: Record<KnowledgeCategoryId, string> = {
  math: '#8b5cf6',
  science: '#34d399',
  language: '#38bdf8',
  society: '#fbbf24',
}

const CAT_STROKE: Record<KnowledgeCategoryId, string> = {
  math: '#7c3aed',
  science: '#059669',
  language: '#0284c7',
  society: '#d97706',
}

interface SimNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  r: number
  cat: KnowledgeCategoryId
  hit: number
  degree: number
}

interface KnowledgeGraphForceProps {
  points: KnowledgePoint[]
  hits: Record<string, number>
  selectedId: string | null
  onSelect: (id: string) => void
}

export function KnowledgeGraphForce({
  points,
  hits,
  selectedId,
  onSelect,
}: KnowledgeGraphForceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })
  const dragRef = useRef<{ px: number; py: number; x: number; y: number } | null>(
    null
  )

  const nodeById = useMemo(
    () => new Map(points.map((n) => [n.id, n])),
    [points]
  )

  const { simNodes, linkPairs } = useMemo(
    () => buildGraphSimulation(points, hits),
    [points, hits]
  )

  const positions = useMemo(() => {
    const map = new Map<string, SimNode>()
    for (const n of simNodes) map.set(n.id, n)
    return map
  }, [simNodes])

  const focusId = selectedId ?? hoverId

  const neighborIds = useMemo(() => {
    if (!focusId) return new Set<string>()
    const set = new Set<string>([focusId])
    for (const [a, b] of linkPairs) {
      if (a === focusId) set.add(b)
      if (b === focusId) set.add(a)
    }
    return set
  }, [focusId, linkPairs])

  const fitView = useCallback(() => {
    const el = containerRef.current
    if (!el || simNodes.length === 0) return
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const n of simNodes) {
      const kp = nodeById.get(n.id)
      const labelW = (kp?.term.length ?? 4) * 7 + n.r + 20
      minX = Math.min(minX, n.x - n.r)
      maxX = Math.max(maxX, n.x + labelW)
      minY = Math.min(minY, n.y - n.r - 8)
      maxY = Math.max(maxY, n.y + n.r + 24)
    }
    const pad = 56
    const bw = maxX - minX
    const bh = maxY - minY
    const k = Math.min(
      (el.clientWidth - pad) / bw,
      (el.clientHeight - pad) / bh,
      1.15
    )
    setTransform({
      k,
      x: (el.clientWidth - (minX + maxX) * k) / 2,
      y: (el.clientHeight - (minY + maxY) * k) / 2,
    })
  }, [simNodes, nodeById])

  const hitsSignature = useMemo(
    () =>
      points
        .map((p) => `${p.id}:${hits[p.id] || 0}`)
        .sort()
        .join('|'),
    [points, hits]
  )

  useEffect(() => {
    fitView()
  }, [fitView, points.length, hitsSignature])

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const delta = -e.deltaY * 0.001
    setTransform((t) => {
      const kNew = Math.min(2.8, Math.max(0.25, t.k * (1 + delta)))
      const ratio = kNew / t.k
      return {
        k: kNew,
        x: mx - (mx - t.x) * ratio,
        y: my - (my - t.y) * ratio,
      }
    })
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-graph-node]')) return
    dragRef.current = {
      px: e.clientX,
      py: e.clientY,
      x: transform.x,
      y: transform.y,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    setTransform((t) => ({
      ...t,
      x: dragRef.current!.x + (e.clientX - dragRef.current!.px),
      y: dragRef.current!.y + (e.clientY - dragRef.current!.py),
    }))
  }

  const onPointerUp = () => {
    dragRef.current = null
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-h-[420px] bg-white overflow-hidden cursor-grab active:cursor-grabbing"
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div className="absolute top-4 left-5 z-10 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-slate-600 pointer-events-none">
        {KNOWLEDGE_CATEGORIES.map((c) => (
          <span key={c.id} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: CAT_FILL[c.id] }}
            />
            {c.title}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={fitView}
        className="absolute top-3 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700"
      >
        <RotateCcw size={14} />
        重置视图
      </button>

      <svg width="100%" height="100%" className="select-none">
        <defs>
          <filter id="node-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.12" />
          </filter>
        </defs>
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {linkPairs.map(([from, to], i) => {
            const a = positions.get(from)
            const b = positions.get(to)
            if (!a || !b) return null
            const touchesFocus =
              focusId && (from === focusId || to === focusId)
            const bothNeighbors =
              focusId &&
              neighborIds.has(from) &&
              neighborIds.has(to) &&
              from !== focusId &&
              to !== focusId
            const dim = focusId && !touchesFocus && !bothNeighbors
            return (
              <line
                key={`${from}-${to}-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={touchesFocus ? '#a5b4fc' : '#e2e8f0'}
                strokeWidth={touchesFocus ? 1 : 0.75}
                strokeOpacity={
                  dim ? 0.12 : touchesFocus ? 0.45 : bothNeighbors ? 0.28 : 0.22
                }
              />
            )
          })}

          {simNodes.map((n) => {
            const kp = nodeById.get(n.id)
            if (!kp) return null
            const selected = selectedId === n.id
            const hovered = hoverId === n.id
            const dim = focusId && !neighborIds.has(n.id)
            const hit = hits[n.id] || 0
            const isHit = hit > 0
            const fill = !isHit
              ? selected || hovered
                ? '#d1d5db'
                : '#f1f5f9'
              : selected || hovered
                ? CAT_STROKE[n.cat]
                : CAT_FILL[n.cat]
            const stroke = !isHit
              ? '#cbd5e1'
              : selected
                ? '#4c1d95'
                : CAT_STROKE[n.cat]
            const labelFill = dim
              ? '#cbd5e1'
              : !isHit
                ? '#94a3b8'
                : '#0f172a'
            const markerR = Math.max(4.5, n.r * 0.24)

            return (
              <g
                key={n.id}
                data-graph-node
                opacity={dim ? 0.35 : isHit ? 1 : 0.55}
                filter={isHit ? 'url(#node-shadow)' : undefined}
                onMouseEnter={() => setHoverId(n.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={(ev) => {
                  ev.stopPropagation()
                  onSelect(n.id)
                }}
                className="cursor-pointer"
              >
                {isHit && (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.r + 4}
                    fill="none"
                    stroke={CAT_FILL[n.cat]}
                    strokeWidth={2.5}
                    opacity={dim ? 0.4 : 0.85}
                  />
                )}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={selected ? 2.5 : isHit ? 2 : 1}
                  className="transition-all duration-150"
                />
                {isHit && (
                  <g style={{ pointerEvents: 'none' }}>
                    <circle
                      cx={n.x + n.r * 0.62}
                      cy={n.y - n.r * 0.62}
                      r={markerR + 1.5}
                      fill="#ffffff"
                      stroke={CAT_STROKE[n.cat]}
                      strokeWidth={1.5}
                    />
                    <circle
                      cx={n.x + n.r * 0.62}
                      cy={n.y - n.r * 0.62}
                      r={markerR * 0.55}
                      fill={CAT_STROKE[n.cat]}
                    />
                  </g>
                )}
                <text
                  x={n.x + n.r + 10}
                  y={n.y + 5}
                  textAnchor="start"
                  fontSize={13}
                  fontWeight={isHit || selected ? 600 : 500}
                  fill={labelFill}
                  style={{ pointerEvents: 'none' }}
                >
                  {kp.term}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

function buildGraphSimulation(points: KnowledgePoint[], hits: Record<string, number>) {
  const edges: { from: string; to: string }[] = []
  const seen = new Set<string>()

  const addEdge = (a: string, b: string) => {
    if (a === b) return
    const key = [a, b].sort().join('|')
    if (seen.has(key)) return
    seen.add(key)
    edges.push({ from: a, to: b })
  }

  for (const n of points) {
    for (const rel of n.relatedTerms) {
      const target = points.find((t) => t.id === rel)
      if (target) addEdge(n.id, target.id)
    }
  }

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i]
      const b = points[j]
      const share = a.tags.some((t) => b.tags.includes(t))
      if (
        share &&
        categorizeKnowledgePoint(a) === categorizeKnowledgePoint(b) &&
        hashPair(a.id, b.id) % 6 === 0
      ) {
        addEdge(a.id, b.id)
      }
    }
  }

  const degreeMap = new Map<string, number>()
  for (const e of edges) {
    degreeMap.set(e.from, (degreeMap.get(e.from) || 0) + 1)
    degreeMap.set(e.to, (degreeMap.get(e.to) || 0) + 1)
  }

  const maxHit = Math.max(
    1,
    ...points.map((p) => hits[p.id] || 0)
  )

  const simNodes: SimNode[] = points.map((n) => {
    const degree = degreeMap.get(n.id) || 0
    const hit = hits[n.id] || 0
    const r = nodeRadiusFromHits(hit, maxHit, degree)
    const cat = categorizeKnowledgePoint(n)
    const seed = hashPair(n.id, 'pos')
    return {
      id: n.id,
      x: CAT_X[cat] + ((seed % 1000) / 1000 - 0.5) * 160,
      y: CANVAS_H / 2 + (((seed >> 10) % 1000) / 1000 - 0.5) * 240,
      vx: 0,
      vy: 0,
      r,
      cat,
      hit,
      degree,
    }
  })

  const linkPairs = edges.map((e) => [e.from, e.to] as [string, string])
  runForceLayout(simNodes, linkPairs)

  return { simNodes, linkPairs }
}

function runForceLayout(nodes: SimNode[], links: [string, string][]) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const centerX = CANVAS_W / 2
  const centerY = CANVAS_H / 2

  for (let tick = 0; tick < 420; tick++) {
    const alpha = 1 - tick / 420

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        let dx = b.x - a.x
        let dy = b.y - a.y
        let dist = Math.sqrt(dx * dx + dy * dy) || 0.01
        const minDist = a.r + b.r + 36
        if (dist < minDist) {
          const push = ((minDist - dist) / dist) * 0.5
          dx *= push
          dy *= push
          a.x -= dx
          a.y -= dy
          b.x += dx
          b.y += dy
          dist = minDist
        }
        const repulse = (380 * alpha) / (dist * dist)
        dx = (dx / dist) * repulse
        dy = (dy / dist) * repulse
        a.vx -= dx
        a.vy -= dy
        b.vx += dx
        b.vy += dy
      }
    }

    for (const [from, to] of links) {
      const a = byId.get(from)
      const b = byId.get(to)
      if (!a || !b) continue
      let dx = b.x - a.x
      let dy = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01
      const target = a.r + b.r + 48
      const pull = (dist - target) * 0.012 * alpha
      dx = (dx / dist) * pull
      dy = (dy / dist) * pull
      a.vx += dx
      a.vy += dy
      b.vx -= dx
      b.vy -= dy
    }

    for (const n of nodes) {
      n.vx += (centerX - n.x) * 0.0008 * alpha
      n.vy += (centerY - n.y) * 0.0008 * alpha
      n.vx += (CAT_X[n.cat] - n.x) * 0.004 * alpha
      n.vx *= 0.82
      n.vy *= 0.82
      n.x += n.vx
      n.y += n.vy
      n.x = Math.max(60, Math.min(CANVAS_W - 60, n.x))
      n.y = Math.max(60, Math.min(CANVAS_H - 60, n.y))
    }
  }
}

/** 命中越多圆越大；未命中仅随图谱度数略放大 */
function nodeRadiusFromHits(hit: number, maxHit: number, degree: number): number {
  const minR = 8
  const maxR = 38
  const degreeBoost = Math.sqrt(degree) * 1.1
  if (hit <= 0) {
    return Math.min(16, minR + degreeBoost)
  }
  const ratio = Math.sqrt(hit / maxHit)
  return Math.min(maxR, minR + 6 + ratio * (maxR - minR - 6) + degreeBoost * 0.35)
}

function hashPair(a: string, b: string): number {
  const s = a < b ? a + b : b + a
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}
